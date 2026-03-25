"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

// Extender window para TypeScript
declare global {
    interface Window {
        UnicornStudio: {
            init: () => void;
            [key: string]: unknown;
        };
        __UNICORN_STUDIO_INITIALIZED__?: boolean;
    }
}

export default function UnicornBackground() {
    const [libLoaded, setLibLoaded] = useState(false);

    useEffect(() => {
        if (!libLoaded) return;

        // 1. Asegurar que el contenedor DOM existe
        let bgContainer = document.getElementById('unicorn-global-bg-container');
        
        if (!bgContainer) {
            console.log('[UnicornStudio] Creating global DOM container safely...');
            bgContainer = document.createElement('div');
            bgContainer.id = 'unicorn-global-bg-container';
            bgContainer.className = 'unicorn-bg';
            Object.assign(bgContainer.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: '-1',
                backgroundColor: 'black'
            });

            const projectDiv = document.createElement('div');
            projectDiv.setAttribute('data-us-project', 'DmxX3AU5Ot4TeJbMP4tT');
            Object.assign(projectDiv.style, {
                width: '100%',
                height: '100%'
            });

            bgContainer.appendChild(projectDiv);
            document.body.prepend(bgContainer);
        }

        // 2. Función de inicialización
        const initStudio = () => {
            const studio = window.UnicornStudio;
            if (studio && typeof studio.init === 'function') {
                try {
                    if (window.__UNICORN_STUDIO_INITIALIZED__) {
                        console.log('[UnicornStudio] Already initialized globally');
                        return;
                    }
                    console.log('[UnicornStudio] Calling studio.init()...');
                    studio.init();
                    window.__UNICORN_STUDIO_INITIALIZED__ = true;
                } catch (err) {
                    console.error('[UnicornStudio] Error during init:', err);
                }
            }
        };

        // Usamos requestAnimationFrame para asegurar que el DOM esté listo y tenga dimensiones
        let timerId: NodeJS.Timeout;
        const rafId = requestAnimationFrame(() => {
            // Un pequeño delay adicional de seguridad
            timerId = setTimeout(initStudio, 200);
        });

        return () => {
            cancelAnimationFrame(rafId);
            if (timerId) clearTimeout(timerId);
        };
    }, [libLoaded]);

    return (
        <Script
            id="unicorn-studio-lib"
            src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js"
            strategy="lazyOnload"
            onLoad={() => {
                console.log('[UnicornStudio] Script library loaded');
                setLibLoaded(true);
            }}
        />
    )
}
