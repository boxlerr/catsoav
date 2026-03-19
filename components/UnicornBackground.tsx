"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function UnicornBackground() {
    useEffect(() => {
        // Initialize UnicornStudio when component mounts
        const initShader = () => {
            const studio = (window as { UnicornStudio?: { init: () => void } }).UnicornStudio
            const bgElement = document.querySelector('[data-us-project]')

            if (studio && bgElement) {
                try {
                    const canvas = bgElement.querySelector('canvas')

                    if (!canvas) {
                        console.log('[UnicornStudio] Initializing background')
                        studio.init()
                    }
                } catch (err) {
                    console.debug('[UnicornStudio] Init failed:', err)
                }
            }
        }

        // Try initialization multiple times
        const timers = [200, 500, 1000, 2000].map(ms =>
            setTimeout(initShader, ms)
        )

        return () => {
            timers.forEach(t => clearTimeout(t))
        }
    }, [])

    return (
        <>
            <Script
                id="unicorn-studio"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(){
              if(!window.UnicornStudio){
                window.UnicornStudio={isInitialized:!1};
                var i=document.createElement("script");
                i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",
                i.onload=function(){
                  if(!window.UnicornStudio.isInitialized){
                    try {
                      UnicornStudio.init()
                      window.UnicornStudio.isInitialized=!0
                    } catch(e) {}
                  }
                },
                (document.head || document.body).appendChild(i)
              }
            }();
          `,
                }}
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
                <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100%", height: "100%" }} suppressHydrationWarning></div>
            </div>
        </>
    )
}
