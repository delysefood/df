'use client';

import { useState, useEffect } from 'react';
import { Package, Check, X, Loader2, Calendar, ShoppingBag, ArrowLeft, Clock, MapPin, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
       const res = await fetch(`/api/admin/orders/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status })
       });
       if (res.ok) {
         fetchOrders();
       }
    } catch (err) {
       console.error(err);
    } finally {
       setUpdating(null);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette commande ?")) return;
    
    setUpdating(id);
    try {
       const res = await fetch(`/api/admin/orders/${id}`, {
         method: 'DELETE',
       });
       if (res.ok) {
         fetchOrders();
       }
    } catch (err) {
       console.error(err);
    } finally {
       setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-gold" size={48} />
      <p className="text-gold font-serif italic text-lg">Symphonie des commandes en cours...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href={`/${locale}/admin`} className="relative z-50 inline-flex items-center gap-3 text-gold mb-4 cursor-pointer hover:gap-5 transition-all w-fit">
             <ArrowLeft size={24} />
             <span className="text-xs font-black uppercase tracking-widest">Retour Dashboard</span>
          </Link>
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Cuisine & Logistique</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Gestion des <span className="text-gold italic font-serif">Commandes</span></h1>
        </div>
        <div className="flex bg-foreground/5 rounded-2xl p-1.5 border border-border">
           <div className="px-6 py-3 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Toutes</div>
           <div className="px-6 py-3 text-foreground/40 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-gold transition-colors">En cours</div>
           <div className="px-6 py-3 text-foreground/40 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-gold transition-colors">Terminées</div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map((order, i) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group rounded-[2.5rem] border border-border p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Order Identity */}
                <div className="flex items-center gap-8">
                   <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-700">
                      <ShoppingBag size={28} />
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-black text-foreground tracking-tight">#{order._id.slice(-6).toUpperCase()}</h3>
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                           order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                           order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' : 
                           'bg-red-500/10 text-red-500'
                         }`}>
                           {order.status}
                         </span>
                      </div>
                      <p className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">Client: {order.user?.name || 'Inconnu'}</p>
                      <div className="flex items-center gap-4 text-foreground/20 text-[9px] font-bold uppercase tracking-widest mt-2">
                         <span className="flex items-center gap-1"><Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                         <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 max-w-md">
                   <div className="space-y-4">
                      {order.orderType && (
                        <div className="mb-4">
                           <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-2">Mode de Réception</span>
                           <div className="mt-2 text-sm text-foreground font-medium">
                              {order.orderType === 'dine_in' && <span>Sur place (Table: {order.tableNumber})</span>}
                              {order.orderType === 'takeaway' && <span>À emporter</span>}
                              {order.orderType === 'delivery' && (
                                <div className="text-xs space-y-1">
                                  <span className="font-bold text-blue-400">Livraison</span>
                                  <p>{order.deliveryDetails?.firstName} {order.deliveryDetails?.lastName}</p>
                                  <p>{order.deliveryDetails?.address}</p>
                                  <p>{order.deliveryDetails?.phone}</p>
                                  {order.deliveryDetails?.remarks && <p className="text-foreground/50 italic">"{order.deliveryDetails.remarks}"</p>}
                                </div>
                              )}
                           </div>
                        </div>
                      )}
                      <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-2">Détails de la Préparation</p>
                      <div className="space-y-4">
                         {order.items.map((item: any, idx: number) => (
                           <div key={idx} className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <span className="w-6 h-6 rounded-lg bg-gold text-white flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                 <span className="text-sm font-black text-foreground">{item.name}</span>
                              </div>
                              
                              {(item.sauces?.length > 0 || item.extras?.length > 0) && (
                                <div className="ml-9 flex flex-wrap gap-2">
                                   {item.sauces?.map((s: string, i: number) => (
                                     <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase rounded-md border border-blue-500/10">
                                       {s}
                                     </span>
                                   ))}
                                   {item.extras?.map((e: any, i: number) => (
                                     <span key={i} className="px-2 py-0.5 bg-gold/10 text-gold text-[8px] font-black uppercase rounded-md border border-gold/10">
                                       + {e.name} {e.quantity > 1 ? `x${e.quantity}` : ''}
                                     </span>
                                   ))}
                                </div>
                              )}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center gap-8 lg:border-l lg:border-border lg:pl-12">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Total Payé</p>
                      <p className="text-3xl font-black text-foreground tracking-tighter">{order.totalPrice}€</p>
                   </div>
                   
                   <div className="flex gap-3">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <>
                           <button 
                             onClick={() => updateStatus(order._id, 'preparing')}
                             disabled={updating === order._id}
                             className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/30 hover:bg-blue-500 hover:text-white transition-all group/btn"
                             title="Préparer"
                           >
                              <Package size={20} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <button 
                             onClick={() => updateStatus(order._id, 'delivered')}
                             disabled={updating === order._id}
                             className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/30 hover:bg-emerald-500 hover:text-white transition-all group/btn"
                             title="Livré"
                           >
                              <Check size={20} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                        </>
                      )}
                      <button 
                        onClick={() => updateStatus(order._id, 'cancelled')}
                        disabled={updating === order._id}
                        className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/30 hover:bg-red-500 hover:text-white transition-all group/btn"
                        title="Annuler"
                      >
                         <X size={20} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order._id)}
                        disabled={updating === order._id}
                        className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/30 hover:bg-red-600 hover:text-white transition-all group/btn"
                        title="Supprimer définitivement"
                      >
                         <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                   </div>
                </div>
              </div>

              {/* Loading Overlay for Item */}
              {updating === order._id && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
                   <Loader2 className="animate-spin text-gold" size={32} />
                </div>
              )}
            </motion.div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="py-40 text-center space-y-4 glass-card rounded-[3rem] border border-border border-dashed">
               <Package size={48} className="mx-auto text-foreground/10" />
               <p className="text-foreground/40 font-black text-xs uppercase tracking-widest">Aucune commande n'a été passée pour le moment.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
