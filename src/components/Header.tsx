import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Languages, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  Bell, 
  ChevronDown, 
  Activity, 
  Radio, 
  QrCode,
  FileText,
  Settings,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User as UserIcon,
  Lock,
  Menu
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { UserRole, Region, User, SystemLogoItem } from '../types';
import { getUsers, useLogos } from '../lib/storage';
import { LoginModal } from './LoginModal';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  onToggleSidebar?: () => void;
  showLoginModal?: boolean;
  setShowLoginModal?: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  activeTab,
  setActiveTab,
  unreadCount,
  onToggleSidebar,
  showLoginModal: externalShowLoginModal,
  setShowLoginModal: externalSetShowLoginModal
}) => {
  const { t } = useLanguage();
  const { isLightMode, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [internalShowLoginModal, setInternalShowLoginModal] = useState(false);
  const logos = useLogos();
  const masterLogo = logos.find(l => l.id === 'bika_master');

  const showLoginModal = externalShowLoginModal !== undefined ? externalShowLoginModal : internalShowLoginModal;
  const setShowLoginModal = externalSetShowLoginModal || setInternalShowLoginModal;

  const toggleLightMode = () => {
    toggleTheme();
  };


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    // Switch to default Public User
    const users = getUsers();
    const publicUser = users.find(u => u.role === 'Public User') || {
      id: 'guest',
      name: 'Public Citizen',
      email: '',
      role: 'Public User',
      region: 'Nationwide',
      active: true
    };
    onSwitchUser(publicUser);
    setActiveTab('public');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg w-full max-w-full overflow-hidden">
      {/* Top National Alert Strip */}
      <div className="bg-gradient-to-r from-yellow-600 via-emerald-600 to-blue-600 text-xs px-2 sm:px-4 py-1 flex items-center justify-between font-medium text-white overflow-hidden">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
          <span className="truncate text-[10px] sm:text-xs">
            KINGDOM OF ESWATINI • NATIONWIDE REPORTING SYSTEM
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 text-[10px] sm:text-xs">
          <span className="hidden lg:inline">EMERGENCY HOTLINE: 999 / 800-BIKA</span>
          <div className="flex items-center space-x-1 bg-black/30 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] whitespace-nowrap">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-amber-300">OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2.5 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand Logo & Left Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {onToggleSidebar && currentUser.role !== 'Public User' && activeTab !== 'public' && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => setActiveTab('public')}
            className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer group shrink-0"
          >
            {masterLogo?.customImageUrl ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950 border border-yellow-500/40 p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                <img 
                  src={masterLogo.customImageUrl} 
                  alt="BIKA System Crest" 
                  className="w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-emerald-500 to-blue-600 p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="font-extrabold text-base sm:text-2xl tracking-wider text-white font-mono">
                  {masterLogo?.acronym || 'BIKA'}
                </span>
                <span className="text-[9px] sm:text-xs bg-yellow-500/20 text-yellow-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-yellow-500/30 font-semibold">
                  ESWATINI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-light italic hidden md:block">
                {t('slogan')}
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleLightMode}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 rounded-lg p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold transition-all shadow shrink-0"
          >
            {isLightMode ? (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span className="hidden lg:inline text-slate-200">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="hidden lg:inline text-slate-200">Light</span>
              </>
            )}
          </button>

          {/* Official Account Login & Profile Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {currentUser.role !== 'Public User' && activeTab === 'public' && (
              <button
                onClick={() => setActiveTab(currentUser.role === 'Super Admin' ? 'command' : 'official')}
                className="hidden sm:flex items-center space-x-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow"
              >
                <span>Go to Operations</span>
              </button>
            )}

            {currentUser.role === 'Public User' ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[11px] sm:text-xs">Log In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1 sm:p-1.5 shrink-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-yellow-400 overflow-hidden shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentUser.role} ({currentUser.region})
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(true)}
                  title="Switch User Account"
                  className="p-1 text-yellow-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  title="Log Out to Public Mode"
                  className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          onSwitchUser(user);
          setShowLoginModal(false);
          if (user.role === 'Public User') {
            setActiveTab('public');
          } else if (user.role === 'Super Admin') {
            setActiveTab('command');
          } else {
            setActiveTab('official');
          }
        }}
      />
    </header>
  );
};

