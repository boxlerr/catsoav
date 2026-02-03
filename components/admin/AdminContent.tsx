"use client"

import { useState, useMemo, useEffect } from "react"
import {
    DndContext,
    closestCenter,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
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
function SortableCategory({ category, children, isAllSelected, toggleAll }: {
    category: Category,
    children: React.ReactNode,
    isAllSelected: boolean,
    toggleAll: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id })

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
function SortableProject({ project, selectedIds, toggleProject, activeId }: {
    project: Project,
    selectedIds: string[],
    toggleProject: (id: string) => void,
    activeId: string | null
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: project.id })

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
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                </div>
            </td>
        </tr>
    )
}

export default function AdminContent({ initialProjects, initialCategories }: AdminContentProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'category' | 'project' | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const router = useRouter()

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

    // Update local state when props change (for re-hydration after router.refresh)
    useEffect(() => {
        setProjects(initialProjects)
    }, [initialProjects])

    useEffect(() => {
        setCategories(initialCategories)
    }, [initialCategories])

    // Memoized projects by category
    const projectsByCategory = useMemo(() => {
        const grouped: Record<string, Project[]> = {}
        categories.forEach(cat => {
            grouped[cat.name] = projects
                .filter(p => p.category === cat.name)
                .sort((a, b) => a.order - b.order)
        })
        return grouped
    }, [projects, categories])

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        setActiveId(active.id as string)

        const isCategory = categories.some(c => c.id === active.id)
        setActiveType(isCategory ? 'category' : 'project')
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const isActiveCategory = categories.some(c => c.id === activeId)
        const isOverProject = projects.some(p => p.id === overId)
        const isOverCategory = categories.some(c => c.id === overId)

        if (!isActiveCategory) {
            const isDragGroup = selectedIds.includes(activeId)
            const movingIds = isDragGroup ? selectedIds : [activeId]

            if (movingIds.includes(overId)) return

            setProjects(prev => {
                const activeProj = prev.find(p => p.id === activeId)!
                let targetCategory = activeProj.category

                if (isOverProject) {
                    const overProj = prev.find(p => p.id === overId)!
                    targetCategory = overProj.category
                } else if (isOverCategory) {
                    const overCat = categories.find(c => c.id === overId)!
                    targetCategory = overCat.name
                }

                const withNewCats = prev.map(p =>
                    movingIds.includes(p.id) ? { ...p, category: targetCategory } : p
                )

                const others = withNewCats.filter(p => !movingIds.includes(p.id))
                const moving = withNewCats.filter(p => movingIds.includes(p.id))

                if (isOverProject) {
                    const overIndexInOthers = others.findIndex(p => p.id === overId)
                    return [
                        ...others.slice(0, overIndexInOthers),
                        ...moving,
                        ...others.slice(overIndexInOthers)
                    ]
                } else if (isOverCategory) {
                    const lastIndexInCat = others.map((p, i) => p.category === targetCategory ? i : -1).reduce((a, b) => Math.max(a, b), -1)
                    return [
                        ...others.slice(0, lastIndexInCat + 1),
                        ...moving,
                        ...others.slice(lastIndexInCat + 1)
                    ]
                }
                return withNewCats
            })
        }
        else {
            if (isOverCategory && activeId !== overId) {
                const oldIndex = categories.findIndex(c => c.id === activeId)
                const newIndex = categories.findIndex(c => c.id === overId)
                if (oldIndex !== -1 && newIndex !== -1) {
                    setCategories(prev => arrayMove(prev, oldIndex, newIndex))
                }
            }
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)
        setActiveType(null)

        if (!over) return

        const activeId = active.id as string

        const isActiveCategory = categories.some(c => c.id === activeId)

        if (isActiveCategory) {
            const reorderItems = categories.map((cat, index) => ({
                id: cat.id,
                order: index
            }))

            await fetch("/api/categories/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: reorderItems })
            })
        }
        else {
            // Project Reordering
            // Persistence
            const projectsToSync: any[] = []
            const counts: Record<string, number> = {}
            projects.forEach(p => {
                if (!counts[p.category]) counts[p.category] = 0
                projectsToSync.push({ id: p.id, order: counts[p.category], category: p.category })
                counts[p.category]++
            })

            await fetch("/api/projects/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: projectsToSync })
            })
        }
    }

    const toggleProject = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
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

    return (
        <div className="space-y-6">
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
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
            )}

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
                    items={categories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {categories.map((category) => {
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
                                    key={category.id}
                                    category={category}
                                    isAllSelected={isAllSelected}
                                    toggleAll={toggleAll}
                                >
                                    {/* Projects Table inside Category */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <tbody className="divide-y divide-white/5">
                                                <SortableContext
                                                    items={catProjects.map(p => p.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {catProjects.length === 0 ? (
                                                        <tr>
                                                            <td className="px-6 py-8 text-center text-white/20 text-sm italic">
                                                                Categoría vacía. Arrastra proyectos aquí.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        catProjects.map((project) => (
                                                            <SortableProject
                                                                key={project.id}
                                                                project={project}
                                                                selectedIds={selectedIds}
                                                                toggleProject={toggleProject}
                                                                activeId={activeId}
                                                            />
                                                        ))
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
                                        {categories.find(c => c.id === activeId)?.title}
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
                                        <span className="font-medium text-sm text-white">{projects.find(p => p.id === activeId)?.title}</span>
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
