'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Trash2, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const { locale } = useParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur de chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis définitivement ?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href={`/${locale}/admin`} className="relative z-50 inline-flex items-center gap-3 text-gold mb-4 cursor-pointer hover:gap-5 transition-all w-fit">
            <ArrowLeft size={24} />
            <span className="text-xs font-black uppercase tracking-widest">Retour Dashboard</span>
          </Link>
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Modération</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Gestion des <span className="text-gold italic font-serif">Avis</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass-card p-6 rounded-[2rem] border transition-all duration-300 flex flex-col ${
                review.status === 'pending' ? 'border-amber-500/30' :
                review.status === 'approved' ? 'border-green-500/30' :
                'border-red-500/30 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-1 text-gold">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                  {[...Array(5 - review.rating)].map((_, i) => <Star key={i + review.rating} size={16} className="text-gold/20" />)}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  review.status === 'pending' ? 'bg-amber-500/20 text-amber-600' :
                  review.status === 'approved' ? 'bg-green-500/20 text-green-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {review.status === 'pending' ? 'En attente' : review.status === 'approved' ? 'Publié' : 'Rejeté'}
                </span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex flex-col items-center justify-center font-black">
                     {review.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{review.name}</h3>
                    <p className="text-[10px] uppercase text-foreground/40 font-black tracking-widest">{review.role || 'Client'}</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed italic line-clamp-4">"{review.review}"</p>
                <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="flex gap-2 pt-6 mt-auto border-t border-border/50">
                {review.status !== 'approved' && (
                  <button onClick={() => updateStatus(review._id, 'approved')} className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 text-green-600 font-bold text-xs uppercase tracking-wider hover:bg-green-500/20 transition-all">
                    <Check size={16} /> Approuver
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button onClick={() => updateStatus(review._id, 'rejected')} className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-600 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 transition-all">
                    <X size={16} /> Rejeter
                  </button>
                )}
                <button onClick={() => deleteReview(review._id)} className="w-12 h-12 flex shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground/40 hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-30">
               <MessageSquare size={64} className="mb-6" />
               <p className="text-xl font-bold">Aucun avis pour le moment</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
