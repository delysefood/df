'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Plus, Star, Search, ShoppingBag, X, Loader2, Check, Info, Flame, Minus, Heart, Sparkles } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const SAUCES = [
  'Algérienne', 'Mayonnaise', 'Ketchup', 'Samouraï', 
  'Harissa', 'Blanche', 'Barbecue', 'Biggy'
];

export default function MenuPage() {
  const t = useTranslations('Menu');
  const locale = useLocale() as 'en' | 'fr' | 'es' | 'it' | 'ar';
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();
  
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Options & Details Modal States
  const [optionItem, setOptionItem] = useState<any>(null);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]); // Form: [{name, price, quantity}]
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddToCartClick = (item: any) => {
    if ((item.extras && item.extras.length > 0) || item.sauceSettings?.hasSauces) {
      setOptionItem(item);
      setSelectedExtras([]);
      setSelectedSauces([]);
    } else {
      addToCart({
        cartId: item._id, id: item._id, name: item.name[locale] || item.name['fr'],
        price: item.price, basePrice: item.price, quantity: 1, image: item.image,
        selectedExtras: [], selectedSauces: []
      });
    }
  };

  const confirmAddToCart = () => {
    if (!optionItem) return;
    const extrasTotal = selectedExtras.reduce((sum, ex) => sum + (ex.price * ex.quantity), 0);
    const finalPrice = optionItem.price + extrasTotal;
    
    // Create a unique key including quantities
    const optionsKey = [
      ...selectedExtras.map(e => `${e.name}x${e.quantity}`), 
      ...selectedSauces
    ].sort().join('|');
    const cartId = `${optionItem._id}-${optionsKey}`;

    addToCart({
      cartId, id: optionItem._id, name: optionItem.name[locale] || optionItem.name['fr'],
      price: finalPrice, basePrice: optionItem.price, quantity: 1, image: optionItem.image,
      selectedExtras, selectedSauces
    });
    setOptionItem(null);
  };

  const updateExtraQuantity = (extra: any, delta: number) => {
    const maxGlobal = optionItem.sauceSettings?.maxExtras || 12;
    const currentTotal = selectedExtras.reduce((sum, ex) => sum + ex.quantity, 0);
    
    const existingIndex = selectedExtras.findIndex(e => e.name === extra.name);

    if (existingIndex > -1) {
      const newExtras = [...selectedExtras];
      const newQuantity = newExtras[existingIndex].quantity + delta;

      if (newQuantity <= 0) {
        newExtras.splice(existingIndex, 1);
      } else if (delta > 0 && currentTotal >= maxGlobal) {
        return; // Limit reached
      } else {
        newExtras[existingIndex].quantity = newQuantity;
      }
      setSelectedExtras(newExtras);
    } else if (delta > 0) {
      if (currentTotal >= maxGlobal) return;
      setSelectedExtras([...selectedExtras, { ...extra, quantity: 1 }]);
    }
  };

  const toggleSauce = (sauce: string) => {
    const max = optionItem.sauceSettings?.maxSauces || 1;
    if (selectedSauces.includes(sauce)) {
      setSelectedSauces(prev => prev.filter(s => s !== sauce));
    } else if (selectedSauces.length < max) {
      setSelectedSauces(prev => [...prev, sauce]);
    }
  };

  const totalExtrasCount = selectedExtras.reduce((sum, ex) => sum + ex.quantity, 0);

  if (loading) return <div className="pt-60 text-center min-vh-screen"><Loader2 className="animate-spin text-gold mx-auto" size={48} /></div>;

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20 space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">{t('subtitle')}</span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Nos <span className="text-gold italic font-serif">Délices</span></h1>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
           {menuItems.filter(i => activeCategory === 'all' || i.category === activeCategory).map((item, idx) => (
              <motion.div 
                key={item._id} 
                onClick={() => setDetailItem(item)}
                className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-6 border border-border group overflow-hidden cursor-pointer hover:border-gold/30 transition-colors"
              >
                 <div className="aspect-square rounded-[1.2rem] md:rounded-[2rem] bg-foreground/5 mb-4 md:mb-6 overflow-hidden relative">
                    <img src={item.image || '/photos/dish1.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-background/90 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl text-gold font-black text-[10px] md:text-sm">{item.price}€</div>
                 </div>
                 <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-lg font-black text-foreground tracking-tight line-clamp-1">{item.name[locale] || item.name['fr']}</h3>
                    <p className="text-foreground/40 text-[9px] md:text-xs italic line-clamp-2 hidden sm:block">{item.description[locale] || item.description['fr']}</p>
                    <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-border">
                       <div className="flex items-center gap-1 md:gap-1.5">
                          <Star size={10} className="text-gold fill-current md:w-3.5 md:h-3.5" />
                          <span className="text-[10px] md:text-sm font-black">{item.rating?.toFixed(1) || '4.8'}</span>
                       </div>
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCartClick(item);
                        }} 
                        className="w-8 h-8 md:w-12 md:h-12 bg-gold text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                       >
                          <Plus size={14} className="md:w-5 md:h-5" />
                       </button>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Options Modal */}
      <AnimatePresence>
        {optionItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-2xl rounded-[3rem] border border-border shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                  <div className="flex gap-4">
                     <img src={optionItem.image} className="w-16 h-16 rounded-xl object-cover" />
                     <div>
                        <h3 className="text-xl font-black text-foreground">{optionItem.name[locale] || optionItem.name['fr']}</h3>
                        <p className="text-gold font-black text-sm">{optionItem.price}€</p>
                     </div>
                  </div>
                  <button onClick={() => setOptionItem(null)} className="p-2 hover:rotate-90 transition-all text-foreground/40"><X /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-elegant">
                  {/* Sauces */}
                  {optionItem.sauceSettings?.hasSauces && (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-lg font-black tracking-tight flex items-center gap-2"><Heart size={18} className="text-blue-500" /> Choisissez vos sauces</h4>
                          <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black">{selectedSauces.length} / {optionItem.sauceSettings.maxSauces}</span>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SAUCES.map(s => (
                            <button key={s} onClick={() => toggleSauce(s)} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${selectedSauces.includes(s) ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-foreground/5 border-border text-foreground/40 hover:border-blue-500/30'}`}>
                               {s}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Extras with Counter */}
                  {optionItem.extras?.length > 0 && (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-lg font-black tracking-tight flex items-center gap-2"><Sparkles size={18} className="text-gold" /> Suppléments délicieux</h4>
                          <div className="text-right">
                             <div className="bg-gold/10 text-gold px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {totalExtrasCount} / {optionItem.sauceSettings?.maxExtras || 12} sélectionnés
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          {optionItem.extras.map((ex: any, i: number) => {
                             const currentItem = selectedExtras.find(e => e.name === ex.name);
                             const qty = currentItem?.quantity || 0;
                             const isLimitReached = totalExtrasCount >= (optionItem.sauceSettings?.maxExtras || 12);

                             return (
                               <div key={i} className={`flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border transition-all ${qty > 0 ? 'bg-gold/5 border-gold shadow-sm' : 'bg-background border-border hover:bg-foreground/[0.02]'}`}>
                                  <div className="flex flex-col flex-1 min-w-0 mr-3">
                                     <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-black text-foreground truncate">{ex.name}</span>
                                        {ex.isPopular && (
                                          <span className="text-[7px] sm:text-[8px] font-black uppercase bg-gold text-white px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                             <Star size={8} className="fill-current" /> Popular
                                          </span>
                                        )}
                                     </div>
                                     <span className="text-[10px] sm:text-xs font-black text-gold mt-1">+€{ex.price.toFixed(2)} / unité</span>
                                  </div>

                                  <div className="flex items-center gap-2 sm:gap-4 bg-foreground/5 p-1.5 sm:p-2 rounded-2xl border border-border shrink-0">
                                     <button 
                                      onClick={() => updateExtraQuantity(ex, -1)}
                                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${qty > 0 ? 'bg-white text-gold shadow-sm' : 'text-foreground/20 cursor-not-allowed'}`}
                                      disabled={qty === 0}
                                     >
                                        <Minus size={12} strokeWidth={3} />
                                     </button>
                                     <span className={`text-[12px] sm:text-sm font-black w-4 text-center ${qty > 0 ? 'text-foreground' : 'text-foreground/30'}`}>{qty}</span>
                                     <button 
                                      onClick={() => updateExtraQuantity(ex, 1)}
                                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${!isLimitReached ? 'bg-gold text-white shadow-md' : 'bg-foreground/5 text-foreground/10 cursor-not-allowed'}`}
                                      disabled={isLimitReached}
                                     >
                                        <Plus size={12} strokeWidth={3} />
                                     </button>
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-border flex items-center justify-between bg-foreground/[0.02]">
                  <div>
                     <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Total plat final</p>
                     <p className="text-2xl font-black text-foreground tracking-tighter">
                        {(optionItem.price + selectedExtras.reduce((s, e) => s + (e.price * e.quantity), 0)).toFixed(2)}€
                     </p>
                  </div>
                  <button onClick={confirmAddToCart} className="bg-gold text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-gold/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                     <ShoppingBag size={18} /> Confirmer & Ajouter
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="glass-card w-full max-w-4xl rounded-[2.5rem] md:rounded-[4rem] border border-border shadow-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative"
            >
              {/* Close Button Mobile */}
              <button 
                onClick={() => setDetailItem(null)} 
                className="absolute top-6 right-6 z-50 p-3 bg-background/50 backdrop-blur-md rounded-full text-foreground/60 md:hidden border border-border"
              >
                <X size={20} />
              </button>

              {/* Left: Image Area */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-foreground/5">
                <img 
                  src={detailItem.image || '/photos/dish1.png'} 
                  className="w-full h-full object-cover" 
                  alt={detailItem.name[locale] || detailItem.name['fr']} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:hidden" />
              </div>

              {/* Right: Info Area */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between overflow-y-auto scrollbar-elegant">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-gold font-black tracking-[0.2em] uppercase text-[10px]">{detailItem.category}</span>
                      <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
                        {detailItem.name[locale] || detailItem.name['fr']}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setDetailItem(null)} 
                      className="hidden md:flex p-3 hover:rotate-90 transition-all text-foreground/20 hover:text-gold"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-gold fill-current" />
                      <span className="text-xl font-black">{detailItem.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2 text-emerald-500">
                       <Flame size={18} />
                       <span className="text-sm font-black uppercase tracking-widest">Premium</span>
                    </div>
                  </div>

                  <p className="text-foreground/50 text-lg md:text-xl font-medium leading-relaxed italic">
                    "{detailItem.description[locale] || detailItem.description['fr']}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black uppercase text-foreground/30 mb-1">Calories</p>
                      <p className="font-black text-foreground">~450 kcal</p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black uppercase text-foreground/30 mb-1">Préparation</p>
                      <p className="font-black text-foreground">15-20 min</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-4xl font-black text-foreground tracking-tighter">
                    {detailItem.price.toFixed(2)}€
                  </div>
                  <button 
                    onClick={() => {
                      setDetailItem(null);
                      handleAddToCartClick(detailItem);
                    }} 
                    className="flex-1 w-full bg-gold text-white px-10 py-6 rounded-3xl font-black text-xs uppercase shadow-2xl shadow-gold/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <ShoppingBag size={20} />
                    Ajouter au Panier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
