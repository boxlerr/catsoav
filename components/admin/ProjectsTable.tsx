"use client"

import { useState } from "react"
import DeleteProjectButton from "./DeleteProjectButton"

interface Project {
    id: string
    title: string
    category: string
    createdAt: string | Date
}

interface ProjectsTableProps {
    projects: Project[]
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

    const toggleProject = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedIds.length === projects.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(projects.map(p => p.id))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`¿Estás seguro de que quieres eliminar los ${selectedIds.length} proyectos seleccionados?`)) return

        setIsBulkDeleting(true)
        try {
            const res = await fetch("/api/projects/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            })

            if (res.ok) {
                window.location.reload()
            } else {
                alert("Error al eliminar los proyectos seleccionados")
            }
        } catch (error) {
            console.error("Bulk delete error:", error)
            alert("Error de red")
        } finally {
            setIsBulkDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-red-500">
                        {selectedIds.length} {selectedIds.length === 1 ? 'proyecto seleccionado' : 'proyectos seleccionados'}
                    </p>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isBulkDeleting}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                        {isBulkDeleting ? 'Eliminando...' : 'Eliminar Seleccionados'}
                    </button>
                </div>
            )}

            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-800 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === projects.length && projects.length > 0}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-white/10 bg-black/20 text-red-600 focus:ring-red-600/20 transition-all cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                                    No hay proyectos aún.
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr
                                    key={project.id}
                                    className={`transition-colors cursor-pointer ${selectedIds.includes(project.id) ? 'bg-red-600/5 hover:bg-red-600/10' : 'hover:bg-white/5'}`}
                                    onClick={() => toggleProject(project.id)}
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(project.id)}
                                            onChange={() => toggleProject(project.id)}
                                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-blue-600 focus:ring-blue-600/20 transition-all cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium">{project.title}</td>
                                    <td className="px-6 py-4 text-white/60 capitalize">{project.category}</td>
                                    <td className="px-6 py-4 text-white/60">{new Date(project.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <a href={`/admin/projects/${project.id}/edit`} className="text-white/60 hover:text-white mr-4 transition-colors">Editar</a>
                                        <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
