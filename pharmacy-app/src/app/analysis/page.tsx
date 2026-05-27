"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  IndianRupee,
  ShoppingCart,
  Activity,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklyDay {
  day: string
  revenue: number
  profit: number
}

interface MedicineEntry {
  name: string
  quantity: number
  revenue: number
}

interface NearExpiryItem {
  medicine_name: string
  quantity: number
  expiry: string
  batch: string
  days_left: number
  at_risk_value: number
}

interface Summary {
  total_revenue: number
  total_cost: number
  gross_profit: number
  net_profit: number
  total_expenses: number
  total_transactions: number
}

interface AnalysisData {
  weekly_sales: WeeklyDay[]
  most_sold: MedicineEntry[]
  least_sold: MedicineEntry[]
  near_expiry: NearExpiryItem[]
  summary: Summary
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black text-white px-4 py-3 text-sm">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === "revenue" ? "Revenue" : "Profit"}: ₹
          {entry.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  highlight,
}: {
  label: string
  value: string
  icon: any
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`border p-6 flex flex-col gap-3 ${
        highlight ? "bg-black text-white border-black" : "border-black/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`uppercase tracking-[0.25em] text-xs ${
            highlight ? "text-white/50" : "text-black/40"
          }`}
        >
          {label}
        </p>
        <Icon size={18} className={highlight ? "text-white/60" : "text-black/30"} />
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      {sub && (
        <p className={`text-xs ${highlight ? "text-white/50" : "text-black/40"}`}>{sub}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<"revenue" | "profit">("revenue")

  useEffect(() => {
    fetch("/api/analysis")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) =>
    "₹" + n.toLocaleString("en-IN")

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-1 bg-black mx-auto mb-6 animate-pulse" />
          <p className="uppercase tracking-[0.4em] text-sm text-black/40">
            Crunching numbers...
          </p>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="uppercase tracking-[0.3em] text-sm text-black/40">
          Failed to load analysis.
        </p>
      </main>
    )
  }

  const { weekly_sales, most_sold, least_sold, near_expiry, summary } = data

  const profitMargin =
    summary.total_revenue > 0
      ? ((summary.gross_profit / summary.total_revenue) * 100).toFixed(1)
      : "0"

  const criticalExpiry = near_expiry.filter((i) => i.days_left <= 30)

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/10">
        <a href="/home" className="text-3xl font-black tracking-tight">
          PHARMA
        </a>
        <div className="flex items-center gap-8">
          <a
            href="/inventory"
            className="uppercase tracking-[0.3em] text-sm text-black/40 hover:text-black transition-colors"
          >
            Inventory
          </a>
          <div className="uppercase tracking-[0.3em] text-sm">Analysis</div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-8 py-14 border-b border-black/10">
        <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-4">
          Business Intelligence
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h1 className="text-6xl font-black leading-none tracking-tight">ANALYSIS</h1>
          <p className="text-black/40 text-sm uppercase tracking-[0.2em]">
            Last 30 days · {summary.total_transactions} transactions
          </p>
        </div>
      </section>

      <div className="px-8 py-12 space-y-16">

        {/* ── Summary Stats ── */}
        <section>
          <SectionLabel>Financial Overview · 30 Days</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-black/10 border border-black/10">
            <div className="bg-white">
              <StatCard
                label="Revenue"
                value={fmt(summary.total_revenue)}
                icon={IndianRupee}
                sub="Total billed"
              />
            </div>
            <div className="bg-white">
              <StatCard
                label="Cost of Goods"
                value={fmt(summary.total_cost)}
                icon={ShoppingCart}
                sub="Purchase cost"
              />
            </div>
            <div className="bg-white">
              <StatCard
                label="Gross Profit"
                value={fmt(summary.gross_profit)}
                icon={TrendingUp}
                sub={`${profitMargin}% margin`}
              />
            </div>
            <div className="bg-white">
              <StatCard
                label="Expenses"
                value={fmt(summary.total_expenses)}
                icon={TrendingDown}
                sub="Operational"
              />
            </div>
            <div className="bg-white col-span-2">
              <StatCard
                label="Net Profit"
                value={fmt(summary.net_profit)}
                icon={Activity}
                sub="After all expenses"
                highlight
              />
            </div>
          </div>
        </section>

        {/* ── Weekly Sales Chart ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionLabel>Weekly Sales · Last 7 Days</SectionLabel>
            <div className="flex border border-black/10 overflow-hidden">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`px-5 py-2 uppercase tracking-[0.2em] text-xs transition-colors ${
                  activeChart === "revenue"
                    ? "bg-black text-white"
                    : "text-black/40 hover:text-black"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart("profit")}
                className={`px-5 py-2 uppercase tracking-[0.2em] text-xs transition-colors border-l border-black/10 ${
                  activeChart === "profit"
                    ? "bg-black text-white"
                    : "text-black/40 hover:text-black"
                }`}
              >
                Profit
              </button>
            </div>
          </div>

          <div className="border border-black/10 p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weekly_sales}
                barCategoryGap="35%"
                margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#00000010" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#00000060", fontFamily: "monospace" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#00000060", fontFamily: "monospace" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#00000008" }} />
                <Bar
                  dataKey={activeChart}
                  fill="#000000"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue + Profit line comparison */}
          <div className="border border-black/10 border-t-0 p-6">
            <p className="uppercase tracking-[0.25em] text-xs text-black/40 mb-4">
              Revenue vs Profit Trend
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={weekly_sales}
                margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
              >
                <CartesianGrid stroke="#00000010" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#00000050", fontFamily: "monospace" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#00000050", fontFamily: "monospace" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ fill: "#000", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#000000"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ fill: "#000", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-black" />
                <span className="text-xs uppercase tracking-[0.2em] text-black/40">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-black border-dashed" style={{ borderTop: "2px dashed black", background: "none" }} />
                <span className="text-xs uppercase tracking-[0.2em] text-black/40">Profit</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Most & Least Sold ── */}
        <section className="grid lg:grid-cols-2 gap-px bg-black/10 border border-black/10">
          {/* Most Sold */}
          <div className="bg-white">
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
              <SectionLabel noBorder>Top Sellers · 30 Days</SectionLabel>
              <TrendingUp size={16} className="text-black/30" />
            </div>
            {most_sold.length === 0 ? (
              <p className="px-6 py-10 text-sm text-black/30 uppercase tracking-widest">No data</p>
            ) : (
              most_sold.map((item, i) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[2rem_1fr_auto_auto] items-center px-6 py-4 border-b border-black/10 gap-4 last:border-0"
                >
                  <span className="text-2xl font-black text-black/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{item.name}</p>
                    <p className="text-xs text-black/40 mt-0.5">{item.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{fmt(item.revenue)}</p>
                    <p className="text-xs text-black/30">revenue</p>
                  </div>
                  {/* bar */}
                  <div className="w-16 h-1 bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${(item.quantity / (most_sold[0]?.quantity || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Least Sold */}
          <div className="bg-white">
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
              <SectionLabel noBorder>Slow Movers · 30 Days</SectionLabel>
              <TrendingDown size={16} className="text-black/30" />
            </div>
            {least_sold.length === 0 ? (
              <p className="px-6 py-10 text-sm text-black/30 uppercase tracking-widest">No data</p>
            ) : (
              least_sold.map((item, i) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[2rem_1fr_auto_auto] items-center px-6 py-4 border-b border-black/10 gap-4 last:border-0"
                >
                  <span className="text-2xl font-black text-black/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{item.name}</p>
                    <p className="text-xs text-black/40 mt-0.5">{item.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{fmt(item.revenue)}</p>
                    <p className="text-xs text-black/30">revenue</p>
                  </div>
                  <div className="w-16 h-1 bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-black/40"
                      style={{
                        width: `${Math.max(
                          10,
                          (item.quantity / (most_sold[0]?.quantity || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Near Expiry ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionLabel>Near Expiry Items</SectionLabel>
            {criticalExpiry.length > 0 && (
              <div className="flex items-center gap-2 bg-black text-white px-4 py-2">
                <AlertTriangle size={14} />
                <span className="text-xs uppercase tracking-[0.2em]">
                  {criticalExpiry.length} critical
                </span>
              </div>
            )}
          </div>

          {near_expiry.length === 0 ? (
            <div className="border border-black/10 px-8 py-16 text-center">
              <Package size={32} className="text-black/20 mx-auto mb-4" />
              <p className="uppercase tracking-[0.3em] text-sm text-black/30">
                No items expiring within 60 days
              </p>
            </div>
          ) : (
            <div className="border border-black/10 overflow-hidden">
              <div className="grid grid-cols-6 bg-black text-white uppercase tracking-[0.15em] text-xs px-6 py-4">
                <div className="col-span-2">Medicine</div>
                <div>Batch</div>
                <div>Expiry</div>
                <div>Qty</div>
                <div>At Risk ₹</div>
              </div>
              {near_expiry.map((item, i) => {
                const urgent = item.days_left <= 14
                const warning = item.days_left <= 30
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-6 px-6 py-4 border-t border-black/10 items-center ${
                      urgent ? "bg-black text-white" : warning ? "bg-black/5" : ""
                    }`}
                  >
                    <div className="col-span-2 font-semibold flex items-center gap-3 text-sm">
                      {(urgent || warning) && (
                        <AlertTriangle size={14} className={urgent ? "text-white/60" : "text-black/40"} />
                      )}
                      {item.medicine_name}
                    </div>
                    <div className={`text-sm ${urgent ? "text-white/70" : "text-black/60"}`}>
                      {item.batch}
                    </div>
                    <div className="text-sm">{item.expiry}</div>
                    <div className="text-sm">{item.quantity}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {fmt(item.at_risk_value)}
                      </span>
                      <span
                        className={`text-xs uppercase tracking-[0.15em] px-2 py-0.5 ${
                          urgent
                            ? "bg-white text-black"
                            : warning
                            ? "bg-black text-white"
                            : "border border-black/20 text-black/50"
                        }`}
                      >
                        {item.days_left}d
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SectionLabel({
  children,
  noBorder,
}: {
  children: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <div className={`${noBorder ? "" : "mb-0"}`}>
      <p className="uppercase tracking-[0.35em] text-sm font-bold">{children}</p>
    </div>
  )
}