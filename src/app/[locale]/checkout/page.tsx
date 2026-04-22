'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Loader2, Lock, CheckCircle2 } from 'lucide-react';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Only load stripe if we have a real key (not the placeholder)
const stripePromise =
  PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('REMPLACER')
    ? loadStripe(PUBLISHABLE_KEY)
    : null;

// ─── Inner form component ────────────────────────────────────────────────────
function PaymentForm({ orderId, totalPrice }: { orderId: string; totalPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const locale = useLocale();
  const router = useRouter();
  const { clearCart } = useCart();

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/checkout/success?orderId=${orderId}`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Une erreur est survenue.');
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      clearCart();
      router.push(`/${locale}/checkout/success?orderId=${orderId}&payment_intent=${paymentIntent.id}`);
    } else {
      setError('Paiement non complété. Veuillez réessayer.');
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Stripe PaymentElement with custom dark appearance (set via Elements wrapper) */}
      <div className="rounded-2xl overflow-hidden">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-2xl px-5 py-4"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-gold text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/30 disabled:opacity-50 uppercase tracking-widest text-xs"
      >
        {paying ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            <Lock size={16} />
            <span>Payer {totalPrice.toFixed(2)} €</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-foreground/20 pt-2">
        <ShieldCheck size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest">Paiement 100% sécurisé · Stripe</span>
      </div>
    </form>
  );
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, totalPrice } = useCart();
  const router = useRouter();
  const locale = useLocale();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Prevent double fetch if already loading or secret exists
    if (!loading || clientSecret || cart.length === 0) return;

    let isMounted = true;

    fetch('/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, totalPrice }),
    })
      .then((r) => {
        if (r.status === 401) { 
          if (isMounted) { setAuthError(true); setLoading(false); }
          return null; 
        }
        return r.json();
      })
      .then((data) => {
        if (!data || !isMounted) return;
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [cart, totalPrice, loading, clientSecret]); 

  // Stripe Elements appearance — matches the dark premium design
  const appearance: any = {
    theme: 'night',
    variables: {
      colorPrimary: '#F59E0B',
      colorBackground: 'rgba(255,255,255,0.04)',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '16px',
      spacingUnit: '5px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#ffffff',
        padding: '14px 18px',
      },
      '.Input:focus': {
        border: '1px solid #F59E0B',
        boxShadow: '0 0 0 2px rgba(245,158,11,0.2)',
      },
      '.Label': {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
      '.Tab': {
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.6)',
      },
      '.Tab--selected': {
        backgroundColor: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.4)',
        color: '#F59E0B',
      },
      '.Error': {
        color: '#ef4444',
      },
    },
  };

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen relative overflow-hidden">
      {/* Bg glows */}
      <div className="absolute top-0 left-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 space-y-4">
          <Link href="/cart" className="inline-flex items-center gap-2 text-foreground/40 hover:text-gold transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Retour au panier
          </Link>
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Étape finale</span>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
            Paiement <span className="text-gold italic font-serif">Sécurisé</span>
          </h1>
        </header>

        {authError && (
          <div className="glass-card rounded-[2rem] p-8 border border-red-500/20 text-center space-y-4">
            <p className="text-foreground font-bold">Vous devez être connecté pour payer.</p>
            <Link href="/auth/signin">
              <button className="bg-gold text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">
                Se connecter
              </button>
            </Link>
          </div>
        )}

        {/* Missing publishable key warning */}
        {!stripePromise && !authError && (
          <div className="glass-card rounded-[2rem] p-8 border border-yellow-500/20 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto text-yellow-500">
              <Lock size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">Configuration Stripe manquante</h2>
              <p className="text-foreground/50 text-sm font-medium">
                La clé publiable Stripe (<code className="text-gold">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>) n&apos;est pas configurée dans <code className="text-gold">.env.local</code>.
              </p>
              <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mt-2">
                Obtenez-la sur dashboard.stripe.com → Développeurs → Clés API
              </p>
            </div>
          </div>
        )}

        {loading && !authError && stripePromise && (
          <div className="flex items-center justify-center py-32 gap-4 text-foreground/40">
            <Loader2 size={28} className="animate-spin text-gold" />
            <span className="font-black uppercase tracking-widest text-xs">Initialisation du paiement…</span>
          </div>
        )}

        {clientSecret && orderId && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            {/* Left — Order summary */}
            <div className="glass-card rounded-[2.5rem] p-10 border border-border space-y-8">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight mb-1">Votre commande</h2>
                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                  {cart.length} article{cart.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0">
                      <img src={item.image || '/photos/dish1.png'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-black text-sm truncate">{item.name}</p>
                      <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">x{item.quantity}</p>
                    </div>
                    <span className="text-gold font-black text-sm shrink-0">{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm font-bold text-foreground/40">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground/40">
                  <span>Livraison</span>
                  <span className="text-gold">Gratuit</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-black text-foreground uppercase tracking-widest text-sm">Total</span>
                  <span className="text-3xl font-black text-gold">{totalPrice.toFixed(2)}€</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Lock, label: 'SSL Sécurisé' },
                  { icon: ShieldCheck, label: '3D Secure' },
                  { icon: CheckCircle2, label: 'Crypté' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-foreground/30">
                    <Icon size={18} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Payment form */}
            <div className="glass-card rounded-[2.5rem] p-10 border border-border space-y-8">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight mb-1">Informations de paiement</h2>
                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                  Vos données sont chiffrées
                </p>
              </div>

              <Elements 
                key={clientSecret} 
                stripe={stripePromise} 
                options={{ clientSecret, appearance, locale: locale as any }}
              >
                <PaymentForm orderId={orderId} totalPrice={totalPrice} />
              </Elements>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
