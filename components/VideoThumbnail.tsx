"use client"

import { useState, useEffect } from "react"

interface VideoThumbnailProps {
    videoUrl: string
    imageUrl?: string | null
    title: string
}

export default function VideoThumbnail({ videoUrl, imageUrl, title }: VideoThumbnailProps) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(imageUrl || null)
    const [isVideo, setIsVideo] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isAdobeCCV, setIsAdobeCCV] = useState(false)

    useEffect(() => {
        setIsLoaded(false)
        setIsAdobeCCV(false)
        if (imageUrl) {
            setThumbnailUrl(imageUrl)
            setIsVideo(false)
            return
        }

        if (!videoUrl) return

        // Check if it's Adobe CCV (Behance)
        if (videoUrl.includes('adobe.io/v1/player/ccv/')) {
            setIsVideo(false)
            setIsAdobeCCV(true)
            setThumbnailUrl(null)
            return
        }

        // Check if it's YouTube
        const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        if (ytMatch && ytMatch[1]) {
            setThumbnailUrl(`https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`)
            setIsVideo(false)
            return
        }

        // Check if it's Vimeo
        const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
        if (vimeoMatch && vimeoMatch[1]) {
            fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.thumbnail_url) {
                        setThumbnailUrl(data.thumbnail_url)
                        setIsVideo(false)
                    } else {
                        setIsVideo(true)
                    }
                })
                .catch(() => setIsVideo(true))
            return
        }

        // Check if it's Adobe CCV (Behance)
        if (videoUrl.includes('adobe.io/v1/player/ccv/')) {
            setIsVideo(false)
            setThumbnailUrl(null) // No public thumbnail available for CCV embeds
            return
        }

        // Check if it's direct video file
        const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(videoUrl) || videoUrl.includes('/uploads/')
        if (isDirectVideo) {
            setIsVideo(true)
            return
        }

        setIsVideo(true)
    }, [videoUrl, imageUrl])

    if (isVideo) {
        return (
            <div className="w-full h-full relative bg-neutral-900 overflow-hidden flex items-center justify-center">
                <video
                    src={videoUrl}
                    className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-60 group-hover:opacity-100' : 'opacity-0'}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsLoaded(true)}
                    onError={() => {
                        console.error("Video preview failed to load:", videoUrl)
                        setIsLoaded(false)
                    }}
                />
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}
            </div>
        )
    }

    if (isAdobeCCV) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#191919] border border-white/5 group-hover:border-red-600/30 transition-all duration-500">
                <div className="bg-red-600/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.58 2H22v15.38L14.58 2zm-3.16 11.53L14.58 23H7.13l4.29-9.47zm-1.84-4.06L3.11 23H2V2h3.11l6.47 7.47z" />
                    </svg>
                </div>
                <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">Adobe CCV Player</span>
            </div>
        )
    }

    if (thumbnailUrl) {
        return (
            <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => {
                    // If maxres fails, try hqdefault
                    if (thumbnailUrl.includes('maxresdefault')) {
                        setThumbnailUrl(thumbnailUrl.replace('maxresdefault', 'hqdefault'))
                    } else {
                        setIsVideo(true) // Fallback to video attempt
                    }
                }}
            />
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </div>
    )
}
