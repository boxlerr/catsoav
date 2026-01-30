"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const steps = [
    {
        id: "01",
        title: "Concepto & Guion",
        description: "Donde nace todo. Definimos la narrativa, el tono y la estética visual que guiará el proyecto.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        )
    },
    {
        id: "02",
        title: "Producción",
        description: "Luces, cámara, caos controlado. Desplegamos equipos de cine y talento humano para capturar la magia.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        id: "03",
        title: "Post-Producción",
        description: "El laboratorio. Edición, color grading, VFX y diseño sonoro para pulir cada frame.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        id: "04",
        title: "Entrega Final",
        description: "Formatos optimizados para cada plataforma. Listos para impactar a tu audiencia.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        )
    }
]

export default function Workflow() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <section id="process" className="py-32 bg-neutral-950 relative overflow-hidden">
            {/* Subtle ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(153,27,27,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
                            The Process
                            <span className="text-red-600">.</span>
                        </h2>
                        <p className="text-white/40 max-w-sm uppercase tracking-wider text-xs">
                            De la idea al master final. Sin atajos.
                        </p>
                    </motion.div>

                    <div className="hidden md:block text-white/20 font-mono text-[10px] tracking-[0.3em] uppercase">
                        {"// WORKFLOW_v9.0_STOCKED"}
                    </div>
                </div>

                <div className="relative grid grid-cols-2 md:flex md:flex-row items-center md:justify-center gap-0 h-auto min-h-[550px] md:h-[650px] px-4 md:px-0">
                    {isMounted && steps.map((step, index) => {
                        const isHovered = hoveredCard === index;

                        return (
                            <motion.div
                                key={step.id}
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => setHoveredCard(hoveredCard === index ? null : index)}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                layout
                                style={{
                                    zIndex: isHovered ? 50 : 10 + index,
                                }}
                                className={`relative flex-shrink-0 w-full md:w-[320px] aspect-[4/5] md:h-[550px] bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center text-center cursor-default transition-all duration-700 
                                    ${index % 2 !== 0 ? 'ml-[-30px]' : 'ml-0'} 
                                    ${index >= 2 ? 'mt-[-80px]' : 'mt-0'} 
                                    md:ml-[-100px] md:mt-0 md:first:ml-0 
                                    ${isHovered ? 'border-red-600/40 ring-1 ring-red-600/20' : 'hover:border-white/10'} shadow-2xl`}
                                animate={{
                                    scale: isHovered ? 1.05 : 1,
                                    y: isHovered ? -20 : 0,
                                    boxShadow: isHovered ? "0 25px 50px -12px rgba(220, 38, 38, 0.2)" : "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Glowing Red Content */}
                                <div className="mb-4 md:mb-6 font-sans">
                                    <motion.span
                                        animate={isHovered ? {
                                            opacity: [0.4, 1, 0.4],
                                            scale: [1, 1.02, 1],
                                        } : {}}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className={`text-6xl md:text-8xl font-bold transition-all duration-700 ${isHovered ? 'text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.6)]' : 'text-red-800/20'}`}
                                    >
                                        {step.id}
                                    </motion.span>
                                </div>

                                <div
                                    className={`mb-6 md:mb-10 transition-all duration-700 ${isHovered ? 'text-red-600 scale-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-red-900/40'}`}
                                >
                                    {step.icon}
                                </div>

                                <h3 className={`text-lg md:text-3xl font-serif font-bold mb-3 md:mb-6 leading-tight transition-colors duration-500 ${isHovered ? 'text-white' : 'text-white/60'}`}>
                                    {step.title}
                                </h3>

                                <p className={`text-[10px] md:text-sm leading-relaxed max-w-[240px] font-sans font-light transition-colors duration-500 ${isHovered ? 'text-white/70' : 'text-white/30'}`}>
                                    {step.description}
                                </p>

                                {/* Bottom Glow Accent */}
                                {isHovered && (
                                    <motion.div
                                        layoutId="bottomGlow"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "60%" }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-0.5 bg-red-600 rounded-full blur-[1px]"
                                    />
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
