'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Plus, Star, Search, ShoppingBag, X, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuPage() {
  const t = useTranslations('Menu');
  const locale = useLocale() as 'en' | 'fr' | 'es' | 'it' | 'ar';
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();
  
  // Review Modal States
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          setMenuItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Menu fetch failed:", err);
        setMenuItems([]);
        setLoading(false);
      });
  }, []);

  const categories = ['all', 'starter', 'main', 'dessert', 'drink'];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const submitReview = async () => {
    if (!reviewItem) return;
    setSendingReview(true);
    try {
      const res = await fetch(`/api/menu/${reviewItem._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state to show new mathematical calculation 
        setMenuItems(prev => prev.map(item => item._id === reviewItem._id ? { ...item, rating: data.newRating, reviewsCount: data.newReviewsCount } : item));
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewItem(null);
          setReviewSuccess(false);
        }, 2000);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) return (
    <div className="pt-60 text-center min-h-screen bg-background">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <span className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">{t('loading')}</span>
    </div>
  );

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-20 space-y-4 animate-fade-in">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">{t('subtitle')}</span>
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

        {/* Categories Tab Bar - Barco Style */}
        <div className="flex justify-center mb-16 overflow-x-auto no-scrollbar pb-4 gap-4">
           <div className="glass-card rounded-[2rem] p-2 flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat 
                    ? 'bg-gold text-white shadow-lg shadow-gold/20 scale-105' 
                    : 'text-foreground/40 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : t(cat + 's')}
                </button>
              ))}
           </div>
        </div>

        {/* Menu Grid - Barco Minimal Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group glass-card rounded-[2.5rem] p-6 hover:shadow-2xl transition-all duration-500 border border-border"
              >
                 <div className="relative aspect-square mb-8 overflow-hidden rounded-[2rem] bg-foreground/5">
                    <img 
                      src={item.image || '/photos/dish1.png'} 
                      alt={item.name[locale]} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gold/10">
                       <span className="text-gold font-black text-sm">{item.price}€</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-start">
                       <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-gold transition-colors line-clamp-1">
                         {item.name[locale] || item.name['fr']}
                       </h3>
                    </div>
                    
                    <p className="text-foreground/40 text-xs font-bold leading-relaxed line-clamp-2 italic min-h-[2.5rem]">
                      {item.description[locale] || item.description['fr']}
                    </p>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                       <button onClick={() => { setReviewItem(item); setReviewRating(5); setReviewSuccess(false); }} className="flex items-center gap-2 mt-2 hover:bg-foreground/5 p-2 rounded-xl transition-all cursor-pointer group/rating">
                          <div className="flex text-gold group-hover/rating:scale-110 transition-transform">
                             <Star size={14} className="fill-current" />
                          </div>
                          <div className="flex items-baseline gap-1">
                             <span className="text-foreground/80 font-black text-sm tracking-tight">{item.rating ? item.rating.toFixed(1) : '4.8'}</span>
                             <span className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">({item.reviewsCount || 124})</span>
                          </div>
                       </button>
                       <button 
                         onClick={() => addToCart({
                           id: item._id,
                           name: item.name[locale] || item.name['fr'],
                           price: item.price,
                           quantity: 1,
                           image: item.image
                         })}
                         className="w-12 h-12 bg-foreground text-background dark:bg-gold dark:text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                       >
                         <Plus size={20} strokeWidth={3} />
                       </button>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-40">
             <ShoppingBag size={48} className="mx-auto text-foreground/10 mb-6" />
             <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">Plus de délices bientôt...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {reviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm rounded-[3rem] border border-border shadow-3xl p-10 text-center relative"
            >
              <button onClick={() => setReviewItem(null)} className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:rotate-90 transition-all"><X size={18} /></button>
              
              {reviewSuccess ? (
                <div className="space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
                    <Star size={32} className="fill-current" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">Merci !</h3>
                  <p className="text-foreground/40 text-xs font-bold leading-relaxed italic">Votre note a été comptabilisée en temps réel.</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden bg-foreground/5 mx-auto mb-6">
                     <img src={reviewItem.image || '/photos/dish1.png'} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground line-clamp-1 mb-2">
                    {reviewItem.name[locale] || reviewItem.name['fr']}
                  </h3>
                  <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-8">Évaluez ce plat</p>
                  
                  <div className="flex justify-center gap-3 mb-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setReviewRating(star)}
                        className={`transition-all hover:scale-125 ${star <= reviewRating ? 'text-gold' : 'text-foreground/10'}`}
                      >
                        <Star size={32} className={star <= reviewRating ? "fill-current" : ""} />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={submitReview}
                    disabled={sendingReview}
                    className="w-full bg-gold text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                  >
                    {sendingReview ? <Loader2 className="animate-spin" size={18} /> : "Soumettre ma note"}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
