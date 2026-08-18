import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Region, 
  SystemConfiguration, 
  SystemHealth, 
  DataUsageStats, 
  AuditRecord,
  EmergencyHotline,
  SystemLogoItem
} from '../types';
import { 
  Sliders, 
  Users, 
  Activity, 
  Database, 
  ShieldCheck, 
  QrCode, 
  Key, 
  Flame, 
  Clock, 
  Download, 
  FileText, 
  FileUp,
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  MessageSquare,
  Search,
  PhoneCall,
  Edit2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { 
  useUsers,
  useHotlines,
  useLogos,
  useSystemConfig,
  useAuditRecords,
  saveUser, 
  saveSystemConfig, 
  addAuditRecord,
  saveHotline, 
  deleteHotline, 
  saveSystemLogo, 
  updateLogoImage, 
  resetSystemLogo, 
  resetAllSystemLogos, 
  deleteCustomLogo,
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToSeed
} from '../lib/storage';
import { initialSystemHealth, initialDataUsage } from '../data/mockData';
import { LogoEditorModal } from './LogoEditorModal';

export const SuperAdminControl: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'users' | 'hotlines' | 'logos' | 'escalation' | 'config' | 'health' | 'dataUsage' | 'audit' | 'qrcode' | 'backups'
  >('users');

  // Reactive Single Source of Truth
  const logosList = useLogos();
  const hotlinesList = useHotlines();
  const usersList = useUsers();
  const liveSystemCfg = useSystemConfig();
  const auditLogs = useAuditRecords();

  // Logos Management State
  const [showLogoEditorModal, setShowLogoEditorModal] = useState<boolean>(false);
  const [selectedLogoIdToEdit, setSelectedLogoIdToEdit] = useState<string | undefined>(undefined);
  const [selectedLogoForUpload, setSelectedLogoForUpload] = useState<SystemLogoItem | null>(null);
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Hotlines Management State
  const [showAddHotlineModal, setShowAddHotlineModal] = useState<boolean>(false);
  const [editingHotline, setEditingHotline] = useState<EmergencyHotline | null>(null);
  const [hName, setHName] = useState('');
  const [hNumber, setHNumber] = useState('');
  const [hCategory, setHCategory] = useState<EmergencyHotline['category']>('Police');
  const [hDept, setHDept] = useState('');
  const [hHours, setHHours] = useState('24/7 Nationwide');
  const [hDesc, setHDesc] = useState('');
  const [hTollFree, setHTollFree] = useState(true);
  const [hActive, setHActive] = useState(true);

  // Users Management State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Police');
  const [newUserRegion, setNewUserRegion] = useState<Region>('Manzini');
  const [newUserDept, setNewUserDept] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('Police');
  const [editUserRegion, setEditUserRegion] = useState<Region>('Manzini');
  const [editUserDept, setEditUserDept] = useState<string>('');
  const [editUserPassword, setEditUserPassword] = useState<string>('');

  // System Configuration State
  const [systemCfg, setSystemCfg] = useState<SystemConfiguration>(liveSystemCfg);

  useEffect(() => {
    setSystemCfg(liveSystemCfg);
  }, [liveSystemCfg]);

  // Audit Logs Search
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // QR Code Generator State
  const [selectedRankForQR, setSelectedRankForQR] = useState<string>('Manzini Main Bus & Kombi Rank');
  const [qrGenerated, setQrGenerated] = useState<boolean>(true);

  // Backup & Restore State
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Add User Handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      region: newUserRegion,
      department: newUserDept || newUserRole,
      password: newUserPassword || 'Bika123!',
      active: true,
    };

    saveUser(newUser);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    alert(`User ${newUser.name} created successfully with role ${newUser.role}`);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserRole(u.role);
    setEditUserRegion(u.region);
    setEditUserDept(u.department || '');
    setEditUserPassword(u.password || '');
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated: User = {
      ...editingUser,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      region: editUserRegion,
      department: editUserDept,
      password: editUserPassword,
    };

    saveUser(updated);
    addAuditRecord({
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'USER_EDITED',
      targetId: updated.id,
      details: `Updated account details/password for ${updated.name} (${updated.email})`,
      ipAddress: '197.221.250.12'
    });

    setEditingUser(null);
    alert(`Successfully updated profile & password for ${updated.name}`);
  };

  const handleToggleUserStatus = (u: User) => {
    const updated = { ...u, active: !u.active };
    saveUser(updated);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemConfig(systemCfg);
    alert('System Configuration updated successfully!');
  };

  const handleResetDatabase = () => {
    if (confirm('CRITICAL WARNING: This will reset all BIKA database records to initial seed state. Proceed?')) {
      resetDatabaseToSeed();
      alert('System database reset to seed state.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase">
              VIRTUAL CONTROL CENTRE • SUPER ADMIN
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            BIKA National Platform Control & Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full authority management of users, SLA escalation deadlines, integration gateways, system health, and audit logs.
          </p>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center space-x-1 overflow-x-auto no-scrollbar text-xs font-semibold">
        {[
          { id: 'users', label: 'User Governance', icon: Users },
          { id: 'hotlines', label: 'Emergency Hotlines', icon: PhoneCall },
          { id: 'logos', label: 'Website Logos & Partner Text', icon: ImageIcon },
          { id: 'escalation', label: 'Escalation Engine', icon: Flame },
          { id: 'config', label: 'Integrations & Rules', icon: Key },
          { id: 'health', label: 'System Health', icon: Activity },
          { id: 'dataUsage', label: 'Data Usage Monitor', icon: Database },
          { id: 'qrcode', label: 'Rank QR Code Generator', icon: QrCode },
          { id: 'audit', label: 'Audit Trail Logs', icon: FileText },
          { id: 'backups', label: 'Database Backup & Restore', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-md font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION: EMERGENCY HOTLINES MANAGEMENT */}
      {activeSection === 'hotlines' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-yellow-400" />
                <span>National Emergency & Toll-Free Hotlines</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure official emergency lines displayed to the public across the Kingdom of Eswatini.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingHotline(null);
                setHName('');
                setHNumber('');
                setHCategory('Police');
                setHDept('Royal Eswatini Police Service');
                setHHours('24/7 Nationwide');
                setHDesc('');
                setHTollFree(true);
                setHActive(true);
                setShowAddHotlineModal(true);
              }}
              className="flex items-center space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hotline</span>
            </button>
          </div>

          {/* Hotlines Table / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotlinesList.map((hotline) => (
              <div
                key={hotline.id}
                className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between space-y-3 ${
                  hotline.active ? 'border-slate-800' : 'border-red-900/40 opacity-60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">{hotline.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{hotline.department}</span>
                    </div>
                    <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-lg font-mono font-black text-xs">
                      {hotline.number}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{hotline.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {hotline.category}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {hotline.availableHours}
                    </span>
                    {hotline.isTollFree && (
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                        TOLL-FREE
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => {
                      const updated: EmergencyHotline = { ...hotline, active: !hotline.active };
                      saveHotline(updated);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border ${
                      hotline.active 
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {hotline.active ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingHotline(hotline);
                        setHName(hotline.name);
                        setHNumber(hotline.number);
                        setHCategory(hotline.category);
                        setHDept(hotline.department);
                        setHHours(hotline.availableHours);
                        setHDesc(hotline.description);
                        setHTollFree(hotline.isTollFree);
                        setHActive(hotline.active);
                        setShowAddHotlineModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700"
                      title="Edit Hotline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete hotline "${hotline.name}" (${hotline.number})?`)) {
                          deleteHotline(hotline.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700"
                      title="Delete Hotline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: BRANDING & AUTHORITY LOGOS MANAGEMENT */}
      {activeSection === 'logos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base font-extrabold text-white">
                  Website Logos & Partner Text
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Change logo images (upload file or enter image URL) and edit organization names, acronyms, and descriptions displayed across the website.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  if (confirm('Reset all authority and system logos to official default vector insignia?')) {
                    resetAllSystemLogos();
                    setUploadSuccessMsg('All logos reset to system defaults.');
                  }
                }}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                <span>Reset All Defaults</span>
              </button>

              <button
                onClick={() => {
                  setSelectedLogoIdToEdit(undefined);
                  setShowLogoEditorModal(true);
                }}
                className="flex items-center space-x-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner Agency</span>
              </button>
            </div>
          </div>

          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {/* Logos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logosList.map((logo) => {
              const isMaster = logo.id === 'bika_master';
              return (
                <div
                  key={logo.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Logo Thumbnail */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {logo.customImageUrl ? (
                            <img 
                              src={logo.customImageUrl} 
                              alt={logo.name} 
                              className="w-full h-full object-contain" 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-yellow-400 font-mono font-black text-xs">
                              <ImageIcon className="w-5 h-5 mb-0.5" />
                              <span className="text-[9px]">{logo.acronym.slice(0, 4)}</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-black text-white truncate">{logo.name}</h4>
                            {isMaster && (
                              <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                MASTER CREST
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{logo.subtitle}</p>
                          <span className="inline-block mt-1 bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                            {logo.acronym} • {logo.role}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${
                        logo.customImageUrl 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {logo.customImageUrl ? 'CUSTOM IMAGE' : 'DEFAULT'}
                      </span>
                    </div>

                    {/* Change Image Section */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span className="flex items-center space-x-1.5 text-yellow-400">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Change Image</span>
                        </span>
                        {logo.customImageUrl && (
                          <button
                            onClick={() => {
                              resetSystemLogo(logo.id);
                              setUploadSuccessMsg(`"${logo.name}" reset to default insignia.`);
                            }}
                            className="text-[10px] text-slate-400 hover:text-yellow-400 transition"
                          >
                            Reset Image
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 hover:border-yellow-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  const dataUrl = evt.target?.result as string;
                                  updateLogoImage(logo.id, dataUrl);
                                  setUploadSuccessMsg(`Image for "${logo.name}" updated successfully!`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        <input
                          type="url"
                          placeholder="Or paste image URL..."
                          defaultValue={logo.customImageUrl || ''}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val && val !== logo.customImageUrl) {
                              updateLogoImage(logo.id, val);
                              setUploadSuccessMsg(`Image URL for "${logo.name}" saved!`);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:border-yellow-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change Text / Edit Full Details Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() => {
                        setSelectedLogoIdToEdit(logo.id);
                        setShowLogoEditorModal(true);
                      }}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-bold transition shadow"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Text & Details</span>
                    </button>

                    {logo.id.startsWith('custom-') && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete partner agency "${logo.name}"?`)) {
                            deleteCustomLogo(logo.id);
                            setUploadSuccessMsg(`Partner agency removed.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 transition"
                        title="Delete Agency"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* SECTION 1: USER GOVERNANCE */}
      {activeSection === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-white">Registered Official Accounts</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Official Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Password</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-400">{u.email}</td>
                    <td className="p-3 font-mono text-yellow-400 font-bold">{u.password || 'Bika2026!'}</td>
                    <td className="p-3 font-bold text-yellow-400">{u.role}</td>
                    <td className="p-3">{u.region}</td>
                    <td className="p-3 text-slate-400">{u.department || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="text-xs text-yellow-400 hover:underline font-bold"
                        >
                          Edit Profile / Password
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className="text-xs text-purple-400 hover:underline font-bold"
                        >
                          {u.active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: ESCALATION ENGINE */}
      {activeSection === 'escalation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-white">Dynamic SLA Escalation Rules</h2>
          <p className="text-xs text-slate-400">
            Configure automated response deadlines per incident severity level. Deadlines are evaluated automatically by the BIKA engine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemCfg.escalationRules.map((rule, idx) => (
              <div key={rule.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    rule.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                    rule.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {rule.severity} SEVERITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Rule ID: {rule.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">1st Response Deadline (Mins)</label>
                    <input
                      type="number"
                      value={rule.firstResponseDeadlineMins}
                      onChange={(e) => {
                        const newRules = [...systemCfg.escalationRules];
                        newRules[idx].firstResponseDeadlineMins = Number(e.target.value);
                        setSystemCfg({ ...systemCfg, escalationRules: newRules });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Escalation Deadline (Mins)</label>
                    <input
                      type="number"
                      value={rule.escalationDeadlineMins}
                      onChange={(e) => {
                        const newRules = [...systemCfg.escalationRules];
                        newRules[idx].escalationDeadlineMins = Number(e.target.value);
                        setSystemCfg({ ...systemCfg, escalationRules: newRules });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-500 text-[10px] mb-1">Responsible Unit</label>
                  <input
                    type="text"
                    value={rule.responsibleDepartment}
                    onChange={(e) => {
                      const newRules = [...systemCfg.escalationRules];
                      newRules[idx].responsibleDepartment = e.target.value;
                      setSystemCfg({ ...systemCfg, escalationRules: newRules });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Save Escalation Engine Rules
          </button>
        </div>
      )}

      {/* SECTION 3: SYSTEM HEALTH */}
      {activeSection === 'health' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">Application & API Health Monitor</h2>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SYSTEM STATUS: OPERATIONAL (99.98% UPTIME)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Database Status</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{initialSystemHealth.dbStatus}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active Users</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">{initialSystemHealth.activeUsersCount}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Storage Used</span>
              <div className="text-2xl font-extrabold text-yellow-400 font-mono mt-1">{initialSystemHealth.storageUsageMb} MB</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">API Error Rate</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{initialSystemHealth.errorRatePercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: RANK QR CODE GENERATOR */}
      {activeSection === 'qrcode' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-white">Terminal & Rank Poster QR Code Generator</h2>
            <p className="text-xs text-slate-400 mt-1">
              Generate official BIKA instant reporting QR posters to mount at bus ranks, airport terminals, border posts, and clinics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Facility or Terminal:</label>
                <select
                  value={selectedRankForQR}
                  onChange={(e) => setSelectedRankForQR(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Manzini Main Bus & Kombi Rank">Manzini Main Bus & Kombi Rank</option>
                  <option value="Mbabane Central Rank">Mbabane Central Rank</option>
                  <option value="King Mswati III International Airport">King Mswati III International Airport</option>
                  <option value="Lomahasha Customs Border Plaza">Lomahasha Customs Border Plaza</option>
                  <option value="Nhlangano Rank & Market">Nhlangano Rank & Market</option>
                  <option value="RFM Hospital Clinic Annex">RFM Hospital Clinic Annex</option>
                </select>
              </div>

              <button
                onClick={() => setQrGenerated(true)}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
              >
                Generate Printable Poster
              </button>
            </div>

            {/* Render Poster Preview */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 border-4 border-yellow-500 text-center space-y-3 shadow-2xl">
              <div className="text-xl font-extrabold font-mono tracking-wider text-slate-950">
                BIKA ESWATINI
              </div>
              <div className="text-xs font-bold text-slate-700">
                SEE SOMETHING, SAY SOMETHING
              </div>

              {/* QR Image Graphic Representation */}
              <div className="w-36 h-36 bg-slate-900 p-2 mx-auto rounded-xl flex items-center justify-center">
                <QrCode className="w-28 h-28 text-white" />
              </div>

              <div className="text-xs font-extrabold text-slate-900">
                {selectedRankForQR}
              </div>
              <p className="text-[10px] text-slate-600">
                Scan with smartphone camera to report incidents in 30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: AUDIT LOGS */}
      {activeSection === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white">Immutable Platform Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5">Search and trace all official actions, system edits, logins, and status updates.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Search actor, role, action, target BIKA ID, details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target ID</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs
                  .filter((a) => {
                    if (!auditSearchQuery.trim()) return true;
                    const q = auditSearchQuery.toLowerCase();
                    return (
                      a.userName.toLowerCase().includes(q) ||
                      a.userRole.toLowerCase().includes(q) ||
                      a.action.toLowerCase().includes(q) ||
                      (a.targetId && a.targetId.toLowerCase().includes(q)) ||
                      a.details.toLowerCase().includes(q) ||
                      a.timestamp.toLowerCase().includes(q)
                    );
                  })
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-slate-400">{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-bold text-white">{a.userName}</td>
                      <td className="p-3 font-semibold text-yellow-400">{a.userRole}</td>
                      <td className="p-3 font-mono text-emerald-400">{a.action}</td>
                      <td className="p-3 font-mono text-slate-300">{a.targetId || '-'}</td>
                      <td className="p-3 text-slate-400">{a.details}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 6: BACKUPS & SINGLE SOURCE OF TRUTH RECOVERY */}
      {activeSection === 'backups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span>Unified Database Management & Disaster Recovery</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              The BIKA Single Source of Truth synchronises incidents, fleet, health inspection logs, user roles, emergency hotlines, and branding across all active sessions and user terminals.
            </p>
          </div>

          {restoreStatus && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 ${
              restoreStatus.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}>
              {restoreStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{restoreStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Snapshot */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-3 text-purple-400">
                <Download className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-bold text-white">Export Database Snapshot</h3>
                  <p className="text-[11px] text-slate-400">Download complete structured backup bundle</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Generates a standardized JSON archive containing all 8 platform collections (Incidents, Fleets, Establishments, Users, Hotlines, Authority Logos, Escalation Rules, and Audit Logs).
              </p>
              <button
                onClick={() => {
                  try {
                    const jsonBackup = exportDatabaseBackup();
                    const blob = new Blob([jsonBackup], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `BIKA_ESWATINI_UNIFIED_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    setRestoreStatus({ type: 'success', message: 'Full database snapshot exported successfully.' });
                  } catch (e: any) {
                    setRestoreStatus({ type: 'error', message: 'Failed to export backup: ' + e.message });
                  }
                }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition shadow flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export & Download Backup JSON</span>
              </button>
            </div>

            {/* Import & Restore Snapshot */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-3 text-emerald-400">
                <FileUp className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-bold text-white">Restore Database Snapshot</h3>
                  <p className="text-[11px] text-slate-400">Upload and sync JSON backup across all terminals</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Upload a verified BIKA JSON backup to restore all tables and broadcast synchronized updates in real time.
              </p>
              <label className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer">
                <FileUp className="w-4 h-4 text-emerald-400" />
                <span>Choose & Restore Backup File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      const res = importDatabaseBackup(content);
                      setRestoreStatus({
                        type: res.success ? 'success' : 'error',
                        message: res.message
                      });
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          {/* Seed State Reset */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-300 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset Database to Official Seed State</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Restores national mock registries, official police and hospital numbers, and default authority logos.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('CRITICAL ACTION: Are you sure you want to reset all collections to default seed state? This action will overwrite any unexported changes.')) {
                  resetDatabaseToSeed();
                  setRestoreStatus({ type: 'success', message: 'System database restored to default seed state and synchronized!' });
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition whitespace-nowrap"
            >
              Reset to Seed State
            </button>
          </div>
        </div>
      )}


      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Official Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Police">Police</option>
                  <option value="Health Inspector">Health Inspector</option>
                  <option value="Rank Marshal">Rank Marshal</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Assigned Region</label>
                <select
                  value={newUserRegion}
                  onChange={(e) => setNewUserRegion(e.target.value as Region)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Hhohho">Hhohho</option>
                  <option value="Manzini">Manzini</option>
                  <option value="Shiselweni">Shiselweni</option>
                  <option value="Lubombo">Lubombo</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Account Password</label>
                <input
                  type="text"
                  placeholder="e.g. Bika2026!"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Create Official Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Reset Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-white">Edit User Profile & Reset Password</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Police">Police</option>
                  <option value="Health Inspector">Health Inspector</option>
                  <option value="Rank Marshal">Rank Marshal</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Region</label>
                <select
                  value={editUserRegion}
                  onChange={(e) => setEditUserRegion(e.target.value as Region)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Hhohho">Hhohho</option>
                  <option value="Manzini">Manzini</option>
                  <option value="Shiselweni">Shiselweni</option>
                  <option value="Lubombo">Lubombo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department / Division</label>
                <input
                  type="text"
                  value={editUserDept}
                  onChange={(e) => setEditUserDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold text-yellow-400">
                  New Password / Reset Password
                </label>
                <input
                  type="text"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-yellow-500/40 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Save Profile & Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Website Logo & Partner Text Editor Modal */}
      {showLogoEditorModal && (
        <LogoEditorModal
          initialSelectedId={selectedLogoIdToEdit}
          onClose={() => {
            setShowLogoEditorModal(false);
            setSelectedLogoIdToEdit(undefined);
          }}
        />
      )}
    </div>
  );
};
