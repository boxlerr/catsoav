"use client"

import { useState, useMemo, useEffect } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable // Added
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities" // Added
// import { SortableItem } from "@/components/SortableItem" // Removed
import DeleteProjectButton from "./DeleteProjectButton"
import { useRouter } from "next/navigation"

interface Project {
    id: string
    title: string
    category: string
    order: number
    published: boolean
    createdAt: string | Date
}

interface Category {
    id: string
    name: string
    title: string
    order: number
}

interface AdminContentProps {
    initialProjects: Project[]
    initialCategories: Category[]
}

// New SortableCategory component
function SortableCategory({ category, children, isAllSelected, toggleAll, index }: {
    category: Category,
    children: React.ReactNode,
    isAllSelected: boolean,
    toggleAll: () => void,
    index: number
}) {
    const safeId = category.id ? `cat-${category.id}` : `cat-fallback-${index}`
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: safeId })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as const,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-xl mb-6">
                <div
                    className="bg-neutral-800/80 px-6 py-4 flex items-center justify-between border-b border-white/5"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="bg-red-600/10 p-1.5 rounded text-red-500 cursor-move"
                            {...attributes}
                            {...listeners}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded border-white/10 bg-black/20 text-red-600 focus:ring-red-600/20 transition-all cursor-pointer"
                            />
                            <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">{category.title}</h3>
                            <span className="text-[10px] text-white/20 font-mono tracking-tighter">({category.name})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('editCategory', { detail: category }));
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-red-500 transition-colors mr-4"
                        >
                            Editar
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('newProject', { detail: { category: category.name } }));
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                        >
                            + Nuevo
                        </button>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

// New SortableProject component
function SortableProject({ project, selectedIds, toggleProject, activeId, onTogglePublished, index }: {
    project: Project,
    selectedIds: string[],
    toggleProject: (id: string) => void,
    activeId: string | null,
    onTogglePublished: (project: Project) => void,
    index: number
}) {
    const safeId = project.id ? `proj-${project.id}` : `proj-fallback-${index}`
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: safeId })

    const isGroupDragging = activeId && selectedIds.includes(activeId) && selectedIds.includes(project.id)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : (isGroupDragging ? 0.3 : 1),
        zIndex: isDragging ? 100 : 1, // Increased zIndex
        position: 'relative' as const,
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`transition-colors group hover:bg-white/5 ${selectedIds.includes(project.id) ? 'bg-red-600/[0.08]' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleProject(project.id); }}
        >
            <td className="w-12 px-6 py-4">
                <div
                    className="p-2 opacity-20 group-hover:opacity-100 transition-opacity cursor-move text-white"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-white/10 bg-black/20 text-red-600 focus:ring-red-600/20 transition-all cursor-pointer hover:border-red-600/50"
                    />
                    <span className="font-medium text-sm text-white/90">{project.title}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-xs text-white/40 hidden md:table-cell">
                {new Date(project.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('editProject', { detail: project }))}
                        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => onTogglePublished(project)}
                        className="relative inline-flex items-center group/switch"
                        title={project.published ? 'Ocultar de la web' : 'Mostrar en la web'}
                    >
                        <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${project.published ? 'bg-[#007b00]' : 'bg-white/10 group-hover/switch:bg-white/20'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${project.published ? 'left-[18px]' : 'left-[2px]'}`} />
                        </div>
                    </button>
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                </div>
            </td>
        </tr>
    )
}

