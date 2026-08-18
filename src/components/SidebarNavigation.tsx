import React from 'react';
import { 
  FilePlus, 
  Activity, 
  Shield, 
  Truck, 
  Building2, 
  BarChart3, 
  Sliders,
  QrCode,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { UserRole, User } from '../types';

interface SidebarNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  openIncidentsCount: number;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHotlines?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLoginModal,
  onLogout,
  openIncidentsCount,
  isCollapsed,
  onToggleCollapsed,
  isMobileOpen,
  onCloseMobile,
  onOpenHotlines
}) => {
  const isOfficial = currentUser.role !== 'Public User';
  const isSuperAdmin = currentUser.role === 'Super Admin';

  const navItems = [
    {
      id: 'public',
      label: 'Public Portal',
      icon: FilePlus,
      visible: true,
      badge: null,
      description: 'Report incident, compliment or track report'
    },
    {
      id: 'command',
      label: 'Command Centre',
      icon: Activity,
      visible: isOfficial,
      badge: openIncidentsCount > 0 ? openIncidentsCount : null,
      description: 'Real-time incident dispatch & response'
    },
    {
      id: 'official',
      label: 'Official Dashboard',
      icon: Shield,
      visible: isOfficial,
      badge: null,
      description: 'Assigned queues & status management'
    },
    {
      id: 'fleet',
      label: 'Fleet & Operators',
      icon: Truck,
      visible: isOfficial,
      badge: null,
      description: 'Kombi & bus registry, permits & VIC'
    },
    {
      id: 'establishments',
      label: 'Restaurants & Food',
      icon: Building2,
      visible: isOfficial,
      badge: null,
      description: 'Food hygiene & market compliance'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      visible: isOfficial,
      badge: null,
      description: 'National charts & performance KPIs'
    },
    {
      id: 'admin',
      label: 'Super Admin Control',
      icon: Sliders,
      visible: isSuperAdmin,
      badge: 'ADMIN',
      description: 'User access, hotlines & audit logs'
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Police': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Health Inspector': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Rank Marshal': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 select-none">
      {/* Top Section */}
      <div className="space-y-4 p-3">
        {/* Toggle Collapse Button (Desktop) */}
        <div className="hidden lg:flex items-center justify-between px-2 py-1">
          {!isCollapsed && (
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
              NAVIGATION
            </span>
          )}
          <button
            onClick={onToggleCollapsed}
            className={`p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shadow ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-yellow-400" /> : <ChevronLeft className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>

        {/* Mobile Header with Close Button */}
        <div className="flex lg:hidden items-center justify-between px-2 py-1 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-yellow-400" />
            <span className="font-mono font-black text-sm text-white">BIKA MENU</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-1">
          {navItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-bold transition-all group relative ${
                  isActive
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-slate-950' : 'text-yellow-400/80 group-hover:text-yellow-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate text-left">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-black rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-slate-950 text-yellow-400 border-slate-950'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Mode Floating Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Hotlines Shortcut & User Profile Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Hotlines Fast Button */}
        {onOpenHotlines && (
          <button
            onClick={() => {
              setActiveTab('public');
              onCloseMobile();
              onOpenHotlines();
            }}
            title={isCollapsed ? 'Emergency Hotlines' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'space-x-2 px-3 py-2'
            } rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition text-xs font-bold`}
          >
            <PhoneCall className="w-4 h-4 text-red-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Emergency Hotlines</span>}
          </button>
        )}

        {/* User Role Card or Log In CTA */}
        {currentUser.role === 'Public User' ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 block">Public Access Mode</span>
                <span>Scan or submit reports freely without logging in.</span>
              </div>
            )}
            <button
              onClick={() => {
                onCloseMobile();
                onOpenLoginModal();
              }}
              title={isCollapsed ? 'Official Log In' : undefined}
              className={`w-full flex items-center justify-center space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black ${
                isCollapsed ? 'p-2' : 'py-2 px-3'
              } rounded-xl text-xs transition shadow`}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Official Log In</span>}
            </button>
          </div>
        ) : (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0 overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => {
                  onCloseMobile();
                  onLogout();
                }}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 py-1.5 px-2 rounded-lg text-xs font-semibold transition border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out to Public</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 sticky top-[48px] h-[calc(100vh-48px)] z-30 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Canvas */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
