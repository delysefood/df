'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', capacity: 2, isActive: true });

  const router = useRouter();

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTable ? `/api/admin/tables/${editingTable._id}` : `/api/admin/tables`;
      const method = editingTable ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTables();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      try {
        await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' });
        fetchTables();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openModal = (table: any = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, capacity: table.capacity, isActive: table.isActive });
    } else {
      setEditingTable(null);
      setFormData({ name: '', capacity: 2, isActive: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Gestion des <span className="text-gold italic font-serif">Tables</span></h1>
          <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest mt-1">Configurez le plan de salle</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gold text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gold/90 transition-all shadow-lg shadow-gold/20"
        >
          <Plus size={20} /> Nouvelle Table
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-gold border-t-transparent animate-spin"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => (
            <motion.div 
              key={table._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border ${table.isActive ? 'border-border bg-foreground/[0.02]' : 'border-red-500/20 bg-red-500/5'} cursor-pointer flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-black text-xl">
                  {table.capacity}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(table)} className="text-foreground/40 hover:text-gold transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(table._id)} className="text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="font-black text-lg text-foreground truncate">{table.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mt-1">
                Places assises
              </p>
              {!table.isActive && <p className="text-xs font-bold text-red-500 mt-4 bg-red-500/10 inline-block px-2 py-1 rounded">Désactivée</p>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border p-8 rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-foreground">{editingTable ? 'Modifier Table' : 'Nouvelle Table'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-foreground/40 hover:text-foreground"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Nom de la table (ex: "Table 1")</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-foreground/5 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Capacité (personnes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full bg-foreground/5 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 accent-gold"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-foreground">Table activée et disponible</label>
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-gold text-white font-black hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20">
                  Enregistrer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
