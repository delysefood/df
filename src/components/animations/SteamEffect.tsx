'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SteamEffect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex justify-center items-end opacity-100">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.5, x: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -150, -350],
            scale: [1, 2, 3],
            x: [0, i % 2 === 0 ? 50 : -50, i % 2 === 0 ? 100 : -100]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
          className="absolute w-32 h-32 bg-gray-400/40 dark:bg-gray-100/30 rounded-full blur-2xl"
          style={{
            left: `${35 + Math.random() * 30}%`,
            bottom: '30%'
          }}
        />
      ))}
    </div>
  );
}
