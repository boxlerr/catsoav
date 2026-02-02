"use client"

import Script from "next/script"
import { useEffect, useState, memo, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useInView } from "framer-motion"
import { SessionProvider, useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Footer from "@/components/Footer"
import QuickProjectButton from "@/components/QuickProjectButton"
import { getProjects, getCategories } from "@/lib/data"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Providers } from "./providers"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"
import VideoThumbnail from "@/components/VideoThumbnail"
// import CatsoVideoPlayer from "@/components/CatsoVideoPlayer"
import { CategoryDroppable } from "@/components/CategoryDroppable"
import { SortableItem } from "@/components/SortableItem"
// Dynamic imports for heavy sections
const Manifesto = dynamic(() => import("@/components/Manifesto"), { ssr: true })

const ServicesList = dynamic(() => import("@/components/ServicesList"), { ssr: true })
const Crew = dynamic(() => import("@/components/Crew"), { ssr: true })
const Clients = dynamic(() => import("@/components/Clients"), { ssr: true })

const MemoizedManifesto = memo(Manifesto)

const MemoizedServicesList = memo(ServicesList)
// const MemoizedCrew = memo(Crew)
// const MemoizedClients = memo(Clients)

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  videoUrl: string | null;
  extraVideos: string | null;
  clientName: string | null;
  published: boolean;
  order: number;
}

interface ExtendedUser {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  id?: string
}

interface ExtendedSession {
  user?: ExtendedUser
}

interface Category {
  id: string;
  name: string;
  title: string;
  description: string | null;
}

// import { getYouTubeId, getVimeoId, isDirectVideo as checkIsDirectVideo } from "@/lib/video-utils"



interface CategorySectionProps {
  category: Category;
  catProjects: Project[];
  isExpanded: boolean;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  session: any;
  isSorting: boolean;
  toggleVisibility: (e: React.MouseEvent, project: Project) => Promise<void>;
  handleDelete: (e: React.MouseEvent, id: string) => Promise<void>;
}

