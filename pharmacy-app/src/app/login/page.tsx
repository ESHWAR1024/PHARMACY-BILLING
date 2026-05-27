"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      router.push("/home")
    } catch (err) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/20 p-10 bg-black">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight">
            PHARMA
          </h1>

          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/50">
            Inventory • Billing • Analytics
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block mb-2 text-xs uppercase tracking-[0.3em] text-white/50">
              ID / Email
            </label>

            <input
              type="text"
              placeholder="Enter ID"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-white"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-xs uppercase tracking-[0.3em] text-white/50">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-white"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 uppercase tracking-[0.2em] font-semibold hover:bg-black hover:text-white border border-white transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 flex justify-between text-xs uppercase tracking-[0.3em] text-white/30">
          <span>Secure Access</span>
          <span>v1.0</span>
        </div>
      </div>
    </main>
  )
}