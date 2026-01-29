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
                {/* Optimized Noise overlay - Static Image instead of heavy SVG Filter */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                        backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '100px 100px'
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
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
                            <div className="w-full h-[2px] bg-red-600 mb-4 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                            <span className="text-red-500 text-xs uppercase tracking-[0.3em] font-bold block">
                                Nuestra Visión
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="md:w-2/3 text-xl md:text-2xl lg:text-3xl text-white font-light leading-relaxed"
                        >
                            En un mundo saturado de ruido, el silencio visual es un pecado.
                            Creamos experiencias que <span className="text-white font-medium border-b border-red-600">incomodan</span>,
                            <span className="text-white font-medium border-b border-red-600 mx-2">emocionan</span> y{' '}
                            <span className="text-white font-medium border-b border-red-600">permanecen</span>.
                            Somos el puente entre tu idea abstracta y una realidad visual impactante.
                            <br /><br />
                            No hacemos videos. <br />
                            <span className="text-red-500 font-bold">Construimos legados digitales.</span>
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-20" />
        </section>
    )
}
