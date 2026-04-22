'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, Image as ImageIcon, Upload, Camera, ArrowLeft } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
    description: { fr: '', en: '', es: '', it: '', ar: '', de: '', tr: '', ru: '' },
    price: '',
    category: 'main',
    image: '',
    rating: 4.8,
    reviewsCount: 124,
    isAvailable: true
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
      isAvailable: true
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
      isAvailable: item.isAvailable ?? true
    });
    setIsModalOpen(true);
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
          reviewsCount: parseInt(formData.reviewsCount as any) || 0
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
      <header className="flex justify-between items-end">
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
              className="glass-card w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-border shadow-3xl flex flex-col"
            >
              <div className="p-8 md:p-12 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tighter">
                    {editingItem ? 'Modifier le' : 'Nouveau'} <span className="text-gold italic font-serif">Plat</span>
                  </h2>
                  <p className="text-foreground/40 text-[10px] uppercase font-black tracking-widest mt-1">Saisie Multilingue Complète</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground hover:rotate-90 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Multilingual Content */}
                  <div className="space-y-10">
                    <h3 className="text-gold font-black uppercase tracking-[0.2em] text-[10px] border-b border-gold/10 pb-2">Contenu Multilingue</h3>
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="space-y-4 p-6 rounded-3xl bg-foreground/5 border border-border">
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

                  {/* Right Column: Parameters & Image */}
                  <div className="space-y-10">
                    <h3 className="text-gold font-black uppercase tracking-[0.2em] text-[10px] border-b border-gold/10 pb-2">Paramètres du Plat</h3>
                    
                    <div className="space-y-8">
                      {/* Image Upload Area */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Image du Plat</label>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden" 
                        />
                        
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative w-full aspect-video rounded-3xl bg-foreground/5 border-2 border-dashed border-border hover:border-gold transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3"
                        >
                          {formData.image ? (
                            <>
                              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                <Camera className="text-white" size={32} />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Changer l'image</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                              </div>
                              <div className="text-center">
                                <p className="text-foreground font-black text-xs uppercase tracking-widest">Importer une image</p>
                                <p className="text-foreground/30 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Depuis votre appareil</p>
                              </div>
                            </>
                          )}
                          
                          {uploading && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center flex-col gap-4 z-20">
                              <Loader2 className="animate-spin text-gold" size={48} />
                              <span className="text-gold font-black text-[10px] uppercase tracking-widest font-serif italic">Téléchargement...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Prix (€)</label>
                          <input 
                            type="number" step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-5 text-xl font-black text-gold focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Catégorie</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-foreground/5 border-none h-[68px] rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-foreground focus:ring-2 focus:ring-gold/50 transition-all outline-none appearance-none cursor-pointer"
                          >
                            <option value="starter">Entrée</option>
                            <option value="main">Plat Principal</option>
                            <option value="dessert">Dessert</option>
                            <option value="drink">Boisson</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pb-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Note (/5)</label>
                          <input 
                            type="number" step="0.1" min="1" max="5"
                            value={formData.rating}
                            onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
                            className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-5 text-xl font-black text-gold focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Nombre d'avis</label>
                          <input 
                            type="number" min="0" step="1"
                            value={formData.reviewsCount}
                            onChange={(e) => setFormData({...formData, reviewsCount: parseInt(e.target.value) || 0})}
                            className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-5 text-xl font-black text-gold focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-3xl bg-foreground/5 border border-border">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Disponibilité</p>
                          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest italic">{formData.isAvailable ? 'En stock' : 'Indisponible'}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
                          className={`w-14 h-8 rounded-full transition-all duration-500 relative ${formData.isAvailable ? 'bg-gold' : 'bg-foreground/10'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-500 ${formData.isAvailable ? 'left-7' : 'left-1'}`} />
                        </button>
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
