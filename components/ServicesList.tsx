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

export default function ServicesList() {

    return (
        <section id="services" className="py-20 md:py-32 bg-black relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 border-b border-white/10 pb-8 flex items-end justify-between px-4 md:px-0">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                        Servicios
                        <span className="text-red-600">.</span>
                    </h2>
                    <span className="text-white/30 text-xs uppercase tracking-widest hidden md:block">Capabilities</span>
                </div>

                <div className="flex flex-col">
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            onMouseEnter={() => { }}
                            onMouseLeave={() => { }}
                            className="group relative border-b border-white/20 py-12 cursor-pointer transition-colors hover:bg-neutral-900/50"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 px-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-red-600 font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">0{service.id}</span>
                                    <h3 className="text-3xl md:text-5xl font-sans font-medium text-white group-hover:text-red-500 transition-colors duration-300">
                                        {service.title}
                                    </h3>
                                </div>
                                <p className="text-white/60 max-w-md text-sm md:text-base font-light group-hover:text-white transition-colors duration-300">
                                    {service.description}
                                </p>
                                <div className="md:hidden w-full h-[1px] bg-red-600/30 mt-4" />
                            </div>

                            {/* Optional: Add a subtle background image/video reveal here if desired in the future */}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
