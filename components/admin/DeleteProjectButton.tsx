"use client"

import { useState } from "react"

interface DeleteProjectButtonProps {
    projectId: string
    projectTitle: string
}

export default function DeleteProjectButton({ projectId, projectTitle }: DeleteProjectButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectTitle}"?`)) {
            return
        }

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                window.location.reload()
            } else {
                const data = await res.json()
                alert(data.error || "Error al eliminar el proyecto")
            }
        } catch (error) {
            console.error("Delete error:", error)
            alert("Error de red al intentar eliminar el proyecto")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`text-red-500 hover:text-red-400 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
    )
}
