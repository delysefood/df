'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ClipboardList, XCircle, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type VerifyState = 'loading' | 'paid' | 'failed';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId       = searchParams.get('orderId');
  const sessionId     = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');

  const [state, setState] = useState<VerifyState>('loading');
  const [shortId, setShortId] = useState('');

  useEffect(() => {
    if (!orderId || (!sessionId && !paymentIntent)) {
      setState('failed');
      return;
    }

    setShortId(orderId.slice(-8).toUpperCase());

    // Verify payment server-side
    const verifyUrl = sessionId 
      ? `/api/checkout/verify?session_id=${sessionId}&orderId=${orderId}`
      : `/api/checkout/verify?payment_intent=${paymentIntent}&orderId=${orderId}`;

    fetch(verifyUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          clearCart();
          setState('paid');
        } else {
          setState('failed');
        }
      })
      .catch(() => setState('failed'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ───── Loading ───── */
  if (state === 'loading') {
    return (
      <div className="pt-40 pb-24 px-6 min-h-screen flex items-center justify-center text-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 glass-card rounded-[2.5rem] border border-border p-12 max-w-md w-full"
        >
          <Loader2 size={48} className="animate-spin text-gold mx-auto" />
          <p className="text-foreground/60 font-black uppercase tracking-widest text-xs">
            Vérification du paiement…
          </p>
        </motion.div>
      </div>
    );
  }

  /* ───── Failed ───── */
  if (state === 'failed') {
    return (
      <div className="pt-40 pb-24 px-6 min-h-screen flex items-center justify-center text-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 glass-card rounded-[2.5rem] border border-border p-12 max-w-md w-full"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-red-500">
            <XCircle size={48} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-foreground">Paiement non confirmé</h1>
            <p className="text-foreground/60 font-medium">
              Votre paiement n&apos;a pas pu être vérifié. Aucun montant n&apos;a été débité.
            </p>
          </div>
          <Link href="/cart">
            <button className="w-full bg-gold text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-gold/20 shadow-lg">
              Retour au panier
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ───── Paid ───── */
  return (
    <div className="pt-40 pb-24 px-6 min-h-screen flex items-center justify-center text-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-8 p-12 glass-card rounded-[2.5rem] border border-border max-w-lg w-full relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/10 blur-[80px] rounded-full -z-10" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-green-500"
        >
          <CheckCircle2 size={48} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Paiement Réussi !
          </h1>
          <p className="text-foreground/60 font-medium leading-relaxed">
            Votre paiement a été confirmé. Notre équipe prépare votre commande avec soin.
          </p>
        </motion.div>

        {shortId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-foreground/5 border border-border rounded-2xl px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-foreground/50">
              <ClipboardList size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Référence commande</span>
            </div>
            <span className="font-black text-foreground tracking-widest text-sm">#{shortId}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4 pt-2"
        >
          <Link href="/" className="block">
            <button className="w-full bg-gold text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 uppercase tracking-widest text-xs">
              <span>Retour à l&apos;accueil</span>
              <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/menu" className="block text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-gold transition-colors">
            Commander à nouveau
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
