'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CartPage() {
  const t = useTranslations('Cart');
  const locale = useLocale() as 'en' | 'fr' | 'es' | 'it' | 'ar';
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleCheckout = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    // Navigate to our custom checkout page (Stripe Elements embedded)
    router.push(`/${locale}/checkout`);
  };

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-24 px-6 md:px-12 bg-background min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-24 h-24 bg-foreground/5 rounded-[2rem] flex items-center justify-center mx-auto text-noir/10">
             <ShoppingBag size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight">{t('emptyTitle')}</h1>
            <p className="text-foreground/40 font-bold italic">{t('emptySubtitle')}</p>
          </div>
          <Link href="/menu" className="inline-block">
            <button className="bg-gold text-white font-black py-5 px-10 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 uppercase tracking-widest text-xs">
              {t('discoverMenu')}
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Votre Sélection</span>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">{t('title')}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 border border-border"
                >
                  <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-noir/5 flex-shrink-0">
                    <img src={item.image || '/photos/dish1.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-foreground tracking-tight">{item.name}</h3>
                    <p className="text-gold font-serif text-lg">{item.price}€</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-foreground/5 dark:bg-white/5 rounded-2xl p-2 border border-border">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:text-gold transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-foreground font-black text-lg w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:text-gold transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-12 h-12 flex items-center justify-center text-foreground/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-40 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-10 border border-border space-y-8">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Résumé</h2>
              
              <div className="space-y-4">
                 <div className="flex justify-between text-sm font-bold text-foreground/40 italic">
                    <span>Sous-total</span>
                    <span>{totalPrice}€</span>
                 </div>
                 <div className="flex justify-between text-sm font-bold text-foreground/40 italic">
                    <span>Livraison</span>
                    <span className="text-gold">Gratuit</span>
                 </div>
                 <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-lg font-black text-foreground uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-gold">{totalPrice}€</span>
                 </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gold text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-[10px]">{t('checkoutBtn')}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-foreground/20">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest text-center">Paiement 100% Sécurisé</span>
              </div>
            </div>

            <Link href="/menu" className="block text-center text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-gold transition-colors">
               Continuer vos achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
