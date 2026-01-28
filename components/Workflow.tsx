"use client"

import { motion } from "framer-motion"
import { useState } from "react"

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
    const [activeStep, setActiveStep] = useState<number | null>(null)

    return (
        <section id="process" className="py-32 bg-neutral-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="mb-24 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
                            The Process
                            <span className="text-red-600">.</span>
                        </h2>
                        <p className="text-white/40 max-w-sm uppercase tracking-wider text-xs">
                            De la idea al master final. Sin atajos.
                        </p>
                    </div>

                    <div className="hidden md:block text-white/20 font-mono text-xs">
            // WORFLOW_V0.1
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-white/10">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setActiveStep(index)}
                            onMouseLeave={() => setActiveStep(null)}
                            className={`
                group relative border-l border-white/10 p-8 min-h-[400px] flex flex-col justify-between
                transition-colors duration-500
                ${activeStep === index ? 'bg-white/5' : 'bg-transparent'}
                hover:border-red-600/50
              `}
                        >
                            <div className="relative text-white/20 group-hover:text-red-600 transition-colors duration-500">
                                <span className="text-6xl font-black font-sans opacity-20 group-hover:opacity-100 transition-opacity duration-500">{step.id}</span>
                            </div>

                            <div className="mt-auto relative z-10">
                                <div className="mb-6 text-white/60 group-hover:text-white transition-colors duration-300">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                    {step.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                                    {step.description}
                                </p>
                            </div>

                            {/* Hover Glow */}
                            <div className={`active-glow absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
