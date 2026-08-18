import React from 'react';
import { 
  FilePlus, 
  Activity, 
  Shield, 
  Truck, 
  Building2, 
  BarChart3, 
  Sliders,
  QrCode
} from 'lucide-react';
import { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  openIncidentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  openIncidentsCount
}) => {
  const { t } = useLanguage();
  const isOfficial = userRole !== 'Public User';
  const isSuperAdmin = userRole === 'Super Admin';

  const tabs = [
    {
      id: 'public',
      labelKey: 'publicPortal',
      defaultLabel: 'Public Portal',
      icon: FilePlus,
      visible: true,
      badge: null
    },
    {
      id: 'command',
      labelKey: 'commandCentre',
      defaultLabel: 'Command Centre',
      icon: Activity,
      visible: isOfficial,
      badge: openIncidentsCount > 0 ? openIncidentsCount : null
    },
    {
      id: 'official',
      labelKey: 'officialDashboard',
      defaultLabel: 'Official Dashboard',
      icon: Shield,
      visible: isOfficial,
      badge: null
    },
    {
      id: 'fleet',
      labelKey: 'fleetOperators',
      defaultLabel: 'Fleet & Operators',
      icon: Truck,
      visible: isOfficial,
      badge: null
    },
    {
      id: 'establishments',
      labelKey: 'restaurantsClinics',
      defaultLabel: 'Restaurants & Food Trade',
      icon: Building2,
      visible: isOfficial,
      badge: null
    },
    {
      id: 'analytics',
      labelKey: 'analyticsReports',
      defaultLabel: 'Analytics & Reports',
      icon: BarChart3,
      visible: isOfficial,
      badge: null
    },
    {
      id: 'qr_generator',
      labelKey: 'qrGenerator',
      defaultLabel: 'Public Portal QR Poster',
      icon: QrCode,
      visible: isOfficial,
      badge: 'POSTER'
    },
    {
      id: 'admin',
      labelKey: 'superAdmin',
      defaultLabel: 'Super Admin',
      icon: Sliders,
      visible: isSuperAdmin,
      badge: 'ADMIN'
    }
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.filter(t => t.visible).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const translatedLabel = t(tab.labelKey) !== tab.labelKey ? t(tab.labelKey) : tab.defaultLabel;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{translatedLabel}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive 
                      ? 'bg-slate-950 text-yellow-400' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
