'use client';

import { useState, useEffect } from 'react';
import { Check, X, Calendar, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminReservationsPage() {
  const { locale } = useParams();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error("Data is not an array:", data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Supprimer définitivement cette réservation ?")) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-gold" size={48} />
      <p className="text-gold font-serif italic text-lg">Chargement de l'agenda...</p>
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
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Agenda & Tables</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Gestion des <span className="text-gold italic font-serif">Réservations</span></h1>
        </div>
      </header>

      <div className="bg-foreground/5 border border-border rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 text-gold uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-8 py-6">Client</th>
              <th className="px-8 py-6">Date & Heure</th>
              <th className="px-8 py-6">Détails</th>
              <th className="px-8 py-6">Statut</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.isArray(reservations) && reservations.map((res) => (
              <tr key={res._id} className="hover:bg-foreground/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="text-foreground font-black text-sm">{res.user?.name || 'Inconnu'}</div>
                  <div className="text-foreground/40 text-[10px] font-bold uppercase tracking-wide">{res.user?.email}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-foreground/60 text-xs font-bold">
                    <Calendar size={14} className="text-gold" />
                    {new Date(res.date).toLocaleDateString()} <span className="text-gold">à</span> {res.time}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground font-black text-xs">{res.guests} personnes</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-md self-start">
                      Table: {res.table?.name || 'Libre'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    res.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    {res.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(res._id, 'confirmed')} className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10" title="Confirmer"><Check size={18} /></button>
                        <button onClick={() => updateStatus(res._id, 'cancelled')} className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10" title="Annuler"><X size={18} /></button>
                      </>
                    )}
                    <button onClick={() => deleteReservation(res._id)} className="w-10 h-10 flex items-center justify-center bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/10" title="Supprimer définitivement"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="space-y-3 opacity-20">
                    <Calendar size={48} className="mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">Aucune réservation pour le moment</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
