"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations('index.home')

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Image
          src="/logo-white.png"
          alt="CATSO AV"
          width={200}
          height={100}
          className="h-20 w-auto object-contain animate-pulse"
          priority
        />
        
        {/* Animated line loader */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-red-600"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-[10px] uppercase tracking-[0.5em] font-black text-white"
      >
        {t('loading')}
      </motion.p>
    </div>
  )
}
