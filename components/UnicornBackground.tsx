"use client"

import { useEffect, useState } from "react"

export default function UnicornBackground() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Even if we use dynamic(ssr: false), keeping this as a guard is good practice
    // but we ensure the container is identical during the "client-only" phase
    if (!mounted) {
        return (
            <div 
                className="unicorn-bg fixed inset-0 bg-black z-[-1] overflow-hidden" 
                style={{ pointerEvents: 'none' }}
            />
        )
    }

    return (
        <div
            className="unicorn-bg fixed inset-0 bg-black z-[-1] overflow-hidden"
            style={{
                pointerEvents: 'none',
            }}
        >
            <iframe
                src="https://gateway.unicorn.studio/DmxX3AU5Ot4TeJbMP4tT?notexture=true"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    opacity: 0.8
                }}
                title="UnicornStudio Background"
                loading="lazy"
            />
        </div>
    )
}
