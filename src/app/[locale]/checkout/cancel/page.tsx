'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CheckoutCancelPage() {
  return (
    <div className="pt-40 pb-24 px-6 md:px-12 bg-background min-h-screen flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8 p-12 glass-card rounded-[2.5rem] border border-border max-w-lg w-full relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -z-10" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-red-500"
        >
          <XCircle size={48} />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Paiement Annulé
          </h1>
          <p className="text-foreground/60 font-medium leading-relaxed">
            Votre paiement a été annulé. Votre panier est toujours disponible — vous pouvez reprendre votre commande à tout moment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link href="/cart" className="flex-1">
            <button className="w-full bg-gold text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 uppercase tracking-widest text-xs">
              <ShoppingBag size={16} />
              <span>Retour au panier</span>
            </button>
          </Link>

          <Link href="/menu" className="flex-1">
            <button className="w-full bg-foreground/5 border border-border text-foreground font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:border-gold hover:text-gold transition-all uppercase tracking-widest text-xs">
              <ArrowLeft size={16} />
              <span>Voir le menu</span>
            </button>
          </Link>
        </div>

        <p className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
          Aucun montant n&apos;a été débité
        </p>
      </motion.div>
    </div>
  );
}
