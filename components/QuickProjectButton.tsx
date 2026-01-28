"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function QuickProjectButton() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<'project' | 'categories'>('project')
    const [categories, setCategories] = useState<any[]>([])
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
    const [newCat, setNewCat] = useState({ title: "", description: "" })
    const [editingCatId, setEditingCatId] = useState<string | null>(null)
    const [editCatData, setEditCatData] = useState({ title: "", description: "" })

    // Project Editor state
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) fetchCategories()
    }, [isOpen])

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
        window.addEventListener('editProject' as any, handleEdit)
        return () => window.removeEventListener('editProject' as any, handleEdit)
    }, [])

    const fetchCategories = async () => {
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
    }

    if (session?.user?.role !== "admin") return null

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

    const handleAddCategory = async (e: React.FormEvent) => {
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
            if (res.ok) fetchCategories()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-white hover:bg-red-600 text-black hover:text-white px-8 py-5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-105 flex items-center gap-4 group border border-white/10"
            >
                <div className="bg-black/5 p-1 rounded-full group-hover:rotate-180 transition-transform duration-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span className="font-serif font-black tracking-[0.2em] uppercase text-xs">Terminal Admin</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-[20px] p-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-[85vh] border-t-white/10">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 bg-black/40 border-r border-white/5 p-8 flex flex-col justify-between">
                            <div>
                                <div className="mb-12">
                                    <h3 className="text-white font-serif font-bold text-xl mb-1">CATSO <span className="text-red-600">AV</span></h3>
                                    <p className="text-white/20 text-[9px] uppercase tracking-[0.3em]">Master Console v2.1</p>
                                </div>
                                <nav className="space-y-4">
                                    <button
                                        onClick={() => setView('project')}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${view === 'project' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                                    >Nuevo Video</button>
                                    <button
                                        onClick={() => setView('categories')}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${view === 'categories' ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                                    >Categorías</button>
                                </nav>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                                <span className="text-[10px] uppercase font-bold tracking-widest">Cerrar Panel</span>
                                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
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

                                        {/* Multimedia Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Miniatura (Preview)</label>
                                                    <div className="flex bg-white/5 rounded-lg p-1">
                                                        {['url', 'file'].map(t => (
                                                            <button key={t} type="button" onClick={() => setActiveTab({ ...activeTab, image: t as any })} className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition-all ${activeTab.image === t ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>{t}</button>
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
                                                            <button key={t} type="button" onClick={() => setActiveTab({ ...activeTab, video: t as any })} className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition-all ${activeTab.video === t ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>{t}</button>
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
                                <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-right-10 duration-500">
                                    <header>
                                        <h2 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">Estructura Galería<span className="text-red-600">.</span></h2>
                                        <p className="text-white/40 text-sm font-light">Gestiona y edita las categorías dinámicas de tu portafolio.</p>
                                    </header>

                                    {/* Category Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {categories.map((cat, idx) => (
                                            <div key={cat.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 group hover:border-red-600/30 transition-all duration-500 relative">
                                                {editingCatId === cat.id ? (
                                                    <form onSubmit={handleUpdateCategory} className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <input required type="text" value={editCatData.title} onChange={e => setEditCatData({ ...editCatData, title: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600" />
                                                            <input readOnly type="text" value={editCatData.title.toLowerCase().replace(/\s+/g, '-')} className="w-full bg-black/20 border border-white/5 text-white/20 px-4 py-3 rounded-xl cursor-not-allowed font-mono" />
                                                        </div>
                                                        <textarea rows={2} value={editCatData.description} onChange={e => setEditCatData({ ...editCatData, description: e.target.value })} className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 resize-none" />
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest">Guardar Cambios</button>
                                                            <button type="button" onClick={() => setEditingCatId(null)} className="bg-white/5 text-white/40 px-6 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest">Cancelar</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <span className="font-mono text-white/10 text-2xl font-bold">0{idx + 1}</span>
                                                            <div>
                                                                <h4 className="text-white font-serif font-bold text-lg tracking-tight">{cat.title}</h4>
                                                                <p className="text-white/30 text-[10px] uppercase font-medium tracking-[0.2em]">{cat.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => { setEditingCatId(cat.id); setEditCatData({ title: cat.title, description: cat.description || "" }) }} className="bg-white/5 hover:bg-white/10 text-white/40 hover:text-white p-3 rounded-2xl transition-all">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </button>
                                                            <button onClick={() => handleDeleteCategory(cat.id)} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-2xl transition-all">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Category Form */}
                                    <div className="pt-10 border-t border-white/5">
                                        <h3 className="text-white font-serif font-bold text-xl mb-6 ml-2">Nueva Sección</h3>
                                        <form onSubmit={handleAddCategory} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Título Visual</label>
                                                    <input required type="text" placeholder="Ej: Fashion Film" value={newCat.title} onChange={e => setNewCat({ ...newCat, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all placeholder:text-white/5" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-white/30 text-[10px] uppercase font-black ml-1 tracking-[0.2em]">Slug Automático</label>
                                                    <input readOnly type="text" value={newCat.title.toLowerCase().replace(/\s+/g, '-')} className="w-full bg-white/[0.01] border border-white/5 text-white/20 px-5 py-4 rounded-2xl focus:outline-none cursor-not-allowed font-mono" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Descripción de Colección</label>
                                                <textarea rows={2} value={newCat.description} onChange={e => setNewCat({ ...newCat, description: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-red-600 transition-all resize-none placeholder:text-white/5" placeholder="¿Qué tipo de contenido define esta categoría?" />
                                            </div>
                                            <button disabled={loading} type="submit" className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-serif font-black tracking-[0.2em] uppercase text-[10px] py-4 rounded-2xl transition-all duration-500 group flex items-center justify-center gap-3">
                                                {loading ? "Registrando..." : (
                                                    <>
                                                        <span>Registrar Categoría</span>
                                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
