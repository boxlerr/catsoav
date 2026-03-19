"use client"

import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    DragOverlay,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

interface Category {
    id: string
    name: string
    title: string
    description: string | null
    order: number
}

interface CategoryCardProps {
    category: Category
    isDragging?: boolean
    isOverlay?: boolean
}

function CategoryCard({ category, isDragging, isOverlay }: CategoryCardProps) {
    return (
        <div
            className={`bg-neutral-900 border rounded-xl p-6 select-none w-full transition-[border-color,background-color,shadow,opacity,transform] duration-300 ${isOverlay
                ? 'shadow-2xl shadow-red-600/40 border-red-600 bg-neutral-800 ring-2 ring-red-600/20 scale-[1.02]'
                : isDragging
                    ? 'opacity-0 border-white/5' // Make original invisible while dragging
                    : 'border-white/10 hover:border-red-600/40 hover:bg-neutral-800/50'
                }`}
        >
            <div className="flex items-center gap-6">
                {/* Order Number */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${isOverlay || isDragging
                    ? 'bg-red-600 border-red-500'
                    : 'bg-red-600/10 border-red-600/20'
                    }`}>
                    <span className={`font-black text-lg ${isOverlay || isDragging ? 'text-white' : 'text-red-500'
                        }`}>
                        {String(category.order + 1).padStart(2, '0')}
                    </span>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">{category.title}</h3>
                    <p className="text-sm text-white/40 font-mono tracking-wider uppercase">{category.name}</p>
                    {category.description && (
                        <p className="text-sm text-white/60 mt-2 line-clamp-1">{category.description}</p>
                    )}
                </div>

                {/* Drag Handle & Actions */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    {!isOverlay && !isDragging && (
                        <>
                            <button
                                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all border border-white/5 hover:border-red-600/30"
                                title="Editar"
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log("Edit category", category.id);
                                    window.dispatchEvent(new CustomEvent('editCategory', { detail: category }));
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                className="p-2 md:p-3 bg-white/5 hover:bg-red-600/10 text-white/40 hover:text-red-500 rounded-lg transition-all border border-white/5 hover:border-red-600/30"
                                title="Eliminar"
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (confirm(`¿Estás seguro de eliminar la categoría "${category.title}"? Todos los proyectos en esta categoría quedarán sin categoría.`)) {
                                        window.dispatchEvent(new CustomEvent('deleteCategory', { detail: category.id }));
                                    }
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </>
                    )}
                    <div className={`transition-colors ${isOverlay ? 'text-red-500' : 'text-white/20'}`}>
                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SortableCategoryItem = memo(function SortableCategoryItem({ category }: { category: Category }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
        touchAction: 'none' as const,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing outline-none`}
        >
            <CategoryCard
                category={category}
                isDragging={isDragging}
            />
        </div>
    )
})

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeIdStr = active.id.toString()
        const overIdStr = over.id.toString()

        setCategories((prev) => {
            const oldIndex = prev.findIndex((cat) => String(cat.id) === activeIdStr)
            const newIndex = prev.findIndex((cat) => String(cat.id) === overIdStr)

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                return arrayMove(prev, oldIndex, newIndex)
            }
            return prev
        })
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeIdStr = active.id.toString()
        const overIdStr = over.id.toString()

        let updatedCategories: Category[] = []

        setCategories((prev) => {
            const oldIndex = prev.findIndex((cat) => String(cat.id) === activeIdStr)
            const newIndex = prev.findIndex((cat) => String(cat.id) === overIdStr)

            let reordered = [...prev]
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                reordered = arrayMove(reordered, oldIndex, newIndex)
            }

            updatedCategories = reordered.map((cat, index) => ({
                ...cat,
                order: index
            }))

            return updatedCategories
        })

        // Call saveOrder outside the state updater
        if (updatedCategories.length > 0) {
            saveOrder(updatedCategories)
        }
    }

    const saveOrder = async (items: Category[]) => {
        setIsSaving(true)
        try {
            const updates = items.map((cat) => ({
                id: cat.id,
                order: cat.order
            }))

            const res = await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updates })
            })

            if (!res.ok) throw new Error('Failed to save order')
        } catch (error) {
            console.error("Error saving category order:", error)
            fetchCategories()
            alert("Error al guardar el orden. Intenta de nuevo.")
        } finally {
            setIsSaving(false)
        }
    }

    const activeCategory = activeId ? categories.find(c => String(c.id) === String(activeId)) : null

    const handleCategoryDelete = async (id: string) => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id))
            } else {
                throw new Error('Failed to delete')
            }
        } catch (error) {
            console.error("Error deleting category:", error)
            alert("Error al eliminar la categoría.")
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        const onDelete = (e: Event) => handleCategoryDelete((e as CustomEvent).detail as string)
        window.addEventListener('deleteCategory', onDelete)
        return () => window.removeEventListener('deleteCategory', onDelete)
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-white/40">Cargando categorías...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold mb-2">Gestión de Categorías</h1>
                    <p className="text-white/60">Arrastra las categorías para cambiar su orden en la página principal</p>
                </div>
                {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                    </div>
                )}
            </div>

            {categories.length === 0 ? (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-12 text-center">
                    <p className="text-white/40">No hay categorías creadas aún.</p>
                </div>
            ) : (
                <div className="relative min-h-[500px]">
                    <DndContext
                        id="categories-dnd"
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={categories.map(cat => cat.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4 relative">
                                {categories.map((category) => (
                                    <SortableCategoryItem key={category.id} category={category} />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay adjustScale={false}>
                            {activeCategory ? (
                                <CategoryCard category={activeCategory} isOverlay />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}

            <div className="mt-8 p-6 bg-neutral-900/50 border border-white/5 rounded-xl">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-white/60">
                        <p className="font-bold text-white mb-1">Consejos:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>El orden aquí determina cómo aparecen las categorías en la página principal</li>
                            <li>Los cambios se guardan automáticamente al soltar una categoría</li>
                            <li>Los visitantes verán las categorías en este orden</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
