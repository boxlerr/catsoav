'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedGalleryProps {
    images: string[]
    title: string
    layout?: 'masonry' | 'grid' | 'showcase'
    columns?: number
}

export default function EnhancedGallery({
    images,
    title,
    layout = 'grid',
    columns = 3
}: EnhancedGalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        },
    }

    const gridClasses = {
        grid: `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-4 md:gap-6`,
        masonry: 'columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6',
        showcase: images.length === 1
            ? 'max-w-6xl mx-auto'
            : 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto',
    }

    return (
        <>
            <motion.div
                className={gridClasses[layout]}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {images.map((img, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className={`group relative cursor-pointer overflow-hidden rounded-xl ${layout === 'masonry' ? 'break-inside-avoid mb-4 md:mb-6' : ''
                            } ${layout === 'showcase' && images.length === 1
                                ? 'aspect-video'
                                : layout === 'showcase'
                                    ? 'aspect-[4/5]'
                                    : 'aspect-video'
                            }`}
                        onClick={() => setLightboxIndex(idx)}
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10" />

                        {/* Border glow */}
                        <div className="absolute inset-0 rounded-xl border border-white/5 group-hover:border-[var(--theme-primary)]/30 transition-colors duration-500 z-10" />

                        {/* Image */}
                        <div className="relative w-full h-full bg-white/5">
                            <Image
                                src={img}
                                alt={`${title} - Image ${idx + 1}`}
                                fill
                                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                loading={idx < 4 ? 'eager' : 'lazy'}
                                priority={idx < 4}
                                sizes={
                                    layout === 'showcase' && images.length === 1
                                        ? '100vw'
                                        : layout === 'masonry' || columns === 3
                                            ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            : '(max-width: 768px) 100vw, 50vw'
                                }
                            />
                        </div>

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 z-20 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors disabled:opacity-30"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLightboxIndex(Math.max(0, lightboxIndex - 1))
                                    }}
                                    disabled={lightboxIndex === 0}
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors disabled:opacity-30"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1))
                                    }}
                                    disabled={lightboxIndex === images.length - 1}
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <span className="text-white text-sm font-medium">
                                {lightboxIndex + 1} / {images.length}
                            </span>
                        </div>

                        {/* Current image */}
                        <motion.div
                            key={lightboxIndex}
                            className="relative max-w-7xl max-h-[90vh] w-full h-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={images[lightboxIndex]}
                                alt={`${title} - Image ${lightboxIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                                sizes="100vw"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
