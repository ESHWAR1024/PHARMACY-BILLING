"use client"

import { useState } from "react"
import {
  Search,
  Package,
  AlertTriangle,
} from "lucide-react"

const medicines = [
  {
    id: 1,
    name: "Dolo 650",
    qty: 120,
    batch: "DL102",
    expiry: "2027-03",
    price: 32,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Azithral 500",
    qty: 24,
    batch: "AZ551",
    expiry: "2026-11",
    price: 98,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Shelcal 500",
    qty: 80,
    batch: "SC778",
    expiry: "2027-08",
    price: 145,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Pantop 40",
    qty: 10,
    batch: "PT901",
    expiry: "2026-05",
    price: 76,
    status: "Critical",
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState("")

  const filteredMedicines =
    medicines.filter((medicine) =>
      medicine.name
        .toLowerCase()
        .includes(query.toLowerCase())
    )

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/10">
        <a
          href="/home"
          className="text-3xl font-black tracking-tight"
        >
          PHARMA
        </a>

        <div className="uppercase tracking-[0.3em] text-sm text-black/40">
          Search
        </div>
      </nav>

      {/* Header */}
      <section className="px-8 py-14">
        <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-4">
          Medicine Lookup
        </p>

        <h1 className="text-6xl font-black leading-none tracking-tight mb-12">
          SEARCH
        </h1>

        {/* Search Box */}
        <div className="flex items-center border border-black px-5 py-4 max-w-2xl">
          <Search size={22} />

          <input
            type="text"
            placeholder="Search medicines..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="ml-4 w-full outline-none bg-transparent text-lg"
          />
        </div>
      </section>

      {/* Results */}
      <section className="px-8 pb-20">
        <div className="space-y-5">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="border border-black/10 p-6 hover:bg-black hover:text-white transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-3">
                    <Package size={20} />

                    <h2 className="text-2xl font-bold">
                      {medicine.name}
                    </h2>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-6 text-sm uppercase tracking-[0.2em] opacity-70">
                    <span>
                      Qty: {medicine.qty}
                    </span>

                    <span>
                      Batch: {medicine.batch}
                    </span>

                    <span>
                      Expiry: {medicine.expiry}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-8">
                  <div>
                    <p className="uppercase text-xs tracking-[0.2em] opacity-60 mb-1">
                      Price
                    </p>

                    <h3 className="text-2xl font-bold">
                      ₹{medicine.price}
                    </h3>
                  </div>

                  <div>
                    <p className="uppercase text-xs tracking-[0.2em] opacity-60 mb-1">
                      Status
                    </p>

                    <div className="flex items-center gap-2">
                      {medicine.status ===
                        "Critical" && (
                        <AlertTriangle size={18} />
                      )}

                      <span className="font-semibold">
                        {medicine.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMedicines.length === 0 && (
            <div className="border border-black/10 p-10 text-center">
              <p className="uppercase tracking-[0.3em] text-black/40">
                No medicines found
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}