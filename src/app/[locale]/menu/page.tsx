'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Plus, Star, Search, ShoppingBag, X, Loader2, Check, Info, Flame } from 'lucide-react';
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
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
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
    const extrasTotal = selectedExtras.reduce((sum, ex) => sum + ex.price, 0);
    const finalPrice = optionItem.price + extrasTotal;
    const optionsKey = [...selectedExtras.map(e => e.name), ...selectedSauces].sort().join('|');
    const cartId = `${optionItem._id}-${optionsKey}`;

    addToCart({
      cartId, id: optionItem._id, name: optionItem.name[locale] || optionItem.name['fr'],
      price: finalPrice, basePrice: optionItem.price, quantity: 1, image: optionItem.image,
      selectedExtras, selectedSauces
    });
    setOptionItem(null);
  };

  const toggleExtra = (extra: any) => {
    const isSelected = selectedExtras.find(e => e.name === extra.name);
    const max = optionItem.sauceSettings?.maxExtras || 12;

    if (isSelected) {
      setSelectedExtras(prev => prev.filter(e => e.name !== extra.name));
    } else if (selectedExtras.length < max) {
      setSelectedExtras(prev => [...prev, extra]);
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

  if (loading) return <div className="pt-60 text-center min-vh-screen"><Loader2 className="animate-spin text-gold mx-auto" size={48} /></div>;

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20 space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">{t('subtitle')}</span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Nos <span className="text-gold italic font-serif">Délices</span></h1>
        </header>

        {/* Categories */}
        <div className="flex justify-center mb-16 gap-4 border-b border-border pb-8">
           {['all', 'starter', 'main', 'dessert', 'drink'].map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeCategory === cat ? 'bg-gold text-white' : 'text-foreground/40 hover:text-gold'
               }`}
             >
               {cat === 'all' ? 'Tous' : t(cat + 's')}
             </button>
           ))}
        </div>

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
               <div className="p-8 border-b border-border flex justify-between items-center">
                  <div className="flex gap-4">
                     <img src={optionItem.image} className="w-16 h-16 rounded-xl object-cover" />
                     <div>
                        <h3 className="text-xl font-black text-foreground">{optionItem.name[locale] || optionItem.name['fr']}</h3>
                        <p className="text-gold font-black text-sm">{optionItem.price}€</p>
                     </div>
                  </div>
                  <button onClick={() => setOptionItem(null)} className="p-2 hover:rotate-90 transition-all"><X /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-12">
                  {/* Sauces */}
                  {optionItem.sauceSettings?.hasSauces && (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-lg font-black tracking-tight">Choisissez vos sauces</h4>
                          <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black">{selectedSauces.length} / {optionItem.sauceSettings.maxSauces}</span>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SAUCES.map(s => (
                            <button key={s} onClick={() => toggleSauce(s)} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${selectedSauces.includes(s) ? 'bg-blue-500 border-blue-500 text-white' : 'bg-foreground/5 border-border text-foreground/40'}`}>
                               {s}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Extras */}
                  {optionItem.extras?.length > 0 && (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-lg font-black tracking-tight">Suppléments délicieux</h4>
                          <span className="bg-gold/10 text-gold px-3 py-1 rounded-lg text-[10px] font-black">Max {optionItem.sauceSettings?.maxExtras || 12}</span>
                       </div>
                       <div className="space-y-3">
                          {optionItem.extras.map((ex: any, i: number) => (
                            <button 
                              key={i} 
                              onClick={() => toggleExtra(ex)}
                              className={`w-full p-6 rounded-[2rem] border flex items-center justify-between transition-all relative overflow-hidden group ${
                                selectedExtras.find(e => e.name === ex.name) ? 'bg-gold border-gold text-white' : 'bg-background border-border hover:bg-foreground/5'
                              }`}
                            >
                               <div className="flex items-center gap-4">
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedExtras.find(e => e.name === ex.name) ? 'bg-white border-white text-gold' : 'border-border'}`}>
                                     {selectedExtras.find(e => e.name === ex.name) && <Check size={14} strokeWidth={4} />}
                                  </div>
                                  <div className="text-left">
                                     <span className="text-sm font-black block">{ex.name}</span>
                                     {ex.isPopular && (
                                       <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-white px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-1 group-hover:bg-gold group-hover:text-white transition-colors">
                                          <Flame size={10} className="fill-current" /> Popular
                                       </span>
                                     )}
                                  </div>
                               </div>
                               <span className={`text-xs font-black ${selectedExtras.find(e => e.name === ex.name) ? 'text-white' : 'text-gold'}`}>+€{ex.price.toFixed(2)}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-border flex items-center justify-between bg-foreground/[0.02]">
                  <div>
                     <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Total plat</p>
                     <p className="text-2xl font-black">{(optionItem.price + selectedExtras.reduce((s, e) => s + e.price, 0)).toFixed(2)}€</p>
                  </div>
                  <button onClick={confirmAddToCart} className="bg-gold text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-gold/20 flex items-center gap-3">
                     <ShoppingBag size={18} /> Ajouter au panier
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
