import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  PhoneCall, 
  Save, 
  RotateCcw,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { EmergencyHotline } from '../types';
import { useHotlines, saveHotline, deleteHotline } from '../lib/storage';

interface HotlineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const HotlineEditorModal: React.FC<HotlineEditorModalProps> = ({
  isOpen,
  onClose,
  onUpdated
}) => {
  const hotlines = useHotlines();
  const [editingHotline, setEditingHotline] = useState<EmergencyHotline | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState<EmergencyHotline['category']>('Emergency');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [availableHours, setAvailableHours] = useState('24/7 Nationwide');
  const [isTollFree, setIsTollFree] = useState(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsCreating(false);
      setEditingHotline(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const handleStartCreate = () => {
    setEditingHotline(null);
    setName('');
    setNumber('');
    setCategory('Emergency');
    setDescription('');
    setDepartment('Royal Eswatini Police Service / Ministry');
    setAvailableHours('24/7 Nationwide');
    setIsTollFree(true);
    setActive(true);
    setIsCreating(true);
  };

  const handleStartEdit = (h: EmergencyHotline) => {
    setEditingHotline(h);
    setName(h.name);
    setNumber(h.number);
    setCategory(h.category);
    setDescription(h.description);
    setDepartment(h.department);
    setAvailableHours(h.availableHours);
    setIsTollFree(h.isTollFree);
    setActive(h.active);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !number) {
      alert('Please provide hotline name and number.');
      return;
    }

    const hotlineToSave: EmergencyHotline = {
      id: editingHotline ? editingHotline.id : 'hotline-' + Date.now(),
      name,
      number,
      category,
      description: description || name,
      department: department || 'Kingdom of Eswatini',
      availableHours: availableHours || '24/7',
      isTollFree,
      priority: editingHotline ? editingHotline.priority : hotlines.length + 1,
      active,
    };

    saveHotline(hotlineToSave);
    setIsCreating(false);
    setEditingHotline(null);
    if (onUpdated) onUpdated();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hotline from the national registry?')) {
      deleteHotline(id);
      if (onUpdated) onUpdated();
    }
  };

  const handleToggleActive = (h: EmergencyHotline) => {
    const updated: EmergencyHotline = { ...h, active: !h.active };
    saveHotline(updated);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Emergency Hotlines & Toll-Free Editor
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin Configuration • Updates public portal in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1">
          {/* Create or Edit Form */}
          {(isCreating || editingHotline) && (
            <form onSubmit={handleSave} className="bg-slate-950/80 border-2 border-yellow-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">
                  {editingHotline ? `Edit Hotline: ${editingHotline.name}` : 'Add New Emergency Hotline'}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingHotline(null); }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel Form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hotline Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Police Emergency Response"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Dial Number *</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g. 999 or 800-BIKA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Police">Police</option>
                    <option value="Fire & Rescue">Fire & Rescue</option>
                    <option value="Medical">Medical & Ambulance</option>
                    <option value="Transport">Transport & Traffic Desk</option>
                    <option value="Anti-Corruption">Anti-Corruption</option>
                    <option value="Emergency">General Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department / Authority</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Royal Eswatini Police Service"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Available Hours</label>
                  <input
                    type="text"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(e.target.value)}
                    placeholder="e.g. 24/7 Nationwide"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTollFree}
                      onChange={(e) => setIsTollFree(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">Toll-Free (Free Call)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">Active & Visible</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Description / Scope of Assistance</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what citizens should call this number for..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingHotline(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Hotline</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Registered Hotlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Registered Hotlines ({hotlines.length})
              </span>
              {!isCreating && !editingHotline && (
                <button
                  onClick={handleStartCreate}
                  className="flex items-center space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Hotline</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {hotlines.map((h) => (
                <div
                  key={h.id}
                  className={`bg-slate-950/60 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    h.active ? 'border-slate-800' : 'border-red-900/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{h.name}</span>
                      <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded font-mono font-bold text-xs">
                        {h.number}
                      </span>
                      {h.isTollFree && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded text-[10px] font-bold">
                          TOLL FREE
                        </span>
                      )}
                      {!h.active && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded text-[10px] font-bold">
                          DISABLED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{h.description}</p>
                    <div className="text-[10px] text-slate-400 space-x-3">
                      <span>Authority: <strong className="text-slate-300">{h.department}</strong></span>
                      <span>• Hours: <strong className="text-slate-300">{h.availableHours}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleActive(h)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border ${
                        h.active 
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {h.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(h)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700"
                      title="Edit Hotline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700"
                      title="Delete Hotline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>All hotline updates are stored in national local registry and synchronized instantly.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
