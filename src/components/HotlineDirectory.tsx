import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Flame, 
  HeartHandshake, 
  Truck, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  Clock, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { EmergencyHotline, User } from '../types';
import { useHotlines, saveHotline, deleteHotline } from '../lib/storage';

interface HotlineDirectoryProps {
  currentUser?: User;
  onOpenAdminHotlineModal?: () => void;
  className?: string;
  variant?: 'full' | 'compact';
}

export const HotlineDirectory: React.FC<HotlineDirectoryProps> = ({
  currentUser,
  onOpenAdminHotlineModal,
  className = '',
  variant = 'full'
}) => {
  const hotlines = useHotlines();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'Super Admin';


  const handleCopyNumber = (hotline: EmergencyHotline) => {
    navigator.clipboard.writeText(hotline.number);
    setCopiedId(hotline.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Police':
        return <ShieldAlert className="w-5 h-5 text-blue-400" />;
      case 'Fire & Rescue':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'Medical':
        return <HeartHandshake className="w-5 h-5 text-emerald-400" />;
      case 'Transport':
        return <Truck className="w-5 h-5 text-yellow-400" />;
      default:
        return <PhoneCall className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Police':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Fire & Rescue':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Medical':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Transport':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const activeHotlines = hotlines.filter(h => h.active);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Admin Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-red-400 font-extrabold text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>NATIONAL 24/7 HOTLINES & TOLL-FREE DIRECTORY</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
            <span>Official Emergency & Public Incident Hotlines</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct government access lines for urgent response, emergency dispatch, and public assistance.
          </p>
        </div>

        {isSuperAdmin && onOpenAdminHotlineModal && (
          <button
            onClick={onOpenAdminHotlineModal}
            className="flex items-center space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shadow shrink-0 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage Hotlines (Admin)</span>
          </button>
        )}
      </div>

      {/* Hotline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeHotlines.map((hotline) => {
          const isCopied = copiedId === hotline.id;
          return (
            <div
              key={hotline.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {getCategoryIcon(hotline.category)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                        {hotline.name}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border inline-block mt-0.5 ${getCategoryBadgeColor(hotline.category)}`}>
                        {hotline.category}
                      </span>
                    </div>
                  </div>

                  {hotline.isTollFree && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0">
                      TOLL-FREE
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {hotline.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{hotline.availableHours}</span>
                  </span>
                  <span className="font-semibold text-slate-300">{hotline.department}</span>
                </div>

                {/* Call & Copy Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <a
                    href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 py-2 px-3 rounded-xl font-black text-xs transition shadow group-hover:scale-[1.02]"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
                    <span>Call {hotline.number}</span>
                  </a>

                  <button
                    onClick={() => handleCopyNumber(hotline)}
                    title="Copy hotline number"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
