"use client"

import Image from "next/image"
import SocialLinks from "./SocialLinks"

export default function Footer() {
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        if (id === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }
        const element = document.getElementById(id)
        if (!element) return
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
        const startPosition = window.pageYOffset
        const distance = Math.abs(targetPosition - startPosition)
        const minDuration = 500
        const maxDuration = 1200
        const duration = Math.min(maxDuration, minDuration + (distance / 3))
        let start: number | null = null
        const animation = (currentTime: number) => {
            if (start === null) start = currentTime
            const timeElapsed = currentTime - start
            const progress = Math.min(timeElapsed / duration, 1)
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
            window.scrollTo(0, startPosition + (targetPosition - startPosition) * ease)
            if (timeElapsed < duration) {
                requestAnimationFrame(animation)
            }
        }
        requestAnimationFrame(animation)
    }

    return (
        <footer className="py-20 border-t border-neutral-900 bg-black" suppressHydrationWarning>
            <div className="w-full max-w-7xl mx-auto px-6 md:px-10" suppressHydrationWarning>
                <div className="flex flex-col items-center text-center gap-12 mb-16" suppressHydrationWarning>

                    {/* Brand Section */}
                    <div className="flex flex-col items-center max-w-lg" suppressHydrationWarning>
                        <div className="mb-6" suppressHydrationWarning>
                            <Image src="/logo-white.png" alt="CATSO AV" width={180} height={80} className="h-24 w-auto opacity-80 object-contain" unoptimized />
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Productora audiovisual especializada en la creación de contenido de alto impacto. Transformamos ideas en experiencias visuales únicas.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 w-full max-w-4xl border-t border-b border-white/5 py-12" suppressHydrationWarning>
                        <div className="flex flex-col items-center" suppressHydrationWarning>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Empresa</h4>
                            <ul className="space-y-4">
                                <li><a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/40 hover:text-white transition-colors text-sm">Sobre Nosotros</a></li>
                                {/* <li><a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/40 hover:text-white transition-colors text-sm">Nuestro Equipo</a></li>
                <li><a href="#" onClick={(e) => scrollToSection(e, "clients")} className="text-white/40 hover:text-white transition-colors text-sm">Clientes</a></li> */}
                            </ul>
                        </div>

                        <div className="flex flex-col items-center" suppressHydrationWarning>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Servicios</h4>
                            <ul className="space-y-4">
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm" aria-label="Videoclips">Videoclips</a></li>
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm" aria-label="Commercial">Commercial</a></li>
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm" aria-label="Brand Content">Brand Content</a></li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center" suppressHydrationWarning>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contacto</h4>
                            <div className="flex flex-col items-center gap-4" suppressHydrationWarning>
                                <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v12z" />
                                    </svg>
                                    <a href="https://wa.me/5493442646868" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors" aria-label="WhatsApp" suppressHydrationWarning>
                                        +54 9 3442646868
                                    </a>
                                </p>
                                <div className="flex flex-col items-center gap-2 text-center" suppressHydrationWarning>
                                    <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                        <a href="mailto:laureanogomez@catsoav.com" aria-label="Email Laureano Gomez" suppressHydrationWarning>laureanogomez@catsoav.com</a>
                                    </p>
                                    <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                        <a href="mailto:camiloserra@catsoav.com" aria-label="Email Camilo Serra" suppressHydrationWarning>camiloserra@catsoav.com</a>
                                    </p>
                                </div>

                                {/* Social Icons */}
                                <div className="mt-6" suppressHydrationWarning>
                                    <SocialLinks />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4" suppressHydrationWarning>
                        <p className="text-white/20 text-xs text-center md:text-left" suppressHydrationWarning>
                            © {new Date().getFullYear()} <a href="https://vaxler.com.ar/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors" suppressHydrationWarning>Vaxler</a>. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-8" suppressHydrationWarning>
                            <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Privacidad</a>
                            <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Términos</a>
                        </div>
                    </div>
                </div>
            </div >
        </footer >
    )
}
