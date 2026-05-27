import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customer, items, total } = body
    // items: [{ inventoryId, medicine_name, quantity, price }]

    const bill = await prisma.$transaction(async (tx) => {
      // ── 1. Validate every item has enough stock ──────────────────────────
      for (const item of items) {
        const inv = await tx.inventory.findUnique({
          where: { id: BigInt(item.inventoryId) },
        })
        if (!inv) {
          throw new Error(`Medicine not found: ${item.medicine_name}`)
        }
        if (inv.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.medicine_name}. Available: ${inv.quantity}`
          )
        }
      }

      // ── 2. Create bill with all items ────────────────────────────────────
      const newBill = await tx.bill.create({
        data: {
          customer: customer || "Walk-in",
          total: Number(total.toFixed(2)),
          BillItem: {
            create: items.map((item: any) => ({
              medicine_name: item.medicine_name,
              quantity:      Number(item.quantity),
              price:         Number(item.price.toFixed(2)),
            })),
          },
        },
      })

      // ── 3. Decrement inventory quantities ────────────────────────────────
      for (const item of items) {
        await tx.inventory.update({
          where: { id: BigInt(item.inventoryId) },
          data:  { quantity: { decrement: item.quantity } },
        })
      }

      return newBill
    })

    return NextResponse.json({ id: bill.id.toString() })
  } catch (error: any) {
    console.error("Billing error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}