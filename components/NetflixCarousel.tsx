"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence, animate } from "framer-motion"
import { Project } from "@/types"
import { Link } from "@/i18n/routing"
import { getYouTubeId, getVimeoId, isDirectVideo as checkIsDirectVideo, isEmbedUrl } from "@/lib/video-utils"
import Image from "next/image"

interface NetflixCarouselProps {
    projects: Project[]
    onHoverChange?: (isHovered: boolean) => void
    hideTitle?: boolean
}

const ARROW_STYLES = [
    { 
        // 0: The Full Rulo (Complete Loop) - Long smooth vertical entry
        d: "M 50 5 C 90 5, 90 40, 55 40 C 35 40, 35 10, 60 10 C 90 10, 50 40, 50 95 M 50 95 L 43 85 M 50 95 L 57 85", 
    },
    { 
        // 1: The Deep Wave - Long smooth vertical entry
        d: "M 40 5 Q 85 20, 55 45 Q 50 55, 50 95 M 50 95 L 43 85 M 50 95 L 57 85", 
    },
    { 
        // 2: The Double Twist - Long smooth vertical entry
        d: "M 55 5 C 30 15, 25 50, 65 55 C 95 60, 50 65, 50 95 M 50 95 L 43 85 M 50 95 L 57 85", 
    },
    { 
        // 3: The S-Curve - Long smooth vertical entry
        d: "M 50 5 C 20 20, 80 40, 50 55 C 20 70, 50 75, 50 95 M 50 95 L 43 85 M 50 95 L 57 85",
    }
];

