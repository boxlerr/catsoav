"use client"

import { motion } from "framer-motion"

// Placeholder data - Replacing with real info later
const crewEffectivo = [
    {
        name: "Juan Pérez",
        role: "Director / Founder",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        bio: "Visionario visual. Obsesionado con el grano de 16mm."
    },
    {
        name: "Ana García",
        role: "Executive Producer",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        bio: "La fuerza que mueve montañas (y presupuestos)."
    },
    {
        name: "Carlos Ruiz",
        role: "Director of Photography",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        bio: "Pintor de luz. Cazador de sombras."
    },
    {
        name: "Laura M.",
        role: "Head of Post",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop",
        bio: "Donde la magia realmente sucede."
    }
]

export default function Crew() {
    return (
        <section id="crew" className="py-32 bg-neutral-950 border-t border-neutral-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                        The Crew
                        <span className="text-red-600">.</span>
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-lg font-light">
                        Talento humano detrás de cada frame.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {crewEffectivo.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative"
                        >
                            <div className="aspect-[3/4] overflow-hidden mb-6 bg-neutral-900 relative">
                                {/* Grayscale Filter Layer */}
                                <div className="absolute inset-0 bg-neutral-900 z-10 mix-blend-color group-hover:opacity-0 transition-opacity duration-700 pointer-events-none" />

                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
                                {/* Red Overlay on Hover */}
                                <div className="absolute inset-0 bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                            </div>

                            <div className="text-center md:text-left">
                                <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-red-500 transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-3">
                                    {member.role}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
