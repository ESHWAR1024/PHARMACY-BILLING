import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()

    // ── 1. Weekly sales — last 7 days grouped by day ───────────────────────
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const weeklyBillItems = await prisma.billItem.findMany({
      where: {
        Bill: {
          createdAt: { gte: weekStart },
        },
      },
      include: {
        Bill: { select: { createdAt: true } },
      },
    })

    // Build day labels for last 7 days
    const dayLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
    })

    const dayMap: Record<string, { revenue: number }> = {}
    dayLabels.forEach((label) => { dayMap[label] = { revenue: 0 } })

    weeklyBillItems.forEach((item) => {
      const label = new Date(item.Bill.createdAt!).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
      })
      if (dayMap[label]) {
        dayMap[label].revenue += item.price * item.quantity
      }
    })

    // ── 2. Profit per day — join BillItem.medicine_name → Inventory.purchase_price
    //    We fetch all inventory purchase prices as a lookup map
    const inventoryPrices = await prisma.inventory.findMany({
      select: { medicine_name: true, purchase_price: true },
    })

    // Use the lowest purchase_price per medicine name as cost basis
    const costMap: Record<string, number> = {}
    inventoryPrices.forEach((inv) => {
      const key = inv.medicine_name.toLowerCase()
      if (!costMap[key] || inv.purchase_price < costMap[key]) {
        costMap[key] = inv.purchase_price
      }
    })

    const dailyProfitMap: Record<string, number> = {}
    dayLabels.forEach((label) => { dailyProfitMap[label] = 0 })

    weeklyBillItems.forEach((item) => {
      const label = new Date(item.Bill.createdAt!).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
      })
      if (dailyProfitMap[label] !== undefined) {
        const cost = costMap[item.medicine_name.toLowerCase()] ?? 0
        dailyProfitMap[label] += (item.price - cost) * item.quantity
      }
    })

    const weeklySales = dayLabels.map((label) => ({
      day: label,
      revenue: Math.round(dayMap[label].revenue),
      profit: Math.round(dailyProfitMap[label]),
    }))

    // ── 3. Most & least sold — last 30 days ───────────────────────────────
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 29)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyItems = await prisma.billItem.findMany({
      where: {
        Bill: { createdAt: { gte: monthStart } },
      },
    })

    const medicineMap: Record<string, { quantity: number; revenue: number; cost: number }> = {}

    monthlyItems.forEach((item) => {
      const key = item.medicine_name
      if (!medicineMap[key]) {
        medicineMap[key] = { quantity: 0, revenue: 0, cost: 0 }
      }
      medicineMap[key].quantity += item.quantity
      medicineMap[key].revenue  += item.price * item.quantity
      const unitCost = costMap[item.medicine_name.toLowerCase()] ?? 0
      medicineMap[key].cost += unitCost * item.quantity
    })

    const sorted = Object.entries(medicineMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.quantity - a.quantity)

    const mostSold  = sorted.slice(0, 5).map((m) => ({
      name: m.name,
      quantity: m.quantity,
      revenue: Math.round(m.revenue),
    }))

    const leastSold = sorted.slice(-5).reverse().map((m) => ({
      name: m.name,
      quantity: m.quantity,
      revenue: Math.round(m.revenue),
    }))

    // ── 4. Near expiry items — within 60 days, quantity > 0 ───────────────
    const expiryThreshold = new Date(now)
    expiryThreshold.setDate(now.getDate() + 60)

    const nearExpiryRows = await prisma.inventory.findMany({
      where: {
        expiry:   { lte: expiryThreshold },
        quantity: { gt: 0 },
      },
      orderBy: { expiry: "asc" },
      take: 10,
      select: {
        medicine_name:  true,
        quantity:       true,
        expiry:         true,
        batch:          true,
        selling_price:  true,
      },
    })

    const nearExpiry = nearExpiryRows.map((item) => {
      const daysLeft = Math.ceil(
        (new Date(item.expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        medicine_name:  item.medicine_name,
        quantity:       item.quantity,
        expiry:         new Date(item.expiry).toLocaleDateString("en-IN"),
        batch:          item.batch,
        days_left:      daysLeft,
        at_risk_value:  Math.round(item.selling_price * item.quantity),
      }
    })

    // ── 5. Financial summary — last 30 days ───────────────────────────────
    const totalRevenue = monthlyItems.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    )

    const totalCost = monthlyItems.reduce((sum, i) => {
      const unitCost = costMap[i.medicine_name.toLowerCase()] ?? 0
      return sum + unitCost * i.quantity
    }, 0)

    const grossProfit = totalRevenue - totalCost

    const totalTransactions = new Set(monthlyItems.map((i) => i.billId.toString())).size

    const summary = {
      total_revenue:      Math.round(totalRevenue),
      total_cost:         Math.round(totalCost),
      gross_profit:       Math.round(grossProfit),
      // net_profit = gross profit (no Expense table in schema yet)
      net_profit:         Math.round(grossProfit),
      total_expenses:     0,
      total_transactions: totalTransactions,
    }

    return NextResponse.json({
      weekly_sales: weeklySales,
      most_sold:    mostSold,
      least_sold:   leastSold,
      near_expiry:  nearExpiry,
      summary,
    })
  } catch (error) {
    console.error("Analysis API error:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}