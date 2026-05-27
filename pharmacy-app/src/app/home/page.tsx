"use client"

import Link from "next/link"

import {
  Search,
  Package,
  IndianRupee,
  FileText,
  User,
  Receipt,
  BarChart3,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

export default function HomePage() {
  const [user, setUser] =
    useState<any>(null)

  const [revenue, setRevenue] =
    useState(0)

  const [query, setQuery] =
    useState("")

  const [results, setResults] =
    useState<any[]>([])

  useEffect(() => {
    fetchHome()
  }, [])

  const fetchHome =
    async () => {
      try {
        const res = await fetch(
          "/api/home"
        )

        const data =
          await res.json()

        setUser(data.user)

        setRevenue(
          data.revenue
        )
      } catch (error) {
        console.log(error)
      }
    }

  const searchInventory =
    async (
      value: string
    ) => {
      setQuery(value)

      if (!value.trim()) {
        setResults([])
        return
      }

      try {
        const res =
          await fetch(
            `/api/search-inventory?query=${value}`
          )

        const data =
          await res.json()

        if (
          Array.isArray(data)
        ) {
          setResults(data)
        } else {
          setResults([])
        }
      } catch (error) {
        console.log(error)
      }
    }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/10">
        {/* LOGO */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            PHARMA
          </h1>
        </div>

        {/* SEARCH */}
        <div className="relative w-[380px]">
          <div className="flex items-center border border-black/10 px-4 py-3 bg-white">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search inventory..."
              value={query}
              onChange={(e) =>
                searchInventory(
                  e.target.value
                )
              }
              className="ml-3 w-full outline-none bg-transparent"
            />
          </div>

          {/* SEARCH RESULTS */}
          {results.length >
            0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-black/10 mt-2 z-50 max-h-[400px] overflow-y-auto shadow-lg">
              {results.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-4 border-b border-black/10 hover:bg-black hover:text-white transition-all"
                  >
                    <h3 className="font-bold">
                      {
                        item.medicine_name
                      }
                    </h3>

                    <p className="text-sm opacity-70">
                      Qty:
                      {
                        item.quantity
                      }
                    </p>

                    <p className="text-sm opacity-70">
                      Batch:
                      {
                        item.batch
                      }
                    </p>

                    <p className="text-sm opacity-70">
                      ₹
                      {
                        item.selling_price
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-8">
          <Link
            href="/inventory"
            className="uppercase text-sm tracking-[0.2em] flex items-center gap-2 hover:opacity-70"
          >
            <Package size={16} />
            Inventory
          </Link>

          <Link
            href="/billing"
            className="uppercase text-sm tracking-[0.2em] flex items-center gap-2 hover:opacity-70"
          >
            <Receipt size={16} />
            Billing
          </Link>

          <Link
            href="/analysis"
            className="uppercase text-sm tracking-[0.2em] flex items-center gap-2 hover:opacity-70"
          >
            <BarChart3 size={16} />
            Analysis
          </Link>

          <Link
            href="/reports"
            className="uppercase text-sm tracking-[0.2em] flex items-center gap-2 hover:opacity-70"
          >
            <FileText size={16} />
            Reports
          </Link>

          <Link
            href="/profile"
            className="uppercase text-sm tracking-[0.2em] flex items-center gap-2 hover:opacity-70"
          >
            <User size={16} />
            Profile
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-8 py-16">
        <p className="uppercase tracking-[0.3em] text-sm text-black/40 mb-4">
          Dashboard
        </p>

        <h1 className="text-7xl font-black leading-none tracking-tight">
          Hello,
          <br />
          {user?.name ||
            "Owner"}
        </h1>

        <p className="mt-6 text-xl text-black/60">
          Today is{" "}
          {new Date().toLocaleDateString(
            "en-US",
            {
              weekday:
                "long",
            }
          )}
        </p>
      </section>

      {/* DASHBOARD CARDS */}
      <section className="grid grid-cols-3 gap-6 px-8 pb-16">
        {/* REVENUE */}
        <div className="border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-5">
            <IndianRupee />

            <p className="uppercase tracking-[0.2em] text-sm text-black/50">
              Revenue Till Now
            </p>
          </div>

          <h2 className="text-5xl font-black">
            ₹{revenue}
          </h2>
        </div>

        {/* INVENTORY SEARCH */}
        <div className="border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-5">
            <Package />

            <p className="uppercase tracking-[0.2em] text-sm text-black/50">
              Search Results
            </p>
          </div>

          <h2 className="text-5xl font-black">
            {
              results.length
            }
          </h2>
        </div>

        {/* CURRENT DAY */}
        <div className="border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-5">
            <FileText />

            <p className="uppercase tracking-[0.2em] text-sm text-black/50">
              Current Day
            </p>
          </div>

          <h2 className="text-4xl font-black">
            {new Date().toLocaleDateString(
              "en-US",
              {
                weekday:
                  "long",
              }
            )}
          </h2>
        </div>
      </section>
    </main>
  )
}