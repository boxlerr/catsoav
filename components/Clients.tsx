"use client"

import { motion } from "framer-motion"

export default function Clients() {
    return (
        <section id="clients" className="py-24 bg-black border-y border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <h3 className="text-white/30 text-sm font-mono uppercase tracking-[0.2em]">
                        Selected Clients
                    </h3>
                    <div className="h-[1px] bg-white/10 flex-1 mx-8 hidden md:block" />
                    <p className="text-white/30 text-xs italic">
                        Trust the process.
                    </p>
                </div>

                {/* Logo Grid - Placeholder SVGs */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex items-center justify-center p-4"
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            initial={{ opacity: 0.3 }}
                            whileInView={{ opacity: 0.5 }}
                        >
                            {/* Placeholder Logo Circle */}
                            <div className="w-full max-w-[120px] aspect-[3/1] bg-white/10 rounded-sm animate-pulse" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
