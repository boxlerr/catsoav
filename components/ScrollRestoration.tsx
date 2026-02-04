"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * ScrollRestoration component
 * 
 * Robust implementation for Next.js App Router:
 * 1. Disables browser's native scroll restoration
 * 2. Saves scroll position to sessionStorage on scroll (throttled)
 * 3. Restores scroll position immediately on navigation
 * 4. Retries restoration if content height is not yet sufficient (dynamic loading)
 */
export default function ScrollRestoration() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const scrollKey = `scroll-pos-${pathname}`

    // Disable browser native restoration to prevent fighting
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // Save scroll position on scroll (throttled)
    useEffect(() => {
        // Skip auto-saving for Home page to avoid overwriting with 0 during loading
        // Home page handles its own saving via manual click handlers
        if (pathname === '/') return;

        const handleScroll = () => {
            // Use requestAnimationFrame for throttling
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(() => {
                    sessionStorage.setItem(scrollKey, window.scrollY.toString())
                })
            } else {
                sessionStorage.setItem(scrollKey, window.scrollY.toString())
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [scrollKey, pathname])

    // Restore scroll position on path change
    useEffect(() => {
        const savedPosition = sessionStorage.getItem(scrollKey)
        const position = savedPosition ? parseInt(savedPosition, 10) : 0

        const restore = () => {
            // If we are at the top and shouldn't be, try to scroll
            // Or if we are supposed to be at 0, scroll to 0
            window.scrollTo({
                top: position,
                behavior: 'instant'
            })
        }

        // Attempt immediate restoration
        restore()

        // Retry mechanism for dynamic content (e.g. images loading)
        // Try multiple times in the first few hundred ms
        const timeouts = [10, 50, 100, 300, 500].map(delay =>
            setTimeout(() => {
                // Only scroll if we haven't manually scrolled yet?
                // For now, force it to ensure we hit the spot
                const currentPos = window.scrollY
                // If we are significantly off target, retry
                if (Math.abs(currentPos - position) > 10) {
                    restore()
                }
            }, delay)
        )

        return () => timeouts.forEach(clearTimeout)
    }, [pathname, searchParams, scrollKey])

    return null
}
