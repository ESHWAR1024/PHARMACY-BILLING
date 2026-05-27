"use client"

import {
  Home,
  Search,
  BarChart3,
  User,
  Package,
  IndianRupee,
} from "lucide-react"

export default function HomePage() {
  // Temporary dummy values
  // Later fetch from DB/profile

  const ownerName = "Eshwar"

  const currentSales = 25430

  const today = new Date()

  const currentDay =
    today.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
      }
    )

  const currentDate =
    today.toLocaleDateString()

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/10">
        {/* Logo */}
        <a
          href="/home"
          className="text-3xl font-black tracking-tight"
        >
          PHARMA
        </a>

        {/* Links */}
        <div className="flex items-center gap-10 uppercase tracking-[0.2em] text-sm">
          <a
            href="/home"
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
          >
            <Home size={16} />
            Home
          </a>

          <a
            href="/search"
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
          >
            <Search size={16} />
            Search
          </a>

          <a
            href="/inventory"
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
          >
            <Package size={16} />
            Inventory
          </a>

          <a
            href="/analysis"
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Analysis
          </a>
        </div>

        {/* Profile */}
        <a
          href="/profile"
          className="hover:opacity-60 transition-opacity"
        >
          <User size={22} />
        </a>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-16">
        <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-4">
          Pharmacy Dashboard
        </p>

        <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight">
          HELLO,
          <br />
          {ownerName.toUpperCase()}
        </h1>

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Day Card */}
          <div className="border border-black/10 p-6 min-w-[260px]">
            <p className="uppercase tracking-[0.2em] text-xs text-black/40 mb-3">
              Today
            </p>

            <h2 className="text-3xl font-black">
              {currentDay}
            </h2>

            <p className="mt-2 text-black/60">
              {currentDate}
            </p>
          </div>

          {/* Sales Card */}
          <div className="border border-black/10 p-6 min-w-[260px]">
            <p className="uppercase tracking-[0.2em] text-xs text-black/40 mb-3">
              Current Sales
            </p>

            <div className="flex items-center gap-2">
              <IndianRupee size={28} />

              <h2 className="text-4xl font-black">
                {currentSales}
              </h2>
            </div>

            <p className="mt-2 text-black/60">
              Today's revenue
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="grid md:grid-cols-3 gap-6 px-8 pb-20">
        {/* Inventory */}
        <div className="border border-black/10 p-8 hover:bg-black hover:text-white transition-all duration-300">
          <Package size={28} />

          <h3 className="text-2xl font-black mt-6 mb-4 uppercase tracking-[0.1em]">
            Inventory
          </h3>

          <p className="leading-relaxed opacity-70">
            Manage pharmacy stock, medicine
            quantities, expiry dates, and
            inventory operations.
          </p>

          <a
            href="/inventory"
            className="inline-block mt-8 uppercase tracking-[0.2em] text-sm"
          >
            Open →
          </a>
        </div>

        {/* Analysis */}
        <div className="border border-black/10 p-8 hover:bg-black hover:text-white transition-all duration-300">
          <BarChart3 size={28} />

          <h3 className="text-2xl font-black mt-6 mb-4 uppercase tracking-[0.1em]">
            Analysis
          </h3>

          <p className="leading-relaxed opacity-70">
            Track pharmacy sales, trends,
            medicine movement, and business
            performance analytics.
          </p>

          <a
            href="/analysis"
            className="inline-block mt-8 uppercase tracking-[0.2em] text-sm"
          >
            Open →
          </a>
        </div>

        {/* Profile */}
        <div className="border border-black/10 p-8 hover:bg-black hover:text-white transition-all duration-300">
          <User size={28} />

          <h3 className="text-2xl font-black mt-6 mb-4 uppercase tracking-[0.1em]">
            Profile
          </h3>

          <p className="leading-relaxed opacity-70">
            Manage pharmacy profile, licenses,
            business details, reports, and
            account settings.
          </p>

          <a
            href="/profile"
            className="inline-block mt-8 uppercase tracking-[0.2em] text-sm"
          >
            Open →
          </a>
        </div>
      </section>
    </main>
  )
}