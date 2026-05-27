"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Printer,
  UserCircle,
  Trash2,
  Package,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  inventoryId: string
  medicine_name: string
  batch: string
  expiry: string
  available_qty: number
  quantity: number
  mrp: number
  purchase_price: number
  discount: number
}

interface Patient {
  name: string
  age: string
  address: string
  contact: string
  doctor: string
}

interface Pharmacy {
  pharmacy: string
  name: string
  location: string
  phone: string
  email: string
  drug_license_number: string
  gst_number: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtExpiry = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString("en-GB", { month: "2-digit", year: "2-digit" })
}

const fmtDate = (d: Date) =>
  d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-")
    .toUpperCase()

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [globalDiscount, setGlobalDiscount] = useState(0)

  // Patient modal
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patient, setPatient] = useState<Patient>({
    name: "", age: "", address: "", contact: "", doctor: "",
  })

  // Bill preview
  const [showBill, setShowBill] = useState(false)
  const [billId, setBillId] = useState("")
  const [billDate, setBillDate] = useState("")

  // Pharmacy info
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => setPharmacy(d.user))
      .catch(console.error)
  }, [])

  // ── Inventory search ──────────────────────────────────────────────────────

  const searchInventory = async (val: string) => {
    setQuery(val)
    if (!val.trim()) { setResults([]); return }
    try {
      const res = await fetch(`/api/search-inventory?query=${encodeURIComponent(val)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {}
  }

  // ── Cart operations ───────────────────────────────────────────────────────

  const addToCart = (item: any) => {
    const id = String(item.id)
    const existing = cart.find((c) => c.inventoryId === id)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.inventoryId === id
            ? { ...c, quantity: Math.min(c.quantity + 1, c.available_qty) }
            : c
        )
      )
    } else {
      setCart([
        ...cart,
        {
          inventoryId:   id,
          medicine_name: item.medicine_name,
          batch:         item.batch,
          expiry:        item.expiry,
          available_qty: item.quantity,
          quantity:      1,
          mrp:           item.selling_price,
          purchase_price: item.purchase_price,
          discount:      globalDiscount,
        },
      ])
    }
    setQuery("")
    setResults([])
  }

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return }
    setCart(
      cart.map((c) =>
        c.inventoryId === id
          ? { ...c, quantity: Math.min(qty, c.available_qty) }
          : c
      )
    )
  }

  const updateDiscount = (id: string, dis: number) => {
    setCart(cart.map((c) => (c.inventoryId === id ? { ...c, discount: dis } : c)))
  }

  const removeItem = (id: string) => setCart(cart.filter((c) => c.inventoryId !== id))

  const itemAmt = (item: CartItem) =>
    parseFloat((item.mrp * item.quantity * (1 - item.discount / 100)).toFixed(2))

  const subtotal = cart.reduce((s, i) => s + itemAmt(i), 0)

  // ── Checkout flow ─────────────────────────────────────────────────────────

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowPatientModal(true)
  }

  const generateBill = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: patient.name || "Walk-in",
          total: subtotal,
          items: cart.map((item) => ({
            inventoryId:   item.inventoryId,
            medicine_name: item.medicine_name,
            quantity:      item.quantity,
            price:         itemAmt(item) / item.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (data.error) { alert(data.error); return }
      setBillId("NV" + String(data.id).padStart(4, "0"))
      setBillDate(fmtDate(new Date()))
      setShowPatientModal(false)
      setShowBill(true)
    } catch {
      alert("Failed to create bill. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const closeBill = () => {
    setShowBill(false)
    setCart([])
    setPatient({ name: "", age: "", address: "", contact: "", doctor: "" })
    setBillId("")
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Print styles injected ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-bill {
            position: fixed !important;
            inset: 0 !important;
            background: white !important;
            z-index: 9999 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body { margin: 0; }
        }
        @media screen {
          .print-bill-inner { max-height: 85vh; overflow-y: auto; }
        }
      `}</style>

      {/* ────────────────────────────────────────────────────────────────────
          MAIN BILLING UI
      ──────────────────────────────────────────────────────────────────── */}
      <main className="min-h-screen bg-white text-black no-print">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-6 border-b border-black/10">
          <a href="/home" className="text-3xl font-black tracking-tight">PHARMA</a>
          <div className="uppercase tracking-[0.3em] text-sm text-black/40">Billing</div>
        </nav>

        {/* Header */}
        <section className="px-8 py-10 border-b border-black/10 flex items-end justify-between">
          <div>
            <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-3">
              Point of Sale
            </p>
            <h1 className="text-6xl font-black leading-none tracking-tight">BILLING</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="uppercase tracking-[0.2em] text-xs text-black/40">
              Global Discount
            </span>
            <div className="flex items-center border border-black/20">
              <input
                type="number"
                min={0}
                max={100}
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                className="w-16 px-3 py-2 outline-none text-center text-sm"
              />
              <span className="px-3 py-2 bg-black text-white text-sm">%</span>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="flex h-[calc(100vh-220px)]">

          {/* ── Left: Search + Results ── */}
          <div className="flex-1 border-r border-black/10 flex flex-col">

            {/* Search bar */}
            <div className="px-6 py-4 border-b border-black/10">
              <div className="flex items-center border border-black px-4 py-3 bg-white relative">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search medicine from inventory..."
                  value={query}
                  onChange={(e) => searchInventory(e.target.value)}
                  className="ml-3 w-full outline-none bg-transparent text-sm"
                  autoFocus
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResults([]) }}>
                    <X size={16} className="text-black/40" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {results.length > 0 ? (
                <div>
                  {results.map((item) => {
                    const inCart = cart.find((c) => c.inventoryId === String(item.id))
                    const outOfStock = item.quantity === 0
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between px-6 py-4 border-b border-black/10 transition-colors ${
                          outOfStock ? "opacity-40" : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Package size={18} className="text-black/30" />
                          <div>
                            <p className="font-semibold text-sm">{item.medicine_name}</p>
                            <p className="text-xs text-black/40 mt-0.5">
                              Batch: {item.batch} &nbsp;·&nbsp;
                              Exp: {fmtExpiry(item.expiry)} &nbsp;·&nbsp;
                              Stock: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-sm">₹{item.selling_price}</span>
                          <button
                            disabled={outOfStock}
                            onClick={() => addToCart(item)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all ${
                              inCart
                                ? "bg-black text-white"
                                : outOfStock
                                ? "border border-black/20 text-black/30"
                                : "border border-black hover:bg-black hover:text-white"
                            }`}
                          >
                            <Plus size={13} />
                            {inCart ? "Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center h-full text-black/20">
                  <Package size={40} />
                  <p className="mt-4 uppercase tracking-widest text-sm">No results</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-black/20">
                  <Search size={40} />
                  <p className="mt-4 uppercase tracking-widest text-sm">Search to add medicines</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Cart ── */}
          <div className="w-[400px] flex flex-col">

            {/* Cart header */}
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} />
                <span className="uppercase tracking-[0.25em] text-sm font-semibold">
                  Cart
                </span>
              </div>
              <span className="text-xs text-black/40 uppercase tracking-widest">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-black/20">
                  <ShoppingCart size={36} />
                  <p className="mt-3 uppercase tracking-widest text-xs">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.inventoryId} className="px-5 py-4 border-b border-black/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm leading-tight flex-1">
                        {item.medicine_name}
                      </p>
                      <button
                        onClick={() => removeItem(item.inventoryId)}
                        className="text-black/30 hover:text-black mt-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-xs text-black/40 mb-3">
                      Batch: {item.batch} · Exp: {fmtExpiry(item.expiry)}
                    </p>

                    <div className="flex items-center gap-3">
                      {/* Qty control */}
                      <div className="flex items-center border border-black/20">
                        <button
                          onClick={() => updateQty(item.inventoryId, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.inventoryId, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-black hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Discount */}
                      <div className="flex items-center border border-black/20 text-xs">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discount}
                          onChange={(e) =>
                            updateDiscount(item.inventoryId, Number(e.target.value))
                          }
                          className="w-10 px-2 py-1.5 outline-none text-center"
                        />
                        <span className="px-2 py-1.5 bg-black/5 text-black/50">%</span>
                      </div>

                      {/* Amount */}
                      <span className="ml-auto font-bold text-sm">
                        ₹{itemAmt(item).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            <div className="border-t border-black/10 px-5 py-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-black/50 uppercase tracking-widest text-xs">
                  Subtotal
                </span>
                <span className="font-black text-xl">₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 uppercase tracking-[0.25em] text-sm font-semibold transition-all ${
                  cart.length === 0
                    ? "bg-black/10 text-black/30 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/80"
                }`}
              >
                Checkout →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────────
          PATIENT DETAILS MODAL
      ──────────────────────────────────────────────────────────────────── */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 no-print">
          <div className="bg-black w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowPatientModal(false)}
              className="absolute top-5 right-5"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <UserCircle size={28} />
              <h2 className="text-3xl font-black tracking-tight">PATIENT DETAILS</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "Patient Name *", key: "name", type: "text", placeholder: "Full name" },
                { label: "Age", key: "age", type: "text", placeholder: "e.g. 35" },
                { label: "Contact Number", key: "contact", type: "tel", placeholder: "10-digit number" },
                { label: "Address", key: "address", type: "text", placeholder: "City, State" },
                { label: "Doctor / Referred By", key: "doctor", type: "text", placeholder: "Dr. Name (optional)" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block uppercase tracking-[0.2em] text-xs text-black/40 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(patient as any)[field.key]}
                    onChange={(e) =>
                      setPatient({ ...patient, [field.key]: e.target.value })
                    }
                    className="w-full border border-black/20 px-4 py-3 outline-none focus:border-black transition-colors text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={generateBill}
              disabled={loading || !patient.name.trim()}
              className={`mt-8 w-full py-4 uppercase tracking-[0.25em] text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                loading || !patient.name.trim()
                  ? "bg-black/20 text-black/40 cursor-not-allowed"
                  : "bg-black text-white hover:bg-black/80"
              }`}
            >
              {loading ? "Generating..." : "Generate Bill →"}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          BILL PREVIEW — screen modal + printable
      ──────────────────────────────────────────────────────────────────── */}
      {showBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 no-print">
          {/* Action bar — hidden on print */}
          <div className="absolute top-4 right-4 flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm uppercase tracking-widest font-semibold hover:bg-black hover:text-white transition-all"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={closeBill}
              className="bg-black/60 text-white px-4 py-2.5 hover:bg-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Bill paper */}
          <div className="print-bill-inner w-full max-w-4xl">
            <BillDocument
              billId={billId}
              billDate={billDate}
              pharmacy={pharmacy}
              patient={patient}
              cart={cart}
              itemAmt={itemAmt}
              subtotal={subtotal}
            />
          </div>
        </div>
      )}

      {/* Hidden print-only bill — rendered outside modal for clean printing */}
      {showBill && (
        <div className="print-bill hidden">
          <BillDocument
            billId={billId}
            billDate={billDate}
            pharmacy={pharmacy}
            patient={patient}
            cart={cart}
            itemAmt={itemAmt}
            subtotal={subtotal}
          />
        </div>
      )}
    </>
  )
}

// ─── Bill Document — matches the reference image format ──────────────────────

function BillDocument({
  billId,
  billDate,
  pharmacy,
  patient,
  cart,
  itemAmt,
  subtotal,
}: {
  billId: string
  billDate: string
  pharmacy: Pharmacy | null
  patient: Patient
  cart: CartItem[]
  itemAmt: (item: CartItem) => number
  subtotal: number
}) {
  const totalDiscount = cart.reduce(
    (s, i) => s + i.mrp * i.quantity * (i.discount / 100),
    0
  )

  return (
    <div
      style={{
        background: "white",
        fontFamily: "'Courier New', Courier, monospace",
        color: "#000",
        padding: "12px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER TABLE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1.5px solid #000",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            {/* BILL OF SUPPLY label */}
            <td
              style={{
                width: "14%",
                border: "1.5px solid #000",
                padding: "10px 8px",
                textAlign: "center",
                verticalAlign: "middle",
                fontWeight: "bold",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              BILL
              <br />
              OF
              <br />
              SUPPLY
            </td>

            {/* Pharmacy info */}
            <td
              style={{
                width: "55%",
                border: "1.5px solid #000",
                padding: "10px 12px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                  fontFamily: "Georgia, serif",
                }}
              >
                {pharmacy?.pharmacy?.toUpperCase() || "PHARMACY NAME"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                <strong>PROPRIETOR</strong>&nbsp; {pharmacy?.name?.toUpperCase() || "OWNER NAME"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                {pharmacy?.location || "Address, City, State - PINCODE"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                <strong>CONTACT</strong>&nbsp; {pharmacy?.phone || "-"}
                {pharmacy?.email && (
                  <>&nbsp;&nbsp;&nbsp;<strong>EMAIL ID</strong>&nbsp; {pharmacy.email}</>
                )}
              </div>
              {pharmacy?.drug_license_number && (
                <div style={{ fontSize: "11px" }}>
                  <strong>DRUG LIC</strong>&nbsp; {pharmacy.drug_license_number}
                  {pharmacy.gst_number && (
                    <>&nbsp;&nbsp;&nbsp;<strong>GST</strong>&nbsp; {pharmacy.gst_number}</>
                  )}
                </div>
              )}
            </td>

            {/* Bill number + patient info */}
            <td
              style={{
                width: "31%",
                border: "1.5px solid #000",
                padding: "10px 10px",
                verticalAlign: "top",
              }}
            >
              {/* Bill # + Date */}
              <table style={{ width: "100%", marginBottom: "8px" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {billId}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {billDate}
                    </td>
                  </tr>
                </tbody>
              </table>

              <hr style={{ border: "none", borderTop: "1px solid #000", margin: "6px 0" }} />

              {/* Patient details */}
              <table style={{ width: "100%", fontSize: "11px", borderSpacing: 0 }}>
                <tbody>
                  {[
                    ["PATIENT", patient.name || "-"],
                    ["AGE",     patient.age || "-"],
                    ["ADDRESS", patient.address || "-"],
                    ["CONTACT", patient.contact || "-"],
                    ["DOCTOR",  patient.doctor || "-"],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td
                        style={{
                          fontWeight: "bold",
                          paddingRight: "6px",
                          paddingBottom: "2px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                          width: "55px",
                        }}
                      >
                        {label}
                      </td>
                      <td style={{ paddingBottom: "2px", wordBreak: "break-word" }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ITEMS TABLE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1.5px solid #000",
          borderTop: "none",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr style={{ background: "#000", color: "#fff" }}>
            {[
              { label: "#",           w: "4%",  align: "center" },
              { label: "DESCRIPTION", w: "30%", align: "left"   },
              { label: "BATCH",       w: "13%", align: "left"   },
              { label: "EXP",         w: "9%",  align: "center" },
              { label: "QTY",         w: "7%",  align: "center" },
              { label: "MRP",         w: "11%", align: "right"  },
              { label: "DIS %",       w: "8%",  align: "right"  },
              { label: "AMT",         w: "13%", align: "right"  },
            ].map((col) => (
              <th
                key={col.label}
                style={{
                  width:     col.w,
                  padding:   "7px 6px",
                  fontSize:  "10px",
                  fontWeight:"bold",
                  textAlign: col.align as any,
                  letterSpacing: "0.08em",
                  border: "1px solid #333",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {cart.map((item, i) => (
            <tr
              key={item.inventoryId}
              style={{
                background: i % 2 === 0 ? "#fff" : "#fafafa",
                fontSize: "11px",
              }}
            >
              <td style={cellStyle("center")}>{i + 1}</td>
              <td style={cellStyle("left", true)}>{item.medicine_name}</td>
              <td style={cellStyle("left")}>{item.batch}</td>
              <td style={cellStyle("center")}>{fmtExpiry(item.expiry)}</td>
              <td style={cellStyle("center")}>{item.quantity}</td>
              <td style={cellStyle("right")}>{item.mrp.toFixed(2)}</td>
              <td style={cellStyle("right")}>{item.discount.toFixed(1)}</td>
              <td style={cellStyle("right")}>{itemAmt(item).toFixed(2)}</td>
            </tr>
          ))}

          {/* Padding rows to fill space */}
          {cart.length < 6 &&
            Array.from({ length: 6 - cart.length }).map((_, i) => (
              <tr key={`pad-${i}`} style={{ height: "26px" }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td
                    key={j}
                    style={{ border: "1px solid #ddd", padding: "4px 6px" }}
                  />
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1.5px solid #000",
          borderTop: "none",
        }}
      >
        <tbody>
          <tr>
            {/* Left: Thank you note */}
            <td
              style={{
                width: "55%",
                border: "1.5px solid #000",
                padding: "10px 14px",
                verticalAlign: "middle",
                fontSize: "11px",
              }}
            >
              <div style={{ fontStyle: "italic", color: "#444", marginBottom: "4px" }}>
                Thank you for your purchase.
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                Goods once sold will not be taken back or exchanged.
                <br />
                Subject to local jurisdiction.
              </div>
            </td>

            {/* Right: Amount summary */}
            <td
              style={{
                width: "45%",
                padding: 0,
                verticalAlign: "top",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <tbody>
                  <tr>
                    <td style={summaryCell()}>Gross Amount</td>
                    <td style={summaryCell(true)}>
                      ₹{cart.reduce((s, i) => s + i.mrp * i.quantity, 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryCell()}>Discount</td>
                    <td style={summaryCell(true)}>- ₹{totalDiscount.toFixed(2)}</td>
                  </tr>
                  <tr
                    style={{
                      background: "#000",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        letterSpacing: "0.06em",
                        borderTop: "1.5px solid #000",
                      }}
                    >
                      NET AMOUNT
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        borderTop: "1.5px solid #000",
                      }}
                    >
                      ₹{subtotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── SIGNATURE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1.5px solid #000",
          borderTop: "none",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "20px 14px 8px",
                fontSize: "10px",
                textAlign: "right",
                color: "#444",
              }}
            >
              Authorised Signatory
              <div
                style={{
                  marginTop: "24px",
                  borderTop: "1px solid #000",
                  paddingTop: "4px",
                  width: "160px",
                  marginLeft: "auto",
                  textAlign: "center",
                }}
              >
                {pharmacy?.name || "Pharmacist"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function cellStyle(align: "left" | "right" | "center", bold = false): React.CSSProperties {
  return {
    padding: "5px 6px",
    border: "1px solid #ddd",
    textAlign: align,
    fontWeight: bold ? "600" : "normal",
    verticalAlign: "middle",
    wordBreak: "break-word",
  }
}

function summaryCell(right = false): React.CSSProperties {
  return {
    padding: "5px 12px",
    borderBottom: "1px solid #ddd",
    textAlign: right ? "right" : "left",
    fontWeight: right ? "600" : "normal",
  }
}