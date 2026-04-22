'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { ShoppingCart, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('Navbar');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (typeof window !== 'undefined') {
      fetch('/api/admin/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => setSettings(data));
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dLogo = settings?.logo || "/photos/logo%20delyse_food.png";

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('menu'), href: '/menu' },
    { name: t('reservation'), href: '/reservation' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'} px-6 md:px-12`}>
      <div className={`max-w-7xl mx-auto glass-card rounded-[2.5rem] px-8 py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'scale-95 shadow-2xl' : 'scale-100'}`}>
        
        {/* Logo - Transparent Container */}
        <Link href="/" className="flex items-center gap-3 group">
           <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-all duration-500 overflow-hidden p-1">
              <img 
                src={dLogo} 
                alt="Logo" 
                className={`w-full h-full object-contain ${!settings?.logo ? 'invert dark:invert-0' : ''}`} 
              />
           </div>
           <span className="text-xl font-black tracking-tighter text-foreground hidden sm:block">
             DELYSE<span className="text-gold">FOOD</span>
           </span>
        </Link>

        {/* Desktop Menu - Barco Style */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-gold relative group ${pathname === link.href ? 'text-gold' : 'text-foreground/50'}`}
            >
              {link.name}
              <motion.span 
                layoutId="nav-underline"
                className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gold transition-all duration-300 ${pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} 
              />
            </Link>
          ))}
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:flex items-center gap-3 md:gap-5 border-r border-border pr-5 mr-1">
             <LanguageSwitcher />
             <button 
                onClick={toggleTheme}
                className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all duration-500"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4 font-black text-[10px] uppercase tracking-widest">
            {/* Cart Button */}
            <Link href="/cart" className="relative group">
               <div className="w-11 h-11 rounded-2xl bg-gold text-white flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-105 active:scale-95 transition-all">
                  <ShoppingCart size={18} strokeWidth={3} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-noir text-white text-[9px] font-black rounded-lg flex items-center justify-center border-2 border-gold translate-x-1 -translate-y-1">
                      {totalItems}
                    </span>
                  )}
               </div>
            </Link>

            {/* User Session */}
            {session ? (
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-foreground">{session.user?.name}</span>
                    {((session.user as any).role === 'admin') && (
                      <Link href="/admin" className="text-gold text-[8px] hover:underline uppercase tracking-widest font-black">{t('dashboard')}</Link>
                    )}
                 </div>
                 <button onClick={() => signOut()} className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <User size={18} />
                 </button>
              </div>
            ) : (
              <Link href="/auth/signin">
                 <button className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all shadow-sm">
                    <User size={18} />
                 </button>
              </Link>
            )}

            {/* Mobile Burger */}
            <button 
              className="lg:hidden w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center text-gold"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-[calc(100%+1rem)] left-6 right-6 glass-card rounded-[2.5rem] p-8 shadow-3xl"
          >
             <div className="flex flex-col gap-6 text-center">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                ))}
                <div className="pt-6 border-t border-border flex justify-center gap-6">
                   <LanguageSwitcher />
                   <button onClick={() => {toggleTheme(); setIsOpen(false);}} className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                     {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

