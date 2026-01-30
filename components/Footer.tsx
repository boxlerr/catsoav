"use client"

import Image from "next/image"

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
        <footer className="py-20 border-t border-neutral-900 bg-black">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
                <div className="flex flex-col items-center text-center gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center max-w-lg">
                        <div className="mb-6">
                            <Image src="/logo-white.png" alt="CATSO AV" width={180} height={80} className="h-24 w-auto opacity-80 object-contain" />
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Productora audiovisual especializada en la creación de contenido de alto impacto. Transformamos ideas en experiencias visuales únicas.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 w-full max-w-4xl border-t border-b border-white/5 py-12">
                        <div className="flex flex-col items-center">
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Empresa</h4>
                            <ul className="space-y-4">
                                <li><a href="#" onClick={(e) => scrollToSection(e, "manifesto")} className="text-white/40 hover:text-white transition-colors text-sm">Sobre Nosotros</a></li>
                                {/* <li><a href="#" onClick={(e) => scrollToSection(e, "crew")} className="text-white/40 hover:text-white transition-colors text-sm">Nuestro Equipo</a></li>
                <li><a href="#" onClick={(e) => scrollToSection(e, "clients")} className="text-white/40 hover:text-white transition-colors text-sm">Clientes</a></li> */}
                            </ul>
                        </div>

                        <div className="flex flex-col items-center">
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Servicios</h4>
                            <ul className="space-y-4">
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Videoclips</a></li>
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Commercial</a></li>
                                <li><a href="#" onClick={(e) => scrollToSection(e, "services")} className="text-white/40 hover:text-white transition-colors text-sm">Brand Content</a></li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center">
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contacto</h4>
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v12z" />
                                    </svg>
                                    <a href="https://wa.me/5493442646868" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
                                        +54 9 3442646868
                                    </a>
                                </p>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                        <a href="mailto:laureanogomez@catsoav.com">laureanogomez@catsoav.com</a>
                                    </p>
                                    <p className="text-white/60 text-sm font-medium tracking-wider flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                        <a href="mailto:camiloserra@catsoav.com">camiloserra@catsoav.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-6">
                        <a
                            href="https://www.instagram.com/catso.av?igsh=YzNxd3BndDlhNGN2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-600 transition-colors p-2 md:p-0"
                            title="Instagram"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.335 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.554-.789.308-1.458.72-2.122 1.384-.664.664-1.076 1.333-1.384 2.122-.296.763-.497 1.634-.554 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.258 2.148.554 2.911.308.789.72 1.458 1.384 2.122.664.664 1.333 1.076 2.122 1.384.763.296 1.634.497 2.911.554 1.28.058 1.688.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.behance.net/catsoav"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-600 transition-colors p-2 md:p-0"
                            title="Behance"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.2 14.48c-.07-.37-.79-3.73-4.43-3.73-3.64 0-4.69 3.14-4.69 4.48s1.02 4.45 4.81 4.45c2.59 0 4.02-1.31 4.63-2.02l-2.31-1.5c-.44.56-1.05 1.18-2.1 1.18-1.14 0-2.28-.4-2.28-2.12h6.44c.01-.13.01-.43.01-.74h-.08zm-6.3-1c.14-1.08 1.1-1.85 2-.15.22.4.22.9 0 1.25-.11.19-.44.4-.95.4a1.88 1.88 0 0 1-1.05-1.5zM9.1 6.07H4.38v12.91h5.57c3.83 0 5.21-2.31 5.21-3.75a3.12 3.12 0 0 0-2.49-3.04 3.06 3.06 0 0 0 1.99-2.82c0-2.99-2.25-3.3-5.56-3.3zm-1.89 4.89V8.47h1.86s1.49-.06 1.49 1.15c0 1.21-1.49 1.34-1.49 1.34H7.21zm0 5.66v-2.3h2.53s1.86-.06 1.86 1.15-1.86 1.15-1.86 1.15H7.21zM15.34 9.07h6.08V7.72h-6.08v1.35z" />
                            </svg>
                        </a>
                        <a
                            href="https://wa.me/5493442646868"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-600 transition-colors p-2 md:p-0"
                            title="WhatsApp"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.407 3.481 2.242 2.242 3.482 5.225 3.481 8.408-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.301 1.667zm6.38-3.551l.366.218c1.554.919 3.328 1.405 5.161 1.406h.005c5.631 0 10.211-4.579 10.213-10.21.001-5.632-4.577-10.213-10.211-10.213-2.729 0-5.292 1.063-7.221 2.993-1.928 1.928-2.99 4.489-2.991 7.218-.001 1.83.47 3.616 1.36 5.176l.24.417-.996 3.636 3.731-.986zm11.41-7.149c-.314-.157-1.86-.918-2.148-1.023-.288-.105-.499-.157-.708.157-.21.314-.812 1.023-.996 1.233-.183.21-.367.236-.681.079-.314-.157-1.328-.49-2.53-1.561-.935-.834-1.566-1.863-1.75-2.177-.183-.314-.02-.485.137-.641.142-.14.314-.367.472-.55.157-.183.21-.314.314-.524.105-.21.052-.393-.027-.55-.079-.157-.708-1.703-.97-2.332-.255-.612-.513-.53-.708-.541-.183-.008-.393-.01-.603-.01-.21 0-.55.079-.838.393-.288.314-1.1 1.075-1.1 2.62s1.127 3.037 1.284 3.247c.157.21 2.219 3.389 5.375 4.755.751.325 1.336.52 1.792.664.754.238 1.439.205 1.982.124.605-.09 1.86-.759 2.122-1.494.262-.733.262-1.362.183-1.494-.08-.132-.288-.21-.603-.367z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.youtube.com/@CATSO"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-600 transition-colors p-2 md:p-0"
                            title="YouTube"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.linkedin.com/company/catso-av/about/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-600 transition-colors p-2 md:p-0"
                            title="LinkedIn"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/20 text-xs text-center md:text-left">
                        © {new Date().getFullYear()} <a href="https://vaxler.com.ar/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Vaxler</a>. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Privacidad</a>
                        <a href="#" className="text-white/20 hover:text-white transition-colors text-xs">Términos</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
