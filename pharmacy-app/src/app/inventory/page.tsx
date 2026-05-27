"use client"

import { useEffect, useState } from "react"

import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  X,
} from "lucide-react"

export default function InventoryPage() {
  const [inventory, setInventory] =
    useState<any[]>([])

  const [query, setQuery] =
    useState("")

  const [showAddModal, setShowAddModal] =
    useState(false)

  const [medicineQuery, setMedicineQuery] =
    useState("")

  const [searchResults, setSearchResults] =
    useState<any[]>([])

  const [selectedMedicine, setSelectedMedicine] =
    useState<any>(null)

  const [quantity, setQuantity] =
    useState("")

  const [batch, setBatch] =
    useState("")

  const [expiry, setExpiry] =
    useState("")

  const [sellingPrice, setSellingPrice] =
    useState("")

  const [purchasePrice, setPurchasePrice] =
    useState("")

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch(
        "/api/inventory"
      )

      const data = await res.json()

      if (Array.isArray(data)) {
        setInventory(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const filteredInventory =
    inventory.filter((item) =>
      item.medicine_name
        ?.toLowerCase()
        .includes(query.toLowerCase())
    )

  const searchMedicines = async (
    value: string
  ) => {
    setMedicineQuery(value)

    if (!value.trim()) {
      setSearchResults([])
      return
    }

    try {
      const res = await fetch(
        `/api/medicines?query=${value}`
      )

      const data = await res.json()

      if (Array.isArray(data)) {
        setSearchResults(data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const addToInventory = async () => {
    if (!selectedMedicine) return

    try {
      const res = await fetch(
        "/api/inventory",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            medicine_name:
              selectedMedicine.name,

            quantity:
              Number(quantity),

            batch,

            expiry,

            selling_price:
              Number(
                sellingPrice
              ),

            purchase_price:
              Number(
                purchasePrice
              ),
          }),
        }
      )

      if (!res.ok) {
        alert(
          "Failed to add medicine"
        )

        return
      }

      await fetchInventory()

      alert(
        "Medicine added successfully"
      )

      setShowAddModal(false)

      setSelectedMedicine(null)

      setMedicineQuery("")
      setSearchResults([])

      setQuantity("")
      setBatch("")
      setExpiry("")
      setSellingPrice("")
      setPurchasePrice("")
    } catch (error) {
      console.log(error)
    }
  }

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
          Inventory
        </div>
      </nav>

      {/* Header */}
      <section className="px-8 py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-4">
            Store Management
          </p>

          <h1 className="text-6xl font-black leading-none tracking-tight">
            INVENTORY
          </h1>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center border border-black/10 px-4 py-3 w-[320px]">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search inventory..."
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              className="ml-3 w-full outline-none bg-transparent"
            />
          </div>

          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className="bg-black text-white px-6 py-3 uppercase tracking-[0.2em] text-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>
      </section>

      {/* Inventory Table */}
      <section className="px-8 pb-20">
        <div className="border border-black/10 overflow-hidden">
          <div className="grid grid-cols-6 bg-black text-white uppercase tracking-[0.2em] text-xs px-6 py-5">
            <div>Medicine</div>
            <div>Quantity</div>
            <div>Batch</div>
            <div>Expiry</div>
            <div>Price</div>
            <div>Status</div>
          </div>

          {filteredInventory.map(
            (item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 px-6 py-5 border-t border-black/10 items-center"
              >
                <div className="font-semibold flex items-center gap-3">
                  <Package size={18} />
                  {
                    item.medicine_name
                  }
                </div>

                <div>
                  {item.quantity}
                </div>

                <div>
                  {item.batch}
                </div>

                <div>
                  {new Date(
                    item.expiry
                  ).toLocaleDateString()}
                </div>

                <div>
                  ₹
                  {
                    item.selling_price
                  }
                </div>

                <div>
                  {item.quantity <
                  10
                    ? "Low"
                    : "In Stock"}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl p-8 relative">
            {/* Close */}
            <button
              onClick={() =>
                setShowAddModal(
                  false
                )
              }
              className="absolute top-5 right-5"
            >
              <X size={24} />
            </button>

            <h2 className="text-4xl font-black mb-8">
              ADD MEDICINE
            </h2>

            {/* Search */}
            {!selectedMedicine && (
              <>
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={
                    medicineQuery
                  }
                  onChange={(e) =>
                    searchMedicines(
                      e.target.value
                    )
                  }
                  className="w-full border border-black px-5 py-4 outline-none mb-6"
                />

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {searchResults.map(
                    (medicine) => (
                      <button
                        key={
                          medicine.prisma_id
                        }
                        onClick={() =>
                          setSelectedMedicine(
                            medicine
                          )
                        }
                        className="w-full border border-black/10 p-5 text-left hover:bg-black hover:text-white transition-all duration-300"
                      >
                        <h3 className="font-bold text-lg">
                          {
                            medicine.name
                          }
                        </h3>

                        <p className="text-sm opacity-70">
                          {
                            medicine.manufacturer_name
                          }
                        </p>
                      </button>
                    )
                  )}
                </div>
              </>
            )}

            {/* FORM */}
            {selectedMedicine && (
              <div>
                <button
                  onClick={() =>
                    setSelectedMedicine(
                      null
                    )
                  }
                  className="mb-6 text-sm underline"
                >
                  ← Back To Search
                </button>

                <h3 className="text-3xl font-black mb-8">
                  {
                    selectedMedicine.name
                  }
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value
                      )
                    }
                    className="border border-black/10 px-4 py-3"
                  />

                  <input
                    type="text"
                    placeholder="Batch No"
                    value={batch}
                    onChange={(e) =>
                      setBatch(
                        e.target.value
                      )
                    }
                    className="border border-black/10 px-4 py-3"
                  />

                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(
                        e.target.value
                      )
                    }
                    className="border border-black/10 px-4 py-3"
                  />

                  <input
                    type="number"
                    placeholder="Selling Price"
                    value={
                      sellingPrice
                    }
                    onChange={(e) =>
                      setSellingPrice(
                        e.target.value
                      )
                    }
                    className="border border-black/10 px-4 py-3"
                  />

                  <input
                    type="number"
                    placeholder="Purchase Price"
                    value={
                      purchasePrice
                    }
                    onChange={(e) =>
                      setPurchasePrice(
                        e.target.value
                      )
                    }
                    className="border border-black/10 px-4 py-3"
                  />
                </div>

                <button
                  onClick={
                    addToInventory
                  }
                  className="mt-8 bg-black text-white w-full py-4 uppercase tracking-[0.2em]"
                >
                  Confirm & Add To Inventory
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}