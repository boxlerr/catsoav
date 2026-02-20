"use client"

import Image from "next/image"

export default function NewCategoryButton() {
    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent('newCategory'))}
            className="relative w-16 h-16 group transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden border border-white/10 bg-black/40 shadow-2xl"
            title="Nueva Categoría"
        >
            <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Image
                    src="/tang-juice.png"
                    alt="Nueva Categoría"
                    fill
                    className="object-cover scale-[1.5] group-hover:scale-[1.8] transition-transform duration-500"
                />
            </div>
        </button>
    )
}
