'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ChevronRight, Leaf } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Magnetic from './animations/Magnetic';
import { useState, useEffect } from 'react';

export default function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale() as 'en' | 'fr' | 'es' | 'it' | 'ar';
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => setSettings(data));
    }
  }, []);

  const dTitle = settings?.hero?.title?.[locale] || t('title');
  const dDesc = settings?.hero?.description?.[locale] || t('subtitle');

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 px-6 md:px-12 lg:px-24 bg-background overflow-hidden transition-colors duration-500">
      
      {/* Soft Background Atmospheric Gradients */}
      <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#FF9F0D]/5 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF9F0D]/10 blur-[100px] rounded-full -z-10" />

      {/* Decorative Floating Leaves (SVG/CSS) */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-[20%] left-[5%] text-gold opacity-20 hidden md:block"
      >
        <Leaf size={48} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-[20%] left-[45%] text-gold opacity-10 hidden md:block"
      >
        <Leaf size={32} />
      </motion.div>

      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Content Side */}
        <div className="space-y-10 animate-fade-in">
           <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-block px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-gold/10 text-gold text-xs font-bold tracking-[0.2em] uppercase"
              >
                Food Delivery & Restaurant
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-foreground text-left rtl:text-right"
              >
                {dTitle.split(/(\*.*?\*)/g).map((part: string, i: number) => {
                  const isHighlighted = part.startsWith('*') && part.endsWith('*');
                  const cleanPart = isHighlighted ? part.slice(1, -1) : part;
                  
                  return (
                    <span key={i}>
                      {isHighlighted ? (
                        <span className="text-gold italic font-serif">{cleanPart}</span>
                      ) : (
                        cleanPart
                      )}
                      {/* Responsive line breaks for non-Arabic locales */}
                      {locale !== 'ar' && (cleanPart === 'Food' || cleanPart === 'Cuisine') && <br className="hidden md:block"/>}
                    </span>
                  );
                })}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-lg md:text-xl text-foreground/50 leading-relaxed font-medium max-w-lg text-left rtl:text-right rtl:mr-0 rtl:ml-auto"
              >
                {dDesc}
              </motion.p>
           </div>

           <div className="flex flex-wrap gap-6 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Magnetic>
                   <Link href="/menu">
                      <button className="px-10 py-5 bg-gold text-white rounded-2xl font-black text-sm uppercase tracking-widest plate-shadow hover:scale-105 active:scale-95 transition-all">
                        Food Menu
                      </button>
                   </Link>
                </Magnetic>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Magnetic>
                   <Link href="/reservation">
                      <button className="px-10 py-5 bg-foreground/5 text-foreground/60 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-foreground/10 transition-all">
                        Book a Table
                      </button>
                   </Link>
                </Magnetic>
              </motion.div>
           </div>
        </div>

        {/* Right Image Side */}
        <div className="relative flex justify-center items-center h-[500px] lg:h-[800px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10 w-[110%] lg:w-[130%] flex justify-center items-center"
            >
               {/* Outer Decorative Glow Circles */}
               <div className="absolute inset-0 bg-gold/10 blur-[120px] rounded-full scale-90 animate-pulse -z-10" />
               <div className="absolute inset-[-15%] border-[2px] border-gold/5 rounded-full -z-10 animate-spin-slow" />
               
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                 className="w-full aspect-square rounded-full overflow-hidden plate-shadow hover:scale-105 transition-transform duration-700 cursor-pointer border-[8px] border-white/10"
               >
                  <img 
                    src="/photos/dish3.png" 
                    alt="Signature Dish" 
                    className="w-full h-full object-cover"
                  />
               </motion.div>
            </motion.div>

           {/* Floating elements like the image */}
           <motion.div
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute top-1/4 -right-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 border border-gold/5 z-20"
           >
              <img src="/photos/dish1.png" alt="small dish" className="w-full h-auto object-contain" />
           </motion.div>
           <motion.div
             animate={{ y: [0, 20, 0] }}
             transition={{ duration: 6, repeat: Infinity }}
             className="absolute bottom-1/4 -left-10 w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center p-6 border border-gold/5 z-20"
           >
              <img src="/photos/dish2.png" alt="small dish" className="w-full h-auto object-contain" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}




