'use client';

import { useState, useEffect } from 'react';
import { Check, X, Calendar, Trash2 } from 'lucide-react';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      });
  }, []);

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

  return (
    <div>
      <h1 className="text-3xl font-serif text-foreground mb-8">Réservations</h1>

      <div className="bg-foreground/5 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 text-gold uppercase text-xs tracking-widest">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Date & Heure</th>
              <th className="px-6 py-4">Personnes</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reservations.map((res) => (
              <tr key={res._id} className="hover:bg-foreground/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-foreground font-bold">{res.user?.name}</div>
                  <div className="text-foreground/50 text-xs">{res.user?.email}</div>
                </td>
                <td className="px-6 py-4 text-foreground/60">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gold" />
                    {new Date(res.date).toLocaleDateString()} à {res.time}
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground font-black">{res.guests} pers.</td>
                <td className="px-6 py-4 text-gold font-bold">
                  {res.table ? res.table.name : 'Non assignée'}
                </td>
                <td className="px-6 py-4">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                    res.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    {res.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(res._id, 'confirmed')} className="w-8 h-8 flex items-center justify-center bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors" title="Confirmer"><Check size={16} /></button>
                        <button onClick={() => updateStatus(res._id, 'cancelled')} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Annuler"><X size={16} /></button>
                      </>
                    )}
                    <button onClick={() => deleteReservation(res._id)} className="w-8 h-8 flex items-center justify-center bg-red-600/10 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Supprimer définitivement"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-foreground/50">Aucune réservation trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
