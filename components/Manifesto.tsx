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
            className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden"
        >
            <div className="absolute inset-0 bg-black/80 z-0">
                {/* Noise overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
                <motion.div
                    style={{ opacity }}
                    className="flex flex-col gap-12"
                >
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[0.9] tracking-tighter"
                    >
                        NO SOLO <br />
                        <span className="text-red-600 italic">GRABAMOS.</span>
                    </motion.h2>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-start">
                        <motion.div
                            style={{ y }}
                            className="md:w-1/3 pt-10 hidden md:block"
                        >
                            <div className="w-full h-[1px] bg-red-600 mb-4" />
                            <span className="text-red-600 text-xs uppercase tracking-[0.3em] font-bold block">
                                Nuestra Visión
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="md:w-2/3 text-xl md:text-2xl lg:text-3xl text-white/80 font-light leading-relaxed"
                        >
                            En un mundo saturado de ruido, el silencio visual es un pecado.
                            Creamos experiencias que <span className="text-white font-medium border-b border-red-600">incomodan</span>,
                            <span className="text-white font-medium border-b border-red-600 mx-2">emocionan</span> y
                            <span className="text-white font-medium border-b border-red-600">permanecen</span>.
                            Somos el puente entre tu idea abstracta y una realidad visual impactante.
                            <br /><br />
                            No hacemos videos. <br />
                            Construimos legados digitales.
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-20" />
        </section>
    )
}
