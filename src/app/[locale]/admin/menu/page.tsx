'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, Image as ImageIcon, Upload, Camera, ArrowLeft, Heart, Sparkles, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const LANGUAGES = ['fr', 'en', 'es', 'it', 'ar', 'de', 'tr', 'ru'] as const;

export default function AdminMenuPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    name: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
    description: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
    price: '',
    category: 'main',
    image: '',
    rating: 4.8,
    reviewsCount: 124,
    isAvailable: true,
    extras: [],
    sauceSettings: { hasSauces: false, maxSauces: 1 }
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, image: data.secure_url });
      } else {
        alert("Erreur lors de l'envoi de l'image");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
      description: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
      price: '',
      category: 'main',
      image: '',
      rating: 4.8,
      reviewsCount: 124,
      isAvailable: true,
      extras: [],
      sauceSettings: { hasSauces: false, maxSauces: 1 }
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: { 
        fr: item.name.fr || '', 
        en: item.name.en || '', 
        es: item.name.es || '', 
        it: item.name.it || '', 
        ar: item.name.ar || '',
        de: item.name.de || '',
        tr: item.name.tr || '',
        ru: item.name.ru || ''
      },
      description: { 
        fr: item.description.fr || '', 
        en: item.description.en || '', 
        es: item.description.es || '', 
        it: item.description.it || '', 
        ar: item.description.ar || '',
        de: item.description.de || '',
        tr: item.description.tr || '',
        ru: item.description.ru || ''
      },
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      rating: item.rating || 4.8,
      reviewsCount: item.reviewsCount || 0,
      isAvailable: item.isAvailable ?? true,
      extras: item.extras || [],
      sauceSettings: item.sauceSettings || { hasSauces: false, maxSauces: 1 }
    });
    setIsModalOpen(true);
  };

  const addExtra = () => {
    setFormData({
      ...formData,
      extras: [...formData.extras, { name: '', price: 0 }]
    });
  };

  const removeExtra = (index: number) => {
    const newExtras = [...formData.extras];
    newExtras.splice(index, 1);
    setFormData({ ...formData, extras: newExtras });
  };

  const updateExtra = (index: number, field: string, value: any) => {
    const newExtras = [...formData.extras];
    newExtras[index] = { ...newExtras[index], [field]: value };
    setFormData({ ...formData, extras: newExtras });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          rating: parseFloat(formData.rating as any) || 4.8,
          reviewsCount: parseInt(formData.reviewsCount as any) || 0,
          extras: formData.extras.map((ex: any) => ({ ...ex, price: parseFloat(ex.price) || 0 }))
        }),
      });

      if (res.ok) {
        fetchItems();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce plat ?')) {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={48} /></div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href={`/${locale}/admin`} className="relative z-50 inline-flex items-center gap-3 text-gold mb-4 cursor-pointer hover:gap-5 transition-all w-fit">
             <ArrowLeft size={24} />
             <span className="text-xs font-black uppercase tracking-widest">Retour Dashboard</span>
          </Link>
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Catalogue Gastronomique</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Gestion du <span className="text-gold italic font-serif">Menu</span></h1>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-gold text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20"
        >
          <Plus size={18} /> Ajouter un délice
        </button>
      </header>

      <div className="glass-card rounded-[3rem] border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 text-gold text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-10 py-6">Détails du Plat</th>
              <th className="px-10 py-6">Catégorie</th>
              <th className="px-10 py-6">Prix</th>
              <th className="px-10 py-6">Options</th>
              <th className="px-10 py-6">Statut</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-foreground/[0.02] transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/5 border border-border">
                      <img src={item.image || '/photos/dish1.png'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <div className="text-foreground font-black tracking-tight">{item.name.fr}</div>
                      <div className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">{item.name.en}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 text-foreground/40 font-black text-[10px] uppercase tracking-widest">{item.category}</td>
                <td className="px-10 py-6 text-gold font-black text-lg tracking-tight">{item.price}€</td>
                <td className="px-10 py-6">
                   <div className="flex gap-2">
                      {item.extras?.length > 0 && <span className="w-6 h-6 rounded-lg bg-gold/10 text-gold flex items-center justify-center" title={`${item.extras.length} suppléments`}><Plus size={12}/></span>}
                      {item.sauceSettings?.hasSauces && <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center" title="Sauces activées"><Heart size={12}/></span>}
                   </div>
                </td>
                <td className="px-10 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {item.isAvailable ? 'Disponible' : 'Épuisé'}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-border shadow-3xl flex flex-col"
            >
              <div className="p-8 md:p-12 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tighter">
                    {editingItem ? 'Modifier le' : 'Nouveau'} <span className="text-gold italic font-serif">Plat</span>
                  </h2>
                  <p className="text-foreground/40 text-[10px] uppercase font-black tracking-widest mt-1">Saisie Multilingue & Options Personnalisées</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:rotate-90 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* Left Column: Multilingual Content */}
                  <div className="space-y-10">
                    <h3 className="text-gold font-black uppercase tracking-[0.2em] text-[10px] border-b border-gold/10 pb-4 flex items-center gap-3"><ChefHat size={14}/> Contenu Multilingue</h3>
                    <div className="space-y-6">
                      {LANGUAGES.map((lang) => (
                        <div key={lang} className="space-y-4 p-6 rounded-3xl bg-foreground/5 border border-border group-within:border-gold/30 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gold text-white text-[10px] font-black flex items-center justify-center uppercase">{lang}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Saisie {lang.toUpperCase()}</span>
                          </div>
                          <input 
                            type="text"
                            placeholder={`Nom du plat (${lang})`}
                            value={formData.name[lang]}
                            onChange={(e) => setFormData({...formData, name: {...formData.name, [lang]: e.target.value}})}
                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            className="w-full bg-background border-none rounded-xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none shadow-sm"
                            required={lang === 'fr'}
                          />
                          <textarea 
                            placeholder={`Description (${lang})`}
                            value={formData.description[lang]}
                            onChange={(e) => setFormData({...formData, description: {...formData.description, [lang]: e.target.value}})}
                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            rows={2}
                            className="w-full bg-background border-none rounded-xl px-6 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none resize-none shadow-sm"
                            required={lang === 'fr'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Parameters, Extras & Sauces */}
                  <div className="space-y-12">
                    {/* General Settings */}
                    <div className="space-y-8">
                       <h3 className="text-gold font-black uppercase tracking-[0.2em] text-[10px] border-b border-gold/10 pb-4 flex items-center gap-3"><Sparkles size={14}/> Paramètres Principaux</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Image Upload */}
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative w-full aspect-square rounded-3xl bg-foreground/5 border-2 border-dashed border-border hover:border-gold transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3"
                          >
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            {formData.image ? (
                              <>
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                  <Camera className="text-white" size={32} />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                  {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                                </div>
                                <p className="text-foreground font-black text-[10px] uppercase tracking-widest">Image</p>
                              </>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Prix (€)</label>
                              <input 
                                type="number" step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 text-xl font-black text-gold focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Catégorie</label>
                              <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-foreground/5 border-none h-14 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none appearance-none cursor-pointer"
                              >
                                <option value="starter">Entrée</option>
                                <option value="main">Plat Principal</option>
                                <option value="dessert">Dessert</option>
                                <option value="drink">Boisson</option>
                              </select>
                            </div>
                          </div>
                       </div>
                    </div>

                    {/* Sauces Settings */}
                    <div className="space-y-8 p-8 rounded-[2rem] bg-foreground/5 border border-border relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl" />
                       <div className="flex items-center justify-between">
                          <label className="text-sm font-black text-foreground tracking-tight flex items-center gap-3">
                             <Heart size={18} className="text-blue-500" /> Gestion des Sauces
                          </label>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, sauceSettings: {...formData.sauceSettings, hasSauces: !formData.sauceSettings.hasSauces}})}
                            className={`w-12 h-7 rounded-full transition-all duration-500 relative ${formData.sauceSettings.hasSauces ? 'bg-blue-500' : 'bg-foreground/10'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-500 ${formData.sauceSettings.hasSauces ? 'left-6' : 'left-1'}`} />
                          </button>
                       </div>
                       
                       {formData.sauceSettings.hasSauces && (
                         <motion.div 
                           initial={{ opacity: 0, h: 0 }}
                           animate={{ opacity: 1, h: 'auto' }}
                           className="pt-6 border-t border-border space-y-4"
                         >
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Nombre de sauces autorisées</label>
                            <div className="flex items-center gap-4">
                               <input 
                                 type="number" min="1" max="5"
                                 value={formData.sauceSettings.maxSauces}
                                 onChange={(e) => setFormData({...formData, sauceSettings: {...formData.sauceSettings, maxSauces: parseInt(e.target.value) || 1}})}
                                 className="w-20 bg-background border-none rounded-xl px-4 py-3 text-lg font-black text-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none text-center"
                               />
                               <span className="text-xs font-bold text-foreground/40 italic">Les sauces seront sélectionnées par le client parmi la liste prédéfinie.</span>
                            </div>
                         </motion.div>
                       )}
                    </div>

                    {/* Extras Settings */}
                    <div className="space-y-8 p-8 rounded-[2rem] bg-foreground/5 border border-border relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl" />
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-black text-foreground tracking-tight flex items-center gap-3">
                             <Plus size={18} className="text-gold" /> Suppléments (Extras)
                          </label>
                          <button 
                            type="button"
                            onClick={addExtra}
                            className="bg-gold/10 text-gold px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all"
                          >
                             Ajouter
                          </button>
                       </div>

                       <div className="space-y-4">
                          {formData.extras.map((extra: any, index: number) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={index} 
                              className="flex gap-4 items-center"
                            >
                               <input 
                                 type="text"
                                 placeholder="Nom (ex: Oeuf)"
                                 value={extra.name}
                                 onChange={(e) => updateExtra(index, 'name', e.target.value)}
                                 className="flex-1 bg-background border-none rounded-xl px-4 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-gold/50 outline-none"
                               />
                               <input 
                                 type="number" step="0.5"
                                 placeholder="Prix"
                                 value={extra.price}
                                 onChange={(e) => updateExtra(index, 'price', e.target.value)}
                                 className="w-24 bg-background border-none rounded-xl px-4 py-3 text-xs font-bold text-gold focus:ring-2 focus:ring-gold/50 outline-none"
                               />
                               <button 
                                 type="button"
                                 onClick={() => removeExtra(index)}
                                 className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground/20 hover:text-red-500 transition-colors"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </motion.div>
                          ))}
                          {formData.extras.length === 0 && (
                            <p className="text-[10px] font-bold text-foreground/20 italic text-center py-4">Aucun supplément configuré pour ce plat.</p>
                          )}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-border flex justify-end gap-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-foreground/40 hover:bg-foreground/5 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-12 py-5 bg-gold text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Sauvegarder le Plat
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
