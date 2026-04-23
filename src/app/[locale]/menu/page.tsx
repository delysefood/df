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

  // Options Modal States
  const [optionItem, setOptionItem] = useState<any>(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {menuItems.filter(i => activeCategory === 'all' || i.category === activeCategory).map((item, idx) => (
              <motion.div key={item._id} className="glass-card rounded-[2.5rem] p-6 border border-border group overflow-hidden">
                 <div className="aspect-square rounded-[2rem] bg-foreground/5 mb-6 overflow-hidden relative">
                    <img src={item.image || '/photos/dish1.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-background/90 px-4 py-2 rounded-xl text-gold font-black text-sm">{item.price}€</div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-foreground tracking-tight">{item.name[locale] || item.name['fr']}</h3>
                    <p className="text-foreground/40 text-xs italic line-clamp-2">{item.description[locale] || item.description['fr']}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                       <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-gold fill-current" />
                          <span className="text-sm font-black">{item.rating?.toFixed(1) || '4.8'}</span>
                       </div>
                       <button onClick={() => handleAddToCartClick(item)} className="w-12 h-12 bg-gold text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                          <Plus size={20} />
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
                               <div key={i} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${qty > 0 ? 'bg-gold/5 border-gold shadow-sm' : 'bg-background border-border hover:bg-foreground/[0.02]'}`}>
                                  <div className="flex flex-col">
                                     <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-foreground">{ex.name}</span>
                                        {ex.isPopular && (
                                          <span className="text-[8px] font-black uppercase bg-gold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                             <Star size={8} className="fill-current" /> Popular
                                          </span>
                                        )}
                                     </div>
                                     <span className="text-xs font-black text-gold mt-1">+€{ex.price.toFixed(2)} / unité</span>
                                  </div>

                                  <div className="flex items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-border">
                                     <button 
                                      onClick={() => updateExtraQuantity(ex, -1)}
                                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${qty > 0 ? 'bg-white text-gold shadow-sm' : 'text-foreground/20 cursor-not-allowed'}`}
                                      disabled={qty === 0}
                                     >
                                        <Minus size={14} strokeWidth={3} />
                                     </button>
                                     <span className={`text-sm font-black w-4 text-center ${qty > 0 ? 'text-foreground' : 'text-foreground/30'}`}>{qty}</span>
                                     <button 
                                      onClick={() => updateExtraQuantity(ex, 1)}
                                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${!isLimitReached ? 'bg-gold text-white shadow-md' : 'bg-foreground/5 text-foreground/10 cursor-not-allowed'}`}
                                      disabled={isLimitReached}
                                     >
                                        <Plus size={14} strokeWidth={3} />
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
    </div>
  );
}
