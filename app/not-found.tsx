"use client"

import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center z-50 relative">
            <h2 className="text-4xl font-bold mb-4">404</h2>
            <p className="text-xl text-white/60 mb-8">No pudimos encontrar esta página.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-white text-black hover:bg-neutral-200 transition-colors uppercase tracking-widest text-sm font-medium"
            >
                Volver al inicio
            </Link>
        </div>
    )
}
