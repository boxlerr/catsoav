"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export default function NotFound() {
  const t = useTranslations('Project')

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image 
          src="/logo-white.png" 
          alt="CATSO AV" 
          width={150} 
          height={75} 
          className="h-20 w-auto opacity-40 mb-12 grayscale mx-auto"
        />
        <h1 className="text-6xl md:text-8xl font-black text-white/10 mb-4 tracking-tighter uppercase">
          404
        </h1>
        <p className="text-white/40 uppercase tracking-[0.3em] font-bold text-xs mb-12">
          Page Not Found
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('back')}
        </Link>
      </motion.div>
    </div>
  )
}
