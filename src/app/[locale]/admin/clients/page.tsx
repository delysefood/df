'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Edit, Trash2, ShieldBan, ShieldCheck, Mail, ArrowLeft, Loader2, Search, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminClientsPage() {
  const { locale } = useParams();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client: any = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, email: client.email, password: '', role: client.role, status: client.status });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingClient ? 'PUT' : 'POST';
      const body = editingClient ? { ...formData, id: editingClient._id } : formData;
      
      const res = await fetch('/api/admin/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchClients();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce compte ?')) return;
    try {
      const res = await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchClients();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="text-gold font-black tracking-[0.3em] uppercase text-[10px] block">Utilisateurs</span>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Gestion des <span className="text-gold italic font-serif">Clients</span></h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-3 px-8 py-4 bg-gold text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Plus size={18} /> Ajouter un Compte
          </button>
        </div>
      </header>

      <div className="bg-foreground/5 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-gold/50 transition-all border border-border">
        <Search size={20} className="text-foreground/40" />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 font-bold text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div 
            key={client._id}
            className={`glass-card p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${
              client.status === 'blocked' ? 'border-red-500/30' : 'border-border hover:border-gold/30 hover:shadow-2xl'
            }`}
          >
            {client.status === 'blocked' && (
              <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] -z-10 pointer-events-none" />
            )}
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${
                  client.status === 'blocked' ? 'bg-red-500/10 text-red-500' : 
                  client.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gold/10 text-gold'
                }`}>
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground tracking-tight line-clamp-1">{client.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest mt-1">
                    <span className={client.role === 'admin' ? 'text-indigo-500' : 'text-gold'}>{client.role}</span>
                    <span className="text-foreground/20">•</span>
                    <span className={client.status === 'blocked' ? 'text-red-500' : 'text-emerald-500'}>{client.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-foreground/60 text-sm font-medium">
                <Mail size={16} className="text-foreground/30" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t border-border/50 mt-auto">
              <button 
                onClick={() => openModal(client)} 
                className="flex-1 py-3 bg-foreground/5 rounded-xl hover:bg-gold hover:text-white transition-colors flex items-center justify-center text-foreground/60"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => toggleStatus(client._id, client.status)} 
                className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-colors ${
                  client.status === 'active' 
                    ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white' 
                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                }`}
                title={client.status === 'active' ? "Bloquer" : "Débloquer"}
              >
                {client.status === 'active' ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
              </button>
              <button 
                onClick={() => deleteClient(client._id)} 
                className="flex-1 py-3 bg-red-500/10 rounded-xl hover:bg-red-500 text-red-600 hover:text-white transition-colors flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card w-full max-w-md rounded-[3rem] border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0 flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">{editingClient ? 'Modifier' : 'Nouveau'} <span className="text-gold italic font-serif">Client</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="text-foreground/40 hover:text-foreground hover:rotate-90 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2 block mb-2">Nom Complet</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold/50 font-bold" />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2 block mb-2">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold/50 font-bold" />
                </div>

                {!editingClient && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2 block mb-2">Mot de passe</label>
                    <input type="password" required={!editingClient} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold/50 font-bold" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2 block mb-2">Rôle</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold/50 font-bold appearance-none">
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2 block mb-2">Statut</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-foreground/5 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-gold/50 font-bold appearance-none">
                      <option value="active">Actif</option>
                      <option value="blocked">Bloqué</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full py-5 bg-gold text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
                    {editingClient ? 'Enregistrer les modifications' : 'Créer le compte'}
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
