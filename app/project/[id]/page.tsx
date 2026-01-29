import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import CatsoVideoPlayer from "@/components/CatsoVideoPlayer"

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    const project = await prisma.project.findUnique({
        where: { id },
    })

    if (!project) {
        notFound()
    }

    // Parse images JSON safely
    let galleryImages: string[] = []
    try {
        if ((project as any).images) {
            galleryImages = JSON.parse((project as any).images)
        }
    } catch (e) {
        console.error("Error parsing project images:", e)
    }

    const videoUrl = project.videoUrl || project.imageUrl || ""
    // Check if it's a Behance fallback link
    const isBehanceFallback = project.videoUrl?.includes("behance.net/gallery")

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto inline-block">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 group"
                    >
                        <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
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

            <div className="max-w-[1800px] mx-auto pt-32 pb-32 px-4 md:px-8">

                {/* 1. HERO HEADER (Always at the top) */}
                <header className="max-w-5xl mx-auto mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-6">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold">{project.category}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                        {project.title}
                    </h1>
                    {project.clientName && (
                        <p className="text-white/40 font-medium tracking-[0.4em] uppercase text-xs mb-8">
                            Client: <span className="text-white">{project.clientName}</span>
                        </p>
                    )}
                    <div className="w-16 h-1 bg-blue-600 mx-auto opacity-50" />
                </header>

                {/* 2. MAIN CONTENT (Video OR Gallery) */}
                <div className="space-y-24">

                    {!isBehanceFallback ? (
                        <>
                            {/* Native Video Layout */}
                            <section className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/5 relative group">
                                <CatsoVideoPlayer
                                    src={videoUrl}
                                    title={project.title}
                                />
                            </section>

                            <section className="max-w-4xl mx-auto text-center">
                                <div className="prose prose-invert prose-lg mx-auto text-white/60 leading-relaxed font-medium">
                                    <p>{project.description || "No description available."}</p>
                                </div>
                            </section>

                            {galleryImages.length > 0 && (
                                <section className="space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/10" />
                                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Gallery</h2>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {galleryImages.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                                                <Image
                                                    src={img}
                                                    alt={`${project.title} ${idx}`}
                                                    fill
                                                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    loading={idx < 3 ? "eager" : "lazy"}
                                                    priority={idx < 3}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Behance Fallback Layout (Photos are Main Content) */}
                            <section className="space-y-8">
                                {galleryImages.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {galleryImages.map((img, idx) => (
                                            <div key={idx} className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                                                <Image
                                                    src={img}
                                                    alt={`${project.title} ${idx}`}
                                                    width={1200}
                                                    height={800}
                                                    className="w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-700"
                                                    loading={idx < 3 ? "eager" : "lazy"}
                                                    priority={idx < 3}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video bg-neutral-900 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                                        <Image src={project.imageUrl || ''} alt={project.title} fill className="object-contain opacity-50" />
                                    </div>
                                )}
                            </section>

                            <section className="max-w-4xl mx-auto space-y-16 text-center">
                                <div className="prose prose-invert prose-lg mx-auto text-white/60 leading-relaxed font-medium">
                                    <p>{project.description || "No description available."}</p>
                                </div>

                                {/* Behance Link Box */}
                                <div className="p-1 w-full bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl">
                                    <div className="flex flex-col items-center gap-6 p-12 bg-[#0d0d0d] rounded-[calc(1.5rem-1px)] border border-white/5 backdrop-blur-xl">
                                        <div className="bg-blue-600/20 p-5 rounded-full">
                                            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Full Project on Behance</h3>
                                            <p className="text-white/40 text-sm max-w-sm mx-auto">This project features interactive elements and high-fidelity video hosted exclusively on Behance.</p>
                                        </div>
                                        <a
                                            href={project.videoUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/btn relative inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-full font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/40 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                            <span className="tracking-widest uppercase text-sm">LAUNCH BEHANCE</span>
                                            <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}
