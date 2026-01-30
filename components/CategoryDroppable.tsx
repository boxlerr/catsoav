"use client"

import { useDroppable } from "@dnd-kit/core"

interface CategoryDroppableProps {
    id: string
    children: React.ReactNode
    className?: string
}

export function CategoryDroppable({ id, children, className }: CategoryDroppableProps) {
    const { setNodeRef } = useDroppable({
        id
    })

    return (
        <section ref={setNodeRef} id={id} className={className}>
            {children}
        </section>
    )
}
