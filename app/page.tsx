"use client"

import Script from "next/script"
import { useEffect, useState, memo, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { SessionProvider, useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import QuickProjectButton from "@/components/QuickProjectButton"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
// Dynamic imports for heavy sections
const Manifesto = dynamic(() => import("@/components/Manifesto"), { ssr: true })
const Workflow = dynamic(() => import("@/components/Workflow"), { ssr: true })
const ServicesList = dynamic(() => import("@/components/ServicesList"), { ssr: true })
const Crew = dynamic(() => import("@/components/Crew"), { ssr: true })
const Clients = dynamic(() => import("@/components/Clients"), { ssr: true })

const MemoizedManifesto = memo(Manifesto)
const MemoizedWorkflow = memo(Workflow)
const MemoizedServicesList = memo(ServicesList)
const MemoizedCrew = memo(Crew)
const MemoizedClients = memo(Clients)

import { getYouTubeId, getVimeoId, isDirectVideo as checkIsDirectVideo } from "@/lib/video-utils"



export default function Home() {
  return (
    <HomeContent />
  )
}

function HomeContent() {
  const { data: session } = useSession()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSorting, setIsSorting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const fetchInitialData = async () => {
    await Promise.all([fetchProjects(), fetchCategories()])
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { next: { revalidate: 3600 } })
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
      const res = await fetch('/api/projects', { next: { revalidate: 3600 } })
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
    e.preventDefault()
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
    e.preventDefault()
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

  // Memoized: Projects filtered by category and sorted
  const projectsByCategory = useMemo(() => {
    const map: Record<string, any[]> = {}
    categories.forEach(cat => {
      map[cat.name] = projects
        .filter((p: any) => p.category === cat.name)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    })
    return map
  }, [projects, categories])

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = () => {
    setIsSorting(true)
  }

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

      setTimeout(() => setIsSorting(false), 100)
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

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > window.innerHeight - 150) {
      if (!isScrolled) setIsScrolled(true)
    } else {
      if (isScrolled) setIsScrolled(false)
    }
  })

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
        strategy="lazyOnload"
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
            <div className="relative w-full px-6 md:px-10 flex items-center justify-between">
              <a href="#" onClick={(e) => scrollToSection(e, "top")} className="group flex-shrink-0">
                <Image src="/logo-white.png" alt="CATSO AV" width={140} height={60} className="h-auto w-auto" priority />
              </a>

              <div className="hidden md:flex gap-4 lg:gap-8 items-center">
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
                {categories.filter(cat => (session as any)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0).map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.name}`}
                    onClick={(e) => scrollToSection(e, category.name)}
                    className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider"
                  >
                    {category.title.split(" ")[0]}
                  </a>
                ))}
                {/* <a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider">
                  Equipo
                </a> */}
                {session && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider">Hola, {session.user?.name?.split(' ')[0] || 'Admin'}</span>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="text-white/80 hover:text-white text-[9px] uppercase tracking-widest font-bold border-r border-white/20 pr-3 mr-1 transition-colors"
                      >
                        Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 rounded border border-red-600/20 transition-all"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </div>

              <button
                className="md:hidden text-white hover:text-red-600 transition-colors z-[60]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-[110] bg-neutral-950 border-l border-white/10 shadow-2xl md:hidden overflow-hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <Image src="/logo-white.png" alt="CATSO AV" width={100} height={40} className="h-auto w-auto opacity-80" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8">
                <nav className="flex flex-col gap-6">
                  <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "top"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Inicio</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "manifesto"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Nosotros</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "services"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Servicios</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "process"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Proceso</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a>

                  <div className="my-4 h-px bg-white/5" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4">Categorías</p>

                  {categories.filter(cat => (session as any)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0).map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.name}`}
                      onClick={(e) => { scrollToSection(e, category.name); setIsMobileMenuOpen(false); }}
                      className="text-xl font-serif font-bold text-white/80 hover:text-red-600 transition-colors flex items-center justify-between group"
                    >
                      <span>{category.title}</span>
                      <span className="h-px w-0 bg-red-600 transition-all duration-300 group-hover:w-4" />
                    </a>
                  ))}

                  <div className="my-4 h-px bg-white/5" />

                  {/* <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "crew"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Equipo</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a> */}
                  {session?.user?.role === "admin" && (
                    <a
                      href="/admin"
                      className="text-2xl font-serif font-bold text-red-500 hover:text-red-400 transition-colors flex items-center justify-between group"
                    >
                      <span>Panel Admin</span>
                      <span className="h-0.5 w-8 bg-red-600" />
                    </a>
                  )}

                  <a
                    href="#"
                    onClick={(e) => { scrollToSection(e, "contact"); setIsMobileMenuOpen(false); }}
                    className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                  >
                    <span>Contacto</span>
                    <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                  </a>

                  {session && (
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full mt-6 bg-red-600/10 border border-red-600/30 text-red-500 py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all"
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </nav>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/30 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-4">Social</p>
                <div className="flex gap-6">
                  <a href="https://www.instagram.com/catso.av" target="_blank" className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.335 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.554-.789.308-1.458.72-2.122 1.384-.664.664-1.076 1.333-1.384 2.122-.296.763-.497 1.634-.554 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.258 2.148.554 2.911.308.789.72 1.458 1.384 2.122.664.664 1.333 1.076 2.122 1.384.763.296 1.634.497 2.911.554 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.148-.258 2.911-.554.789-.308 1.458-.72 2.122-1.384.664-.664 1.076-1.333 1.384-2.122.296-.763.497-1.634.554-2.911.058-1.28.072-1.688-.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.258-2.148-.554-2.911-.308-.789-.72-1.458-1.384-2.122-.664-.664-1.333-1.076-2.122-1.384-.763-.296-1.634-.497-2.911-.554-1.28-.058-1.688-.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="https://www.behance.net/catsoav" target="_blank" className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.2 14.48c-.07-.37-.79-3.73-4.43-3.73-3.64 0-4.69 3.14-4.69 4.48s1.02 4.45 4.81 4.45c2.59 0 4.02-1.31 4.63-2.02l-2.31-1.5c-.44.56-1.05 1.18-2.1 1.18-1.14 0-2.28-.4-2.28-2.12h6.44c.01-.13.01-.43.01-.74h-.08zm-6.3-1c.14-1.08 1.1-1.85 2-.15.22.4.22.9 0 1.25-.11.19-.44.4-.95.4a1.88 1.88 0 0 1-1.05-1.5zM9.1 6.07H4.38v12.91h5.57c3.83 0 5.21-2.31 5.21-3.75a3.12 3.12 0 0 0-2.49-3.04 3.06 3.06 0 0 0 1.99-2.82c0-2.99-2.25-3.3-5.56-3.3zm-1.89 4.89V8.47h1.86s1.49-.06 1.49 1.15c0 1.21-1.49 1.34-1.49 1.34H7.21zm0 5.66v-2.3h2.53s1.86-.06 1.86 1.15-1.86 1.15-1.86 1.15H7.21zM15.34 9.07h6.08V7.72h-6.08v1.35z" /></svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="unicorn-bg">
        <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100vw", height: "100vh" }} />
      </div>

      <div className="relative z-10 w-full" suppressHydrationWarning>
        <section className="relative h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            style={{ opacity, y }}
            className={`transition-all duration-1000 relative z-20 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative flex flex-col items-center">
              <Image
                src="/logo-white.png"
                alt="CATSO AV"
                width={1600}
                height={800}
                className={`h-auto w-[300px] md:w-[650px] lg:w-[950px] max-w-full drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-0 ${isLoaded ? "hero-logo-entrance" : "opacity-0"}`}
                priority
              />
              <p className="absolute bottom-[22%] md:bottom-[28%] lg:bottom-[32%] left-1/2 -translate-x-1/2 font-sans text-white/70 text-[10px] md:text-sm lg:text-lg font-extralight tracking-[0.5em] uppercase text-center leading-none w-full">
                <span className="inline md:hidden leading-relaxed">Video Production<br />Company</span>
                <span className="hidden md:inline text-nowrap">Video Production Company</span>
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

        <MemoizedManifesto />
        <MemoizedServicesList />
        <MemoizedWorkflow />

        <div className="w-full bg-black relative z-20">
          <div className="max-w-7xl mx-auto px-6 pb-20">
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {categories.map((category) => {
                  const catProjects = projectsByCategory[category.name] || []
                  if ((session as any)?.user?.role !== "admin" && catProjects.length === 0) return null;

                  return (
                    <CategoryDroppable
                      key={category.id}
                      id={category.name}
                      className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none"
                    >
                      <div className="mb-12 md:mb-16">
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
                                <Link
                                  href={`/project/${project.id}`}
                                  onClick={(e) => {
                                    if (isSorting) {
                                      e.preventDefault()
                                      return
                                    }
                                  }}
                                  className={`hover-burn group relative block aspect-video bg-neutral-900/50 border border-white/5 lg:hover:border-red-600/50 transition-all duration-500 lg:hover:shadow-2xl lg:hover:shadow-red-900/20 w-full h-full cursor-pointer ${!project.published ? "opacity-40 grayscale" : ""}`}
                                >
                                  {/* Media Container (Clipped) */}
                                  <div className="absolute inset-0 overflow-hidden rounded-[inherit] z-0">
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
                                            e.preventDefault()
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
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            handleDelete(e, project.id)
                                          }}
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
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full lg:group-hover:translate-y-0 transition-transform duration-500 z-20">
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
                                </Link>
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
                  <div className="mb-12 md:mb-16 px-4 md:px-0">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{category.title}<span className="text-red-600">.</span></h2>
                    <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
                  </div>
                  <div className="flex items-center justify-center p-12 text-white/40">Cargando proyectos...</div>
                </section>
              ))
            )}
          </div>

          {/* <Clients />
          <Crew /> */}

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
            <div className="w-full px-6 md:px-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="col-span-1">
                  <div className="mb-6">
                    <Image src="/logo-white.png" alt="CATSO AV" width={140} height={60} className="h-auto w-auto opacity-50" />
                  </div>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                    Productora audiovisual especializada en la creación de contenido de alto impacto. Transformamos ideas en experiencias visuales únicas.
                  </p>
                </div>

                {/* Info Columns */}
                <div>
                  <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Empresa</h4>
                  <ul className="space-y-4">
                    <li><a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/40 hover:text-white transition-colors text-sm">Sobre Nosotros</a></li>
                    {/* <li><a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/40 hover:text-white transition-colors text-sm">Nuestro Equipo</a></li>
                    <li><a href="#" onClick={(e) => scrollToSection(e, "clients")} className="text-white/40 hover:text-white transition-colors text-sm">Clientes</a></li> */}
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

                {/* Contact Column */}
                <div className="flex flex-col items-center md:items-end">
                  <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contacto</h4>
                  <div className="flex flex-col items-center md:items-end gap-4">
                    <p className="text-white/60 text-sm font-medium tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v12z" />
                      </svg>
                      <a href="https://wa.me/5493442646868" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
                        +54 9 3442646868
                      </a>
                    </p>
                    <div className="flex flex-col items-center md:items-end gap-2 text-right">
                      <p className="text-white/60 text-sm font-medium tracking-wider flex items-center gap-2 hover:text-red-600 transition-colors justify-end">
                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <a href="mailto:laureanogomez@catsoav.com">laureanogomez@catsoav.com</a>
                      </p>
                      <p className="text-white/60 text-sm font-medium tracking-wider flex items-center gap-2 hover:text-red-600 transition-colors justify-end">
                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <a href="mailto:camiloserra@catsoav.com">camiloserra@catsoav.com</a>
                      </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <a
                        href="https://www.instagram.com/catso.av?igsh=YzNxd3BndDlhNGN2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-red-600 transition-colors"
                        title="Instagram"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.335 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.554-.789.308-1.458.72-2.122 1.384-.664.664-1.076 1.333-1.384 2.122-.296.763-.497 1.634-.554 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.258 2.148.554 2.911.308.789.72 1.458 1.384 2.122.664.664 1.333 1.076 2.122 1.384.763.296 1.634.497 2.911.554 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.148-.258 2.911-.554.789-.308 1.458-.72 2.122-1.384.664-.664 1.076-1.333 1.384-2.122.296-.763.497-1.634.554-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.258-2.148-.554-2.911-.308-.789-.72-1.458-1.384-2.122-.664-.664-1.333-1.076-2.122-1.384-.763-.296-1.634-.497-2.911-.554-1.28-.058-1.688-.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.behance.net/catsoav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-red-600 transition-colors"
                        title="Behance"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.2 14.48c-.07-.37-.79-3.73-4.43-3.73-3.64 0-4.69 3.14-4.69 4.48s1.02 4.45 4.81 4.45c2.59 0 4.02-1.31 4.63-2.02l-2.31-1.5c-.44.56-1.05 1.18-2.1 1.18-1.14 0-2.28-.4-2.28-2.12h6.44c.01-.13.01-.43.01-.74h-.08zm-6.3-1c.14-1.08 1.1-1.85 2-.15.22.4.22.9 0 1.25-.11.19-.44.4-.95.4a1.88 1.88 0 0 1-1.05-1.5zM9.1 6.07H4.38v12.91h5.57c3.83 0 5.21-2.31 5.21-3.75a3.12 3.12 0 0 0-2.49-3.04 3.06 3.06 0 0 0 1.99-2.82c0-2.99-2.25-3.3-5.56-3.3zm-1.89 4.89V8.47h1.86s1.49-.06 1.49 1.15c0 1.21-1.49 1.34-1.49 1.34H7.21zm0 5.66v-2.3h2.53s1.86-.06 1.86 1.15-1.86 1.15-1.86 1.15H7.21zM15.34 9.07h6.08V7.72h-6.08v1.35z" />
                        </svg>
                      </a>
                      <a
                        href="https://wa.me/5493442646868"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-red-600 transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.407 3.481 2.242 2.242 3.482 5.225 3.481 8.408-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.301 1.667zm6.38-3.551l.366.218c1.554.919 3.328 1.405 5.161 1.406h.005c5.631 0 10.211-4.579 10.213-10.21.001-5.632-4.577-10.213-10.211-10.213-2.729 0-5.292 1.063-7.221 2.993-1.928 1.928-2.99 4.489-2.991 7.218-.001 1.83.47 3.616 1.36 5.176l.24.417-.996 3.636 3.731-.986zm11.41-7.149c-.314-.157-1.86-.918-2.148-1.023-.288-.105-.499-.157-.708.157-.21.314-.812 1.023-.996 1.233-.183.21-.367.236-.681.079-.314-.157-1.328-.49-2.53-1.561-.935-.834-1.566-1.863-1.75-2.177-.183-.314-.02-.485.137-.641.142-.14.314-.367.472-.55.157-.183.21-.314.314-.524.105-.21.052-.393-.027-.55-.079-.157-.708-1.703-.97-2.332-.255-.612-.513-.53-.708-.541-.183-.008-.393-.01-.603-.01-.21 0-.55.079-.838.393-.288.314-1.1 1.075-1.1 2.62s1.127 3.037 1.284 3.247c.157.21 2.219 3.389 5.375 4.755.751.325 1.336.52 1.792.664.754.238 1.439.205 1.982.124.605-.09 1.86-.759 2.122-1.494.262-.733.262-1.362.183-1.494-.08-.132-.288-.21-.603-.367z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.youtube.com/@CATSO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-red-600 transition-colors"
                        title="YouTube"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.linkedin.com/company/catso-av/about/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-red-600 transition-colors"
                        title="LinkedIn"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/20 text-xs">
                  © {new Date().getFullYear()} <a href="https://vaxler.com.ar/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Vaxler</a>. Todos los derechos reservados.
                </p>
                <div className="flex gap-8">
                  <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Privacidad</a>
                  <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Términos</a>
                </div>
              </div>
            </div>
          </footer>

        </div>

        <QuickProjectButton />
      </div >
    </>
  )
}
