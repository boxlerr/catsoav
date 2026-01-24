"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"
import QuickProjectButton from "@/components/QuickProjectButton"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { SortableItem } from "@/components/SortableItem"

const CATEGORIES = [
  {
    id: "videoclips",
    title: "Videoclips",
    description: "Producción musical y visual de alto impacto.",
  },
  {
    id: "restaurants",
    title: "Restaurants",
    description: "Experiencias culinarias capturadas en video.",
  },
  {
    id: "nightclubs",
    title: "Nightclubs",
    description: "La energía de la noche, inmortalizada.",
  },
  {
    id: "photography",
    title: "Photography",
    description: "Momentos estáticos con narrativa dinámica.",
  },
  {
    id: "social-media",
    title: "Social Media",
    description: "Contenido optimizado para redes.",
  },
  {
    id: "dj-sets",
    title: "DJ Sets",
    description: "Sesiones completas con sonido y visuales premium.",
  },
]

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  )
}

function HomeContent() {
  const { data: session } = useSession()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // State for real data and hydration fix
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  // Helper: Get projects for a specific category, sorted by order
  // If no projects in category, return empty array (admin needs to add one first or we add droppable zone later)
  const getCategoryProjects = (catId: string) => {
    return projects
      .filter(p => p.category === catId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    // Only allow if admin and valid drop
    if (session?.user?.role !== "admin" || !over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    if (activeId !== overId) {
      setProjects((prev) => {
        const activeIndex = prev.findIndex((p) => p.id === activeId)
        const overIndex = prev.findIndex((p) => p.id === overId)

        if (activeIndex === -1 || overIndex === -1) return prev

        const newProjects = [...prev]

        // Check if moving between categories (by checking the target project's category)
        const targetCategory = newProjects[overIndex].category
        if (newProjects[activeIndex].category !== targetCategory) {
          newProjects[activeIndex].category = targetCategory
        }

        const reordered = arrayMove(newProjects, activeIndex, overIndex)

        // Prepare update payload
        // We need to update orders. A simple robust way is to update everyone's order 
        // derived from the new array index which implies global order.
        const updates = reordered.map((p, index) => ({
          id: p.id,
          order: index,
          category: p.category
        }))

        // Persist to DB
        fetch('/api/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates })
        }).catch(console.error)

        return reordered
      })
    }
  }

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
    const minDuration = 500
    const maxDuration = 1200
    const duration = Math.min(maxDuration, minDuration + (distance / 3))
    let start: number | null = null
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const progress = Math.min(timeElapsed / duration, 1)
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
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

      <AnimatePresence>
        {isScrolled && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center"
          >
            <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
              <a href="#" onClick={(e) => scrollToSection(e, "top")} className="text-white font-serif font-bold text-2xl group">
                CATSO <span className="text-red-600 group-hover:text-white transition-colors duration-300">AV</span>
              </a>

              <div className="hidden md:flex gap-8">
                <a href="#" onClick={(e) => scrollToSection(e, "top")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
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
                {session ? (
                  <span className="text-white/40 text-xs px-2 cursor-default font-medium uppercase tracking-wider">Hola, {session.user?.name || 'Usuario'}</span>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/login" className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">Login</Link>
                    <Link href="/register" className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider border border-white/20 px-4 py-1 rounded hover:border-red-600 hover:bg-red-600/10">Registrarse</Link>
                  </div>
                )}
              </div>

              <button className="md:hidden text-white hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0">
        <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100vw", height: "100vh" }} />
      </div>

      <div className="relative z-10 w-full">
        <section className="relative h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            style={{ opacity, y }}
            className={`text-center transition-all duration-1000 relative z-20 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight mb-2 drop-shadow-2xl">
              CATSO <span className="text-red-600 ml-2">AV</span>
            </h1>
            <p className="font-sans text-white/90 text-xl md:text-2xl font-light tracking-widest uppercase">
              Video production company
            </p>
          </motion.div>

          <motion.div
            style={{ opacity }}
            className={`absolute bottom-12 transition-all duration-1000 delay-500 z-20 ${isLoaded ? "opacity-70 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="animate-bounce text-white flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none z-10" />
        </section>

        <div className="w-full bg-black relative z-20">
          <div className="max-w-7xl mx-auto px-4 pb-20">
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                {CATEGORIES.map((category) => {
                  const catProjects = getCategoryProjects(category.id)

                  return (
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

                      <SortableContext
                        items={catProjects.map(p => p.id)}
                        strategy={rectSortingStrategy}
                        disabled={session?.user?.role !== "admin"}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                          {catProjects.length > 0 ? (
                            catProjects.map((project) => (
                              <SortableItem key={project.id} id={project.id} disabled={session?.user?.role !== "admin"}>
                                <div
                                  className="group relative aspect-video bg-neutral-900/50 overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/20 w-full h-full"
                                >
                                  {/* Thumbnail */}
                                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                    {project.imageUrl ? (
                                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-white/20 group-hover:text-red-600/50 transition-colors">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>

                                  {/* Overlay Info */}
                                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                                    <p className="text-white font-medium text-sm">{project.title}</p>
                                    <p className="text-white/50 text-xs">{(project as any).clientName || 'Client Name'}</p>
                                    {session?.user?.role === "admin" && (
                                      <p className="text-red-500 text-[10px] mt-1 uppercase tracking-wider font-bold">Drag to Reorder</p>
                                    )}
                                  </div>
                                </div>
                              </SortableItem>
                            ))
                          ) : (
                            <div className="col-span-full py-12 text-center text-white/30 border border-white/5 border-dashed rounded-lg">
                              No hay proyectos en esta categoría. {session?.user?.role === "admin" && "Usa el botón + para agregar uno."}
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </section>
                  )
                })}
              </DndContext>
            ) : (
              /* SSR Hydration Match -> Render static list without DnD for initial paint */
              CATEGORIES.map((category) => (
                <section key={category.id} id={category.id} className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none">
                  <div className="mb-12 md:mb-16 ml-4 md:ml-0">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{category.title}<span className="text-red-600">.</span></h2>
                    <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
                  </div>
                  <div className="flex items-center justify-center p-12 text-white/40">Cargando proyectos...</div>
                </section>
              ))
            )}
          </div>

          <section id="contact" className="py-20 border-t border-neutral-900 bg-black">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Let's Work Together
                <span className="text-red-600">.</span>
              </h2>
              <p className="text-white/60 text-lg mb-12">
                ¿Tienes un proyecto en mente? Cuéntanos tu idea.
              </p>

              {session ? (
                <form className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Nombre</label>
                      <input type="text" id="name" defaultValue={session.user?.name || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Email</label>
                      <input type="email" id="email" defaultValue={session.user?.email || ''} readOnly className="w-full bg-neutral-900/50 border border-white/10 text-white/50 px-4 py-3 rounded-none focus:outline-none cursor-not-allowed" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Mensaje</label>
                    <textarea id="message" rows={4} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder="Cuéntanos sobre tu proyecto..."></textarea>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 font-medium uppercase tracking-widest text-sm transition-all duration-300">Enviar Mensaje</button>
                  </div>
                </form>
              ) : (
                <div className="bg-neutral-900/30 border border-white/5 p-12 rounded-xl backdrop-blur-sm">
                  <p className="text-white/80 mb-6 text-xl">Debes iniciar sesión para enviarnos un mensaje.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/login" className="bg-white text-black hover:bg-neutral-200 px-8 py-3 font-medium uppercase tracking-widest text-sm transition-colors">Iniciar Sesión</Link>
                    <Link href="/register" className="border border-white/20 text-white hover:border-red-600 hover:text-red-500 px-8 py-3 font-medium uppercase tracking-widest text-sm transition-colors">Registrarse</Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer className="py-12 border-t border-neutral-900 bg-black">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white font-serif font-bold text-xl">CATSO <span className="text-red-600">AV</span></div>
              <p className="text-white/40 text-sm">© 2025 CATSO AV. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="text-white/60 hover:text-red-600 transition-colors">Instagram</a>
                <a href="/login" className="text-white/60 hover:text-red-600 transition-colors">Admin</a>
              </div>
            </div>
          </footer>
        </div>

        <QuickProjectButton />
      </div>
    </>
  )
}
