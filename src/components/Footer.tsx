'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Share2, Camera, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/admin');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/admin/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => setSettings(data));
    }
  }, []);

  const dAddress = settings?.footer?.address || "2 Chem. des Frères Garbero, 06600 Antibes, France";
  const dPhone = settings?.footer?.phone || "+33 1 23 45 67 89";
  const dEmail = settings?.footer?.email || "contact@delysefood.com";
  const dDesc = settings?.footer?.description?.[locale] || t('description');
  const dLogo = settings?.logo || "/photos/logo%20delyse_food.png";

  if (isAdminPage) return null;

  return (
    <footer className="py-12 px-6 md:px-12 bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto glass-card rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
          {/* Brand info */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
               <div className="w-16 h-16 flex items-center justify-center p-1 group-hover:scale-105 transition-all duration-500">
                  <img 
                    src={dLogo} 
                    alt="Logo" 
                    className={`w-full h-full object-contain ${!settings?.logo ? 'invert dark:invert-0' : ''}`} 
                  />
               </div>
               <span className="text-2xl font-black tracking-tighter text-foreground">
                 DELYSE<span className="text-gold">FOOD</span>
               </span>
            </Link>
            <p className="text-foreground/40 font-bold text-sm leading-relaxed max-w-xs italic">
              "{dDesc}"
            </p>
            <div className="flex gap-4">
              {[Share2, Camera, MessageCircle].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-lg font-black text-foreground uppercase tracking-widest">{t('quickLinks')}</h4>
            <ul className="space-y-4">
              {[
                { name: t('home'), href: '/' },
                { name: t('menu'), href: '/menu' },
                { name: t('reservation'), href: '/reservation' },
                { name: t('contact'), href: '/contact' }
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className="text-sm font-bold text-foreground/40 hover:text-gold transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-lg font-black text-foreground uppercase tracking-widest">{t('contact')}</h4>
            <ul className="space-y-5">
              <li>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(dAddress)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-sm font-bold text-foreground/50 hover:text-blue-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-gold group-hover:text-blue-500 group-hover:scale-105 transition-all"><MapPin size={18} /></div>
                  <span>{dAddress}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${dPhone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-sm font-bold text-foreground/50 hover:text-green-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-gold group-hover:text-green-500 group-hover:scale-105 transition-all"><Phone size={18} /></div>
                  <span>{dPhone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${dEmail}`} 
                  className="flex items-center gap-4 text-sm font-bold text-foreground/50 hover:text-gold transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-gold group-hover:scale-105 transition-transform"><Mail size={18} /></div>
                  <span>{dEmail}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-8">
            <h4 className="text-lg font-black text-foreground uppercase tracking-widest">Newsletter</h4>
            <p className="text-xs font-bold text-foreground/30">Recevez nos offres exclusives et menu de saison.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:ring-2 focus:ring-gold/50 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-gold text-white px-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">OK</button>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
            © 2026 Delyse Food. All Rights Reserved.
          </p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-foreground/20">
            <button className="hover:text-gold underline decoration-gold/20">Privacy Policy</button>
            <button className="hover:text-gold underline decoration-gold/20">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