export default function NetflixCarousel({ projects, onHoverChange, hideTitle }: NetflixCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 10)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }

    useEffect(() => {
        const el = scrollRef.current
        if (el) {
            el.addEventListener('scroll', checkScroll)
            checkScroll()
            window.addEventListener('resize', checkScroll)
        }
        return () => {
            if (el) el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [projects])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const el = scrollRef.current
        
        // Calculate card width + gap based on responsive sizes
        const cardWidth = window.innerWidth < 768 ? 160 : window.innerWidth < 1024 ? 224 : 288
        const gap = window.innerWidth < 768 ? 8 : 16
        
        // Scroll exactly ~2.2 cards for a more logical jump
        const scrollAmount = (cardWidth + gap) * 2.2
        
        const target = direction === 'left' 
            ? el.scrollLeft - scrollAmount 
            : el.scrollLeft + scrollAmount

        // Smooth but fast animation using Framer Motion's animate
        animate(el.scrollLeft, target, {
            duration: 0.5,
            ease: [0.45, 0, 0.55, 1], // Custom cubic-bezier for snappy yet smooth feel
            onUpdate: (latest) => {
                if (el) el.scrollLeft = latest
            }
        })
    }

    const cardRef = useRef<HTMLDivElement>(null)
    const [cardHeight, setCardHeight] = useState(0)

    useEffect(() => {
        const measure = () => {
            if (cardRef.current) {
                setCardHeight(cardRef.current.offsetHeight)
            }
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [projects])

    if (!projects || projects.length === 0) return null;

    const [isCarouselHovered, setIsCarouselHovered] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const hoverTimer = useRef<NodeJS.Timeout | null>(null)

    const handleCarouselMouseEnter = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current)
        setIsCarouselHovered(true)
    }

    const handleCarouselMouseLeave = () => {
        hoverTimer.current = setTimeout(() => {
            setIsCarouselHovered(false)
        }, 300)
    }

    // Check if content overflows (needs scrolling)
    useEffect(() => {
        const checkOverflow = () => {
            if (!scrollRef.current) return
            const { scrollWidth, clientWidth } = scrollRef.current
            setIsOverflowing(scrollWidth > clientWidth + 20)
        }
        checkOverflow()
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [projects])

    return (
        <div 
            className={`w-full relative transition-[z-index] duration-0 pt-0 pb-0 ${isCarouselHovered ? 'z-[100]' : 'z-30'}`}
            onMouseEnter={handleCarouselMouseEnter}
            onMouseLeave={handleCarouselMouseLeave}
        >
            <div className="w-full">
                {!hideTitle && (
                    <h2 className="text-sm md:text-base font-bold text-white/80 pl-6 md:pl-10 mb-2 tracking-wide pointer-events-auto">
                        Un poco de nuestro contenido
                    </h2>
                )}
                
                {/* This wrapper creates a visual boundary for the card row */}
                <div className="relative w-full overflow-visible">
                    {/* Scroll container with padding for hover expansion - NO negative margins to avoid overlap */}
                    <div 
                        ref={scrollRef}
                        className="flex gap-2 md:gap-4 pl-6 md:pl-10 pr-[30vw] overflow-x-auto no-scrollbar pt-12 pb-12 md:pt-16 md:pb-16 pointer-events-auto"
                    >
                        {(() => {
                            const filtered = projects
                                .filter(p => !!p?.videoUrl && p.videoUrl.trim() !== '')
                            
                            return filtered.map((project, idx) => (
                                <NetflixCard 
                                    key={project.id || idx} 
                                    project={project} 
                                    idx={idx}
                                    isFirst={idx === 0}
                                    isLast={idx === filtered.length - 1}
                                    onHoverChange={(h) => {
                                        onHoverChange?.(h)
                                        if (h) handleCarouselMouseEnter()
                                        else handleCarouselMouseLeave()
                                    }}
                                    cardRef={idx === 0 ? cardRef : undefined}
                                />
                            ))
                        })()}
                    </div>

                    {/* Overlay container - positioned over the scroll container's active area */}
                    <div 
                        className="absolute inset-0 pointer-events-none z-[60]"
                    >
                        {/* Inner relative container to center things relative to the cards, not the expansion padding */}
                        <div className="relative w-full h-full">
                            {/* Left gradient fade */}
                            {isOverflowing && showLeftArrow && (
                                <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 lg:w-64 z-[60] pointer-events-none transition-opacity duration-300"
                                    style={{ 
                                        background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
                                        opacity: isCarouselHovered ? 1 : 0.6
                                    }}
                                />
                            )}

                            {/* Right gradient fade - visible when there is more content */}
                            {isOverflowing && showRightArrow && (
                                <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 lg:w-64 z-[60] pointer-events-none transition-opacity duration-300"
                                    style={{ 
                                        background: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
                                        opacity: isCarouselHovered ? 1 : 0.6
                                    }}
                                />
                            )}

                            {/* Left Arrow */}
                            {isOverflowing && showLeftArrow && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        scroll('left')
                                    }}
                                    onMouseEnter={handleCarouselMouseEnter}
                                    onMouseLeave={handleCarouselMouseLeave}
                                    className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[70] transition-all duration-300 flex items-center justify-center text-white cursor-pointer hover:scale-125 ${isCarouselHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                >
                                    <svg className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_15px_rgba(0,0,0,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                            )}
                            
                            {/* Right Arrow */}
                            {isOverflowing && showRightArrow && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        scroll('right')
                                    }}
                                    onMouseEnter={handleCarouselMouseEnter}
                                    onMouseLeave={handleCarouselMouseLeave}
                                    className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[70] transition-all duration-300 flex items-center justify-center text-white cursor-pointer hover:scale-125 ${isCarouselHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                >
                                    <svg className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_15px_rgba(0,0,0,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NetflixCard({ project, isFirst, isLast, idx, onHoverChange, cardRef }: { project: Project; isFirst?: boolean; isLast?: boolean; idx: number; onHoverChange?: (h: boolean) => void; cardRef?: React.RefObject<HTMLDivElement | null> }) {
    const [isHovered, setIsHovered] = useState(false)
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null)
    const playbackTimeout = useRef<NodeJS.Timeout | null>(null)
    const [shouldPlayVideo, setShouldPlayVideo] = useState(false)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(project.imageUrl || null)
    
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const touchTimeout = useRef<NodeJS.Timeout | null>(null)
    const [isLongPress, setIsLongPress] = useState(false)
    
    // Explicitly play video when state changes to true
    useEffect(() => {
        if (shouldPlayVideo && videoRef.current) {
            const playVideo = async () => {
                // Wait for the browser to be ready for and the element to be properly mounted
                await new Promise(r => requestAnimationFrame(r))
                try {
                    if (videoRef.current) {
                        videoRef.current.muted = true
                        await videoRef.current.play()
                    }
                } catch (err) {
                    console.warn("Autoplay was blocked or failed:", err)
                }
            }
            playVideo()
        }
    }, [shouldPlayVideo])
    
    // Derived video flags
    const ytId = getYouTubeId(project.videoUrl || '')
    const vimeoId = getVimeoId(project.videoUrl || '')
    const isDirect = checkIsDirectVideo(project.videoUrl || '')
    const isEmbed = isEmbedUrl(project.videoUrl || '')
    
    useEffect(() => {
        if (!thumbnailUrl && ytId) {
            setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`)
        } else if (!thumbnailUrl && vimeoId) {
            fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(project.videoUrl || '')}`)
                .then(res => res.json())
                .then(data => {
                    if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url)
                }).catch(() => {})
        }
    }, [project.videoUrl, thumbnailUrl, ytId, vimeoId])

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        if (window.innerWidth < 768) return; // Ignore hover on mobile
        
        // Signal immediate hover to parent (to show arrows instantly)
        onHoverChange?.(true)
        
        hoverTimeout.current = setTimeout(() => {
            setIsHovered(true)
            setShouldPlayVideo(true)
            
            // Limit playback to 15 seconds
            if (playbackTimeout.current) clearTimeout(playbackTimeout.current)
            playbackTimeout.current = setTimeout(() => {
                setShouldPlayVideo(false)
            }, 15000)
            
        }, 500) // Delay before expanding like Netflix
    }

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        if (playbackTimeout.current) clearTimeout(playbackTimeout.current)
        setIsHovered(false)
        setShouldPlayVideo(false)
        onHoverChange?.(false)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        // Clear any lingering hover timeout if any
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        // If it's the first touch and we're not hovered, we'll let the onClick handle it
    }

    const handleClick = (e: React.MouseEvent) => {
        if (window.innerWidth < 768) {
            if (!isHovered) {
                // First tap: expand but don't navigate
                e.preventDefault()
                e.stopPropagation()
                setIsHovered(true)
                setShouldPlayVideo(true)
                onHoverChange?.(true)
                
                // CRITICAL: On mobile, we must trigger play() precisely during the click handler
                // to satisfy the user-gesture requirement. Since the component is about to 
                // render the video tag, we can try to play it as soon as it mounts (in useEffect)
                // but we also use a small timeout to try here once the state update is in motion.
            } else {
                // Second tap: it will naturally navigate through the Link component
                // unless we are stopping propagation. We want to let it bubble to Link.
                onHoverChange?.(false)
            }
        }
    }

    // Render fallback image immediately if no thumbnail exists yet, ensuring it takes layout space
    return (
        <div 
            ref={cardRef}
            className="flex-none w-40 md:w-56 lg:w-72 shrink-0 block"
            style={{ 
                position: 'relative', 
                zIndex: isHovered ? 50 : 1, 
                height: 'min-content',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                pointerEvents: 'auto'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            <div 
                className="w-full aspect-[16/9] min-h-[100px] bg-transparent relative rounded-md"
            >
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={project.title || 'Video'}
                        fill
                        className="object-cover rounded-md scale-[1.01]"
                        sizes="(max-width: 768px) 192px, 288px"
                        onError={() => {
                            if (thumbnailUrl.includes('maxresdefault')) {
                                setThumbnailUrl(thumbnailUrl.replace('maxresdefault', 'hqdefault'))
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-2 text-center text-xs">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        {project.title && <span className="line-clamp-2 px-2 text-white/40 font-bold">{project.title}</span>}
                    </div>
                )}
            </div>

            {/* The Expanded Card (Popout) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.35, y: -20 }}
                        exit={{ opacity: 0, scale: 1, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 z-[100] 
                            ${isFirst ? 'origin-left' : isLast ? 'origin-right' : 'origin-center'}`}
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Anarchic Floating Title */}
                        <div className="absolute z-[110] pointer-events-none w-[150%] left-1/2 -translate-x-1/2 -top-[80px] md:-top-[120px]">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
                                className="relative flex flex-col items-center"
                            >
                                <motion.div 
                                    className="relative group w-full flex flex-col items-center"
                                    initial={{ rotate: idx % 2 === 0 ? -4.5 : 4.5 }}
                                    animate={{ 
                                        rotate: [
                                            (idx % 2 === 0 ? -4.5 : 4.5), 
                                            (idx % 2 === 0 ? -4.8 : 4.8), 
                                            (idx % 2 === 0 ? -4.2 : 4.2),
                                            (idx % 2 === 0 ? -4.5 : 4.5)
                                        ],
                                        x: [0, -0.3, 0.3, 0],
                                        y: [0, 0.3, -0.3, 0]
                                    }}
                                    transition={{ 
                                        duration: 0.2, 
                                        repeat: Infinity, 
                                        ease: "linear" 
                                    }}
                                >
                                    <h3 
                                        className="text-white/90 text-[9px] md:text-xs font-medium uppercase tracking-[0.1em] text-center max-w-[250px] md:max-w-[400px] px-6 py-2 leading-snug" 
                                        style={{ 
                                            fontFamily: "var(--font-permanent-marker), cursive",
                                        }}
                                    >
                                        {project.title}
                                    </h3>
                                    {/* Chalk underlining - more wavy and anarchic */}
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-white/50" preserveAspectRatio="none" viewBox="0 0 100 15">
                                        <path d="M 5 5 Q 30 2, 55 7 Q 80 10, 95 3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                        <path d="M 8 10 Q 35 12, 60 7 Q 85 4, 92 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
                                    </svg>
                                </motion.div>

                                {(() => {
                                    const style = ARROW_STYLES[idx % ARROW_STYLES.length];
                                    return (
                                        <svg 
                                            className="absolute top-[40px] md:top-[60px] left-1/2 -translate-x-1/2 w-10 h-10 md:w-16 md:h-16 text-white overflow-visible drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
                                            viewBox="0 0 100 100" fill="none" stroke="currentColor"
                                        >
                                            <motion.path 
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                                                d={style.d} 
                                                strokeWidth="3.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />
                                        </svg>
                                    )
                                })()}
                            </motion.div>
                        </div>

                        {/* Card Content container */}
                        <div className="w-full bg-black rounded-lg overflow-hidden relative">
                            <Link href={`/project/${project.id || '#'}`} className="block">
                            {/* Video / Image wrapper */}
                                <div className="relative aspect-video bg-black overflow-hidden">
                                    {isHovered && (
                                        <div 
                                            className="absolute inset-0 z-20 md:hidden bg-transparent" 
                                            // This overlay captures the 2nd tap on mobile to navigate
                                        />
                                    )}
                                    {ytId && shouldPlayVideo ? (
                                        <div className="w-full h-full overflow-hidden absolute inset-0 bg-black flex items-center justify-center">
                                            <iframe 
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytId}&playsinline=1&enablejsapi=1`}
                                                className="w-full h-full animate-in fade-in duration-500 scale-[1.05] pointer-events-none"
                                                allow="autoplay; encrypted-media; picture-in-picture"
                                                frameBorder="0"
                                            />
                                        </div>
                                    ) : vimeoId && shouldPlayVideo ? (
                                        <div className="w-full h-full overflow-hidden absolute inset-0 bg-black flex items-center justify-center">
                                            <iframe 
                                                src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1`}
                                                className="w-full h-full animate-in fade-in duration-500 scale-[1.05] pointer-events-none"
                                                allow="autoplay; encrypted-media; fullscreen"
                                                frameBorder="0"
                                            />
                                        </div>
                                    ) : isDirect && project.videoUrl && shouldPlayVideo ? (
                                        <video 
                                            ref={videoRef}
                                            src={project.videoUrl} 
                                            autoPlay 
                                            loop 
                                            muted={true}
                                            playsInline 
                                            webkit-playsinline="true"
                                            onCanPlay={(e) => {
                                                (e.target as HTMLVideoElement).play().catch(() => {})
                                            }}
                                            onLoadedData={(e) => {
                                                if (!isMuted) (e.target as HTMLVideoElement).volume = 0.3
                                            }}
                                            className="w-full h-full object-contain bg-black animate-in fade-in duration-500"
                                        />
                                    ) : project.videoUrl && shouldPlayVideo ? (
                                        <div className="w-full h-full overflow-hidden absolute inset-0 bg-black flex items-center justify-center">
                                            <iframe 
                                                src={project.videoUrl.includes('?') 
                                                    ? `${project.videoUrl}&autoplay=1&mute=1&muted=1&background=1&autoPlay=true&muted=true&playsinline=1` 
                                                    : `${project.videoUrl}?autoplay=1&mute=1&muted=1&background=1&autoPlay=true&muted=true&playsinline=1`}
                                                className="w-full h-full animate-in fade-in duration-500 scale-[1.01] pointer-events-none"
                                                allow="autoplay; encrypted-media; fullscreen"
                                                frameBorder="0"
                                            />
                                        </div>
                                    ) : (
                                        <Image
                                            src={thumbnailUrl || '/placeholder-project.jpg'}
                                            alt={project.title || 'Video preview'}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-100 h-[30%] bottom-0 top-auto" />
                                
                                <div className="absolute bottom-2 left-4 right-4 text-white z-10">
                                    <h3 className="font-bold text-[14px] leading-tight line-clamp-2 drop-shadow-md">{project.title}</h3>
                                </div>
                            </div>
                            
                            {/* Card Content Footer */}
                            <div className="px-4 pt-3 pb-5 grid gap-3 text-white">
                                <div className="flex items-center gap-2">
                                    <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition shadow-md" aria-label="Reproducir">
                                        <svg className="w-3 h-3 md:w-4 md:h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setIsMuted(!isMuted)
                                        }}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition bg-neutral-900/50" 
                                        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                                    >
                                        {isMuted ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        )}
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setIsHovered(false)
                                            setShouldPlayVideo(false)
                                            onHoverChange?.(false)
                                        }}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition ml-auto bg-neutral-900/50" 
                                        aria-label="Cerrar"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-medium tracking-wide">
                                    <span className="px-1 border border-white/40 text-white/80">16+</span>
                                    <span className="text-white/80">{project.category}</span>
                                    <span className="px-1 border border-white/40 text-white/80 rounded uppercase">HD</span>
                                </div>
                            </div>
                        </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
