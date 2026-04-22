'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ChevronLeft, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  Loader2,
  DollarSign,
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const stats = await res.json();
      setData(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-gold">
      <Loader2 className="animate-spin" size={48} />
      <p className="font-serif italic text-lg opacity-80">Extraction des pépites financières...</p>
    </div>
  );

  const getMonthName = (monthNum: number) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    return months[monthNum - 1];
  };

  const displayedStats = data?.[activeTab] || [];
  const maxTotal = Math.max(...displayedStats.map((s: any) => s.total), 1);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href={`/${locale}/admin`} className="relative z-50 inline-flex items-center gap-3 text-gold mb-4 cursor-pointer hover:gap-5 transition-all w-fit">
            <ArrowLeft size={24} />
            <span className="text-xs font-black uppercase tracking-widest">Retour Dashboard</span>
          </Link>
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Analyse de Performance</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Chiffre <span className="text-gold italic font-serif">d&apos;Affaires</span></h1>
        </div>
        
        <div className="flex bg-foreground/5 rounded-2xl p-1.5 border border-border">
          {['daily', 'weekly', 'monthly', 'yearly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-foreground/40 hover:text-gold'
              }`}
            >
              {tab === 'daily' ? 'Journalier' : tab === 'weekly' ? 'Semaine' : tab === 'monthly' ? 'Mensuel' : 'Annuel'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card rounded-[3rem] p-12 border border-border">
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                  <BarChart3 size={20} />
               </div>
               <h2 className="text-2xl font-black text-foreground tracking-tight">Courbe de Croissance</h2>
            </div>
          </div>

          <div className="h-[400px] flex items-end gap-3 lg:gap-6 relative">
            {/* Y Axis Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
               {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-foreground w-full h-0" />)}
            </div>

            {displayedStats.map((stat: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative flex items-end justify-center">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${(stat.total / maxTotal) * 100}%` }}
                     transition={{ duration: 1, delay: i * 0.05 }}
                     className="w-full max-w-[40px] bg-gold/20 rounded-t-xl group-hover:bg-gold transition-all duration-500 relative"
                   >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-background border border-border px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none">
                         <p className="text-[10px] font-black text-gold">{stat.total}€</p>
                      </div>
                   </motion.div>
                </div>
                <span className="text-[10px] font-black text-foreground/20 group-hover:text-gold uppercase tracking-tighter">
                  {activeTab === 'daily' ? stat._id.split('-')[2] : 
                   activeTab === 'weekly' ? `S${stat._id}` :
                   activeTab === 'monthly' ? getMonthName(stat._id) : 
                   stat._id}
                </span>
              </div>
            ))}

            {displayedStats.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-foreground/20 italic font-medium">
                 Aucune donnée disponible pour cette période.
              </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-8">
           <div className="glass-card rounded-[3rem] p-10 border border-border flex flex-col justify-between">
              <div className="space-y-6">
                 <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-gold">
                    <TrendingUp size={24} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Performance Totale</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">
                      {displayedStats.reduce((acc: number, cur: any) => acc + cur.total, 0).toLocaleString()}€
                    </h3>
                 </div>
              </div>
              
            <div className="mt-12 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-foreground/30">Moyenne / {
                  activeTab === 'daily' ? 'jour' : 
                  activeTab === 'weekly' ? 'semaine' : 
                  activeTab === 'monthly' ? 'mois' : 'an'
                }</span>
                <span className="text-gold">
                  {Math.round(displayedStats.reduce((acc: number, cur: any) => acc + cur.total, 0) / (displayedStats.length || 1))}€
                </span>
              </div>
              <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-gold"
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] p-10 border border-border">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-widest mb-8">Tableau de Bord</h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {displayedStats.slice().reverse().map((stat: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-foreground">
                      {activeTab === 'daily' ? stat._id : 
                       activeTab === 'weekly' ? `Semaine ${stat._id}` : 
                       activeTab === 'monthly' ? `Mois ${getMonthName(stat._id)}` : 
                       `Année ${stat._id}`}
                    </p>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{stat.count} Commandes</p>
                  </div>
                  <p className="text-sm font-black text-gold">{stat.total.toLocaleString()}€</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
