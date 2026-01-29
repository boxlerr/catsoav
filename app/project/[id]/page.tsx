import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import CatsoVideoPlayer from "@/components/CatsoVideoPlayer"
import EnhancedGallery from "@/components/EnhancedGallery"
import { getProjectTheme, generateThemeCSS } from "@/lib/project-themes"

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    console.log(`[ProjectPage] Requesting ID: ${id}`)

    const project = await prisma.project.findUnique({
        where: { id },
    })

    const relatedProjects = await prisma.project.findMany({
        where: {
            id: { not: id },
            published: true
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
    })

    if (!project) {
        console.error(`[ProjectPage] 404 - Project not found: ${id}`)
        // Check if maybe it's a valid ID but just missing
        const allProjects = await prisma.project.findMany({ select: { id: true } })
        console.log(`[ProjectPage] Available IDs: ${allProjects.map(p => p.id).join(', ')}`)
        notFound()
    }

    // Hide default sync message
    if (project.description === "Sincronizado desde Behance") {
        // @ts-ignore
        project.description = ""
    }

    // Parse images and extra videos
    let galleryImages: string[] = []
    let extraVideos: string[] = []
    try {
        if ((project as any).images) {
            galleryImages = JSON.parse((project as any).images)
        }
        if ((project as any).extraVideos) {
            extraVideos = JSON.parse((project as any).extraVideos)
        }
    } catch (e) {
        console.error("Error parsing project media:", e)
    }

    // Get dynamic theme for this project
    const theme = getProjectTheme({
        id: project.id,
        title: project.title,
        category: project.category,
        videoUrl: project.videoUrl,
        images: (project as any).images,
    })

    const themeCSS = generateThemeCSS(theme)

    const videoUrl = project.videoUrl || project.imageUrl || ""
    const isBehanceFallback = project.videoUrl?.includes("behance.net/gallery")
    const hasNativeVideo = !isBehanceFallback && videoUrl

    return (
        <main
            className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[var(--theme-primary)]/30 overflow-x-hidden"
            style={{
                // @ts-ignore
                [themeCSS.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split(':').map(s => s.trim())
                    if (key && value) acc[key] = value.replace(';', '')
                    return acc
                }, {} as Record<string, string>)]: undefined,
                ...themeCSS.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split(':').map(s => s.trim())
                    if (key && value) acc[key] = value.replace(';', '')
                    return acc
                }, {} as Record<string, string>)
            }}
        >
            {/* Animated gradient background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'var(--theme-gradient-glow)' }}
                />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="pointer-events-auto inline-block">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 group"
                    >
                        <div
                            className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-[var(--theme-primary)] transition-all backdrop-blur-sm"
                            style={{
                                // @ts-ignore
                                '--tw-shadow-color': 'var(--theme-primary)',
                                boxShadow: '0 0 0 0 var(--tw-shadow-color)',
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        <span className="uppercase tracking-[0.2em] text-[10px] font-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            Back
                        </span>
                    </Link>
                </div>
            </nav>

            <div className="relative max-w-[1800px] mx-auto pt-32 pb-32 px-4 md:px-8">

                {/* HERO HEADER */}
                <header className="max-w-5xl mx-auto mb-16 text-center">
                    <div
                        className="inline-block px-4 py-1.5 bg-white/5 rounded-full border mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500"
                        style={{ borderColor: 'var(--theme-primary)20' }}
                    >
                        <span
                            className="text-[10px] uppercase tracking-[0.3em] font-bold"
                            style={{ color: 'var(--theme-primary)' }}
                        >
                            {project.category}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter uppercase leading-[0.9] animate-in fade-in slide-in-from-top-4 duration-700">
                        <span
                            className="drop-shadow-md"
                            style={{ color: '#FF1F1F', textShadow: '0 0 30px rgba(255, 31, 31, 0.4)' }}
                        >
                            {project.title}
                        </span>
                    </h1>

                    {project.clientName && (
                        <p className="text-white/40 font-medium tracking-[0.4em] uppercase text-xs mb-8 animate-in fade-in duration-1000">
                            Client: <span className="text-white">{project.clientName}</span>
                        </p>
                    )}

                    <div
                        className="w-16 h-1 mx-auto opacity-50 animate-in fade-in slide-in-from-bottom-2 duration-1000"
                        style={{ background: 'var(--theme-gradient-hero)' }}
                    />
                </header>

                {/* MAIN CONTENT */}
                <div className="space-y-24">

                    {/* VIDEO HERO LAYOUT */}
                    {theme.layout.type === 'video-hero' && hasNativeVideo && (
                        <>
                            <section className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group animate-in fade-in zoom-in-95 duration-700">
                                {/* Glow effect */}
                                <div
                                    className="absolute -inset-1 rounded-2xl opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-500"
                                    style={{ background: 'var(--theme-gradient-hero)' }}
                                />

                                <div className="relative w-full h-full">
                                    <CatsoVideoPlayer
                                        src={videoUrl}
                                        title={project.title}
                                    />
                                </div>
                            </section>

                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Extra Videos */}
                            {extraVideos.map((vid, idx) => (
                                <section key={idx} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={vid}
                                            title={`${project.title} - Video ${idx + 2}`}
                                        />
                                    </div>
                                </section>
                            ))}


                            {galleryImages.length > 0 && (
                                <section className="space-y-12 animate-in fade-in duration-1000">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/10" />
                                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Gallery</h2>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <EnhancedGallery
                                        images={galleryImages}
                                        title={project.title}
                                        layout="grid"
                                        columns={3}
                                    />
                                </section>
                            )}
                        </>
                    )}

                    {/* GALLERY MASONRY LAYOUT */}
                    {theme.layout.type === 'gallery-masonry' && !isBehanceFallback && galleryImages.length > 0 && (
                        <>
                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>

                            )}

                            {/* Extra Videos */}
                            {extraVideos.map((vid, idx) => (
                                <section key={idx} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={vid}
                                            title={`${project.title} - Video ${idx + 2}`}
                                        />
                                    </div>
                                </section>
                            ))}

                            <section className="animate-in fade-in zoom-in-95 duration-1000">
                                <EnhancedGallery
                                    images={galleryImages}
                                    title={project.title}
                                    layout="masonry"
                                    columns={3}
                                />
                            </section>
                        </>
                    )}

                    {/* GALLERY GRID LAYOUT */}
                    {theme.layout.type === 'gallery-grid' && !isBehanceFallback && galleryImages.length > 0 && (
                        <>
                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Extra Videos */}
                            {extraVideos.map((vid, idx) => (
                                <section key={idx} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={vid}
                                            title={`${project.title} - Video ${idx + 2}`}
                                        />
                                    </div>
                                </section>
                            ))}

                            <section className="animate-in fade-in zoom-in-95 duration-1000">
                                <EnhancedGallery
                                    images={galleryImages}
                                    title={project.title}
                                    layout="grid"
                                    columns={3}
                                />
                            </section>
                        </>
                    )}

                    {/* PHOTO SHOWCASE LAYOUT */}
                    {theme.layout.type === 'photo-showcase' && !isBehanceFallback && galleryImages.length > 0 && (
                        <>
                            <section className="animate-in fade-in zoom-in-95 duration-1000">
                                <EnhancedGallery
                                    images={galleryImages}
                                    title={project.title}
                                    layout="showcase"
                                    columns={theme.layout.galleryColumns}
                                />
                            </section>

                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Extra Videos */}
                            {extraVideos.map((vid, idx) => (
                                <section key={idx} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={vid}
                                            title={`${project.title} - Video ${idx + 2}`}
                                        />
                                    </div>
                                </section>
                            ))}
                        </>
                    )}

                    {/* MIXED CONTENT LAYOUT */}
                    {theme.layout.type === 'mixed-content' && !isBehanceFallback && (
                        <>
                            {hasNativeVideo && (
                                <section className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group animate-in fade-in zoom-in-95 duration-700">
                                    <div
                                        className="absolute -inset-1 rounded-2xl opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-500"
                                        style={{ background: 'var(--theme-gradient-hero)' }}
                                    />
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={videoUrl}
                                            title={project.title}
                                        />
                                    </div>
                                </section>
                            )}

                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Extra Videos */}
                            {extraVideos.map((vid, idx) => (
                                <section key={idx} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                                    <div className="relative w-full h-full">
                                        <CatsoVideoPlayer
                                            src={vid}
                                            title={`${project.title} - Video ${idx + 2}`}
                                        />
                                    </div>
                                </section>
                            ))}

                            {galleryImages.length > 0 && (
                                <section className="space-y-12 animate-in fade-in duration-1000">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/10" />
                                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Gallery</h2>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <EnhancedGallery
                                        images={galleryImages}
                                        title={project.title}
                                        layout="grid"
                                        columns={3}
                                    />
                                </section>
                            )}
                        </>
                    )}

                    {/* BEHANCE FALLBACK */}
                    {isBehanceFallback && (
                        <>
                            {galleryImages.length > 0 ? (
                                <section className="animate-in fade-in zoom-in-95 duration-1000">
                                    <EnhancedGallery
                                        images={galleryImages}
                                        title={project.title}
                                        layout={galleryImages.length > 15 ? "masonry" : "grid"}
                                        columns={3}
                                    />
                                </section>
                            ) : (
                                <div className="w-full aspect-video bg-neutral-900 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    {project.imageUrl && (
                                        <Image src={project.imageUrl} alt={project.title} fill className="object-contain opacity-50" />
                                    )}
                                </div>
                            )}

                            {project.description && (
                                <section className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
                                    <div className="prose prose-invert prose-lg mx-auto text-white/70 leading-relaxed font-medium">
                                        <p>{project.description}</p>
                                    </div>
                                </section>
                            )}

                        </>
                    )}

                    {/* Behance Link CTA - Global */}
                    <section className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div
                            className="p-1 w-full rounded-3xl"
                            style={{ background: 'var(--theme-gradient-card)' }}
                        >
                            <div className="flex flex-col items-center gap-6 p-12 bg-[#0d0d0d] rounded-[calc(1.5rem-1px)] border border-white/5 backdrop-blur-xl">
                                <div
                                    className="p-5 rounded-full"
                                    style={{ backgroundColor: 'var(--theme-primary)20' }}
                                >
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--theme-primary)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">View on Behance</h3>
                                    <p className="text-white/40 text-sm max-w-sm mx-auto">This project features high-fidelity content hosted on Behance.</p>
                                </div>
                                <a
                                    href={project.videoUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl overflow-hidden"
                                    style={{
                                        backgroundColor: 'var(--theme-primary)',
                                        boxShadow: `0 20px 60px -15px var(--theme-primary)60`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    <span className="tracking-widest uppercase text-sm text-white">LAUNCH BEHANCE</span>
                                    <svg className="w-5 h-5 text-white group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Related Projects Section */}
                    {relatedProjects.length > 0 && (
                        <section className="pt-20 mt-20 border-t border-white/5">
                            <h2 className="text-2xl md:text-3xl font-black uppercase mb-12 text-center tracking-tighter text-white">
                                More <span style={{ color: '#FF1F1F' }}>Productions</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedProjects.map((p) => (
                                    <Link key={p.id} href={`/project/${p.id}`} className="group block">
                                        <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-[#FF1F1F]/50 transition-colors duration-500 mb-6">
                                            {p.imageUrl ? (
                                                <Image
                                                    src={p.imageUrl}
                                                    alt={p.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <span className="text-xs uppercase tracking-widest">No Preview</span>
                                                </div>
                                            )}
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="p-3 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-[#FF1F1F] transition-colors duration-300">
                                                {p.title}
                                            </h3>
                                            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">
                                                {p.category || 'Production'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </main >
    )
}
