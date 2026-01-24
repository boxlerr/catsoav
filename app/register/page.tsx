"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Error al registrarse")
                return
            }

            router.push("/login")
        } catch (error) {
            setError("Error al registrarse")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">
                        CATSO <span className="text-red-600">AV</span>
                    </h1>
                    <p className="text-white/60">Crear Cuenta</p>
                </div>

                <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-6">Registro</h2>

                    {error && (
                        <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-white/80 mb-2 text-sm">
                                Nombre
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition-colors"
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-white/80 mb-2 text-sm">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition-colors"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-white/80 mb-2 text-sm">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-white/80 mb-2 text-sm">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/login" className="text-red-600 hover:text-red-500 transition-colors">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
