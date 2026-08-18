import React, { useState, useEffect } from 'react';
import { User, Incident } from './types';
import { Header } from './components/Header';
import { SidebarNavigation } from './components/SidebarNavigation';
import { PublicPortal } from './components/PublicPortal';
import { CommandCentre } from './components/CommandCentre';
import { OfficialDashboard } from './components/OfficialDashboard';
import { FleetManager } from './components/FleetManager';
import { EstablishmentManager } from './components/EstablishmentManager';
import { Analytics } from './components/Analytics';
import { SuperAdminControl } from './components/SuperAdminControl';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { HotlineEditorModal } from './components/HotlineEditorModal';
import { LogoEditorModal } from './components/LogoEditorModal';
import { LanguageProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { 
  initStorage, 
  useIncidents,
  GUEST_USER 
} from './lib/storage';

export default function App() {
  useEffect(() => {
    initStorage();
  }, []);

  // Default to Guest Public User on landing (no user profiles loaded without signing in)
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [activeTab, setActiveTab] = useState<string>('public');
  const incidents = useIncidents();

  // Left Sidebar Toggle State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('bika_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showHotlineModal, setShowHotlineModal] = useState<boolean>(false);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [selectedLogoIdForEdit, setSelectedLogoIdForEdit] = useState<string | undefined>(undefined);

  // Selected Incident for Details Modal
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('bika_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    setCurrentUser(GUEST_USER);
    setActiveTab('public');
  };

  const handleOpenTrackReport = (trackId?: string) => {
    if (trackId) {
      const found = incidents.find(i => i.id.toLowerCase() === trackId.toLowerCase());
      if (found) {
        setSelectedIncident(found);
      } else {
        alert(`Incident ID "${trackId}" was not found. Please verify the BIKA reference number.`);
      }
    }
  };

  const openIncidentsCount = incidents.filter(i => i.status !== 'Closed' && i.status !== 'Resolved').length;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-yellow-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
          {/* Top Header */}
          <Header
            currentUser={currentUser}
            onSwitchUser={(usr) => {
              setCurrentUser(usr);
              if (usr.role === 'Public User') {
                setActiveTab('public');
              } else if (usr.role === 'Super Admin') {
                setActiveTab('command');
              } else {
                setActiveTab('official');
              }
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadCount={openIncidentsCount}
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            showLoginModal={showLoginModal}
            setShowLoginModal={setShowLoginModal}
          />

          {/* Horizontal Workspace with Left Sidebar */}
          <div className="flex-1 flex w-full max-w-full relative">
            {/* Left Sidebar Navigation - Only shown for signed-in officials in official tabs */}
            {currentUser.role !== 'Public User' && activeTab !== 'public' && (
              <SidebarNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentUser={currentUser}
                onOpenLoginModal={() => setShowLoginModal(true)}
                onLogout={handleLogout}
                openIncidentsCount={openIncidentsCount}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapsed={toggleSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
                onOpenHotlines={() => {
                  setActiveTab('public');
                  window.scrollTo({ top: 1200, behavior: 'smooth' });
                }}
              />
            )}

            {/* Main Workspace Body */}
            <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
              {activeTab === 'public' && (
                <PublicPortal
                  currentUser={currentUser}
                  onIncidentSubmitted={() => {}}
                  onOpenTrackReport={handleOpenTrackReport}
                  onOpenAdminHotlineModal={() => setShowHotlineModal(true)}
                  onOpenLogoEditor={(logoId) => {
                    setSelectedLogoIdForEdit(logoId);
                    setShowLogoModal(true);
                  }}
                />
              )}

              {activeTab === 'command' && (
                <CommandCentre
                  incidents={incidents}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                />
              )}

              {activeTab === 'official' && (
                <OfficialDashboard
                  currentUser={currentUser}
                  incidents={incidents}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onRefreshData={() => {}}
                />
              )}

              {activeTab === 'fleet' && (
                <FleetManager />
              )}

              {activeTab === 'establishments' && (
                <EstablishmentManager />
              )}

              {activeTab === 'analytics' && (
                <Analytics incidents={incidents} />
              )}

              {activeTab === 'admin' && (
                <SuperAdminControl />
              )}
            </main>
          </div>

          {/* System & Authority Logos Editor Modal for Super Admin */}
          <LogoEditorModal
            isOpen={showLogoModal}
            initialSelectedLogoId={selectedLogoIdForEdit}
            onClose={() => {
              setShowLogoModal(false);
              setSelectedLogoIdForEdit(undefined);
            }}
            onLogosUpdated={() => {}}
          />

          {/* Emergency Hotline Editor Modal for Super Admin */}
          <HotlineEditorModal
            isOpen={showHotlineModal}
            onClose={() => setShowHotlineModal(false)}
            onUpdated={() => {}}
          />

          {/* Incident Details & Workflow Chat Modal */}
          {selectedIncident && (
            <IncidentDetailsModal
              incident={selectedIncident}
              currentUser={currentUser}
              onClose={() => setSelectedIncident(null)}
              onUpdate={(updated) => {
                setSelectedIncident(updated);
              }}
            />
          )}

          {/* Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">
              BIKA – Eswatini Integrated Real-Time Incident, Transport & Trade Reporting Platform
            </div>
            <div className="text-slate-400">
              Kingdom of Eswatini • Ministry of Public Works • National Road Transport Council • REPS • Fire & Emergency Services
            </div>
          </footer>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}


