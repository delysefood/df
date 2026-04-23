'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Plus, Star, Search, ShoppingBag, X, Loader2, Check, Info } from 'lucide-react';
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
  
  // Review Modal States
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Options Modal States
  const [optionItem, setOptionItem] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);

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

  const handleAddToCartClick = (item: any) => {
    const hasExtras = item.extras && item.extras.length > 0;
    const hasSauces = item.sauceSettings?.hasSauces;

    if (hasExtras || hasSauces) {
      setOptionItem(item);
      setSelectedExtras([]);
      setSelectedSauces([]);
    } else {
      // Direct add
      const cartItem: CartItem = {
        cartId: item._id,
        id: item._id,
        name: item.name[locale] || item.name['fr'],
        price: item.price,
        basePrice: item.price,
        quantity: 1,
        image: item.image,
        selectedExtras: [],
        selectedSauces: []
      };
      addToCart(cartItem);
    }
  };

  const confirmAddToCart = () => {
    if (!optionItem) return;

    const extrasTotal = selectedExtras.reduce((sum, ex) => sum + ex.price, 0);
    const finalPrice = optionItem.price + extrasTotal;
    
    // Create a unique cartId based on selections
    const optionsKey = [...selectedExtras.map(e => e.name), ...selectedSauces].sort().join('|');
    const cartId = `${optionItem._id}-${optionsKey}`;

    const cartItem: CartItem = {
      cartId,
      id: optionItem._id,
      name: optionItem.name[locale] || optionItem.name['fr'],
      price: finalPrice,
      basePrice: optionItem.price,
      quantity: 1,
      image: optionItem.image,
      selectedExtras,
      selectedSauces
    };

    addToCart(cartItem);
    setOptionItem(null);
  };

  const toggleExtra = (extra: any) => {
    if (selectedExtras.find(e => e.name === extra.name)) {
      setSelectedExtras(prev => prev.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras(prev => [...prev, extra]);
    }
  };

  const toggleSauce = (sauce: string) => {
    if (selectedSauces.includes(sauce)) {
      setSelectedSauces(prev => prev.filter(s => s !== sauce));
    } else if (selectedSauces.length < (optionItem?.sauceSettings?.maxSauces || 1)) {
      setSelectedSauces(prev => [...prev, sauce]);
    }
  };

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

        {/* Categories Tab Bar */}
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

        {/* Menu Grid */}
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
                    {item.sauceSettings?.hasSauces && (
                      <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
                         <Info size={12} className="text-white" />
                         <span className="text-white font-black text-[8px] uppercase tracking-widest">Sauces incluses</span>
                      </div>
                    )}
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
                         onClick={() => handleAddToCartClick(item)}
                         className="w-12 h-12 bg-foreground text-background dark:bg-gold dark:text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                       >
                         <Plus size={20} strokeWidth={3} />
                       </button>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Options Selection Modal */}
      <AnimatePresence>
        {optionItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="glass-card w-full max-w-2xl rounded-[3rem] border border-border shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                {/* Modal Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border">
                         <img src={optionItem.image || '/photos/dish1.png'} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter">{optionItem.name[locale] || optionItem.name['fr']}</h3>
                        <p className="text-gold font-black text-sm">{optionItem.price}€</p>
                      </div>
                   </div>
                   <button onClick={() => setOptionItem(null)} className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground hover:rotate-90 transition-all">
                      <X size={20} />
                   </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                   
                   {/* Sauces Selection */}
                   {optionItem.sauceSettings?.hasSauces && (
                     <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <div>
                              <h4 className="text-lg font-black text-foreground tracking-tight">Choisissez vos sauces</h4>
                              <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mt-1">Sélectionnez jusqu'à {optionItem.sauceSettings.maxSauces} sauce(s)</p>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedSauces.length === optionItem.sauceSettings.maxSauces ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gold/10 text-gold'}`}>
                              {selectedSauces.length} / {optionItem.sauceSettings.maxSauces}
                           </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {SAUCES.map((sauce) => {
                             const isSelected = selectedSauces.includes(sauce);
                             const isLimitReached = selectedSauces.length >= optionItem.sauceSettings.maxSauces;
                             
                             return (
                               <button
                                 key={sauce}
                                 onClick={() => toggleSauce(sauce)}
                                 disabled={isLimitReached && !isSelected}
                                 className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-2 group ${
                                   isSelected 
                                   ? 'bg-gold border-gold text-white shadow-lg shadow-gold/20' 
                                   : 'bg-foreground/5 border-border text-foreground/40 hover:border-gold/50'
                                 } ${isLimitReached && !isSelected ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                               >
                                  {isSelected && <Check size={14} className="animate-bounce-in" />}
                                  {sauce}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   )}

                   {/* Extras Selection */}
                   {optionItem.extras?.length > 0 && (
                     <div className="space-y-6">
                        <h4 className="text-lg font-black text-foreground tracking-tight border-b border-border pb-4">Suppléments délicieux</h4>
                        <div className="space-y-3">
                           {optionItem.extras.map((extra: any, i: number) => {
                             const isSelected = selectedExtras.find(e => e.name === extra.name);
                             
                             return (
                               <button 
                                 key={i}
                                 onClick={() => toggleExtra(extra)}
                                 className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all group ${
                                   isSelected 
                                   ? 'bg-gold/5 border-gold shadow-sm' 
                                   : 'bg-background border-border hover:bg-foreground/[0.02]'
                                 }`}
                               >
                                  <div className="flex items-center gap-4">
                                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                       isSelected ? 'bg-gold border-gold text-white' : 'border-border group-hover:border-gold/50'
                                     }`}>
                                        {isSelected && <Check size={14} strokeWidth={4} />}
                                     </div>
                                     <span className={`text-sm font-black transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/60'}`}>{extra.name}</span>
                                  </div>
                                  <span className={`text-xs font-black ${isSelected ? 'text-gold' : 'text-foreground/30'}`}>+{extra.price}€</span>
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-foreground/[0.02] border-t border-border flex items-center justify-between">
                   <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Total pour ce plat</p>
                      <p className="text-2xl font-black text-foreground tracking-tighter">
                         {(optionItem.price + selectedExtras.reduce((s, e) => s + e.price, 0)).toFixed(2)}€
                      </p>
                   </div>
                   <button 
                     onClick={confirmAddToCart}
                     className="w-full sm:w-auto bg-gold text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                      <ShoppingBag size={18} />
                      Ajouter au panier
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
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
