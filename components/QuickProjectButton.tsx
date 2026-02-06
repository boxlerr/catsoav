"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function QuickProjectButton() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    console.log("QuickProjectButton mounted, session:", session?.user?.role)
    const [view, setView] = useState<'project' | 'categories'>('project')
    const [categories, setCategories] = useState<{ id: string, name: string, title: string, description?: string }[]>([])
    const [activeTab, setActiveTab] = useState({ image: 'url', video: 'url' })
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        clientName: "",
        published: true
    })

    // Category Manager state
    const [editingCatId, setEditingCatId] = useState<string | null>(null)
    const [editCatData, setEditCatData] = useState({ title: "", description: "" })
    const [newCat, setNewCat] = useState({ title: "", description: "" })

    // Project Editor state
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
                if (data.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: data[0].name }))
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }, [formData.category])

    useEffect(() => {
        if (isOpen) {
            fetchCategories()
        }
    }, [isOpen, fetchCategories])

    useEffect(() => {
        const handleEdit = (e: CustomEvent) => {
            const project = e.detail
            setEditingProjectId(project.id)
            setFormData({
                title: project.title || "",
                category: project.category || "",
                description: project.description || "",
                imageUrl: project.imageUrl || "",
                videoUrl: project.videoUrl || "",
                clientName: project.clientName || "",
                published: project.published !== undefined ? project.published : true
            })
            setIsOpen(true)
            setView('project')
        }

        const handleNew = (e: CustomEvent) => {
            const preselectedCategory = e.detail?.category || (categories.length > 0 ? categories[0].name : "")
            setEditingProjectId(null)
            setFormData({
                title: "",
                category: preselectedCategory,
                description: "",
                imageUrl: "",
                videoUrl: "",
                clientName: "",
                published: true
            })
            setIsOpen(true)
            setView('project')
        }

        const handleEditCategory = (e: CustomEvent) => {
            console.log("QuickProjectButton received editCategory:", e.detail)
            const category = e.detail
            setEditingCatId(category.id)
            setEditCatData({
                title: category.title || "",
                description: category.description || ""
            })
            setIsOpen(true)
            setView('categories')
        }

        console.log("Adding event listeners in QuickProjectButton")
        window.addEventListener('editProject' as string, handleEdit as EventListener)
        window.addEventListener('newProject' as string, handleNew as EventListener)
        window.addEventListener('editCategory' as string, handleEditCategory as EventListener)
        return () => {
            window.removeEventListener('editProject' as string, handleEdit as EventListener)
            window.removeEventListener('newProject' as string, handleNew as EventListener)
            window.removeEventListener('editCategory' as string, handleEditCategory as EventListener)
        }
    }, [categories])

    // if (session?.user?.role !== "admin") return null // Removed early return to allow listeners to attach

    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        const formDataPayload = new FormData()
        formDataPayload.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formDataPayload })
        if (!res.ok) throw new Error(`Error uploading ${type}`)
        const data = await res.json()
        return data.url
    }

    const handleSubmitProject = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            let finalImageUrl = formData.imageUrl
            let finalVideoUrl = formData.videoUrl

            const imageFile = (document.getElementById('image-upload') as HTMLInputElement)?.files?.[0]
            const videoFile = (document.getElementById('video-upload') as HTMLInputElement)?.files?.[0]

            if (activeTab.image === 'file' && imageFile) finalImageUrl = await handleFileUpload(imageFile, 'image')
            if (activeTab.video === 'file' && videoFile) finalVideoUrl = await handleFileUpload(videoFile, 'video')

            const url = editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects"
            const method = editingProjectId ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, imageUrl: finalImageUrl, videoUrl: finalVideoUrl })
            })

            if (!res.ok) throw new Error(`Error ${editingProjectId ? 'updating' : 'creating'} project`)

            setIsOpen(false)
            setEditingProjectId(null)
            setFormData({ title: "", category: "", description: "", imageUrl: "", videoUrl: "", clientName: "", published: true })
            router.refresh()
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert(`Error al ${editingProjectId ? 'actualizar' : 'crear'} el proyecto`)
        } finally {
            setLoading(false)
        }
    }

    const _handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCat.title) return
        setLoading(true)
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            })
            if (res.ok) {
                setNewCat({ title: "", description: "" })
                await fetchCategories()
            } else {
                const errorData = await res.json()
                alert(errorData.error || "Error al crear la categoría")
            }
        } catch (error) {
            console.error(error)
            alert("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingCatId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/categories/${editingCatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editCatData)
            })
            if (res.ok) {
                setEditingCatId(null)
                await fetchCategories()
                router.refresh()
            } else {
                const errorData = await res.json()
                alert(errorData.error || "Error al actualizar la categoría")
            }
        } catch (error) {
            console.error(error)
            alert("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("¿Eliminar categoría? Los videos asociados podrían quedar huérfanos.")) return
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchCategories()
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (session?.user?.role !== "admin") return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-[20px] p-4 cursor-pointer"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] w-full max-w-4xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[85vh] border-t-white/10 cursor-default"
                    >
                        {/* Header Area */}
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-black/40">
                            <div>
                                <h3 className="text-white font-serif font-bold text-xl mb-1">CATSO <span className="text-red-600">AV</span></h3>
                                <p className="text-white/20 text-[9px] uppercase tracking-[0.3em]">Master Console v2.1</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors" aria-label="Cerrar Panel">
                                <span className="text-[10px] uppercase font-bold tracking-widest">Cerrar</span>
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-gradient-to-br from-transparent to-white/[0.02]">
                            {view === 'project' ? (
                                <form onSubmit={handleSubmitProject} className="max-w-3xl mx-auto space-y-10">
                                    <header>
                                        <h2 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                                            {editingProjectId ? 'Editar Obra' : 'Agregar Contenido'}
                                            <span className="text-red-600">.</span>
                                        </h2>
                                        <p className="text-white/40 text-sm font-light">
                                            {editingProjectId ? 'Actualiza los metadatos y medios del proyecto.' : 'Configura los metadatos y medios para la nueva producción.'}
                                        </p>
                                    </header>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Título</label>
                                                <input required type="text" placeholder="Ej: Abstract Motion v1" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white/[0.05] transition-all placeholder:text-white/5" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Cliente / Artista</label>
                                                <input type="text" placeholder="Catso Studios" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white/[0.05] transition-all placeholder:text-white/5" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Categoría Destino</label>
                                            <div className="flex flex-wrap gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
                                                {categories.map(cat => (
                                                    <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.name })} className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all ${formData.category === cat.name ? "bg-red-600 text-white shadow-lg" : "hover:bg-white/5 text-white/40 hover:text-white"}`}>
                                                        {cat.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Descripción Narrativa</label>
                                            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white/[0.05] transition-all resize-none placeholder:text-white/5" placeholder="Describe brevemente la visión estética del proyecto..." />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Miniatura (Preview)</label>
                                                    <div className="flex bg-white/5 rounded-lg p-1">
                                                        {['url', 'file'].map(t => (
                                                            <button key={t} type="button" onClick={() => setActiveTab({ ...activeTab, image: t as 'url' | 'file' })} className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition-all ${activeTab.image === t ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>{t}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {activeTab.image === 'url' ? (
                                                    <input type="url" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white p-4 rounded-2xl text-xs focus:outline-none focus:border-red-600 transition-all font-mono placeholder:text-white/5" />
                                                ) : (
                                                    <label className="group w-full flex flex-col items-center justify-center p-8 bg-white/[0.02] border-2 border-dashed border-white/5 hover:border-red-600/30 rounded-2xl cursor-pointer transition-all">
                                                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, imageUrl: f.name }) }} />
                                                        <svg className="w-6 h-6 text-white/10 mb-2 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        <span className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em]">{formData.imageUrl || "Cargar Imagen Local"}</span>
                                                    </label>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Video (Master Copy)</label>
                                                    <div className="flex bg-white/5 rounded-lg p-1">
                                                        {['url', 'file'].map(t => (
                                                            <button key={t} type="button" onClick={() => setActiveTab({ ...activeTab, video: t as 'url' | 'file' })} className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition-all ${activeTab.video === t ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>{t}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {activeTab.video === 'url' ? (
                                                    <input type="url" placeholder="https://..." value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white p-4 rounded-2xl text-xs focus:outline-none focus:border-red-600 transition-all font-mono placeholder:text-white/5" />
                                                ) : (
                                                    <label className="group w-full flex flex-col items-center justify-center p-8 bg-white/[0.02] border-2 border-dashed border-white/5 hover:border-red-600/30 rounded-2xl cursor-pointer transition-all">
                                                        <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, videoUrl: f.name }) }} />
                                                        <svg className="w-6 h-6 text-white/10 mb-2 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        <span className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em]">{formData.videoUrl || "Cargar Video Local"}</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Visibilidad del Proyecto</label>
                                        <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl group/toggle cursor-pointer" onClick={() => setFormData({ ...formData, published: !formData.published })}>
                                            <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${formData.published ? 'bg-red-600' : 'bg-white/10'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${formData.published ? 'left-7' : 'left-1'}`} />
                                            </div>
                                            <div>
                                                <span className={`text-xs uppercase tracking-widest font-black transition-colors ${formData.published ? 'text-white' : 'text-white/40'}`}>
                                                    {formData.published ? 'Público (Visible en la web)' : 'Privado (Solo Admin)'}
                                                </span>
                                                <p className="text-[10px] text-white/20 mt-0.5">Controla si este video aparece en la galería principal.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10">
                                        <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-white text-white hover:text-black font-serif font-black tracking-[0.4em] uppercase text-xs py-5 rounded-2xl transition-all duration-500 shadow-xl shadow-red-900/20 active:scale-[0.98]">
                                            {loading ? "Sincronizando..." : (editingProjectId ? "Actualizar Obra" : "Publicar Obra")}
                                        </button>
                                        {editingProjectId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProjectId(null)
                                                    setFormData({ title: "", category: "", description: "", imageUrl: "", videoUrl: "", clientName: "", published: true })
                                                }}
                                                className="w-full mt-4 text-white/30 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
                                            >
                                                Cancelar Edición
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleUpdateCategory} className="max-w-xl mx-auto space-y-10 py-10">
                                    <header className="text-center">
                                        <h2 className="text-3xl font-serif font-bold text-white mb-2">Editar Categoría</h2>
                                        <p className="text-white/40 text-sm">Modifica el nombre y descripción de la categoría.</p>
                                    </header>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Título de Categoría</label>
                                            <input
                                                required
                                                type="text"
                                                value={editCatData.title}
                                                onChange={e => setEditCatData({ ...editCatData, title: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Descripción</label>
                                            <textarea
                                                rows={3}
                                                value={editCatData.description}
                                                onChange={e => setEditCatData({ ...editCatData, description: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 space-y-4">
                                        <button disabled={loading} type="submit" className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-serif font-black tracking-[0.2em] uppercase text-xs py-4 rounded-xl transition-all shadow-lg">
                                            {loading ? "Guardando..." : "Guardar Cambios"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCategory(editingCatId!)}
                                            className="w-full text-red-500/50 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest transition-colors"
                                        >
                                            Eliminar Categoría
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
