"use client"


import { useEffect, useState, memo, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import Footer from "@/components/Footer"
import QuickProjectButton from "@/components/QuickProjectButton"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useTranslations } from "next-intl"
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
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { CategoryDroppable } from "@/components/CategoryDroppable"
import { Project, Category } from "@/types"

// Dynamic imports for heavy sections
const Manifesto = dynamic(() => import("@/components/Manifesto"), { ssr: true })
const ServicesList = dynamic(() => import("@/components/ServicesList"), { ssr: true })

const NetflixCarousel = dynamic(() => import("@/components/NetflixCarousel"), { ssr: false })

const MemoizedManifesto = memo(Manifesto)
const MemoizedServicesList = memo(ServicesList)

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

interface CategorySectionProps {
    category: Category;
    catProjects: Project[];
    session: ExtendedSession | null;
    index: number;
    t: (key: string) => string;
}

const CategorySection = memo(({
    category,
    catProjects,
    session,
    index,
    t
}: CategorySectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    const sectionId = category.id ? `cat-${category.id}` : `cat-fallback-${category.name || 'unknown'}-${index}`
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: sectionId,
        disabled: session?.user?.role !== "admin"
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const tp = useTranslations('portfolio');
    const displayTitle = tp.has(`${category.name}.title`) ? tp(`${category.name}.title`) : category.title;
    const displayDescription = tp.has(`${category.name}.description`) ? tp(`${category.name}.description`) : category.description;

    return (
        <div
            id={category.name}
            ref={(node) => {
                setNodeRef(node);
                if (node) {
                    (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            style={style}
        >
            <CategoryDroppable
                id={category.name}
                className="flex flex-col py-12 md:py-16 border-t border-neutral-900 first:border-none"
            >
                <div className="mb-6 md:mb-8 flex items-start justify-between px-6 md:px-10">
                    <div
                        className={session?.user?.role === "admin" ? "cursor-move" : ""}
                        {...(session?.user?.role === "admin" ? { ...attributes, ...listeners } : {})}
                    >
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                            {displayTitle}
                            <span className="text-red-600">.</span>
                        </h2>
                        <p className="text-white/60 text-base md:text-lg font-light max-w-xl">{displayDescription}</p>
                    </div>

                    {session?.user?.role === "admin" && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('newProject', { detail: { category: category.name } }))}
                                className="bg-white/5 hover:bg-white text-white hover:text-black px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all"
                            >
                                {t('newProject')}
                            </button>
                        </div>
                    )}
                </div>

                <NetflixCarousel projects={catProjects} hideTitle />
            </CategoryDroppable>
        </div>
    );
});

CategorySection.displayName = 'CategorySection';

interface HomeContentProps {
    initialProjects: Project[];
    initialCategories: Category[];
    initialHeroSlides?: unknown[];
}

export default function HomeContent({ initialProjects, initialCategories, initialHeroSlides }: HomeContentProps) {
    const { data: session } = useSession()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [projects, setProjects] = useState<Project[]>(() => {
        if (!initialProjects) return []
        const valid = initialProjects.filter(p => p && p.id && typeof p.id === 'string' && p.id.trim() !== '')
        return Array.from(new Map(valid.map(p => [p.id, p])).values())
    })
    const [categories, setCategories] = useState<Category[]>(() => {
        if (!initialCategories) return []
        const valid = initialCategories.filter(c => c && c.id && typeof c.id === 'string' && c.id.trim() !== '')
        return Array.from(new Map(valid.map(c => [c.id, c])).values())
    })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()


    // Translations
    const tNav = useTranslations('header')
    const tHero = useTranslations('index.hero')
    const tHome = useTranslations('index.home')
    const tContact = useTranslations('contact')
    const tFooter = useTranslations('footer')

    useEffect(() => {
        setMounted(true)

        // Refresh data in background to ensure sync
        const refreshData = async () => {
            await Promise.all([fetchProjects(), fetchCategories()])
        }
        refreshData()
    }, [])

    useEffect(() => {
        if (projects.length > 0 && categories.length > 0 && mounted) {
            const timeoutId = setTimeout(() => {
                const savedPosition = sessionStorage.getItem('scroll-pos-/');
                if (savedPosition) {
                    const pos = parseInt(savedPosition, 10);
                    if (pos > 0) {
                        window.scrollTo({
                            top: pos,
                            behavior: 'instant'
                        });
                    }
                }
            }, 150);
            return () => clearTimeout(timeoutId);
        }
    }, [projects.length, categories.length, mounted]);

    // Keep state in sync with props when router.refresh() happens, ensuring uniqueness and non-empty IDs
    useEffect(() => {
        if (initialProjects) {
            const validProjects = initialProjects.filter(p => p && p.id && typeof p.id === 'string' && p.id.trim() !== '')
            const uniqueProjects = Array.from(new Map(validProjects.map(p => [p.id, p])).values())
            setProjects(uniqueProjects)
        }
    }, [initialProjects])

    useEffect(() => {
        if (initialCategories) {
            const validCategories = initialCategories.filter(c => c && c.id && typeof c.id === 'string' && c.id.trim() !== '')
            const uniqueCategories = Array.from(new Map(validCategories.map(c => [c.id, c])).values())
            setCategories(uniqueCategories)
        }
    }, [initialCategories])



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

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })
            if (res.ok) {
                const data = await res.json()
                const validCategories = data.filter((c: Category) => c && c.id && typeof c.id === 'string' && c.id.trim() !== '')
                const uniqueCategories = Array.from(new Map(validCategories.map((c: Category) => [c.id, c])).values())
                setCategories(uniqueCategories as Category[])
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })
            if (res.ok) {
                const data = await res.json()
                const validProjects = data.filter((p: Project) => p && p.id && typeof p.id === 'string' && p.id.trim() !== '')
                const uniqueProjects = Array.from(new Map(validProjects.map((p: Project) => [p.id, p])).values())
                setProjects(uniqueProjects as Project[])
            }
        } catch (error) {
            console.error("Error fetching projects:", error)
        }
    }


    const projectsByCategory = useMemo(() => {
        const map: Record<string, Project[]> = {}
        categories.forEach(cat => {
            const catLower = cat.name?.toLowerCase() || ''
            const catIdLower = cat.id?.toLowerCase() || ''
            
            map[cat.name] = [...projects]
                .filter((p) => {
                    const projectCat = p.category?.toLowerCase() || ''
                    // Flexible matching for Behance imports vs translated categories
                    if (projectCat === catLower || projectCat === catIdLower) return true;
                    
                    // Known Behance categories -> Spanish/Custom mapping
                    if (projectCat === 'commercial' && (catLower === 'comercial' || catLower.includes('comercio'))) return true;
                    if (projectCat === 'music' && catLower.includes('music')) return true;
                    if (projectCat === 'photography' && catLower.includes('foto')) return true;
                    if (projectCat === 'event' && catLower.includes('evento')) return true;
                    
                    return false;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
        })
        return map
    }, [projects, categories])

    const [activeType, setActiveType] = useState<'category' | 'project' | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const isCategory = categories.some(c => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === active.id)
        setActiveType(isCategory ? 'category' : 'project')
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        if (session?.user?.role !== "admin") return

        const activeId = active.id.toString()
        const overId = over.id.toString()

        const isActiveProject = projects.some((p) => (p.id ? `proj-${p.id}` : `proj-fallback-${p.title.replace(/\s+/g, '-')}`) === activeId)
        const isActiveCategory = categories.some((c) => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === activeId)

        if (isActiveProject) {
            setProjects((prev) => {
                const activeIndex = prev.findIndex((p) => (p.id ? `proj-${p.id}` : `proj-fallback-${p.title.replace(/\s+/g, '-')}`) === activeId)
                const overIndex = prev.findIndex((p) => (p.id ? `proj-${p.id}` : `proj-fallback-${p.title.replace(/\s+/g, '-')}`) === overId)

                if (activeIndex === -1) return prev

                // Moving within same category or to a project in another category
                const activeProject = prev[activeIndex]
                const overProject = prev.find((p) => (p.id ? `proj-${p.id}` : `proj-fallback-${p.title.replace(/\s+/g, '-')}`) === overId)
                const overCategory = categories.find((c) => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === overId || c.name === overId)

                if (overProject) {
                    const newProjects = [...prev]
                    if (activeProject.category !== overProject.category) {
                        newProjects[activeIndex] = { ...activeProject, category: overProject.category }
                    }
                    return arrayMove(newProjects, activeIndex, overIndex)
                } else if (overCategory) {
                    if (activeProject.category !== overCategory.name) {
                        const newProjects = [...prev]
                        newProjects[activeIndex] = { ...activeProject, category: overCategory.name }
                        return newProjects
                    }
                }
                return prev
            })
        } else if (isActiveCategory) {
            const oldIndex = categories.findIndex((c) => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === activeId)
            const newIndex = categories.findIndex((c) => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === overId)
            if (oldIndex !== -1 && newIndex !== -1) {
                setCategories(prev => arrayMove(prev, oldIndex, newIndex))
            }
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveType(null)

        if (session?.user?.role !== "admin" || !over) return

        setIsSaving(true)
        const isActiveCategory = categories.some((c) => (c.id ? `cat-${c.id}` : `cat-fallback-${c.name}`) === active.id)

        if (isActiveCategory) {
            const reorderItems = categories.map((cat, index) => ({
                id: cat.id,
                order: index
            }))

            try {
                const res = await fetch("/api/categories/reorder", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: reorderItems })
                })
                if (res.ok) router.refresh()
            } catch (err) {
                console.error("Error reordering categories:", err)
            }
        } else {
            // Recalculate orders for all projects based on their current array position per category
            const projectsWithNewOrder = [...projects]
            const cats = Array.from(new Set(projectsWithNewOrder.map(p => p.category)))

            const projectsToSync: { id: string, order: number, category: string }[] = []

            cats.forEach(catName => {
                projectsWithNewOrder
                    .filter(p => p.category === catName)
                    .forEach((p, index) => {
                        p.order = index
                        projectsToSync.push({ id: p.id, order: index, category: catName })
                    })
            })

            setProjects(projectsWithNewOrder)

            try {
                const res = await fetch("/api/projects/reorder", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: projectsToSync })
                })
                if (res.ok) router.refresh()
            } catch (err) {
                console.error("Error reordering projects:", err)
            }
        }
        setIsSaving(false)
    }

    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [300, 1100], [1, 0])
    const y = useTransform(scrollY, [300, 1100], [0, 80])

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > (typeof window !== 'undefined' ? window.innerHeight : 800) - 150) {
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
            <AnimatePresence>
                {isSaving && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {tHome('saving')}
                    </motion.div>
                )}
                {isScrolled && (
                    <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center"
                    >
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
                                <a href="#" onClick={(e) => scrollToSection(e, "top")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider" aria-label="Inicio">
                                    {tNav('home')}
                                </a>
                                <a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider" aria-label="Nosotros">
                                    {tNav('about')}
                                </a>
                                <a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider" aria-label="Servicios">
                                    {tNav('services')}
                                </a>

                                {categories
                                    .filter(cat => (session as ExtendedSession)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0)
                                    .map((category) => (
                                        <a
                                            key={category.id ? `nav-${category.id}` : `nav-fallback-${category.name}`}
                                            href={`#${category.name}`}
                                            onClick={(e) => scrollToSection(e, category.name)}
                                            className="text-white/80 hover:text-red-600 transition-colors text-sm font-medium uppercase tracking-wider"
                                            aria-label={`Categoría ${category.title}`}
                                        >
                                            {category.title.split(" ")[0]}
                                        </a>
                                    ))}
                                
                                <LanguageSwitcher />

                                {session && (
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className="text-white/40 text-[10px] uppercase tracking-wider">Hola, {session.user?.name?.split(' ')[0] || 'Admin'}</span>
                                        {session.user.role === "admin" && (
                                            <Link
                                                href="/admin"
                                                className="text-white/80 hover:text-white text-[9px] uppercase tracking-widest font-bold border-r border-white/20 pr-3 mr-1 transition-colors"
                                            >
                                                {tNav('admin')}
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 rounded border border-red-600/20 transition-all"
                                        >
                                            {tNav('logout')}
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
            </AnimatePresence >

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm md:hidden"
                        />

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
                                    <div className="mb-4">
                                        <LanguageSwitcher />
                                    </div>
                                    <a
                                        href="#"
                                        onClick={(e) => { scrollToSection(e, "top"); setIsMobileMenuOpen(false); }}
                                        className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                                    >
                                        <span>{tNav('home')}</span>
                                        <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { scrollToSection(e, "manifesto"); setIsMobileMenuOpen(false); }}
                                        className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                                    >
                                        <span>{tNav('about')}</span>
                                        <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { scrollToSection(e, "services"); setIsMobileMenuOpen(false); }}
                                        className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                                    >
                                        <span>{tNav('services')}</span>
                                        <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                                    </a>


                                    <div className="my-4 h-px bg-white/5" />
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4">Categorías</p>

                                    {categories
                                        .filter(cat => (session as ExtendedSession)?.user?.role === "admin" || (projectsByCategory[cat.name]?.length || 0) > 0)
                                        .map((category) => (
                                            <a
                                                key={category.id ? `mob-${category.id}` : `mob-fallback-${category.name}`}
                                                href={`#${category.name}`}
                                                onClick={(e) => { scrollToSection(e, category.name); setIsMobileMenuOpen(false); }}
                                                className="text-xl font-serif font-bold text-white/80 hover:text-red-600 transition-colors flex items-center justify-between group"
                                            >
                                                <span>{category.title}</span>
                                                <span className="h-px w-0 bg-red-600 transition-all duration-300 group-hover:w-4" />
                                            </a>
                                        ))}

                                    <div className="my-4 h-px bg-white/5" />

                                    {((session as ExtendedSession)?.user?.role === "admin") && (
                                        <Link
                                            href="/admin"
                                            className="text-2xl font-serif font-bold text-red-500 hover:text-red-400 transition-colors flex items-center justify-between group"
                                        >
                                            <span>{tNav('dashboard')}</span>
                                            <span className="h-0.5 w-8 bg-red-600" />
                                        </Link>
                                    )}

                                    <a
                                        href="#"
                                        onClick={(e) => { scrollToSection(e, "contact"); setIsMobileMenuOpen(false); }}
                                        className="text-2xl font-serif font-bold text-white hover:text-red-600 transition-colors flex items-center justify-between group"
                                    >
                                        <span>{tNav('contact')}</span>
                                        <span className="h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-8" />
                                    </a>

                                    {session && (
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="w-full mt-6 bg-red-600/10 border border-red-600/30 text-red-500 py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            {tNav('logout')}
                                        </button>
                                    )}
                                </nav>
                            </div>

                            <div className="p-8 border-t border-white/5 bg-black/30 backdrop-blur-md">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-4">{tFooter('social')}</p>
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


            <div className="relative z-10 w-full">
                <section className="relative h-screen flex flex-col items-center justify-center p-4 z-40">
                    <motion.div
                        style={{ opacity, y }}
                        className={`transition-all duration-1000 relative z-20 w-full flex-grow flex flex-col items-center justify-center pb-32 md:pb-48 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                        <div className="relative flex flex-col items-center">
                            <Image
                                src="/logo-white.png"
                                alt="CATSO AV"
                                width={1600}
                                height={800}
                                className={`h-auto w-[300px] md:w-[650px] lg:w-[950px] max-w-full drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-0 ${isLoaded ? "hero-logo-entrance" : "opacity-0"}`}
                                priority
                                style={{ height: "auto" }}
                            />
                            <p 
                                className="absolute bottom-[22%] md:bottom-[28%] lg:bottom-[32%] left-1/2 -translate-x-1/2 font-sans text-white/70 text-[10px] md:text-sm lg:text-lg font-extralight tracking-[0.5em] uppercase text-center leading-none w-full"
                            >
                                <span className="inline md:hidden leading-relaxed">{tHero('subtitle')}</span>
                                <span className="hidden md:inline text-nowrap">{tHero('subtitle')}</span>
                            </p>
                        </div>
                    </motion.div>
                    <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />


                </section>

                <MemoizedManifesto />

                <div className="w-full bg-black relative z-20">
                    <div className="w-full pb-20">
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
                                    items={categories.map((c, idx) => c.id ? `cat-${c.id}` : `cat-fallback-${idx}`)}
                                    strategy={verticalListSortingStrategy}
                                    disabled={session?.user?.role !== "admin"}
                                >
                                    <div className="flex flex-col">
                                        {categories.map((category, idx) => {
                                            const catProjects = projectsByCategory[category.name] || []
                                            if ((session as ExtendedSession)?.user?.role !== "admin" && catProjects.length === 0) return null;

                                            const categoryKey = category.id ? `cat-${category.id}` : `cat-fallback-${idx}`
                                            return (
                                                <CategorySection
                                                    key={categoryKey}
                                                    category={category}
                                                    catProjects={catProjects}
                                                    session={session}
                                                    index={idx}
                                                    t={tHome}
                                                />
                                            )
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            categories.map((category) => (
                                <section key={category.id || `static-${category.name}`} id={category.name} className="min-h-[80vh] flex flex-col justify-center py-20 border-t border-neutral-900 first:border-none px-6 md:px-10">
                                    <div className="mb-12 md:mb-16 px-4 md:px-0">
                                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{category.title}<span className="text-red-600">.</span></h2>
                                        <p className="text-white/60 text-lg md:text-xl font-light max-w-xl">{category.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center p-12 text-white/40">{tHome('loading')}</div>
                                </section>
                            ))
                        )}
                    </div>

                    <MemoizedServicesList />

                    <section id="contact" className="py-20 border-t border-neutral-900 bg-black">
                        <div className="max-w-3xl mx-auto px-4 text-center">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                                {tContact('title')}
                                <span className="text-red-600">.</span>
                            </h2>
                            <p className="text-white/60 text-lg mb-12">
                                {tContact('subtitle')}
                            </p>

                            <form className="space-y-6 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">{tContact('name')}</label>
                                        <input type="text" id="name" defaultValue={session?.user?.name || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder={tContact('placeholderName')} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">{tContact('email')}</label>
                                        <input type="email" id="email" defaultValue={session?.user?.email || ''} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors" placeholder={tContact('placeholderEmail')} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-white/80 mb-2 text-sm uppercase tracking-wider">{tContact('message')}</label>
                                    <textarea id="message" rows={4} className="w-full bg-neutral-900/50 border border-white/10 text-white px-4 py-3 rounded-none focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder={tContact('placeholderMessage')}></textarea>
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 font-medium uppercase tracking-widest text-sm transition-all duration-300">{tContact('send')}</button>
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