export default function AdminContent({ initialProjects, initialCategories }: AdminContentProps) {
    const [projects, setProjects] = useState<Project[]>(() => {
        if (!initialProjects) return []
        const valid = initialProjects.filter(p => p && p.id && typeof p.id === 'string' && p.id.trim() !== '')
        return Array.from(new Map(valid.map(p => [p.id, p])).values())
    })
    const [categories, setCategories] = useState<Category[]>(() => {
        if (!initialCategories) return []
        const valid = initialCategories.filter(c => c && c.id && typeof c.id === 'string' && c.id.trim() !== '')
        return Array.from(new Map(valid.map(c => [c.id, c])).values())
    })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'category' | 'project' | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasMounted, setHasMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setHasMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Update local state when props change, ensuring uniqueness and non-empty IDs
    useEffect(() => {
        if (initialProjects) {
            const validProjects = initialProjects.filter(p => p && p.id && typeof p.id === 'string' && p.id.trim() !== '')
            const uniqueProjects = Array.from(new Map(validProjects.map(p => [p.id, p])).values())
            setProjects(uniqueProjects)
        }
    }, [initialProjects])

    useEffect(() => {
        if (initialCategories) {
            const validCategories = initialCategories.filter(c => c && c.id && typeof c.id === 'string' && c.id.trim() !== '')
            const uniqueCategories = Array.from(new Map(validCategories.map(c => [c.id, c])).values())
            setCategories(uniqueCategories)
        }
    }, [initialCategories])

    // Memoized projects by category
    const projectsByCategory = useMemo(() => {
        const grouped: Record<string, Project[]> = {}
        categories.forEach(cat => {
            grouped[cat.name] = projects
                .filter(p => p.category === cat.name)
        })
        return grouped
    }, [projects, categories])

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        setActiveId(active.id as string)

        const isCategory = categories.some(c => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === active.id)
        setActiveType(isCategory ? 'category' : 'project')
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const isActiveCategory = categories.some(c => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === activeId)
        if (isActiveCategory) return // Category sorting handled in handleDragEnd

        const overProject = projects.find((p, idx) => (p.id ? `proj-${p.id}` : `proj-fallback-${idx}`) === overId)
        const overCategory = categories.find((c, idx) => (c.id ? `cat-${c.id}` : `cat-fallback-${idx}`) === overId)

        if (!overProject && !overCategory) return

        setProjects((prev) => {
            const activeIndex = prev.findIndex((p, idx) => (p.id ? `proj-${p.id}` : `proj-fallback-${idx}`) === activeId)
            const overIndex = prev.findIndex((p, idx) => (p.id ? `proj-${p.id}` : `proj-fallback-${idx}`) === overId)

            const activeProj = prev[activeIndex]
            if (!activeProj) return prev

            // Case 1: Moving over another project
            if (overProject) {
                if (activeProj.category !== overProject.category) {
                    // Changing category
                    const newProjects = [...prev]
                    newProjects[activeIndex] = { ...activeProj, category: overProject.category }
                    return arrayMove(newProjects, activeIndex, overIndex)
                }
                return arrayMove(prev, activeIndex, overIndex)
            }

            // Case 2: Moving over a category header
            if (overCategory) {
                if (activeProj.category !== overCategory.name) {
                    const newProjects = [...prev]
                    newProjects[activeIndex] = { ...activeProj, category: overCategory.name }
                    // Move to start of the new category
                    const firstInCat = newProjects.findIndex(p => p.category === overCategory.name)
                    return arrayMove(newProjects, activeIndex, firstInCat !== -1 ? firstInCat : activeIndex)
                }
            }

            return prev
        })
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)
        setActiveType(null)

        if (!over) return

        const activeId = active.id as string

        const isActiveCategory = categories.some(c => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === activeId)

        setIsSaving(true)
        try {
            if (isActiveCategory) {
                const reorderItems = categories.map((cat, index) => ({
                    id: cat.id,
                    order: index
                }))

                const res = await fetch("/api/categories/reorder", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: reorderItems })
                })
                if (!res.ok) throw new Error("Error saving categories order")
            } else {
                // Project Reordering
                // Persistence
                const projectsToSync: { id: string; order: number; category: string }[] = []
                const counts: Record<string, number> = {}
                projects.forEach(p => {
                    if (!counts[p.category]) counts[p.category] = 0
                    projectsToSync.push({ id: p.id, order: counts[p.category], category: p.category })
                    counts[p.category]++
                })

                const res = await fetch("/api/projects/reorder", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: projectsToSync })
                })
                if (!res.ok) throw new Error("Error saving projects order")
            }

            // Sync server state
            router.refresh()
        } catch (error) {
            console.error("Reorder sync error:", error)
            alert("Error al guardar el nuevo orden")
            // Reload to revert local state to last known good server state
            window.location.reload()
        } finally {
            setIsSaving(false)
        }
    }

    const toggleProject = (id: string) => {
        setSelectedIds((prev: string[]) =>
            prev.includes(id)
                ? prev.filter((i: string) => i !== id)
                : [...prev, id]
        )
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} proyectos?`)) return

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
                alert("Error al eliminar")
            }
        } catch (error) {
            console.error("Bulk delete error:", error)
            alert("Error de red")
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const togglePublished = async (project: Project) => {
        const newStatus = !project.published

        // Optimistic update
        setProjects(prev => prev.map(p =>
            p.id === project.id ? { ...p, published: newStatus } : p
        ))

        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: newStatus })
            })

            if (!res.ok) {
                // Revert on error
                setProjects(prev => prev.map(p =>
                    p.id === project.id ? { ...p, published: project.published } : p
                ))
                alert("Error al actualizar la visibilidad")
            }
            // No reload needed!
        } catch (error) {
            console.error("Toggle visibility error:", error)
            // Revert on error
            setProjects(prev => prev.map(p =>
                p.id === project.id ? { ...p, published: project.published } : p
            ))
            alert("Error de red")
        }
    }

    if (!hasMounted) return <div className="min-h-screen bg-black" />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center h-12">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center justify-between w-full p-4 bg-red-600/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-medium text-red-500">
                            {selectedIds.length} proyectos seleccionados
                        </p>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {isBulkDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {isSaving && (
                            <div className="flex items-center gap-2 text-xs text-white/40 animate-pulse">
                                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                <span>Guardando cambios...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DndContext
                id="admin-dnd-context"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={categories.map((c, idx) => c.id ? `cat-${c.id}` : `cat-fallback-${idx}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {categories.map((category, idx) => {
                            const catProjects = projectsByCategory[category.name] || []
                            const isAllSelected = catProjects.length > 0 && catProjects.every(p => selectedIds.includes(p.id))

                            const toggleAll = () => {
                                const catProjIds = catProjects.map(p => p.id)
                                setSelectedIds(prev => {
                                    const others = prev.filter(id => !catProjIds.includes(id))
                                    return isAllSelected ? others : [...others, ...catProjIds]
                                })
                            }

                            return (
                                <SortableCategory
                                    key={category.id ? `cat-${category.id}` : `cat-fallback-${idx}`}
                                    category={category}
                                    isAllSelected={isAllSelected}
                                    toggleAll={toggleAll}
                                    index={idx}
                                >
                                    {/* Projects Table inside Category */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <tbody className="divide-y divide-white/5">
                                                <SortableContext
                                                    items={catProjects.map((p, pIdx) => p.id ? `proj-${p.id}` : `proj-fallback-${pIdx}`)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {catProjects.length === 0 ? (
                                                        <tr>
                                                            <td className="px-6 py-8 text-center text-white/20 text-sm italic">
                                                                Categoría vacía. Arrastra proyectos aquí.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        catProjects.map((project, pIdx) => {
                                                            const projectKey = project.id ? `proj-${project.id}` : `proj-fallback-${pIdx}`
                                                            return (
                                                                <SortableProject
                                                                    key={projectKey}
                                                                    project={project}
                                                                    selectedIds={selectedIds}
                                                                    toggleProject={toggleProject}
                                                                    activeId={activeId}
                                                                    onTogglePublished={togglePublished}
                                                                    index={pIdx}
                                                                />
                                                            )
                                                        })
                                                    )}
                                                </SortableContext>
                                            </tbody>
                                        </table>
                                    </div>
                                </SortableCategory>
                            )
                        })}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        activeType === 'category' ? (
                            <div className="bg-neutral-800 border border-red-600/50 rounded-xl p-4 shadow-2xl flex items-center justify-between opacity-90 scale-[1.02] w-full max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-red-600/20 rounded text-red-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                                        {categories.find(c => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === activeId)?.title}
                                    </h3>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className="bg-neutral-900 border border-white/20 rounded-lg p-4 shadow-2xl flex items-center justify-between w-[400px] opacity-90 scale-[1.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 text-white/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-sm text-white">{projects.find(p => (p.id ? `proj-${p.id}` : `proj-fallback-${p.title.replace(/\s+/g, '-')}`) === activeId)?.title}</span>
                                    </div>
                                    {selectedIds.length > 1 && selectedIds.includes(activeId) && (
                                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-white/20 animate-bounce">
                                            + {selectedIds.length} ITEMS
                                        </div>
                                    )}
                                </div>
                                {selectedIds.length > 1 && selectedIds.includes(activeId) && (
                                    <>
                                        <div className="absolute top-1 left-1 w-[400px] h-full bg-white/5 border border-white/10 rounded-lg -z-10 rotate-1" />
                                        <div className="absolute top-2 left-2 w-[400px] h-full bg-white/5 border border-white/10 rounded-lg -z-20 rotate-2" />
                                    </>
                                )}
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
