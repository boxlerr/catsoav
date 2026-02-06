"use client"

import { useState } from "react"

export default function SyncBehanceButton() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })

    const handleSync = async () => {
        if (!confirm("¿Deseas sincronizar los proyectos desde Behance? Esto buscará proyectos nuevos y los agregará a la lista.")) return

        setIsSyncing(true)
        setStatus({ type: null, message: "" })

        try {
            const res = await fetch("/api/admin/behance/sync", {
                method: "POST"
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setStatus({ type: 'success', message: data.message })
                // Refresh the page after 2.5 seconds to show new projects
                if (data.count > 0) {
                    setTimeout(() => window.location.reload(), 2500)
                }
            } else {
                setStatus({ type: 'error', message: data.error || data.message || "Error al sincronizar" })
            }
        } catch (_error) {
            setStatus({ type: 'error', message: "Error de conexión con el servidor" })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-all ${isSyncing
                    ? "bg-neutral-800 text-white/40 cursor-not-allowed border border-white/10"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
                    }`}
            >
                {isSyncing ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sincronizando...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sincronizar Behance
                    </>
                )}
            </button>

            {status.type && (
                <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded bg-neutral-900 border ${status.type === 'success' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'
                    }`}>
                    {status.message}
                </div>
            )}
        </div>
    )
}
