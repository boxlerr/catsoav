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
  DragEndEvent,
  closestCorners,
  rectIntersection
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { SortableItem } from "@/components/SortableItem"
import VideoThumbnail from "@/components/VideoThumbnail"
import CatsoVideoPlayer from "@/components/CatsoVideoPlayer"
import { CategoryDroppable } from "@/components/CategoryDroppable"
import Manifesto from "@/components/Manifesto"
import Workflow from "@/components/Workflow"
import ServicesList from "@/components/ServicesList"
import Crew from "@/components/Crew"
import Clients from "@/components/Clients"



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
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    await Promise.all([fetchProjects(), fetchCategories()])
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const toggleVisibility = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation()
    const newStatus = !project.published
    setProjects((prev: any[]) => prev.map(p => p.id === project.id ? { ...p, published: newStatus } : p))
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus })
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      setProjects((prev: any[]) => prev.map(p => p.id === project.id ? { ...p, published: !newStatus } : p))
    }
  }

  const renderVideo = (url: string) => {
    const isDirectVideo = url?.startsWith('/uploads/') ||
      url?.startsWith('blob:') ||
      /\.(mp4|webm|mov|ogg|m4v|3gp|avi)($|\?|#)/i.test(url)

    if (isDirectVideo) {
      return (
        <CatsoVideoPlayer src={url} title="Catso AV Production" />
      )
    }

    let embedUrl = url
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop()
      // rel=0: related from same channel, iv_load_policy=3: hide annotations
      embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`
    } else if (url.includes('vimeo.com')) {
      const id = url.split('/').pop()
      // title, byline, portrait = 0: clean player
      embedUrl = `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`
    }

    return (
      <iframe
        src={embedUrl}
        className="w-full aspect-video rounded-lg shadow-2xl bg-black"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }
  // Helper: Get projects for a specific category, sorted by order
  const getCategoryProjects = (catName: string) => {
    return projects
      .filter((p: any) => p.category === catName)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  }

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragOver = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (session?.user?.role !== "admin") return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    setProjects((prev) => {
      const activeProject = prev.find((p) => p.id === activeId)
      if (!activeProject) return prev

      // Find if we are over a project or a category section
      const overProject = prev.find((p) => p.id === overId)
      const isOverCategory = categories.some((c) => c.name === overId)

      if (overProject) {
        // Dragging over another project
        if (activeProject.category !== overProject.category) {
          const activeIndex = prev.findIndex((p) => p.id === activeId)
          const overIndex = prev.findIndex((p) => p.id === overId)
          const newProjects = [...prev]
          newProjects[activeIndex] = {
            ...newProjects[activeIndex],
            category: overProject.category
          }
          return arrayMove(newProjects, activeIndex, overIndex)
        }
      } else if (isOverCategory) {
        // Dragging over an empty category section
        if (activeProject.category !== overId) {
          const activeIndex = prev.findIndex((p) => p.id === activeId)
          const newProjects = [...prev]
          newProjects[activeIndex] = {
            ...newProjects[activeIndex],
            category: overId
          }
          return newProjects
        }
      }

      return prev
    })
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (session?.user?.role !== "admin" || !over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    setProjects((prev) => {
      const activeProject = prev.find(p => p.id === activeId)
      const overProject = prev.find(p => p.id === overId)
      const isOverCategory = categories.some((c) => c.name === overId)

      if (!activeProject) return prev

      const activeIndex = prev.findIndex((p) => p.id === activeId)
      let overIndex = prev.findIndex((p) => p.id === overId)

      // If dropped over a category section, move to the end of that category
      if (overIndex === -1 && isOverCategory) {
        overIndex = prev.length - 1
      }

      if (overIndex === -1) return prev

      let reordered = [...prev]
      if (activeIndex !== overIndex) {
        reordered = arrayMove(reordered, activeIndex, overIndex)
      }

      // Sync local order property
      const finalProjects = reordered.map((p, index) => ({
        ...p,
        order: index
      }))

      // Persist to DB
      const updates = finalProjects.map((p) => ({
        id: p.id,
        order: p.order,
        category: p.category
      }))

      fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates })
      }).catch(err => {
        console.error("Error updating order:", err)
        fetchProjects() // Revert on error
      })

      return finalProjects
    })
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
            {/* Gradient overlay that extends below */}
            <div
              className="absolute inset-x-0 top-0 h-20 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)'
              }}
            />
            <div className="relative w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
              <a href="#" onClick={(e) => scrollToSection(e, "top")} className="group">
                <img src="/logo-white.png" alt="CATSO AV" className="h-30 md:h-35 w-auto" />
              </a>

              <div className="hidden md:flex gap-8">
                <a href="#" onClick={(e) => scrollToSection(e, "top")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Inicio
                </a>
                <a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Nosotros
                </a>
                <a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Servicios
                </a>
                <a href="#" onClick={(e) => scrollToSection(e, "process")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Proceso
                </a>
                {categories.filter(cat => (session as any)?.user?.role === "admin" || getCategoryProjects(cat.name).length > 0).map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.name}`}
                    onClick={(e) => scrollToSection(e, category.name)}
                    className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider"
                  >
                    {category.title.split(" ")[0]}
                  </a>
                ))}
                <a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Equipo
                </a>
                {session && (
                  <span className="text-white/40 text-xs px-2 cursor-default font-medium uppercase tracking-wider">Hola, {session.user?.name || 'Usuario'}</span>
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
            className={`transition-all duration-1000 relative z-20 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative flex flex-col items-center">
              <img
                src="/logo-white.png"
                alt="CATSO AV"
                className="h-64 md:h-[500px] lg:h-[650px] w-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              />
              <p className="font-sans text-white/90 text-base md:text-xl lg:text-2xl font-light tracking-[0.4em] uppercase absolute bottom-[32%] md:bottom-[37%] left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                Video production company
              </p>
            </div>
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

        <Manifesto />
        <ServicesList />
        <Workflow />

        <div className="w-full bg-black relative z-20">
          <div className="max-w-7xl mx-auto px-4 pb-20">
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {categories.map((category) => {
                  const catProjects = getCategoryProjects(category.name)
                  if ((session as any)?.user?.role !== "admin" && catProjects.length === 0) return null;

                  return (
                    <CategoryDroppable
                      key={category.id}
                      id={category.name}
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
                                  onClick={() => setSelectedProject(project)}
                                  className={`group relative aspect-video bg-neutral-900/50 overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/20 w-full h-full cursor-pointer ${!project.published ? "opacity-40 grayscale" : ""}`}
                                >
                                  {/* Animated Visibility Switch (Admin Only) */}
                                  {session?.user?.role === "admin" && (
                                    <div
                                      onClick={(e) => toggleVisibility(e, project)}
                                      className="absolute top-3 left-3 z-40 flex items-center gap-2 group/switch cursor-pointer"
                                    >
                                      <div className={`w-9 h-5 rounded-full relative transition-colors duration-500 backdrop-blur-md border border-white/20 flex items-center px-1 ${project.published ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "bg-black/60"}`}>
                                        <motion.div
                                          animate={{ x: project.published ? 16 : 0 }}
                                          transition={{ type: "spring", stiffness: 600, damping: 35 }}
                                          className="w-3 h-3 bg-white rounded-full shadow-md"
                                        />
                                      </div>
                                      <span className={`text-[8px] uppercase font-black tracking-widest transition-opacity duration-300 ${project.published ? "text-white opacity-0 group-hover/switch:opacity-100" : "text-white/40"}`}>
                                        {project.published ? "On" : "Off"}
                                      </span>
                                    </div>
                                  )}
                                  {/* Deletion & Edit Buttons (Admin Only) */}
                                  {session?.user?.role === "admin" && (
                                    <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          window.dispatchEvent(new CustomEvent('editProject', { detail: project }))
                                        }}
                                        className="bg-black/60 hover:bg-white text-white/40 hover:text-black p-1.5 rounded-md transition-all duration-300"
                                        title="Editar Proyecto"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => handleDelete(e, project.id)}
                                        className="bg-black/60 hover:bg-red-600 text-white/40 hover:text-white p-1.5 rounded-md transition-all duration-300"
                                        title="Eliminar Proyecto"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}

                                  {/* Thumbnail */}
                                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                    <VideoThumbnail
                                      videoUrl={project.videoUrl}
                                      imageUrl={project.imageUrl}
                                      title={project.title}
                                    />
                                  </div>

                                  {/* Overlay Info */}
                                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-white font-serif font-bold text-lg mb-0.5 tracking-tight">{project.title}</p>
                                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">{(project as any).clientName || 'Producción'}</p>
                                    {session?.user?.role === "admin" && (
                                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-red-500 text-[9px] uppercase tracking-[0.2em] font-bold">Admin: Drag to Reorder</span>
                                      </div>
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
                    </CategoryDroppable>
                  )
                })}
              </DndContext>
            ) : (
              /* SSR Hydration Match -> Render static list without DnD for initial paint */
              categories.map((category) => (
                <section key={category.id} id={category.name} className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none">
                  <div className="mb-12 md:mb-16 ml-4 md:ml-0">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{category.title}<span className="text-red-600">.</span></h2>
                    <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
                  </div>
                  <div className="flex items-center justify-center p-12 text-white/40">Cargando proyectos...</div>
                </section>
              ))
            )}
          </div>

          <Clients />
          <Crew />

          <section id="contact" className="py-20 border-t border-neutral-900 bg-black">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Let's Work Together
                <span className="text-red-600">.</span>
              </h2>
              <p className="text-white/60 text-lg mb-12">
                ¿Tienes un proyecto en mente? Cuéntanos tu idea.
              </p>

              <form className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Nombre</label>
                    <input type="text" id="name" defaultValue={session?.user?.name || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Email</label>
                    <input type="email" id="email" defaultValue={session?.user?.email || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder="tu@email.com" />
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
            </div>
          </section>

          <footer className="py-20 border-t border-neutral-900 bg-black">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-6">
                    <img src="/logo-white.png" alt="CATSO AV" className="h-30 md:h-35 w-auto" />
                  </div>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-8">
                    Productora audiovisual especializada en la creación de contenido de alto impacto. Transformamos ideas en experiencias visuales únicas.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/catso.av?igsh=YzNxd3BndDlhNGN2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.335 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.554-.789.308-1.458.72-2.122 1.384-.664.664-1.076 1.333-1.384 2.122-.296.763-.497 1.634-.554 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.258 2.148.554 2.911.308.789.72 1.458 1.384 2.122.664.664 1.333 1.076 2.122 1.384.763.296 1.634.497 2.911.554 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.148-.258 2.911-.554.789-.308 1.458-.72 2.122-1.384.664-.664 1.076-1.333 1.384-2.122.296-.763.497-1.634.554-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.258-2.148-.554-2.911-.308-.789-.72-1.458-1.384-2.122-.664-.664-1.333-1.076-2.122-1.384-.763-.296-1.634-.497-2.911-.554-1.28-.058-1.688-.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Info Columns */}
                <div>
                  <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Empresa</h4>
                  <ul className="space-y-4">
                    <li><a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/40 hover:text-white transition-colors text-sm">Sobre Nosotros</a></li>
                    <li><a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/40 hover:text-white transition-colors text-sm">Nuestro Equipo</a></li>
                    <li><a href="#" onClick={(e) => scrollToSection(e, "clients")} className="text-white/40 hover:text-white transition-colors text-sm">Clientes</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Servicios</h4>
                  <ul className="space-y-4">
                    <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Videoclips</a></li>
                    <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Commercial</a></li>
                    <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Brand Content</a></li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/20 text-xs">© 2025 CATSO AV. Todos los derechos reservados.</p>
                <div className="flex gap-8">
                  <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Privacidad</a>
                  <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Términos</a>
                </div>
              </div>
            </div>
          </footer>

          {/* Video Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                onClick={() => setSelectedProject(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-6xl aspect-video bg-neutral-900 shadow-2xl overflow-hidden rounded-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-all group"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 bg-black overflow-hidden flex items-center justify-center">
                      {renderVideo(selectedProject.videoUrl)}
                    </div>

                    <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                          <span className="text-red-600 text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block">{selectedProject.category}</span>
                          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1 tracking-tight">{selectedProject.title}</h3>
                          <p className="text-white/40 text-sm uppercase tracking-widest leading-relaxed">{(selectedProject as any).clientName}</p>
                        </div>
                        <div className="max-w-md text-right">
                          <p className="text-white/60 text-sm italic font-light">"{selectedProject.description}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <QuickProjectButton />
      </div>
    </>
  )
}
