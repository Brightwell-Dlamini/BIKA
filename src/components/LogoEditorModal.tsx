import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Building2, 
  Shield, 
  Bus, 
  Flame, 
  Landmark,
  Eye,
  Info,
  Trash2,
  Plus,
  Edit2
} from 'lucide-react';
import { SystemLogoItem } from '../types';
import { 
  useLogos,
  saveSystemLogo, 
  resetSystemLogo, 
  resetAllSystemLogos,
  deleteCustomLogo 
} from '../lib/storage';

interface LogoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedLogoId?: string;
  onLogosUpdated?: () => void;
}

export const LogoEditorModal: React.FC<LogoEditorModalProps> = ({
  isOpen,
  onClose,
  initialSelectedLogoId = 'bika_master',
  onLogosUpdated
}) => {
  const logos = useLogos();
  const [selectedId, setSelectedId] = useState<string>(initialSelectedLogoId);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [acronym, setAcronym] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLogo = logos.find(l => l.id === selectedId) || logos[0];

  useEffect(() => {
    if (isOpen) {
      const targetId = initialSelectedLogoId && logos.some(l => l.id === initialSelectedLogoId)
        ? initialSelectedLogoId
        : logos[0]?.id || 'bika_master';
      
      setSelectedId(targetId);
      loadLogoData(targetId, logos);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsCreatingNew(false);
    }
  }, [isOpen, initialSelectedLogoId]);


  const loadLogoData = (id: string, list: SystemLogoItem[] = logos) => {
    const item = list.find(l => l.id === id);
    if (item) {
      setName(item.name);
      setSubtitle(item.subtitle);
      setAcronym(item.acronym);
      setRole(item.role);
      setImageUrl(item.customImageUrl || '');
    }
  };

  const handleSelectLogo = (id: string) => {
    setIsCreatingNew(false);
    setSelectedId(id);
    loadLogoData(id);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleStartNewLogo = () => {
    setIsCreatingNew(true);
    setSelectedId('custom-' + Date.now());
    setName('');
    setSubtitle('Partner Authority / Agency');
    setAcronym('');
    setRole('Regulatory / Inspection Partner');
    setImageUrl('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Image Upload handler with compression to data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be below 5MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setIsUploading(false);
      setSuccessMsg('Logo image loaded. Click "Save Logo" to apply system-wide.');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !acronym.trim()) {
      setErrorMsg('Name and acronym are required.');
      return;
    }

    const updatedItem: SystemLogoItem = {
      id: isCreatingNew ? selectedId : activeLogo.id,
      name: name.trim(),
      subtitle: subtitle.trim(),
      acronym: acronym.trim().toUpperCase(),
      role: role.trim(),
      customImageUrl: imageUrl.trim() || undefined,
      badgeColor: activeLogo?.badgeColor || 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      updatedAt: new Date().toISOString()
    };

    saveSystemLogo(updatedItem);
    setIsCreatingNew(false);
    setSuccessMsg(`"${updatedItem.name}" updated successfully across the entire system!`);
    if (onLogosUpdated) onLogosUpdated();
  };

  const handleResetSingle = () => {
    if (confirm(`Reset "${activeLogo.name}" logo to default government insignia?`)) {
      resetSystemLogo(activeLogo.id);
      loadLogoData(activeLogo.id, logos);
      setSuccessMsg(`Logo reset to default vector crest.`);
      if (onLogosUpdated) onLogosUpdated();
    }
  };

  const handleDeleteCustom = () => {
    if (confirm(`Delete custom partner "${activeLogo.name}"?`)) {
      deleteCustomLogo(activeLogo.id);
      const remaining = logos.filter(l => l.id !== activeLogo.id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        loadLogoData(remaining[0].id, remaining);
      }
      setSuccessMsg('Partner logo removed.');
      if (onLogosUpdated) onLogosUpdated();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Website Logos & Partner Text</span>
                <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  ADMIN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Change logo images and organization text. Changes update across the website immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Logos Navigation */}
          <div className="md:col-span-4 p-4 space-y-2 bg-slate-950/30 overflow-y-auto">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Select Logo to Edit
              </span>
              <button
                type="button"
                onClick={handleStartNewLogo}
                className="flex items-center space-x-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-yellow-400 px-2 py-1 rounded-lg border border-slate-700 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Partner</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {logos.map((logo) => {
                const isSelected = selectedId === logo.id && !isCreatingNew;
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => handleSelectLogo(logo.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-yellow-500/10 border-yellow-500/50 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0">
                      {logo.customImageUrl ? (
                        <img 
                          src={logo.customImageUrl} 
                          alt={logo.name} 
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-yellow-400 font-black text-xs font-mono">
                          {logo.acronym.slice(0, 3)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate">{logo.name}</span>
                        {logo.customImageUrl && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Custom Logo Active" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{logo.acronym} • {logo.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Edit Form & Live Preview */}
          <div className="md:col-span-8 p-6 space-y-5 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center space-x-2">
                <Info className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Live System Preview Header */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Real-Time System Preview</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {imageUrl ? 'Using Uploaded Image' : 'Using Default Vector Insignia'}
                </span>
              </div>

              {/* Preview Display */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-inner">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-yellow-400 font-black text-sm">
                      <Landmark className="w-7 h-7 mb-0.5" />
                      <span className="text-[8px] font-mono">{acronym || 'LOGO'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white truncate">{name || 'Entity Name'}</span>
                    <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-black px-2 py-0.5 rounded">
                      {acronym || 'CODE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{subtitle || 'Government Authority / Agency'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{role || 'Public Oversight Division'}</p>
                </div>
              </div>
            </div>

            {/* Logo Configuration Form */}
            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Section 1: Image Setting */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-yellow-400 font-black text-xs uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>1. Change Logo Image</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload an image from your computer or enter a direct image URL.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500/50 text-white font-bold px-4 py-3 rounded-xl transition shadow"
                  >
                    <Upload className="w-4 h-4 text-yellow-400" />
                    <span>{imageUrl ? 'Replace Image File' : 'Upload Image File (PNG/JPG)'}</span>
                  </button>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setSuccessMsg('Image cleared. Click Save to apply default icon.');
                      }}
                      className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 transition"
                      title="Clear Custom Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pt-1">
                  <label className="text-[11px] text-slate-400 block mb-1">Or paste Direct Image URL:</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.gov.sz/assets/logo.png"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Text Information */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-yellow-400 font-black text-xs uppercase tracking-wider">
                  <Edit2 className="w-4 h-4" />
                  <span>2. Change Logo Text & Info</span>
                </div>

                {/* Entity Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Organization / Title *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ministry of Public Works & Transport"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Acronym / Code *</label>
                    <input
                      type="text"
                      required
                      value={acronym}
                      onChange={(e) => setAcronym(e.target.value)}
                      placeholder="e.g. MPWT, NRTC, REPS"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Subtitle / Jurisdiction</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Government of the Kingdom of Eswatini"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mandate / Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Transport Policy & Road Safety"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  {!isCreatingNew && (
                    <button
                      type="button"
                      onClick={handleResetSingle}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Reset to Default</span>
                    </button>
                  )}

                  {!isCreatingNew && activeLogo.id.startsWith('custom-') && (
                    <button
                      type="button"
                      onClick={handleDeleteCustom}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 text-xs transition"
                    >
                      Delete Partner
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black shadow-lg transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save System Logo</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