const CategorySection = memo(({
  category,
  catProjects,
  isExpanded,
  setExpandedCategories,
  session,
  isSorting,
  toggleVisibility,
  handleDelete
}: CategorySectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0 }); // 0 means even 1px visible is "in view"

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: category.id,
    disabled: session?.user?.role !== "admin"
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    // If it's expanded but no longer in view, collapse it
    if (!isInView && isExpanded) {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        if (next.has(category.name)) {
          next.delete(category.name);
          return next;
        }
        return prev;
      });
    }
  }, [isInView, isExpanded, category.name, setExpandedCategories]);

  const visibleProjects = isExpanded
    ? catProjects
    : catProjects.slice(0, 3);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          (sectionRef as any).current = node;
        }
      }}
      style={style}
    >
      <CategoryDroppable
        id={category.name}
        className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none"
      >
        <div className="mb-12 md:mb-16 flex items-start justify-between">
          <div
            className={session?.user?.role === "admin" ? "cursor-move" : ""}
            {...(session?.user?.role === "admin" ? { ...attributes, ...listeners } : {})}
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              {category.title}
              <span className="text-red-600">.</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
          </div>

          {session?.user?.role === "admin" && (
            <div className="flex gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('newProject', { detail: { category: category.name } }))}
                className="bg-white/5 hover:bg-white text-white hover:text-black px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all"
              >
                + Nuevo Proyecto
              </button>
            </div>
          )}
        </div>

        <SortableContext
          items={visibleProjects.map(p => p.id)}
          strategy={rectSortingStrategy}
          disabled={session?.user?.role !== "admin"}
        >
          <div className="centered-grid gap-4 md:gap-8">
            {visibleProjects.length > 0 ? (
              visibleProjects.map((project) => {
                return (
                  <SortableItem
                    key={project.id}
                    id={project.id}
                    disabled={session?.user?.role !== "admin"}
                    className="h-full"
                  >
                    <Link
                      href={`/project/${project.id}`}
                      onClick={(e) => {
                        if (isSorting) {
                          e.preventDefault()
                          return
                        }
                      }}
                      className={`hover-burn group relative block aspect-video bg-neutral-900/50 border border-white/5 lg:hover:border-red-600/50 transition-all duration-500 lg:hover:shadow-2xl lg:hover:shadow-red-900/20 cursor-pointer ${!project.published ? "opacity-40 grayscale" : ""} w-full h-full`}
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                        <VideoThumbnail
                          videoUrl={project.videoUrl || ""}
                          imageUrl={project.imageUrl}
                          title={project.title}
                        />

                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full lg:group-hover:translate-y-0 transition-transform duration-500 z-20">
                          <p className="text-white font-serif font-bold text-lg mb-0.5 tracking-tight">{project.title}</p>
                          <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">{project.clientName || 'Producción'}</p>
                          {session?.user?.role === "admin" && (
                            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              <span className="text-red-500 text-[9px] uppercase tracking-[0.2em] font-bold">Admin: Drag to Reorder</span>
                            </div>
                          )}
                        </div>
                      </div>

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
                    </Link>
                  </SortableItem>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-white/30 border border-white/5 border-dashed rounded-lg">
                No hay proyectos en esta categoría. {session?.user?.role === "admin" && "Usa el botón + para agregar uno."}
              </div>
            )}
          </div>
        </SortableContext>

        {(catProjects.length > 3 || isExpanded) && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setExpandedCategories(prev => {
                const next = new Set(prev)
                if (isExpanded) {
                  next.delete(category.name)
                } else {
                  next.add(category.name)
                }
                return next
              })}
              className="group flex flex-col items-center gap-4 py-4"
            >
              <span className="text-xs font-serif text-white/50 tracking-[0.3em] uppercase group-hover:text-white transition-colors duration-500">
                {isExpanded ? "Ver Menos" : "Ver Más"}
              </span>
              <div className={`w-px bg-gradient-to-b from-white/20 to-transparent transition-all duration-500 ${isExpanded ? "h-12 from-red-600 to-red-600/20 group-hover:h-8 group-hover:from-white/20" : "h-8 group-hover:h-12 group-hover:from-red-600 group-hover:to-red-600/20"}`} />
            </button>
          </div>
        )}
      </CategoryDroppable >
    </div >
  );
});

CategorySection.displayName = 'CategorySection';

export default async function Home() {
  const session = await getServerSession(authOptions)
  const [initialProjects, initialCategories] = await Promise.all([
    getProjects(session?.user?.role === "admin"),
    getCategories()
  ])

  return (
    <HomeClient
      initialProjects={initialProjects}
      initialCategories={initialCategories}
      session={session}
    />
  )
}

