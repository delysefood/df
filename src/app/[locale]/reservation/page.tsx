'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, User, MessageSquare, Utensils, Leaf, Check } from 'lucide-react';

export default function ReservationPage() {
  const t = useTranslations('Reservation');
  const [settings, setSettings] = useState<any>(null);

  // States for form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [message, setMessage] = useState('');
  
  // States for flow
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Could not load settings:", err));
  }, []);

  const handleSearchTables = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tables/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests })
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableTables(data);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests, table: selectedTable, specialRequests: message })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        alert(err.message || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-32 px-6 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
           <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check size={48} />
           </div>
           <h2 className="text-4xl font-black text-foreground">Réservation Confirmée !</h2>
           <p className="text-foreground/60">
             Votre réservation a bien été enregistrée pour le {new Date(date).toLocaleDateString()} à {time}. 
             Notre équipe la validera très rapidement.
           </p>
           <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-gold text-white rounded-xl font-bold uppercase tracking-widest text-xs mt-4 hover:scale-105 transition-transform">
              Retour à l'accueil
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-6 md:px-12 bg-background min-h-screen relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-gold/5 blur-3xl -z-10" />
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[10%] right-[10%] text-gold opacity-10 hidden lg:block"
      >
        <Leaf size={120} />
      </motion.div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="text-center mb-20 space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">{t('subtitle')}</span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
            {t('pageTitle').split(/(\*.*?\*)/g).map((part, i) => {
              const isHighlight = part.startsWith('*') && part.endsWith('*');
              return isHighlight ? (
                <span key={i} className="text-gold italic font-serif">{part.slice(1, -1)}</span>
              ) : (
                part
              );
            })}
          </h1>
          <p className="text-foreground/40 font-bold max-w-xl mx-auto text-sm leading-relaxed italic">
            "{t('pageDescription')}"
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-8 md:p-16 border border-border shadow-3xl relative"
        >
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-gold rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-gold/20 -rotate-12 hidden md:flex">
             <Utensils size={32} />
          </div>

          <form onSubmit={step === 1 ? handleSearchTables : handleConfirmReservation} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2 flex items-center gap-2">
                   <Calendar size={12} /> {t('date')}
                </label>
                <input 
                  type="date" 
                  value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none" 
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2 flex items-center gap-2">
                   <Clock size={12} /> {t('time')}
                </label>
                <input 
                  type="time" 
                  value={time} onChange={e => setTime(e.target.value)}
                  className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none" 
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2 flex items-center gap-2">
                   <Users size={12} /> {t('guests')}
                </label>
                <select 
                  value={guests} onChange={e => setGuests(e.target.value)}
                  className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="1">1 {t('person')}</option>
                  <option value="2">2 {t('persons')}</option>
                  <option value="4">4 {t('persons')}</option>
                  <option value="6">6 {t('persons')}</option>
                  <option value="8">8 {t('persons')}</option>
                  <option value="10">10 {t('persons')}</option>
                </select>
              </div>
            </div>

            {step === 1 && (
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gold text-white font-black py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gold/20 uppercase tracking-[0.3em] text-xs disabled:opacity-50"
              >
                {loading ? 'Recherche...' : 'Rechercher une Table Disponible'}
              </button>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, h: 0 }} animate={{ opacity: 1, h: "auto" }} className="space-y-12 border-t border-border pt-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground text-center mb-6">Choisissez votre table</h3>
                  {availableTables.length === 0 ? (
                    <p className="text-center text-red-500 font-bold p-6 bg-red-500/5 rounded-2xl">Aucune table disponible pour ces critères. Veuillez modifier la date ou l'heure.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {availableTables.map(t => (
                        <div 
                          key={t._id} 
                          onClick={() => setSelectedTable(t._id)}
                          className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center transition-all ${selectedTable === t._id ? 'border-gold bg-gold/10' : 'border-border hover:border-gold/30 bg-foreground/[0.02]'}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-2 font-black">{t.capacity}</div>
                          <span className="font-bold text-sm text-foreground">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTable && (
                  <div className="space-y-12">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2 flex items-center gap-2">
                         <MessageSquare size={12} /> {t('message') || 'Requêtes Spéciales'}
                      </label>
                      <textarea 
                        rows={4} 
                        value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Allergies, anniversaire..."
                        className="w-full bg-foreground/5 border-none rounded-[2rem] px-8 py-6 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gold text-white font-black py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gold/20 uppercase tracking-[0.3em] text-xs disabled:opacity-50"
                    >
                      {loading ? "Confirmation..." : t('confirmButton')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </form>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 space-y-3">
               <h4 className="text-gold font-black uppercase tracking-widest text-[10px]">{t('callUs')}</h4>
               <a 
                 href={`https://wa.me/${(settings?.footer?.phone || "+33 1 23 45 67 89").replace(/[^0-9]/g, '')}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-foreground font-black text-lg tracking-tighter hover:text-green-500 transition-colors block"
               >
                 {settings?.footer?.phone || "+33 1 23 45 67 89"}
               </a>
            </div>
            <div className="p-8 border-x border-border space-y-3">
               <h4 className="text-gold font-black uppercase tracking-widest text-[10px]">{t('emailLabel')}</h4>
               <a 
                 href={`mailto:${settings?.footer?.email || "reserver@delysefood.com"}`}
                 className="text-foreground font-black text-lg tracking-tighter hover:text-gold transition-colors block"
               >
                 {settings?.footer?.email || "reserver@delysefood.com"}
               </a>
            </div>
            <div className="p-8 space-y-3">
               <h4 className="text-gold font-black uppercase tracking-widest text-[10px]">{t('locationLabel')}</h4>
               <a 
                 href={`https://maps.google.com/?q=${encodeURIComponent(settings?.footer?.address || t('locationText'))}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-foreground font-black text-lg tracking-tighter hover:text-blue-500 transition-colors block"
               >
                 {settings?.footer?.address || t('locationText')}
               </a>
            </div>
        </div>
      </div>
    </div>
  );
}
