'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Layout, Info, Phone, Mail, MapPin, Globe, Loader2, CheckCircle } from 'lucide-react';

type LocalizedText = {
  fr: string;
  en: string;
  es: string;
  it: string;
  ar: string;
};

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setSettings({ ...settings, logo: data.secure_url });
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
         setSuccess(true);
         setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: 'title' | 'description', lang: string, value: string) => {
    setSettings({
      ...settings,
      hero: {
        ...settings.hero,
        [field]: {
          ...settings.hero[field],
          [lang]: value
        }
      }
    });
  };

  const updateFooterDesc = (lang: string, value: string) => {
    setSettings({
      ...settings,
      footer: {
        ...settings.footer,
        description: {
          ...settings.footer.description,
          [lang]: value
        }
      }
    });
  };

  const updateFooter = (field: string, value: string) => {
    setSettings({
      ...settings,
      footer: {
        ...settings.footer,
        [field]: value
      }
    });
  };

  if (loading) return (
     <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gold" size={48} />
     </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Configuration Globale</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">
            Gestion du <span className="text-gold italic font-serif">Contenu</span>
          </h1>
          <p className="text-foreground/40 font-bold max-w-xl text-xs leading-relaxed italic">
            "Modifiez les textes de l'accueil, le logo et les informations de contact en un clic."
          </p>
        </div>
        
        <button 
           onClick={handleSave}
           disabled={saving}
           className="bg-gold text-white font-black px-10 py-5 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 text-[10px] uppercase tracking-widest disabled:opacity-50"
        >
           {saving ? <Loader2 className="animate-spin" size={18} /> : (success ? <CheckCircle size={18} /> : <Save size={18} />)}
           {success ? "Enregistré !" : "Sauvegarder les modifications"}
        </button>
      </header>

      {/* Identité Visuelle (Logo) */}
      <section className="glass-card rounded-[3rem] p-10 border border-border">
         <div className="flex items-center gap-4 text-gold mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center"><Layout size={24} /></div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Identité Visuelle</h2>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 rounded-[2.5rem] bg-foreground/5 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group relative">
               {settings?.logo ? (
                 <img src={settings.logo} alt="Logo Preview" className="w-full h-full object-contain p-4" />
               ) : (
                 <div className="text-foreground/20 text-center space-y-2">
                    <CheckCircle className="mx-auto" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aucun Logo</span>
                 </div>
               )}
               {uploadingLogo && (
                 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="animate-spin text-gold" size={32} />
                 </div>
               )}
            </div>

            <div className="space-y-6 flex-1">
               <div className="space-y-2">
                  <h3 className="text-lg font-black text-foreground">Logo Officiel</h3>
                  <p className="text-foreground/40 font-bold text-xs max-w-md italic">
                     "Ce logo sera affiché dans la barre de navigation et le pied de page. Utilisez un format PNG transparent de préférence."
                  </p>
               </div>
               
               <label className="inline-block">
                  <span className="bg-foreground text-background dark:bg-zinc-800 dark:text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-gold transition-all block text-center">
                     Choisir un nouveau logo
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
               </label>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         {/* Hero Configuration */}
         <div className="glass-card rounded-[3rem] p-10 border border-border space-y-10">
            <div className="flex items-center gap-4 text-gold mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center"><Layout size={24} /></div>
               <h2 className="text-2xl font-black text-foreground tracking-tight">Section Accueil (Hero)</h2>
            </div>

            {['fr', 'en', 'es', 'it', 'ar'].map((lang) => (
              <div key={lang} className="space-y-6 p-6 rounded-[2rem] bg-foreground/5 border border-border">
                 <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gold" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Langue : {lang.toUpperCase()}</span>
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2">
                       Titre Principal 
                       <span className="text-foreground/30 normal-case ml-2 font-bold italic">(Entourez un mot de * pour le mettre en doré, ex: *Food*)</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.hero.title[lang]}
                      onChange={(e) => updateHero('title', lang, e.target.value)}
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      className="w-full bg-background border-none rounded-xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2">Description</label>
                    <textarea 
                      rows={3}
                      value={settings.hero.description[lang]}
                      onChange={(e) => updateHero('description', lang, e.target.value)}
                      className="w-full bg-background border-none rounded-xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none"
                    />
                 </div>
              </div>
            ))}
         </div>

         {/* Footer Configuration */}
         <div className="space-y-10">
            <div className="glass-card rounded-[3rem] p-10 border border-border space-y-10">
            <div className="flex items-center gap-4 text-gold mb-2">
               <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center"><Phone size={20} /></div>
               <h2 className="text-2xl font-black text-foreground tracking-tight">Configuration Footer</h2>
            </div>
            
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold border-b border-gold/10 pb-2">Description du Footer</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['fr', 'en', 'es', 'it', 'ar'].map((lang) => (
                    <div key={lang} className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">{lang.toUpperCase()}</label>
                       <textarea 
                         value={settings?.footer?.description?.[lang] || ''}
                         onChange={(e) => updateFooterDesc(lang, e.target.value)}
                         dir={lang === 'ar' ? 'rtl' : 'ltr'}
                         rows={2}
                         className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none"
                       />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold border-b border-gold/10 pb-2">Coordonnées de Contact</h3>
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2 flex items-center gap-2">
                        <MapPin size={14} /> Adresse
                     </label>
                     <input 
                       type="text"
                       value={settings.footer.address}
                       onChange={(e) => updateFooter('address', e.target.value)}
                       className="w-full bg-foreground/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2 flex items-center gap-2">
                        <Phone size={14} /> Téléphone
                     </label>
                     <input 
                       type="text"
                       value={settings.footer.phone}
                       onChange={(e) => updateFooter('phone', e.target.value)}
                       className="w-full bg-foreground/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2 flex items-center gap-2">
                        <Mail size={14} /> Email de Contact
                     </label>
                     <input 
                       type="email"
                       value={settings.footer.email}
                       onChange={(e) => updateFooter('email', e.target.value)}
                       className="w-full bg-foreground/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                     />
                  </div>
               </div>
            </div>

            <div className="glass-card rounded-[3rem] p-8 border border-border flex items-start gap-6 group overflow-hidden relative">
               <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shrink-0">
                  <Info size={24} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight text-foreground">Rappel Important</h3>
                  <p className="text-foreground/40 font-bold text-xs leading-relaxed italic">
                     "Ces modifications impactent directement l'expérience utilisateur. Assurez-vous de la qualité des traductions."
                  </p>
               </div>
            </div>

            {/* Reservation Settings */}
            <div className="glass-card rounded-[3rem] p-10 border border-border space-y-8">
              <div className="flex items-center gap-4 text-gold mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center"><Layout size={20} /></div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Paramètres de Réservation</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    id="reqPayment"
                    checked={settings?.reservationSettings?.requiresPayment || false}
                    onChange={(e) => setSettings({...settings, reservationSettings: {...settings.reservationSettings, requiresPayment: e.target.checked}})}
                    className="w-6 h-6 accent-gold cursor-pointer"
                  />
                  <label htmlFor="reqPayment" className="text-sm font-bold text-foreground cursor-pointer">
                    Exiger un paiement en ligne pour confirmer la réservation
                  </label>
                </div>

                {settings?.reservationSettings?.requiresPayment && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2 flex items-center gap-2">
                      Montant de la réservation (€)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={settings?.reservationSettings?.feeAmount || 0}
                      onChange={(e) => setSettings({...settings, reservationSettings: {...settings.reservationSettings, feeAmount: parseFloat(e.target.value) || 0}})}
                      className="w-full max-w-sm bg-foreground/5 border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
         </div>
      </div>
    </div>
  </div>
  );
}
