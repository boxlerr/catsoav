"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError("Credenciales inválidas")
            } else {
                router.push("/admin")
                router.refresh()
            }
        } catch (error) {
            setError("Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-2">
                        <img src="/logo-white.png" alt="CATSO AV" className="h-12 w-auto" />
                    </div>
                    <p className="text-white/60">Panel de Administración</p>
                </div>

                <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-white/80 mb-2 text-sm">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 bg-black/50 border-white/20"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                                Recordarme
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </button>
                    </form>


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
