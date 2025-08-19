"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* UnicornStudio Background */}
      <div className="unicorn-bg">
        <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100vw", height: "100vh" }} />
      </div>

      <Script
        id="unicorn-studio"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(){
              if(!window.UnicornStudio){
                window.UnicornStudio={isInitialized:!1};
                var i=document.createElement("script");
                i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",
                i.onload=function(){
                  window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
                },
                (document.head || document.body).appendChild(i)
              }
            }();
          `,
        }}
      />

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Main Content Container */}
          <div
            className={`bg-red-600/90 backdrop-blur-md rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl border border-red-500/20 transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Logo Section */}
            <div
              className={`text-center mb-8 transition-all duration-800 delay-200 ${
                isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
            >
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
                CATSO
                <span className="text-4xl md:text-5xl lg:text-6xl ml-2">AV</span>
              </h1>
              <p className="font-sans text-white text-lg md:text-xl mt-4 font-medium">Video production company</p>
            </div>

            {/* Under Development Message */}
            <div
              className={`text-center mb-12 transition-all duration-600 delay-400 ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <h2 className="font-sans text-white text-2xl md:text-3xl font-bold mb-3">Sitio en Desarrollo</h2>
                <p className="font-sans text-white/90 text-lg">
                  Estamos trabajando en algo increíble. Mientras tanto, explora nuestro portafolio.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto transition-all duration-800 delay-600 ${
                isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <a
                href="https://catsoav.myportfolio.com/music-videos"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-1" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
                  Videoclips
                </span>
              </a>

              <a
                href="https://catsoav.myportfolio.com/restaurants"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-2" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
                  Restaurants
                </span>
              </a>

              <a
                href="https://catsoav.myportfolio.com/nightclubs-and-aftermovies"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-3" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
                  Nightclubs
                </span>
              </a>

              <a
                href="https://catsoav.myportfolio.com/product-photography"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-4" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
                  Photography
                </span>
              </a>

              <a
                href="https://catsoav.myportfolio.com/talking-head-content"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-5" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
                  Social Media
                </span>
              </a>

              <a
                href="https://catsoav.myportfolio.com/dj-sets"
                target="_blank"
                rel="noopener noreferrer"
                className={`enhanced-button bg-white/95 backdrop-blur-sm text-red-600 font-sans font-semibold py-4 px-6 rounded-xl hover:bg-white hover:text-red-700 transition-all duration-300 text-center text-lg shadow-lg hover:shadow-2xl border border-white/30 group ${
                  isLoaded ? "animate-button-6" : ""
                }`}
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">DJ Sets</span>
              </a>
            </div>

            {/* Footer */}
            <div
              className={`text-center mt-12 transition-all duration-600 delay-1000 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="font-sans text-white/80 text-sm">© 2024 CATSO AV. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
