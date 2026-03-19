"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

export default function UnicornBackground() {
    const isInitialized = useRef(false);

    const initStudio = () => {
        if (isInitialized.current) return;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studio = (window as any).UnicornStudio;
        if (studio && typeof studio.init === 'function') {
            try {
                console.log('[UnicornStudio] Initializing...');
                studio.init();
                isInitialized.current = true;
            } catch (err) {
                console.error('[UnicornStudio] Init error:', err);
            }
        }
    };

    useEffect(() => {
        // Fallback in case script loaded before mount
        const timer = setTimeout(initStudio, 500);
        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <Script
                id="unicorn-studio-lib"
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js"
                strategy="afterInteractive"
                onLoad={initStudio}
            />

            <div
                className="unicorn-bg"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: -1,
                    backgroundColor: 'black'
                }}
                suppressHydrationWarning
            >
                <div 
                    data-us-project="DmxX3AU5Ot4TeJbMP4tT" 
                    style={{ width: "100%", height: "100%" }} 
                    suppressHydrationWarning
                ></div>
            </div>
        </>
    )
}
