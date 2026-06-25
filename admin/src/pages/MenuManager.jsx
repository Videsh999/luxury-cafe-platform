import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl backdrop-blur-xl border shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
        type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium tracking-wide">{message}</span>
    </motion.div>
  );
};

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Coffee', image: '', prepTime: '', calories: '', isAvailable: true
  });

  const categories = ['All', 'Coffee', 'Desserts', 'Bakery', 'Pasta & Main Course', 'Burgers & Sandwiches', 'Premium Beverages', 'Chef Specials'];

  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/menu');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      showToast("Failed to fetch menu items", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (res.ok) {
        setItems(items.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
        showToast(`Item marked as ${!currentStatus ? 'Available' : 'Unavailable'}`);
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`http://localhost:5001/api/menu/${editingItem._id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(item => item._id !== editingItem._id));
        showToast("Item deleted successfully");
        setIsDeleteModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      showToast("Failed to delete item", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `http://localhost:5001/api/menu/${editingItem._id}` : 'http://localhost:5001/api/menu';
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) || 0 })
      });
      
      if (res.ok) {
        showToast(editingItem ? "Item updated successfully" : "New item added successfully");
        fetchMenu(); // Refresh the list
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to save item", "error");
      }
    } catch (err) {
      showToast("Network error while saving", "error");
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, description: item.description, price: item.price, 
        category: item.category, image: item.image, prepTime: item.prepTime || '', 
        calories: item.calories || '', isAvailable: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', description: '', price: '', category: 'Coffee', image: '', prepTime: '', calories: '', isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (item) => {
    setEditingItem(item);
    setIsDeleteModalOpen(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Menu Engine</h1>
          <p className="text-white/50 text-sm font-light">Manage catalog, pricing, and live availability.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-luxury-gold hover:bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(197,160,89,0.3)]"
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search menu items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-luxury-gold transition-colors font-light"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-luxury-gold transition-colors font-light appearance-none"
        >
          {categories.map(cat => <option key={cat} value={cat} className="bg-luxury-charcoal">{cat}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Item</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Category</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Price</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-white/50">Loading catalog...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-white/50">No items found.</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <motion.tr 
                    key={item._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden border border-white/10 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={16}/></div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-white/40 text-xs truncate max-w-xs">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-white font-serif">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
                          item.isAvailable 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2 text-white/50 hover:text-luxury-gold hover:bg-luxury-gold/10 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDelete(item)} className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-serif text-white">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Item Name *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none" />
                    </div>
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Category *</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none appearance-none">
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Price (₹) *</label>
                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Prep Time (mins)</label>
                        <input type="number" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Image URL</label>
                      <input type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none" />
                      <p className="text-white/30 text-[10px] mt-1">Direct URL to image (e.g., Unsplash, Imgur)</p>
                    </div>
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase tracking-widest font-bold mb-2">Description *</label>
                      <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-luxury-gold outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-4 h-4 accent-luxury-gold" />
                  <label htmlFor="isAvailable" className="text-white text-sm">Item is currently available for ordering</label>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm font-bold">Cancel</button>
                  <button type="submit" className="bg-luxury-gold hover:bg-white text-black px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                    {editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel max-w-sm w-full relative z-10 p-6 text-center border-red-500/20">
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-serif text-white mb-2">Delete Menu Item?</h3>
              <p className="text-white/50 text-sm mb-6">Are you sure you want to permanently remove <strong className="text-white">{editingItem?.name}</strong> from the catalog? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-bold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)]">Delete Item</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default MenuManager;
