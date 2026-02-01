"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface CatsoVideoPlayerProps {
    src: string
    title: string
}

export default function CatsoVideoPlayer({ src, title }: CatsoVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // PLATFORM DETECTION
    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be')
    const isVimeo = src.includes('vimeo.com')
    const isAdobeCCV = src.includes('adobe.io/v1/player/ccv/')
    const isBehanceGallery = src.includes('behance.net/gallery')

    // Check if it's a direct video file (mp4, webm, etc.)
    const isVideoFile = src.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i) || src.startsWith('/uploads/')

    // HELPERS
    const getYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    }

    const getVimeoId = (url: string) => {
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
        return match ? match[1] : null;
    }

    const getAdobeId = (url: string) => {
        const match = url.match(/\/ccv\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }

    // Debug logging
    if (typeof window !== 'undefined') {
        console.log('[CatsoVideoPlayer] Video source:', src);
        console.log('[CatsoVideoPlayer] Platform detection:', {
            isYouTube,
            isVimeo,
            isAdobeCCV,
            isBehanceGallery,
            isVideoFile
        });
        if (isAdobeCCV) {
            const adobeId = getAdobeId(src);
            const apiKey = process.env.NEXT_PUBLIC_ADOBE_CCV_API_KEY || 'behance1';
            console.log('[CatsoVideoPlayer] Adobe CCV ID:', adobeId);
            console.log('[CatsoVideoPlayer] API Key configured:', apiKey ? 'Yes' : 'No');
        }
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video || !isVideoFile) return

        const updateTime = () => setCurrentTime(video.currentTime)
        const updateDuration = () => setDuration(video.duration)
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener("timeupdate", updateTime)
        video.addEventListener("loadedmetadata", updateDuration)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)

        return () => {
            video.removeEventListener("timeupdate", updateTime)
            video.removeEventListener("loadedmetadata", updateDuration)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
        }
    }, [isVideoFile])

    const togglePlay = () => {
        if (!isVideoFile) return

        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        setVolume(val)
        if (videoRef.current) {
            videoRef.current.volume = val
            setIsMuted(val === 0)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            const newMute = !isMuted
            setIsMuted(newMute)
            videoRef.current.muted = newMute
        }
    }

    const toggleFullscreen = () => {
        const container = document.getElementById('catso-player-container');
        if (!document.fullscreenElement && container) {
            container.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 3000)
    }

    // --- RENDER PLATFORMS ---

    // 1. BEHANCE GALLERY (Non-embeddable fallback)
    if (isBehanceGallery) {
        return (
            <div id="catso-player-container" className="relative w-full h-full group bg-[#191919] rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-red-600/10 p-6 rounded-full mb-6 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Interactive Content</h3>
                <p className="text-white/40 text-sm max-w-md mb-8">This project contains content hosted directly on Behance.</p>
                <a href={src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold transition-all transform hover:scale-105">
                    <span>Watch on Behance</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        )
    }

    // 2. ADOBE CCV
    if (isAdobeCCV) {
        const videoId = getAdobeId(src);
        return (
            <div id="catso-player-container" className="relative w-full h-full group bg-black rounded-lg overflow-hidden">
                {videoId && (
                    <iframe
                        src={`https://www-ccv.adobe.io/v1/player/ccv/${videoId}/embed?api_key=${process.env.NEXT_PUBLIC_ADOBE_CCV_API_KEY || 'behance1'}&bgcolor=%23191919`}
                        title={title}
                        className="w-full h-full absolute inset-0"
                        frameBorder="0"
                        allowFullScreen
                        allow="encrypted-media; picture-in-picture"
                    />
                )}
            </div>
        )
    }

    // 3. YOUTUBE
    if (isYouTube) {
        const videoId = getYouTubeId(src);
        return (
            <div id="catso-player-container" className="relative w-full h-full group bg-black rounded-lg overflow-hidden">
                {videoId && (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                        title={title}
                        className="w-full h-full absolute inset-0"
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                )}
            </div>
        )
    }

    // 4. VIMEO
    if (isVimeo) {
        const videoId = getVimeoId(src);
        return (
            <div id="catso-player-container" className="relative w-full h-full group bg-black rounded-lg overflow-hidden">
                {videoId && (
                    <iframe
                        src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`}
                        title={title}
                        className="w-full h-full absolute inset-0"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                    />
                )}
            </div>
        )
    }

    // 5. NATIVE VIDEO FILE (Or final fallback to image)
    if (!isVideoFile) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-lg relative overflow-hidden">
                <Image src={src} alt={title} fill className="object-contain opacity-50" />
            </div>
        )
    }

    return (
        <div
            id="catso-player-container"
            className="relative w-full h-full group bg-black rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                className="absolute inset-0 w-full h-full object-contain"
                playsInline
                autoPlay
                muted
                loop
                onClick={togglePlay}
            />

            {/* Big Play Overlay (if not playing) */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-20"
                    >
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-900/40">
                            <svg className="w-10 h-10 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20 z-50 pointer-events-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Progress Bar */}
                        <div className="group/progress relative mb-4">
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-red-600 transition-all group-hover/progress:h-2"
                            />
                            <div
                                className="absolute top-0 left-0 h-1 bg-red-600 rounded-full pointer-events-none group-hover/progress:h-2 transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                {/* Play/Pause */}
                                <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                                    {isPlaying ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>

                                {/* Volume */}
                                <div className="flex items-center gap-3 group/volume">
                                    <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 group-hover/volume:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white transition-all overflow-hidden"
                                    />
                                </div>

                                {/* Time */}
                                <div className="text-[10px] font-mono text-white/40 tracking-widest font-bold">
                                    <span className="text-white">{formatTime(currentTime)}</span>
                                    <span className="mx-1">/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Brand Badge (Optional) */}
                                <div className="hidden lg:block">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-black">Catso Player</span>
                                    </div>
                                </div>

                                {/* Fullscreen */}
                                <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors">
                                    {isFullscreen ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1h4m0 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
