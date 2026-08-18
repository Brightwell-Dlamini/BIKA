import React from 'react';
import { Shield, Bus, Flame, Landmark, CheckCircle2, Edit2, Upload, Building2 } from 'lucide-react';
import { SystemLogoItem, User } from '../types';
import { useLogos } from '../lib/storage';

interface OfficialLogosBannerProps {
  className?: string;
  variant?: 'compact' | 'full';
  currentUser?: User;
  onOpenLogoEditor?: (logoId?: string) => void;
}

export const OfficialLogosBanner: React.FC<OfficialLogosBannerProps> = ({ 
  className = '',
  variant = 'full',
  currentUser,
  onOpenLogoEditor
}) => {
  const allLogos = useLogos();
  const logos = allLogos.filter(l => l.id !== 'bika_master');

  const isSuperAdmin = currentUser?.role === 'Super Admin';


  const getFallbackIcon = (id: string, acronym: string) => {
    if (id === 'works') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-yellow-400">
            <Landmark className="w-6 h-6 text-yellow-400" />
            <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5">ESWATINI</span>
          </div>
        </div>
      );
    }
    if (id === 'nrtc') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-blue-400">
            <Bus className="w-6 h-6 text-blue-400" />
            <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5">NRTC</span>
          </div>
        </div>
      );
    }
    if (id === 'reps') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-blue-300">
            <Shield className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
            <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5">POLICE</span>
          </div>
        </div>
      );
    }
    if (id === 'fire') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-orange-600 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-red-400">
            <Flame className="w-6 h-6 text-red-400 fill-red-400/30" />
            <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5">FIRE</span>
          </div>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-0.5 shadow-md flex items-center justify-center">
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-yellow-400">
          <Building2 className="w-6 h-6 text-yellow-400" />
          <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5">{acronym.slice(0, 4)}</span>
        </div>
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {logos.map((l) => (
          <div 
            key={l.id} 
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 shadow-md"
          >
            <div className="shrink-0">
              {l.customImageUrl ? (
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                  <img src={l.customImageUrl} alt={l.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                getFallbackIcon(l.id, l.acronym)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-white truncate">{l.acronym}</div>
              <div className="text-[10px] text-slate-400 truncate">{l.name}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">
            OFFICIAL AUTHORITIES & OVERSIGHT PARTNERS
          </span>
          <h3 className="text-base sm:text-lg font-black text-white">
            Endorsed by the Government of the Kingdom of Eswatini
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {isSuperAdmin && onOpenLogoEditor && (
            <button
              onClick={() => onOpenLogoEditor()}
              className="flex items-center space-x-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow"
              title="Upload / Change Authority Logos"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Manage Logos</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Integrated National Dispatch</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="group relative bg-slate-900/95 border border-slate-800 hover:border-yellow-500/50 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Logo Image or Fallback Vector Badge */}
                {logo.customImageUrl ? (
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shadow-md">
                    <img 
                      src={logo.customImageUrl} 
                      alt={logo.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  getFallbackIcon(logo.id, logo.acronym)
                )}

                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${logo.badgeColor || 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                    {logo.acronym}
                  </span>

                  {isSuperAdmin && onOpenLogoEditor && (
                    <button
                      onClick={() => onOpenLogoEditor(logo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 text-slate-300 transition"
                      title={`Edit ${logo.acronym} Logo`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-yellow-400 transition-colors leading-tight">
                  {logo.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {logo.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="truncate pr-1">{logo.role}</span>
              <span className="text-emerald-400 font-bold text-xs shrink-0">● Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