function HomeClient({ initialProjects, initialCategories, session: serverSession }: {
  initialProjects: Project[],
  initialCategories: Category[],
  session: any
}) {
  const { data: sessionData } = useSession()
  const session = serverSession || sessionData
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
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

  const toggleVisibility = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    e.preventDefault()
    const newStatus = !project.published
    setProjects((prev) => prev.map(p => p.id === project.id ? { ...p, published: newStatus } : p))
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus })
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      setProjects((prev) => prev.map(p => p.id === project.id ? { ...p, published: !newStatus } : p))
    }
  }

  // Memoized: Projects filtered by category and sorted
  const projectsByCategory = useMemo(() => {
    const map: Record<string, Project[]> = {}
    categories.forEach(cat => {
      map[cat.name] = projects
        .filter((p) => p.category === cat.name)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    })
    return map
  }, [projects, categories])

  // DnD Sensors
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'category' | 'project' | null>(null)
  const router = useRouter()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setIsSorting(true)
    const { active } = event
    setActiveId(active.id.toString())
    const isCategory = categories.some(c => c.id === active.id)
    setActiveType(isCategory ? 'category' : 'project')
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (session?.user?.role !== "admin") return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    const isActiveProject = projects.some(p => p.id === activeId)
    const isActiveCategory = categories.some(c => c.id === activeId)
    const isOverProject = projects.some(p => p.id === overId)
    const isOverCategory = categories.some(c => c.id === overId || c.name === overId)

    if (isActiveProject) {
      setProjects((prev) => {
        const activeProject = prev.find((p) => p.id === activeId)
        if (!activeProject) return prev

        const overProject = prev.find((p) => p.id === overId)
        const overCategory = categories.find((c) => c.id === overId || c.name === overId)

        if (overProject) {
          if (activeProject.category !== overProject.category) {
            const activeIndex = prev.findIndex((p) => p.id === activeId)
            const overIndex = prev.findIndex((p) => p.id === overId)
            const newProjects = [...prev]
            newProjects[activeIndex] = { ...newProjects[activeIndex], category: overProject.category }
            return arrayMove(newProjects, activeIndex, overIndex)
          }
        } else if (overCategory) {
          if (activeProject.category !== overCategory.name) {
            const activeIndex = prev.findIndex((p) => p.id === activeId)
            const newProjects = [...prev]
            newProjects[activeIndex] = { ...newProjects[activeIndex], category: overCategory.name }
            return newProjects
          }
        }
        return prev
      })
    } else if (isActiveCategory) {
      // If it's a category, we might be over a project. If so, find that project's category.
      let actualOverId = overId;
      if (isOverProject) {
        const overProj = projects.find(p => p.id === overId)!
        const parentCat = categories.find(c => c.name === overProj.category)
        if (parentCat) actualOverId = parentCat.id
      }

      if (activeId !== actualOverId) {
        const oldIndex = categories.findIndex(c => c.id === activeId)
        const newIndex = categories.findIndex(c => c.id === actualOverId)
        if (oldIndex !== -1 && newIndex !== -1) {
          setCategories(prev => arrayMove(prev, oldIndex, newIndex))
        }
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setIsSorting(false)
    setActiveId(null)
    setActiveType(null)

    if (session?.user?.role !== "admin" || !over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    const isActiveCategory = categories.some(c => c.id === activeId)
    const isOverProject = projects.some(p => p.id === overId)

    if (isActiveCategory) {
      const reorderItems = categories.map((cat, index) => ({
        id: cat.id,
        order: index
      }))

      await fetch("/api/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderItems })
      })
    } else {
      const activeProj = projects.find(p => p.id === activeId)
      if (!activeProj) return

      const overProj = projects.find(p => p.id === overId)
      const overCat = categories.find(c => c.id === overId || c.name === overId)

      let newCategory = activeProj.category
      if (overProj) newCategory = overProj.category
      else if (overCat) newCategory = overCat.name

      const oldIndex = projects.findIndex(p => p.id === activeId)
      let newIndex = projects.findIndex(p => p.id === overId)
      if (newIndex === -1 && overCat) {
        newIndex = projects.length - 1
      }

      const updatedProjects = [...projects]
      updatedProjects[oldIndex] = { ...activeProj, category: newCategory }
      const finalProjects = newIndex !== -1
        ? arrayMove(updatedProjects, oldIndex, newIndex)
        : updatedProjects

      setProjects(finalProjects)

      const projectsToSync: { id: string, order: number, category: string }[] = []
      const counts: Record<string, number> = {}
      finalProjects.forEach(p => {
        if (!counts[p.category]) counts[p.category] = 0
        projectsToSync.push({ id: p.id, order: counts[p.category], category: p.category })
        counts[p.category]++
      })

      await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: projectsToSync })
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
                <Image src="/logo-white.png" alt="CATSO AV" width={140} height={60} className="h-28 w-auto object-contain" priority unoptimized style={{ width: "auto" }} />
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

                {categories.filter(cat => (session as ExtendedSession)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0).map((category) => (
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
                <Image src="/logo-white.png" alt="CATSO AV" width={100} height={40} className="h-14 w-auto opacity-80 object-contain" priority unoptimized style={{ width: "auto" }} />
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


                  <div className="my-4 h-px bg-white/5" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4">Categorías</p>

                  {categories.filter(cat => (session as ExtendedSession)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0).map((category) => (
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
                  {((session as ExtendedSession)?.user?.role === "admin") && (
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

      <div className="unicorn-bg" suppressHydrationWarning>
        <div data-us-project="DmxX3AU5Ot4TeJbMP4tT" style={{ width: "100vw", height: "100vh" }} suppressHydrationWarning></div>
      </div>

      <div className="relative z-10 w-full" suppressHydrationWarning>
        <section className="relative h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            style={{ opacity, y }}
            className={`transition-all duration-1000 relative z-20 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            suppressHydrationWarning
          >
            <div className="relative flex flex-col items-center" suppressHydrationWarning>
              <Image
                src="/logo-white.png"
                alt="CATSO AV"
                width={1600}
                height={800}
                className={`h-auto w-[300px] md:w-[650px] lg:w-[950px] max-w-full drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-0 ${isLoaded ? "hero-logo-entrance" : "opacity-0"}`}
                priority
                style={{ height: "auto" }}
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
            suppressHydrationWarning
          >
            <div className="animate-bounce text-white flex flex-col items-center gap-2" suppressHydrationWarning>
              <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none z-10" suppressHydrationWarning />
        </section>

        <MemoizedManifesto />


        <div className="w-full bg-black relative z-20" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-6 pb-20" suppressHydrationWarning>
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={activeType === 'category' ? [restrictToVerticalAxis] : []}
              >
                <SortableContext
                  items={categories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                  disabled={session?.user?.role !== "admin"}
                >
                  <div className="flex flex-col">
                    {categories.map((category) => {
                      const catProjects = projectsByCategory[category.name] || []
                      if ((session as ExtendedSession)?.user?.role !== "admin" && catProjects.length === 0) return null;

                      return (
                        <CategorySection
                          key={category.id}
                          category={category}
                          catProjects={catProjects}
                          isExpanded={expandedCategories.has(category.name)}
                          setExpandedCategories={setExpandedCategories}
                          session={session}
                          isSorting={isSorting}
                          toggleVisibility={toggleVisibility}
                          handleDelete={handleDelete}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
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

          <MemoizedServicesList />

          {/* <Clients />
          <Crew /> */}

          <section id="contact" className="py-20 border-t border-neutral-900 bg-black" suppressHydrationWarning>
            <div className="max-w-3xl mx-auto px-4 text-center" suppressHydrationWarning>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Let&apos;s Work Together
                <span className="text-red-600">.</span>
              </h2>
              <p className="text-white/60 text-lg mb-12">
                ¿Tienes un proyecto en mente? Cuéntanos tu idea.
              </p>

              <form className="space-y-6 text-left" suppressHydrationWarning>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                  <div suppressHydrationWarning>
                    <label htmlFor="name" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Nombre</label>
                    <input type="text" id="name" defaultValue={session?.user?.name || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder="Tu nombre" />
                  </div>
                  <div suppressHydrationWarning>
                    <label htmlFor="email" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Email</label>
                    <input type="email" id="email" defaultValue={session?.user?.email || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder="tu@email.com" />
                  </div>
                </div>
                <div suppressHydrationWarning>
                  <label htmlFor="message" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">Mensaje</label>
                  <textarea id="message" rows={4} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder="Cuéntanos sobre tu proyecto..."></textarea>
                </div>
                <div className="text-center" suppressHydrationWarning>
                  <button type="submit" className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 font-medium uppercase tracking-widest text-sm transition-all duration-300">Enviar Mensaje</button>
                </div>
              </form>
            </div>
          </section>

          <Footer />

        </div>

        <QuickProjectButton />
      </div >
    </>
  )
}
