"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function Manifesto() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [100, -100])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section
            ref={containerRef}
            id="manifesto"
            className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-black text-white"
        >
            {/* CRT & Grain Textures */}
            <div className="crt-grain" />
            <div className="crt-overlay" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    style={{ opacity }}
                    className="flex flex-col gap-16"
                >
                    {/* Header with Glitch & Ghosting */}
                    <div className="relative">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-6xl lg:text-7xl font-bold leading-[0.85] tracking-tighter uppercase mb-2 relative"
                        >
                            <span className="block glitch-text-anim" data-text="BIENVENIDOS A" style={{ position: 'relative' }}>
                                <span className="glitch-text" data-text="BIENVENIDOS A">BIENVENIDOS A</span>
                            </span>
                            <span className="block text-red-600 italic -mt-2 glitch-text-anim" style={{ animationDelay: '0.2s', position: 'relative' }}>
                                <span className="glitch-text" data-text="NUESTRO MUNDO…">NUESTRO MUNDO…</span>
                            </span>
                        </motion.h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {/* Sidebar */}
                        <motion.div
                            style={{ y }}
                            className="md:w-1/4 pt-4 hidden md:block"
                        >
                            <div className="w-full h-[3px] bg-red-600 mb-6" />
                            <span className="text-red-600 text-sm uppercase tracking-[0.4em] font-black block">
                                ERROR_SYSTEM_VISION
                            </span>
                        </motion.div>

                        {/* Vision Content */}
                        <div className="md:w-3/4 flex flex-col gap-8 text-lg md:text-2xl lg:text-3xl font-medium leading-[1.1] font-sans">
                            <div className="flex flex-wrap gap-x-4 gap-y-4 items-baseline">
                                <span className="text-white/40 font-light">De historias</span>
                                <span className="brush-underline text-white italic">delirantes,</span>
                                <span>lo</span>
                                <span className="brush-underline text-white">rarocentrista</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-4 items-center">
                                <span>como</span>
                                <motion.span
                                    className="static-box px-4 py-1 text-black bg-white uppercase font-black"
                                    animate={{ opacity: [1, 0.8, 1, 0.9, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.1 }}
                                >
                                    MOTOR
                                </motion.span>
                                <span>y la</span>
                            </div>

                            <div className="block">
                                <span className="brush-underline text-white">creación lúdica y absurda.</span>
                            </div>

                            {/* Tilted Final Line */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
                                className="mt-12 md:mt-20 self-end"
                            >
                                <span className="text-red-600 font-black text-2xl md:text-5xl lg:text-6xl tracking-tight block transform -skew-x-12 filter blur-[0.5px]">
                                    A la deriva creativa.
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CRT Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60 z-40" />
        </section>
    )
}
