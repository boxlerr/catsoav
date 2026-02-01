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
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Category {
    id: string
    name: string
    title: string
    description: string | null
    order: number
}

const SortableCategoryItem = memo(function SortableCategoryItem({ category, isOverlay = false }: { category: Category, isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: category.id,
        disabled: isOverlay
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 1,
        touchAction: 'none' as const,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-neutral-900 border border-white/10 rounded-xl p-6 transition-all select-none ${isOverlay
                    ? 'shadow-2xl shadow-red-900/40 border-red-600/50 scale-105 bg-neutral-800 cursor-grabbing'
                    : isDragging
                        ? 'opacity-30'
                        : 'hover:border-red-600/30 cursor-grab hover:bg-white/5'
                }`}
        >
            <div className="flex items-center gap-6">
                {/* Order Number */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${isOverlay || isDragging
                        ? 'bg-red-600 border-red-500'
                        : 'bg-red-600/10 border-red-600/20'
                    }`}>
                    <span className={`font-black text-lg transition-colors ${isOverlay || isDragging ? 'text-white' : 'text-red-500'
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

                {/* Actions */}
                {!isOverlay && (
                    <div className="flex items-center gap-2 flex-shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Editar categoría"
                            onClick={() => {
                                console.log("Edit category", category.id)
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <div className="text-white/20 ml-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                        </div>
                    </div>
                )}
                {isOverlay && (
                    <div className="flex-shrink-0 text-white/40 ml-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    )
})

export default function CategoriesPage() {
    const router = useRouter()
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
        const { active } = event
        setActiveId(active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeId = active.id.toString()
        const overId = over.id.toString()

        const oldIndex = categories.findIndex((cat) => String(cat.id) === activeId)
        const newIndex = categories.findIndex((cat) => String(cat.id) === overId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setCategories((prev) => arrayMove(prev, oldIndex, newIndex))
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        // Final sync of order numbers
        const updatedCategories = categories.map((cat, index) => ({
            ...cat,
            order: index
        }))

        setCategories(updatedCategories)

        // Save to API
        setIsSaving(true)
        try {
            const updates = updatedCategories.map((cat) => ({
                id: cat.id,
                order: cat.order
            }))

            const res = await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updates })
            })

            if (!res.ok) {
                throw new Error('Failed to save order')
            }
        } catch (error) {
            console.error("Error saving category order:", error)
            fetchCategories()
            alert("Error al guardar el orden. Intenta de nuevo.")
        } finally {
            setIsSaving(false)
        }
    }

    const activeCategory = activeId ? categories.find(c => c.id === activeId) : null

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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={categories.map(cat => cat.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4 relative min-h-[100px]">
                            {categories.map((category) => (
                                <SortableCategoryItem key={category.id} category={category} />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: { opacity: '0.3' },
                            },
                        }),
                    }}>
                        {activeCategory ? (
                            <SortableCategoryItem category={activeCategory} isOverlay />
                        ) : null}
                    </DragOverlay>
                </DndContext>
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
