'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ClipboardList, XCircle, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';

type VerifyState = 'loading' | 'paid' | 'failed';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId       = searchParams.get('orderId');
  const sessionId     = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');

  const [state, setState] = useState<VerifyState>('loading');
  const [shortId, setShortId] = useState('');
  
  // New state for preferences
  const [prefState, setPrefState] = useState<'choosing' | 'submitting' | 'done'>('choosing');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: '', lastName: '', address: '', phone: '', remarks: ''
  });

  useEffect(() => {
    if (!orderId || (!sessionId && !paymentIntent)) {
      setState('failed');
      return;
    }

    setShortId(orderId.slice(-6).toUpperCase());

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

  const submitPreferences = async () => {
    setPrefState('submitting');
    try {
      const res = await fetch(`/api/orders/${orderId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
          deliveryDetails: orderType === 'delivery' ? deliveryDetails : undefined
        }),
      });
      if (res.ok) setPrefState('done');
      else setPrefState('choosing'); // handle error gracefully
    } catch (e) {
      console.error(e);
      setPrefState('choosing');
    }
  };

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
            Votre paiement a été confirmé.
          </p>
        </motion.div>

        {prefState !== 'done' ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6 text-left border-t border-border pt-6"
          >
            <h2 className="text-xl font-black text-foreground text-center">Comment souhaitez-vous recevoir votre commande ?</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setOrderType('dine_in')} className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${orderType === 'dine_in' ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-foreground/5 text-foreground/50'}`}>Sur Place</button>
              <button onClick={() => setOrderType('takeaway')} className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${orderType === 'takeaway' ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-foreground/5 text-foreground/50'}`}>À emporter</button>
              <button onClick={() => setOrderType('delivery')} className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${orderType === 'delivery' ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-foreground/5 text-foreground/50'}`}>Livraison</button>
            </div>

            {orderType === 'dine_in' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Numéro de table</label>
                <input type="text" placeholder="Ex: 12" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
              </div>
            )}

            {orderType === 'delivery' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Prénom" value={deliveryDetails.firstName} onChange={e => setDeliveryDetails({...deliveryDetails, firstName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                  <input type="text" placeholder="Nom" value={deliveryDetails.lastName} onChange={e => setDeliveryDetails({...deliveryDetails, lastName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                </div>
                <input type="text" placeholder="Adresse complète" value={deliveryDetails.address} onChange={e => setDeliveryDetails({...deliveryDetails, address: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                <input type="tel" placeholder="Numéro de téléphone" value={deliveryDetails.phone} onChange={e => setDeliveryDetails({...deliveryDetails, phone: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                <textarea placeholder="Remarque (facultatif)" value={deliveryDetails.remarks} onChange={e => setDeliveryDetails({...deliveryDetails, remarks: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none min-h-[80px]" />
              </div>
            )}

            <button 
              onClick={submitPreferences}
              disabled={!orderType || prefState === 'submitting' || (orderType === 'dine_in' && !tableNumber) || (orderType === 'delivery' && (!deliveryDetails.firstName || !deliveryDetails.address || !deliveryDetails.phone))}
              className="w-full bg-gold text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {prefState === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : "Confirmer"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {shortId && (
              <div className="bg-foreground/5 border border-border rounded-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-foreground/50">
                  <ClipboardList size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Référence</span>
                </div>
                <span className="font-black text-foreground tracking-widest text-sm">#{shortId}</span>
              </div>
            )}

            {orderId && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl mx-auto w-fit">
                <p className="text-black font-black uppercase text-[10px] mb-4">Code Serveur</p>
                <QRCode value={orderId} size={150} />
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <Link href="/" className="block">
                <button className="w-full bg-gold text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 uppercase tracking-widest text-xs">
                  <span>Retour à l&apos;accueil</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
