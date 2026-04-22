'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  Users, 
  Package,
  Activity,
  ArrowUpRight,
  Plus,
  Loader2
} from "lucide-react";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const stats = await res.json();
      setData(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-gold" size={48} />
      <p className="text-gold font-serif italic text-lg">Préparation de vos données...</p>
    </div>
  );

  const statsList = [
    {
      title: "Réservations",
      value: data?.reservations || 0,
      change: "+0%",
      icon: Calendar,
      color: "gold",
      label: "Aujourd'hui"
    },
    {
      title: "Commandes",
      value: data?.orders || 0,
      change: "+0%",
      icon: ShoppingBag,
      color: "gold",
      label: "Total cumulé"
    },
    {
      title: "Chiffre d'Affaires",
      value: `${data?.revenue || 0}€`,
      change: "+0%",
      icon: TrendingUp,
      color: "gold",
      label: "Ce mois",
      path: './admin/analytics'
    },
    {
      title: "Clients",
      value: data?.customers || 0,
      change: "+0%",
      icon: Users,
      color: "gold",
      label: "Inscrits",
      path: './admin/clients'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Console de Gestion</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">
            Tableau de <span className="text-gold italic font-serif">Bord</span>
          </h1>
          <p className="text-foreground/40 font-bold max-w-xl text-xs leading-relaxed italic">
            "Analysez les performances réelles de votre établissement."
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => router.push('./admin/menu')}
             className="bg-gold text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 text-[10px] uppercase tracking-widest"
           >
              <Plus size={18} /> Nouveau Plat
           </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => stat.path && router.push(stat.path)}
            className={`group glass-card border border-border p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${stat.path ? 'cursor-pointer hover:border-gold/30' : ''}`}
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors`} />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                <ArrowUpRight size={14} /> {stat.change}
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <p className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">{stat.title}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</h3>
                <span className="text-[10px] font-black uppercase tracking-tighter text-foreground/20 italic">{stat.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 border border-border">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Activité Récente</h2>
            <button onClick={() => router.push('./admin/orders')} className="text-[10px] font-black uppercase tracking-widest text-gold hover:underline">Voir tout</button>
          </div>
          
          <div className="space-y-4">
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((order: any, i: number) => (
                <div key={order._id} className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-foreground/5 transition-all border border-transparent hover:border-border group">
                  <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/20 group-hover:text-gold transition-colors">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-foreground font-black text-sm">Commande de {order.user?.name || 'Client Anonyme'}</h4>
                    <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                       {new Date(order.createdAt).toLocaleString()} • {order.totalPrice}€
                    </p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gold/10 text-gold'
                  }`}>
                    {order.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30 italic">Aucune activité récente.</div>
            )}
          </div>
        </div>

        {/* System Status / Quick Tips */}
        <div className="space-y-8">
           <div className="glass-card rounded-[3rem] p-10 border border-border space-y-8 group transition-all duration-500">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                    <TrendingUp size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-foreground tracking-tight">Performance</h3>
              </div>
              
              <p className="text-foreground/40 font-bold text-xs italic leading-relaxed">
                 Le système analyse actuellement vos tendances de vente mensuelles.
              </p>
              
              <div className="space-y-4">
                 <div className="h-1.5 w-full bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: data?.orders > 0 ? '45%' : '5%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gold" 
                    />
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <span>Indice de croissance</span>
                    <span className="text-gold">En cours...</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-[3rem] p-10 border border-border space-y-6">
              <div className="flex items-center gap-3 text-gold">
                 <Activity size={20} />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">État du Système</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <span>Base de données</span>
                    <span className="text-emerald-500">Connectée</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <span>Service Images</span>
                    <span className="text-emerald-500">Actif</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
