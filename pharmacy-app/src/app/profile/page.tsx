"use client"

import {
  useEffect,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import {
  User,
  Building2,
  MapPin,
  Clock3,
  ShieldCheck,
  Save,
  FileBarChart,
  Lock,
  LogOut,
  Archive,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()

  const [formData, setFormData] =
    useState({
      ownerName: "",
      email: "",
      phone: "",

      pharmacyName: "",
      ayushmanId: "",
      drugLicense: "",
      licenseExpiry: "",
      gstNumber: "",
      location: "",
      timings: "",
    })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile =
    async () => {
      try {
        const res = await fetch(
          "/api/profile"
        )

        const data =
          await res.json()

        setFormData({
          ownerName:
            data?.name || "",

          email:
            data?.email || "",

          phone:
            data?.phone || "",

          pharmacyName:
            data?.pharmacy || "",

          ayushmanId:
            data?.ayushman_hfr_id ||
            "",

          drugLicense:
            data?.drug_license_number ||
            "",

          licenseExpiry:
            data?.license_expiry
              ? new Date(
                  data.license_expiry
                )
                  .toISOString()
                  .split("T")[0]
              : "",

          gstNumber:
            data?.gst_number ||
            "",

          location:
            data?.location ||
            "",

          timings:
            data?.timings ||
            "",
        })
      } catch (error) {
        console.log(error)
      }
    }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleSave = () => {
    alert(
      "Business profile saved successfully"
    )
  }

  const handleLogout = () => {
    router.push("/login")
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
          Profile
        </div>
      </nav>

      {/* Header */}
      <section className="px-8 py-14">
        <p className="uppercase tracking-[0.4em] text-sm text-black/40 mb-4">
          Account Settings
        </p>

        <h1 className="text-6xl font-black leading-none tracking-tight">
          PROFILE
        </h1>
      </section>

      {/* Main Grid */}
      <section className="grid lg:grid-cols-2 gap-8 px-8">
        {/* Personal Info */}
        <div className="border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-8">
            <User size={22} />

            <h2 className="text-2xl font-black uppercase tracking-[0.2em]">
              Personal Info
            </h2>
          </div>

          <div className="space-y-6">
            {/* Owner Name */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Owner Name
              </label>

              <input
                type="text"
                name="ownerName"
                value={
                  formData.ownerName
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Business Profile */}
        <div className="border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Building2 size={22} />

            <h2 className="text-2xl font-black uppercase tracking-[0.2em]">
              Business Profile
            </h2>
          </div>

          <div className="space-y-6">
            {/* Pharmacy Name */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Pharmacy Name
              </label>

              <input
                type="text"
                name="pharmacyName"
                value={
                  formData.pharmacyName
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Ayushman */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Ayushman HFR ID
              </label>

              <input
                type="text"
                name="ayushmanId"
                value={
                  formData.ayushmanId
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Drug License */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Drug License Number
              </label>

              <input
                type="text"
                name="drugLicense"
                value={
                  formData.drugLicense
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                License Expiry
              </label>

              <input
                type="date"
                name="licenseExpiry"
                value={
                  formData.licenseExpiry
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* GST */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                GST / Taxation
              </label>

              <input
                type="text"
                name="gstNumber"
                value={
                  formData.gstNumber
                }
                onChange={
                  handleChange
                }
                className="w-full border border-black/10 px-4 py-3 outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Location
              </label>

              <div className="flex items-center border border-black/10 px-4">
                <MapPin size={18} />

                <input
                  type="text"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full px-3 py-3 outline-none"
                />
              </div>
            </div>

            {/* Timings */}
            <div>
              <label className="block mb-2 uppercase tracking-[0.2em] text-xs text-black/40">
                Timings
              </label>

              <div className="flex items-center border border-black/10 px-4">
                <Clock3 size={18} />

                <input
                  type="text"
                  name="timings"
                  placeholder="9 AM - 10 PM"
                  value={
                    formData.timings
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full px-3 py-3 outline-none"
                />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mt-4"
            >
              <Save size={18} />
              Save Business Profile
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Cards */}
      <section className="grid md:grid-cols-3 gap-6 px-8 py-14">
        {/* Reports */}
        <div className="border border-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileBarChart size={20} />

            <h3 className="uppercase tracking-[0.2em] text-sm font-bold">
              Reports
            </h3>
          </div>

          <p className="text-black/60 text-sm leading-relaxed mb-6">
            Access weekly and monthly pharmacy
            reports and sales summaries.
          </p>

          <button className="border border-black px-4 py-3 uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all duration-300 w-full">
            View Reports
          </button>
        </div>

        {/* Archive */}
        <div className="border border-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Archive size={20} />

            <h3 className="uppercase tracking-[0.2em] text-sm font-bold">
              Analysis Archive
            </h3>
          </div>

          <p className="text-black/60 text-sm leading-relaxed mb-6">
            View previous inventory and sales
            analytics history.
          </p>

          <button className="border border-black px-4 py-3 uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all duration-300 w-full">
            Open Archive
          </button>
        </div>

        {/* Security */}
        <div className="border border-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={20} />

            <h3 className="uppercase tracking-[0.2em] text-sm font-bold">
              Security
            </h3>
          </div>

          <p className="text-black/60 text-sm leading-relaxed mb-6">
            Manage password and secure account
            access settings.
          </p>

          <div className="space-y-3">
            <button className="border border-black px-4 py-3 uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all duration-300 w-full flex items-center justify-center gap-2">
              <Lock size={16} />
              Change Password
            </button>

            <button
              onClick={
                handleLogout
              }
              className="bg-black text-white px-4 py-3 uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-opacity w-full flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}