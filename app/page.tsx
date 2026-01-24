"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

const CATEGORIES = [
  {
    id: "videoclips",
    title: "Videoclips",
    description: "Producción musical y visual de alto impacto.",
    items: [1, 2, 3, 4, 5, 6], // Placeholders
  },
  {
    id: "restaurants",
    title: "Restaurants",
    description: "Experiencias culinarias capturadas en video.",
    items: [1, 2, 3, 4],
  },
  {
    id: "nightclubs",
    title: "Nightclubs & Aftermovies",
    description: "La energía de la noche, inmortalizada.",
    items: [1, 2, 3, 4],
  },
  {
    id: "photography",
    title: "Photography",
    description: "Momentos estáticos con narrativa dinámica.",
    items: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "social-media",
    title: "Social Media",
    description: "Contenido optimizado para redes.",
    items: [1, 2, 3, 4],
  },
  {
    id: "dj-sets",
    title: "DJ Sets",
    description: "Sesiones completas con sonido y visuales premium.",
    items: [1, 2, 3],
  },
]

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll hooks for Hero Fade
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const y = useTransform(scrollY, [0, 500], [0, 50])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Show header earlier (adjusted per user request)
      if (window.scrollY > window.innerHeight - 150) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const element = document.getElementById(id)
    if (!element) return

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = Math.abs(targetPosition - startPosition)

    // Calculate duration based on distance
    // Base: 500ms for short distances, up to 1200ms for very long distances
    const minDuration = 500
    const maxDuration = 1200
    const duration = Math.min(maxDuration, minDuration + (distance / 3))
    let start: number | null = null

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const progress = Math.min(timeElapsed / duration, 1)

      // Easing function for smooth deceleration
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      window.scrollTo(0, startPosition + (targetPosition - startPosition) * ease)

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  }

  return (
    <>
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

      {/* Sticky Navigation Header with "Granulado" Effect */}
      <AnimatePresence>
        {isScrolled && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center"
          >
            {/* Content */}
            <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
              {/* Logo */}
              <a href="#" onClick={(e) => scrollToSection(e, "top")} className="text-white font-serif font-bold text-2xl group">
                CATSO <span className="text-red-600 group-hover:text-white transition-colors duration-300">AV</span>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-8">
                <a
                  href="#"
                  onClick={(e) => scrollToSection(e, "top")}
                  className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider"
                >
                  Inicio
                </a>
                {CATEGORIES.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    onClick={(e) => scrollToSection(e, category.id)}
                    className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider"
                  >
                    {category.title.split(" ")[0]}
                  </a>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-white hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100vw", height: "100vh" }} />
      </div>

      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="relative h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            style={{ opacity, y }}
            className={`text-center transition-all duration-1000 relative z-20 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight mb-2 drop-shadow-2xl">
              CATSO
              <span className="text-red-600 ml-2">AV</span>
            </h1>
            <p className="font-sans text-white/90 text-xl md:text-2xl font-light tracking-widest uppercase">
              Video production company
            </p>
          </motion.div>

          <motion.div
            style={{ opacity }}
            className={`absolute bottom-12 transition-all duration-1000 delay-500 z-20 ${isLoaded ? "opacity-70 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
          >
            <div className="animate-bounce text-white flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>

          {/* Fade to Black Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none z-10" />
        </section>

        {/* PORTFOLIO SECTIONS WRAPPER */}
        <div className="w-full bg-black relative z-20">
          <div className="max-w-7xl mx-auto px-4 pb-20">
            {CATEGORIES.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none"
              >
                <div className="mb-12 md:mb-16 ml-4 md:ml-0">
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
                    {category.title}
                    <span className="text-red-600">.</span>
                  </h2>
                  <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video bg-neutral-900/50 overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/20"
                    >
                      {/* Placeholder Content */}
                      <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                        <div className="text-white/20 group-hover:text-red-600/50 transition-colors">
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Overlay Info */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-medium text-sm">Project Title {item}</p>
                        <p className="text-white/50 text-xs">Client Name</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* FOOTER */}
          <footer className="py-12 border-t border-neutral-900 bg-black">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white font-serif font-bold text-xl">
                CATSO <span className="text-red-600">AV</span>
              </div>
              <p className="text-white/40 text-sm">© 2025 CATSO AV. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="text-white/60 hover:text-red-600 transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-white/60 hover:text-red-600 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
