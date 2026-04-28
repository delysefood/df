'use client';

import { useState, useEffect } from 'react';
import { Package, Check, X, Loader2, Calendar, ShoppingBag, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SingleOrderPage() {
  const router = useRouter();
  const { locale, id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          alert("Commande introuvable. Elle a peut-être été supprimée ou l'ID est invalide.");
          router.push(`/${locale}/admin/scanner`);
        }
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
       const res = await fetch(`/api/admin/orders/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status })
       });
       if (res.ok) {
         fetchOrder();
       }
    } catch (err) {
       console.error(err);
    } finally {
       setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-gold" size={48} />
      <p className="text-gold font-serif italic text-lg">Chargement de la commande...</p>
    </div>
  );

  if (!order) return null;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <header className="flex flex-col gap-6">
        <Link href={`/${locale}/admin/scanner`} className="relative z-50 inline-flex items-center gap-3 text-gold mb-4 cursor-pointer hover:gap-5 transition-all w-fit">
           <ArrowLeft size={24} />
           <span className="text-xs font-black uppercase tracking-widest">Retour au Scanner</span>
        </Link>
        <h1 className="text-5xl font-black text-foreground tracking-tighter">Détails <span className="text-gold italic font-serif">Commande</span></h1>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] border border-border p-10 relative overflow-hidden space-y-12"
      >
        <div className="flex flex-col lg:flex-row justify-between gap-8 border-b border-border pb-8">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-[2rem] bg-gold flex items-center justify-center text-white shadow-xl shadow-gold/20">
                <ShoppingBag size={28} />
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-4">
                   <h3 className="text-3xl font-black text-foreground tracking-tight">#{order._id.slice(-6).toUpperCase()}</h3>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                     order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                     order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' : 
                     'bg-red-500/10 text-red-500'
                   }`}>
                     {order.status}
                   </span>
                </div>
                <p className="text-foreground/40 font-black text-xs uppercase tracking-widest">Client: {order.user?.name || 'Inconnu'}</p>
             </div>
          </div>
          
          <div className="flex flex-col justify-center text-right">
             <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">Montant Payé</p>
             <p className="text-5xl font-black text-foreground tracking-tighter">{order.totalPrice}€</p>
          </div>
        </div>

        {order.orderType && (
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-[0.2em] mb-4">Mode de Réception</p>
            <div className="bg-foreground/5 rounded-2xl p-6">
              {order.orderType === 'dine_in' && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                    T{order.tableNumber}
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">Sur Place</p>
                    <p className="text-foreground/50 text-xs">Table {order.tableNumber}</p>
                  </div>
                </div>
              )}
              {order.orderType === 'takeaway' && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Package size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">À emporter</p>
                  </div>
                </div>
              )}
              {order.orderType === 'delivery' && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-foreground mb-1">Livraison</p>
                    <p className="text-foreground/80 text-sm font-medium">{order.deliveryDetails?.firstName} {order.deliveryDetails?.lastName}</p>
                    <p className="text-foreground/60 text-xs">{order.deliveryDetails?.address}</p>
                    <p className="text-foreground/60 text-xs">{order.deliveryDetails?.phone}</p>
                    {order.deliveryDetails?.remarks && (
                      <p className="text-foreground/50 text-xs italic mt-2">"{order.deliveryDetails.remarks}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
           <p className="text-xs font-black text-gold uppercase tracking-[0.2em] mb-6">Contenu de la Commande</p>
           <div className="space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-foreground/5 rounded-2xl p-6">
                   <div className="flex items-center gap-4 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-gold text-white flex items-center justify-center text-sm font-black">{item.quantity}</span>
                      <span className="text-xl font-black text-foreground">{item.name}</span>
                   </div>
                   
                   {(item.sauces?.length > 0 || item.extras?.length > 0) && (
                     <div className="ml-12 flex flex-wrap gap-2">
                        {item.sauces?.map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase rounded-lg border border-blue-500/10">
                            {s}
                          </span>
                        ))}
                        {item.extras?.map((e: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase rounded-lg border border-gold/10">
                            + {e.name} {e.quantity > 1 ? `x${e.quantity}` : ''}
                          </span>
                        ))}
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-8 border-t border-border">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <>
               <button 
                 onClick={() => updateStatus('preparing')}
                 disabled={updating}
                 className="flex-1 bg-blue-500 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs disabled:opacity-50"
               >
                  <Package size={18} />
                  <span>En Préparation</span>
               </button>
               <button 
                 onClick={() => updateStatus('delivered')}
                 disabled={updating}
                 className="flex-1 bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs disabled:opacity-50"
               >
                  <Check size={18} />
                  <span>Livrée</span>
               </button>
            </>
          )}
        </div>

        {updating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
             <Loader2 className="animate-spin text-gold" size={48} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
