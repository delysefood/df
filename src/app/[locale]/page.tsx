'use client';

import Hero from '@/components/Hero';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, PhoneCall, Clock, Users, Truck, ChevronRight, X, Loader2, Accessibility, Wind, Sun, Flame, ShoppingBag, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/animations/Reveal';
import TiltCard from '@/components/animations/TiltCard';

export default function Home() {
  const t = useTranslations('HomePage');
  
  const [reviews, setReviews] = useState<any[]>([
    { name: "Sophie Laurent", review: "Une expérience culinaire inoubliable ! Le service est impeccable et les plats sont absolument divins.", rating: 5, role: "Gastronome" },
    { name: "Marc Dubois", review: "Le meilleur restaurant de la région, sans aucune hésitation. Les saveurs sont d'une finesse incroyable.", rating: 5, role: "Client Régulier" },
    { name: "Elena Vronsky", review: "Une ambiance luxueuse et une carte à la hauteur des plus grandes tables étoilées. À recommander absolument.", rating: 5, role: "Épicurienne" }
  ]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', review: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch('/api/reviews').then(r => r.json()).then(data => {
      if (data && data.length > 0) setReviews(data.slice(0, 3));
    }).catch(e => console.error(e));
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) });
      alert('Merci pour votre avis ! Il sera publié après validation de notre équipe.');
      setIsReviewModalOpen(false);
      setNewReview({ name: '', role: '', review: '', rating: 5 });
    } catch(err) {
      alert('Erreur lors de l\'envoi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const topList = [
    {
      id: 1,
      name: t('dishes.noodles.name'),
      desc: t('dishes.noodles.desc'),
      price: "12€",
      rating: "4.8",
      img: "/photos/dish1.png"
    },
    {
      id: 2,
      name: t('dishes.ramen.name'),
      desc: t('dishes.ramen.desc'),
      price: "20€",
      rating: "4.9",
      img: "/photos/dish2.png",
      featured: true
    },
    {
      id: 3,
      name: t('dishes.soup.name'),
      desc: t('dishes.soup.desc'),
      price: "16€",
      rating: "4.7",
      img: "/photos/dish3.png"
    }
  ];

  const services = [
    { icon: PhoneCall, name: t('services.reservation') },
    { icon: Clock, name: t('services.catering') },
    { icon: Users, name: t('services.member') },
    { icon: Truck, name: t('services.delivery') }
  ];

  const amenities = [
    { icon: Accessibility, name: "Accessible aux personnes à mobilité réduite" },
    { icon: Wind, name: "Climatisation" },
    { icon: Sun, name: "Terrasse" },
    { icon: Flame, name: "Coin fumeurs" },
    { icon: ShoppingBag, name: "À emporter" },
    { icon: Wifi, name: "Wi-Fi gratuit" }
  ];

  return (
    <>
    <main className="relative bg-background overflow-hidden pb-32 transition-colors duration-300">
      <Hero />

      {/* Top List Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center mb-24 space-y-6">
           <Reveal width="100%" delay={0.1}>
              <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic">{t('topListTitle')}</h2>
           </Reveal>
           <Reveal width="100%" delay={0.2}>
              <p className="text-gold font-black tracking-[0.4em] uppercase text-xs">{t('topListSubtitle')}</p>
           </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
           {topList.map((item, i) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="h-full"
             >
                <TiltCard>
                   <div className="group glass-card rounded-[3rem] p-10 h-full flex flex-col items-center transition-all hover:border-gold/30 hover:shadow-2xl relative overflow-hidden">
                      {/* Decorative Gradient Background inside card */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
                      
                      <div className="relative w-56 h-56 mb-10 transform group-hover:scale-110 transition-transform duration-700">
                         <img 
                          src={item.img} 
                          alt={item.name} 
                          className="w-full h-full object-contain plate-shadow"
                         />
                         <div className="absolute -top-4 -right-4 bg-gold text-white px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 font-black text-sm">
                            <Star size={14} fill="currentColor" /> {item.rating}
                         </div>
                      </div>

                      <div className="w-full space-y-4 text-center">
                         <h3 className="text-3xl font-black text-foreground tracking-tight">{item.name}</h3>
                         <p className="text-sm text-foreground/40 font-bold leading-relaxed line-clamp-2">
                           {item.desc}
                         </p>
                         
                         <div className="flex justify-between items-center pt-8">
                            <span className="text-3xl font-black text-foreground">{item.price}</span>
                            <button className="w-12 h-12 rounded-2xl bg-gold text-white flex items-center justify-center shadow-lg shadow-gold/20 hover:rotate-90 transition-all duration-500">
                               <Plus size={24} />
                            </button>
                         </div>
                      </div>
                   </div>
                </TiltCard>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Featured Section (Potatoes) */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-gold/5 relative">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <motion.div 
             whileHover={{ rotate: 1, scale: 1.02 }}
             className="relative animate-fade-in"
           >
              <img 
                src="/photos/fries.png" 
                alt="Featured Item" 
                className="w-full h-auto plate-shadow rounded-[4rem]"
              />
              <div className="absolute -inset-10 border border-gold/10 rounded-[5rem] -z-10 animate-pulse" />
           </motion.div>

           <div className="space-y-10">
              <Reveal width="100%">
                <h2 className="text-6xl md:text-8xl font-black text-foreground leading-[0.9] tracking-tighter">
                  {t('featuredTitle').split(/(\*.*?\*)/g).map((part, i) => {
                    const isHighlight = part.startsWith('*') && part.endsWith('*');
                    return isHighlight ? (
                      <span key={i} className="text-gold italic font-serif italic">{part.slice(1, -1)}</span>
                    ) : (
                      part
                    );
                  })}
                </h2>
              </Reveal>
              <Reveal delay={0.2} width="100%">
                <p className="text-xl text-foreground/50 leading-relaxed font-medium max-w-xl">
                   {t('featuredDesc')}
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                 <div className="pt-6">
                    <Link href="/menu">
                      <button className="px-12 py-6 bg-foreground text-background dark:bg-zinc-800 dark:text-white rounded-[2rem] font-black text-xl hover:bg-gold transition-all duration-500 flex items-center gap-4 group">
                         {t('featuredCTA')}
                         <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                    </Link>
                 </div>
              </Reveal>
           </div>
        </div>
      </section>

      {/* Amenities Section - Creative Part */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[100px] -z-10 rounded-full" />
        <div className="max-w-7xl mx-auto space-y-24">
          <Reveal width="100%">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Votre <span className="text-gold italic font-serif">Confort</span></h2>
              <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-[10px]">Pensé dans les moindres détails</p>
            </div>
          </Reveal>

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


      {/* Reviews Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-background">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
           <Reveal width="100%" delay={0.1}>
              <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Avis <span className="text-gold italic font-serif">Clients</span></h2>
           </Reveal>
           <Reveal width="100%" delay={0.2}>
              <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-[10px]">L'Excellence Reconnue</p>
           </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
           {reviews.map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="glass-card rounded-[3rem] p-10 border border-border group hover:border-gold/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col"
             >
                <div className="absolute -top-10 -right-10 text-gold/5 rotate-12 pointer-events-none">
                   <Star size={180} className="fill-current" />
                </div>
                
                <div className="flex gap-1.5 text-gold mb-8 relative z-10">
                   {[...Array(item.rating)].map((_, s) => <Star key={s} size={20} className="fill-current group-hover:scale-110 transition-transform" style={{ transitionDelay: `${s * 50}ms` }} />)}
                   {[...Array(5 - item.rating)].map((_, s) => <Star key={s + item.rating} size={20} className="text-gold/20" />)}
                </div>
                <p className="text-foreground/70 font-medium leading-relaxed italic mb-10 min-h-[5rem] relative z-10 line-clamp-4">"{item.review}"</p>
                <div className="flex items-center gap-5 border-t border-border pt-6 mt-auto relative z-10">
                   <div className="w-14 h-14 shrink-0 rounded-2xl bg-gold/10 text-gold flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-gold group-hover:text-white transition-colors duration-500">
                      {item.name.charAt(0)}
                   </div>
                   <div className="overflow-hidden">
                      <span className="text-foreground font-black tracking-tight truncate block">{item.name}</span>
                      <span className="text-gold text-[10px] font-black uppercase tracking-widest truncate block">{item.role || 'Client'}</span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
        
        <Reveal delay={0.4}>
          <div className="flex justify-center mt-16 mt-20">
             <button 
               onClick={() => setIsReviewModalOpen(true)}
               className="px-10 py-5 rounded-full border border-gold text-gold font-black uppercase tracking-widest text-[10px] hover:bg-gold hover:text-white transition-all duration-500 flex items-center gap-3 shadow-lg shadow-gold/5"
             >
                <Plus size={16} /> Partager votre Expérience
             </button>
          </div>
        </Reveal>
      </section>

      {/* Services Section */}
      <section className="py-40 border-t border-black/5 dark:border-white/5 mx-6 md:mx-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <Reveal width="100%" delay={0.1}>
            <h3 className="text-center text-5xl font-serif text-foreground mb-24 italic tracking-widest">{t('servicesTitle')}</h3>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
             {services.map((service, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center gap-6 group cursor-pointer"
                >
                   <div className="w-24 h-24 rounded-[2rem] bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white group-hover:shadow-[0_20px_40px_rgba(255,159,13,0.3)] transition-all duration-500 transform group-hover:rotate-6 shadow-sm">
                      <service.icon size={36} strokeWidth={1.5} />
                   </div>
                   <span className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground/60 transition-colors group-hover:text-gold text-center">{service.name}</span>
                </motion.div>
             ))}
          </div>
        </div>
      </section>
    </main>

    {/* Review Modal */}
    <AnimatePresence>
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-2xl overflow-hidden rounded-[3rem] border border-border flex flex-col shadow-3xl"
          >
            <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter">Votre <span className="text-gold italic font-serif">Avis</span></h2>
                <p className="text-foreground/40 text-[10px] uppercase font-black tracking-widest mt-1">Partagez votre expérience</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:rotate-90 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={submitReview} className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-4 py-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Note</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={40} 
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className={`cursor-pointer transition-all hover:scale-110 ${star <= newReview.rating ? 'fill-gold text-gold drop-shadow-md' : 'text-foreground/10'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2 mb-2 block">Nom & Prénom</label>
                  <input type="text" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none" placeholder="Ex: Jean Dupont" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2 mb-2 block">Rôle / Titre (Optionnel)</label>
                  <input type="text" value={newReview.role} onChange={e => setNewReview({...newReview, role: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none" placeholder="Ex: Grand Fan" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2 mb-2 block">Votre Message</label>
                <textarea required rows={4} value={newReview.review} onChange={e => setNewReview({...newReview, review: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none" placeholder="Racontez-nous votre expérience..."></textarea>
              </div>

              <button type="submit" disabled={submittingReview} className="w-full py-5 bg-gold text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {submittingReview ? <Loader2 className="animate-spin" size={18} /> : "Soumettre mon avis"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}


