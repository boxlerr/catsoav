"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const CATEGORIES = [
    { id: "videoclips", title: "Videoclips" },
    { id: "restaurants", title: "Restaurants" },
    { id: "nightclubs", title: "Nightclubs" },
    { id: "photography", title: "Photography" },
    { id: "social-media", title: "Social Media" },
    { id: "dj-sets", title: "DJ Sets" },
]

export default function QuickProjectButton() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "videoclips",
        description: "",
        imageUrl: "",
        videoUrl: "",
        clientName: ""
    })

    // Only show for admins
    if (session?.user?.role !== "admin") return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Error creating project")

            setIsOpen(false)
            setFormData({
                title: "",
                category: "videoclips",
                description: "",
                imageUrl: "",
                videoUrl: "",
                clientName: ""
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error al crear el proyecto")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
                title="Agregar Nuevo Video"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold font-serif">Nuevo Proyecto</h2>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/80 mb-1 text-sm">Título</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 rounded focus:outline-none focus:border-red-600"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-1 text-sm">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 rounded focus:outline-none focus:border-red-600"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/80 mb-1 text-sm">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 rounded focus:outline-none focus:border-red-600"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-1 text-sm">URL Imagen (Thumbnail)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 rounded focus:outline-none focus:border-red-600"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-1 text-sm">URL Video (Youtube/Vimeo)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                    className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 rounded focus:outline-none focus:border-red-600"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : "Guardar Proyecto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
