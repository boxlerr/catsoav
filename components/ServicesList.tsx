"use client"

import { motion } from "framer-motion"
import { useState } from "react"

const services = [
    {
        id: 1,
        title: "Commercial",
        description: "Publicidad de alto impacto para TV y Medios Digitales.",
        video: "/demo-commercial.mp4"
    },
    {
        id: 2,
        title: "Music Videos",
        description: "Narrativa visual para artistas. Estética cinematográfica.",
        video: "/demo-music.mp4"
    },
    {
        id: 3,
        title: "Brand Content",
        description: "Contenido estratégico para potenciar tu identidad de marca.",
        video: "/demo-brand.mp4"
    },
    {
        id: 4,
        title: "Documentary",
        description: "Historias reales, contadas con profundidad y respeto.",
        video: "/demo-doc.mp4"
    },
    {
        id: 5,
        title: "Photography",
        description: "Campaña fija, editorial y producto.",
        video: "/demo-photo.mp4"
    }
]

const processSteps = [
    {
        id: "01",
        title: "Concepto & Guion",
        description: "Donde nace todo. Definimos la narrativa, el tono y la estética visual que guiará el proyecto.",
        icon: (
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        )
    },
    {
        id: "02",
        title: "Pre-Producción",
        description: "Planificación detallada. Casting, locaciones, equipo técnico y logística integral.",
        icon: (
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        )
    },
    {
        id: "03",
        title: "Rodaje",
        description: "Acción. Capturamos las imágenes con tecnología de cine digital y un equipo experto.",
        icon: (
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        id: "04",
        title: "Post-Producción",
        description: "Edición, color grading, VFX y diseño sonoro para el acabado final perfecto.",
        icon: (
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
        )
    }
]

export default function ServicesList() {
    const [activeService, setActiveService] = useState<number | null>(null)

    const toggleService = (id: number) => {
        setActiveService(activeService === id ? null : id)
    }

    return (
        <section id="services" className="py-20 md:py-32 bg-black relative z-10" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-6" suppressHydrationWarning>
                <div className="mb-16 border-b border-white/10 pb-8 flex items-end justify-between px-4 md:px-0" suppressHydrationWarning>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                        Servicios
                        <span className="text-red-600">.</span>
                    </h2>
                    <span className="text-white/30 text-xs uppercase tracking-widest hidden md:block">Capabilities</span>
                </div>

                <div className="flex flex-col" suppressHydrationWarning>
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            onViewportLeave={() => activeService === service.id && setActiveService(null)}
                            onClick={() => toggleService(service.id)}
                            className={`group relative border-b border-white/20 cursor-pointer transition-all duration-500 ${activeService === service.id ? 'bg-neutral-900/40' : 'hover:bg-neutral-900/50'}`}
                            suppressHydrationWarning
                        >
                            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 px-4 transition-all duration-500 ${activeService === service.id ? 'py-8' : 'py-12'}`} suppressHydrationWarning>
                                <div className="flex items-center gap-4" suppressHydrationWarning>
                                    <span className={`font-mono text-sm transition-opacity duration-300 ${activeService === service.id ? 'text-red-600 opacity-100' : 'text-red-600 opacity-0 group-hover:opacity-100'}`}>0{service.id}</span>
                                    <h3 className={`text-3xl md:text-5xl font-sans font-medium transition-colors duration-300 ${activeService === service.id ? 'text-white' : 'text-white group-hover:text-red-500'}`}>
                                        {service.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4 md:gap-8" suppressHydrationWarning>
                                    <p className={`text-white/60 max-w-md text-sm md:text-base font-light transition-colors duration-300 ${activeService === service.id ? 'text-white' : 'group-hover:text-white'}`}>
                                        {service.description}
                                    </p>
                                    <div className="hidden md:block text-white/40" suppressHydrationWarning>
                                        <motion.div
                                            animate={{ rotate: activeService === service.id ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            suppressHydrationWarning
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="md:hidden w-full h-[1px] bg-red-600/30 mt-4" suppressHydrationWarning />
                            </div>

                            {/* Expanded Content */}
                            <motion.div
                                initial={false}
                                animate={{
                                    height: activeService === service.id ? "auto" : 0,
                                    opacity: activeService === service.id ? 1 : 0
                                }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="overflow-hidden"
                                suppressHydrationWarning
                            >
                                <div className="px-4 md:px-12 pb-12 pt-4" suppressHydrationWarning>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8" suppressHydrationWarning>
                                        {processSteps.map((step, index) => (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: activeService === service.id ? 1 : 0,
                                                    y: activeService === service.id ? 0 : 10
                                                }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="flex flex-col gap-4"
                                                suppressHydrationWarning
                                            >
                                                <div className="text-red-600 opacity-80" suppressHydrationWarning>
                                                    {step.icon}
                                                </div>
                                                <div suppressHydrationWarning>
                                                    <h4 className="text-white font-bold mb-2 text-sm">{step.title}</h4>
                                                    <p className="text-white/40 text-xs leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-end" suppressHydrationWarning>
                                        <span className="text-xs uppercase tracking-widest text-red-600 font-bold cursor-pointer hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toggleService(service.id) }}>
                                            Cerrar
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
