"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableItemProps {
    id: string
    children: React.ReactNode
    disabled?: boolean
}

export function SortableItem({ id, children, disabled }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        disabled
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
        position: 'relative' as const,
        touchAction: 'manipulation' // Allow scrolling while supporting drag with delay sensor
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => {
                // If the element was being dragged, we might want to prevent clicks.
                // However, dnd-kit usually handles this. 
                // We add stopPropagation just in case for nested links.
            }}
        >
            {children}
        </div>
    )
}
