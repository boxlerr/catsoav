"use client"

export default function NewProjectButton() {
    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('newProject'))}
            className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded font-medium text-sm transition-colors"
        >
            + Nuevo Proyecto
        </button>
    )
}
