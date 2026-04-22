'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Accessibility, Wind, Sun, Flame, ShoppingBag, Wifi } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('Contact');

  const amenities = [
    { icon: Accessibility, name: "Accessible aux personnes à mobilité réduite" },
    { icon: Wind, name: "Climatisation" },
    { icon: Sun, name: "Terrasse" },
    { icon: Flame, name: "Coin fumeurs" },
    { icon: ShoppingBag, name: "À emporter" },
    { icon: Wifi, name: "Wi-Fi gratuit" }
  ];

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen relative overflow-hidden">
      {/* Decorative Atmosphere */}
      <div className="absolute top-0 left-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-24 space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">{t('pageSubtitle')}</span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
            {t('pageTitle').split(/(\*.*?\*)/g).map((part, i) => {
              const isHighlight = part.startsWith('*') && part.endsWith('*');
              return isHighlight ? (
                <span key={i} className="text-gold italic font-serif">{part.slice(1, -1)}</span>
              ) : (
                part
              );
            })}
          </h1>
          <p className="text-foreground/40 font-bold max-w-xl mx-auto text-sm leading-relaxed italic">
            "{t('pageDescription')}"
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] p-8 border border-border flex items-center gap-6 group hover:translate-x-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{t('addressTitle')}</h3>
                <p className="text-lg font-black text-foreground tracking-tight">2 Chem. des Frères Garbero, 06600 Antibes, France</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-[2.5rem] p-8 border border-border flex items-center gap-6 group hover:translate-x-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{t('phoneTitle')}</h3>
                <p className="text-lg font-black text-foreground tracking-tight">+33 1 23 45 67 89</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-[2.5rem] p-8 border border-border flex items-center gap-6 group hover:translate-x-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                <Mail size={28} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{t('emailTitle')}</h3>
                <p className="text-lg font-black text-foreground tracking-tight">contact@delysefood.com</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-[2.5rem] p-8 border border-border flex items-center gap-6 group hover:translate-x-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                <Clock size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-2">{t('hoursTitle')}</h3>
                <div className="space-y-1 text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                  <div className="flex justify-between border-b border-foreground/5 pb-1">
                    <span>{t('everyDay')}</span>
                    <span className="text-foreground">11:00 - 00:00</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[3rem] p-10 md:p-14 border border-border shadow-3xl"
          >
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2">{t('nameLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px) font-black uppercase tracking-[0.2em] text-gold ml-2">{t('emailLabel')}</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2">{t('subjectLabel')}</label>
                <input
                  type="text"
                  placeholder={t('subjectPlaceholder')}
                  className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none shadow-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2">{t('messageLabel')}</label>
                <textarea
                  rows={6}
                  placeholder={t('messagePlaceholder')}
                  className="w-full bg-foreground/5 border-none rounded-[2rem] px-8 py-6 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none shadow-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gold text-white font-black py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gold/20 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3"
              >
                {t('sendButton')} <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Amenities Section - Creative Part */}
      <section className="py-32 relative overflow-hidden border-t border-border/50 mt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[100px] -z-10 rounded-full" />
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Votre <span className="text-gold italic font-serif">Confort</span></h2>
            <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-[10px]">Pensé dans les moindres détails</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {amenities.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="flex flex-col items-center gap-6 group"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 border border-border flex items-center justify-center text-foreground group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all duration-500 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <item.icon size={28} className="relative z-10" />
                </div>
                <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-foreground/60 group-hover:text-gold transition-colors text-center leading-relaxed px-2">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
