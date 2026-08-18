import { useState, useEffect } from 'react';
import { 
  Incident, 
  VehicleFleet, 
  Establishment, 
  SystemConfiguration, 
  AuditRecord, 
  SystemHealth, 
  DataUsageStats,
  User,
  UserRole,
  Attachment,
  EmergencyHotline,
  SystemLogoItem,
  BikaDatabaseSnapshot
} from '../types';
import { 
  initialIncidents, 
  initialFleet, 
  initialEstablishments, 
  defaultSystemConfig, 
  initialSystemHealth, 
  initialDataUsage, 
  initialAuditRecords, 
  initialUsers,
  initialHotlines,
  initialSystemLogos
} from '../data/mockData';

// Storage Keys
const INCIDENTS_KEY = 'bika_incidents_v3';
const FLEET_KEY = 'bika_fleet_v3';
const ESTABLISHMENTS_KEY = 'bika_establishments_v3';
const CONFIG_KEY = 'bika_config_v3';
const AUDIT_KEY = 'bika_audit_v3';
const USERS_KEY = 'bika_users_v3';
const HOTLINES_KEY = 'bika_hotlines_v3';
const LOGOS_KEY = 'bika_logos_v3';
const DB_VERSION_KEY = 'bika_db_version';
const CURRENT_DB_VERSION = '3.0.0';

// Global Unified Event Target for single-tab reactive updates
export const bikaEventEmitter = new EventTarget();

// Cross-tab BroadcastChannel
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('bika_unified_database_bus');
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type) {
        bikaEventEmitter.dispatchEvent(new CustomEvent('bika-update', { 
          detail: { type: event.data.type, data: event.data.data, source: 'remote' } 
        }));
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel initialization failed, falling back to storage events', e);
  }
}

// Window Storage Event Fallback for older browsers / iframe boundaries
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('bika_')) {
      const type = event.key.replace('bika_', '').replace('_v3', '');
      bikaEventEmitter.dispatchEvent(new CustomEvent('bika-update', { 
        detail: { type, source: 'storage-event' } 
      }));
    }
  });
}

/**
 * Dispatches a change event locally and across all browser tabs/windows
 */
export function notifyChange(type: string, data?: any) {
  // 1. Local Event Target
  bikaEventEmitter.dispatchEvent(new CustomEvent('bika-update', { 
    detail: { type, data, source: 'local' } 
  }));

  // 2. Cross-tab broadcast
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (e) {
      console.warn('Failed to broadcast storage change', e);
    }
  }
}

/**
 * Initializes the unified storage if keys are missing
 */
export function initStorage() {
  if (typeof window === 'undefined') return;

  try {
    if (!localStorage.getItem(DB_VERSION_KEY)) {
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    }
    if (!localStorage.getItem(INCIDENTS_KEY)) {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(initialIncidents));
    }
    if (!localStorage.getItem(FLEET_KEY)) {
      localStorage.setItem(FLEET_KEY, JSON.stringify(initialFleet));
    }
    if (!localStorage.getItem(ESTABLISHMENTS_KEY)) {
      localStorage.setItem(ESTABLISHMENTS_KEY, JSON.stringify(initialEstablishments));
    }
    if (!localStorage.getItem(CONFIG_KEY)) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultSystemConfig));
    }
    if (!localStorage.getItem(AUDIT_KEY)) {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(initialAuditRecords));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(HOTLINES_KEY)) {
      localStorage.setItem(HOTLINES_KEY, JSON.stringify(initialHotlines));
    }
    if (!localStorage.getItem(LOGOS_KEY)) {
      localStorage.setItem(LOGOS_KEY, JSON.stringify(initialSystemLogos));
    }
  } catch (e) {
    console.error('Failed to initialize local database storage:', e);
  }
}

// Execute initial storage bootstrap on module load
initStorage();

// ==========================================
// 1. INCIDENTS CRUD & ACTIONS
// ==========================================
export function getIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_KEY);
    return raw ? JSON.parse(raw) : initialIncidents;
  } catch (e) {
    return initialIncidents;
  }
}

export function saveIncident(incident: Incident): Incident {
  const list = getIncidents();
  const idx = list.findIndex(i => i.id === incident.id);
  
  const now = new Date().toISOString();
  incident.updatedAt = now;

  if (idx >= 0) {
    list[idx] = incident;
  } else {
    list.unshift(incident);
  }

  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(list));
  
  // Log audit record
  addAuditRecord({
    userName: incident.reporterName || 'Public Citizen',
    userRole: 'Public User',
    action: idx >= 0 ? 'UPDATE_INCIDENT' : 'CREATE_INCIDENT',
    targetId: incident.id,
    ipAddress: '196.202.210.12',
    details: `Incident ${incident.id} (${incident.category}) saved with status "${incident.status}"`,
  });

  notifyChange('incidents', incident);
  return incident;
}

export function deleteIncident(id: string) {
  const list = getIncidents().filter(i => i.id !== id);
  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'DELETE_INCIDENT',
    targetId: id,
    ipAddress: '197.221.250.12',
    details: `Incident ${id} deleted from database`,
  });

  notifyChange('incidents', id);
}

export function generateIncidentId(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const uniqueId = String(Math.floor(Math.random() * 900) + 100);
  return `BIKA-${day}-${month}-${year}-${uniqueId}`;
}

export function checkDuplicateIncident(
  mode: string, 
  location: string, 
  vehicleReg?: string, 
  restaurantName?: string
): Incident | null {
  const list = getIncidents();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // last 24 hours

  return list.find(inc => {
    if (inc.createdAt < cutoff || inc.status === 'Closed' || inc.status === 'Resolved') {
      return false;
    }
    if (vehicleReg && inc.vehicleRegistration?.toLowerCase() === vehicleReg.toLowerCase().trim()) {
      return true;
    }
    if (restaurantName && inc.restaurantName?.toLowerCase() === restaurantName.toLowerCase().trim()) {
      return true;
    }
    if (inc.mode === mode && inc.location.toLowerCase().includes(location.toLowerCase().trim())) {
      return true;
    }
    return false;
  }) || null;
}

// ==========================================
// 2. FLEET CRUD
// ==========================================
export function getFleet(): VehicleFleet[] {
  try {
    const raw = localStorage.getItem(FLEET_KEY);
    return raw ? JSON.parse(raw) : initialFleet;
  } catch (e) {
    return initialFleet;
  }
}

export function saveFleetItem(item: VehicleFleet): VehicleFleet {
  const list = getFleet();
  const idx = list.findIndex(f => f.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  
  localStorage.setItem(FLEET_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Transport Officer',
    userRole: 'Rank Marshal',
    action: idx >= 0 ? 'UPDATE_FLEET' : 'CREATE_FLEET',
    targetId: item.registrationNumber,
    ipAddress: '197.221.250.12',
    details: `Fleet record ${item.registrationNumber} (${item.operatorName}) saved`,
  });

  notifyChange('fleet', item);
  return item;
}

export function deleteFleetItem(id: string) {
  const list = getFleet().filter(f => f.id !== id);
  localStorage.setItem(FLEET_KEY, JSON.stringify(list));
  notifyChange('fleet', id);
}

// ==========================================
// 3. ESTABLISHMENTS CRUD
// ==========================================
export function getEstablishments(): Establishment[] {
  try {
    const raw = localStorage.getItem(ESTABLISHMENTS_KEY);
    return raw ? JSON.parse(raw) : initialEstablishments;
  } catch (e) {
    return initialEstablishments;
  }
}

export function saveEstablishment(item: Establishment): Establishment {
  const list = getEstablishments();
  const idx = list.findIndex(e => e.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  
  localStorage.setItem(ESTABLISHMENTS_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Health Inspector',
    userRole: 'Health Inspector',
    action: idx >= 0 ? 'UPDATE_ESTABLISHMENT' : 'CREATE_ESTABLISHMENT',
    targetId: item.name,
    ipAddress: '197.221.250.12',
    details: `Establishment ${item.name} status updated to ${item.healthInspectionStatus}`,
  });

  notifyChange('establishments', item);
  return item;
}

export function deleteEstablishment(id: string) {
  const list = getEstablishments().filter(e => e.id !== id);
  localStorage.setItem(ESTABLISHMENTS_KEY, JSON.stringify(list));
  notifyChange('establishments', id);
}

// ==========================================
// 4. USERS GOVERNANCE & AUTHENTICATION
// ==========================================
export const GUEST_USER: User = {
  id: 'guest',
  name: 'Public Citizen',
  email: '',
  role: 'Public User',
  region: 'Nationwide',
  active: true,
};

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : initialUsers;
  } catch (e) {
    return initialUsers;
  }
}

export function saveUser(user: User): User {
  const list = getUsers();
  const idx = list.findIndex(u => u.id === user.id);
  if (idx >= 0) list[idx] = user;
  else list.unshift(user);
  
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: idx >= 0 ? 'UPDATE_USER' : 'CREATE_USER',
    targetId: user.email,
    ipAddress: '197.221.250.12',
    details: `User account ${user.name} (${user.role}, active: ${user.active}) saved`,
  });

  notifyChange('users', user);
  return user;
}

export function deleteUser(id: string) {
  const list = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'DELETE_USER',
    targetId: id,
    ipAddress: '197.221.250.12',
    details: `User ID ${id} permanently removed`,
  });

  notifyChange('users', id);
}

// ==========================================
// 5. EMERGENCY HOTLINES DIRECTORY
// ==========================================
export function getHotlines(): EmergencyHotline[] {
  try {
    const raw = localStorage.getItem(HOTLINES_KEY);
    return raw ? JSON.parse(raw) : initialHotlines;
  } catch (e) {
    return initialHotlines;
  }
}

export function saveHotline(hotline: EmergencyHotline): EmergencyHotline {
  const list = getHotlines();
  const idx = list.findIndex(h => h.id === hotline.id);
  if (idx >= 0) {
    list[idx] = hotline;
  } else {
    list.push(hotline);
  }
  
  localStorage.setItem(HOTLINES_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: idx >= 0 ? 'UPDATE_HOTLINE' : 'CREATE_HOTLINE',
    targetId: hotline.number,
    ipAddress: '197.221.250.12',
    details: `Hotline ${hotline.name} (${hotline.number}) updated`,
  });

  notifyChange('hotlines', hotline);
  return hotline;
}

export function deleteHotline(id: string) {
  const list = getHotlines().filter(h => h.id !== id);
  localStorage.setItem(HOTLINES_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'DELETE_HOTLINE',
    targetId: id,
    ipAddress: '197.221.250.12',
    details: `Emergency Hotline ID ${id} deleted`,
  });

  notifyChange('hotlines', id);
}

// ==========================================
// 6. SYSTEM & AUTHORITY BRANDING LOGOS
// ==========================================
export function getSystemLogos(): SystemLogoItem[] {
  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    if (!raw) return initialSystemLogos;
    const parsed = JSON.parse(raw);
    const merged = [...initialSystemLogos];
    parsed.forEach((p: SystemLogoItem) => {
      const idx = merged.findIndex(m => m.id === p.id);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...p };
      } else {
        merged.push(p);
      }
    });
    return merged;
  } catch (e) {
    return initialSystemLogos;
  }
}

export function getSystemLogo(id: string): SystemLogoItem | undefined {
  const logos = getSystemLogos();
  return logos.find(l => l.id === id);
}

export function saveSystemLogo(logo: SystemLogoItem): SystemLogoItem {
  const list = getSystemLogos();
  const idx = list.findIndex(l => l.id === logo.id);
  const updatedLogo = { ...logo, updatedAt: new Date().toISOString() };
  
  if (idx >= 0) {
    list[idx] = updatedLogo;
  } else {
    list.push(updatedLogo);
  }
  
  localStorage.setItem(LOGOS_KEY, JSON.stringify(list));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'UPDATE_LOGO',
    targetId: logo.acronym,
    ipAddress: '197.221.250.12',
    details: `Updated branding/insignia for ${logo.name} (${logo.acronym})`,
  });

  notifyChange('logos', updatedLogo);
  return updatedLogo;
}

export function updateLogoImage(id: string, customImageUrl: string): SystemLogoItem | undefined {
  const list = getSystemLogos();
  const idx = list.findIndex(l => l.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], customImageUrl, updatedAt: new Date().toISOString() };
    localStorage.setItem(LOGOS_KEY, JSON.stringify(list));
    
    addAuditRecord({
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'UPLOAD_LOGO_IMAGE',
      targetId: id,
      ipAddress: '197.221.250.12',
      details: `Custom seal/image uploaded for ${list[idx].name}`,
    });

    notifyChange('logos', list[idx]);
    return list[idx];
  }
  return undefined;
}

export function resetSystemLogo(id: string): SystemLogoItem | undefined {
  const list = getSystemLogos();
  const idx = list.findIndex(l => l.id === id);
  const defaultItem = initialSystemLogos.find(l => l.id === id);
  if (idx >= 0) {
    list[idx] = {
      ...(defaultItem || list[idx]),
      customImageUrl: undefined,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(LOGOS_KEY, JSON.stringify(list));
    notifyChange('logos', list[idx]);
    return list[idx];
  }
  return undefined;
}

export function resetAllSystemLogos() {
  localStorage.setItem(LOGOS_KEY, JSON.stringify(initialSystemLogos));
  notifyChange('logos', initialSystemLogos);
}

export function deleteCustomLogo(id: string) {
  const list = getSystemLogos().filter(l => l.id !== id);
  localStorage.setItem(LOGOS_KEY, JSON.stringify(list));
  notifyChange('logos', id);
}

// ==========================================
// 7. SYSTEM CONFIGURATION & ESCALATION RULES
// ==========================================
export function getSystemConfig(): SystemConfiguration {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : defaultSystemConfig;
  } catch (e) {
    return defaultSystemConfig;
  }
}

export function saveSystemConfig(cfg: SystemConfiguration): SystemConfiguration {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  
  addAuditRecord({
    userName: 'Super Admin',
    userRole: 'Super Admin',
    action: 'UPDATE_SYSTEM_CONFIG',
    targetId: 'SYSTEM_SETTINGS',
    ipAddress: '197.221.250.12',
    details: 'System-wide configuration, timeouts, and escalation rules saved',
  });

  notifyChange('config', cfg);
  return cfg;
}

// ==========================================
// 8. AUDIT LOGS
// ==========================================
export function getAuditRecords(): AuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : initialAuditRecords;
  } catch (e) {
    return initialAuditRecords;
  }
}

export function addAuditRecord(record: Omit<AuditRecord, 'id' | 'timestamp'>) {
  try {
    const list = getAuditRecords();
    const newRec: AuditRecord = {
      ...record,
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
    };
    list.unshift(newRec);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, 500))); // Cap at 500
    notifyChange('audit', newRec);
  } catch (e) {
    console.warn('Audit record append error', e);
  }
}

// ==========================================
// 9. UNIFIED DATABASE SNAPSHOT, EXPORT & IMPORT
// ==========================================
export function getDatabaseSnapshot(): BikaDatabaseSnapshot {
  return {
    version: CURRENT_DB_VERSION,
    exportedAt: new Date().toISOString(),
    system: 'BIKA Eswatini Unified Reporting Platform',
    incidents: getIncidents(),
    fleet: getFleet(),
    establishments: getEstablishments(),
    users: getUsers(),
    hotlines: getHotlines(),
    logos: getSystemLogos(),
    config: getSystemConfig(),
    audit: getAuditRecords(),
  };
}

export function exportDatabaseBackup(): string {
  const snapshot = getDatabaseSnapshot();
  return JSON.stringify(snapshot, null, 2);
}

export function importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }

    // Validate and write collections
    if (Array.isArray(data.incidents)) localStorage.setItem(INCIDENTS_KEY, JSON.stringify(data.incidents));
    if (Array.isArray(data.fleet)) localStorage.setItem(FLEET_KEY, JSON.stringify(data.fleet));
    if (Array.isArray(data.establishments)) localStorage.setItem(ESTABLISHMENTS_KEY, JSON.stringify(data.establishments));
    if (Array.isArray(data.users)) localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
    if (Array.isArray(data.hotlines)) localStorage.setItem(HOTLINES_KEY, JSON.stringify(data.hotlines));
    if (Array.isArray(data.logos)) localStorage.setItem(LOGOS_KEY, JSON.stringify(data.logos));
    if (data.config && typeof data.config === 'object') localStorage.setItem(CONFIG_KEY, JSON.stringify(data.config));
    if (Array.isArray(data.audit)) localStorage.setItem(AUDIT_KEY, JSON.stringify(data.audit));

    addAuditRecord({
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'RESTORE_DATABASE_BACKUP',
      targetId: data.version || 'RESTORE_SNAPSHOT',
      ipAddress: '197.221.250.12',
      details: `Full database restored from snapshot exported at ${data.exportedAt || 'Unknown'}`,
    });

    notifyChange('all', data);
    return { success: true, message: 'Database successfully restored and synchronized across all modules!' };
  } catch (e: any) {
    return { success: false, message: 'Failed to restore database: ' + (e.message || 'Corrupt JSON data') };
  }
}

export function resetDatabaseToSeed() {
  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(initialIncidents));
  localStorage.setItem(FLEET_KEY, JSON.stringify(initialFleet));
  localStorage.setItem(ESTABLISHMENTS_KEY, JSON.stringify(initialEstablishments));
  localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultSystemConfig));
  localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  localStorage.setItem(HOTLINES_KEY, JSON.stringify(initialHotlines));
  localStorage.setItem(LOGOS_KEY, JSON.stringify(initialSystemLogos));
  localStorage.setItem(AUDIT_KEY, JSON.stringify(initialAuditRecords));
  
  notifyChange('all', { reset: true });
}

// ==========================================
// 10. REACTIVE CUSTOM HOOKS FOR REAL-TIME SYNC
// ==========================================
export function useIncidents(): Incident[] {
  const [incidents, setIncidents] = useState<Incident[]>(() => getIncidents());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'incidents' || e.detail.type === 'all') {
        setIncidents(getIncidents());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return incidents;
}

export function useFleet(): VehicleFleet[] {
  const [fleet, setFleet] = useState<VehicleFleet[]>(() => getFleet());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'fleet' || e.detail.type === 'all') {
        setFleet(getFleet());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return fleet;
}

export function useEstablishments(): Establishment[] {
  const [establishments, setEstablishments] = useState<Establishment[]>(() => getEstablishments());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'establishments' || e.detail.type === 'all') {
        setEstablishments(getEstablishments());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return establishments;
}

export function useUsers(): User[] {
  const [users, setUsers] = useState<User[]>(() => getUsers());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'users' || e.detail.type === 'all') {
        setUsers(getUsers());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return users;
}

export function useHotlines(): EmergencyHotline[] {
  const [hotlines, setHotlines] = useState<EmergencyHotline[]>(() => getHotlines());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'hotlines' || e.detail.type === 'all') {
        setHotlines(getHotlines());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return hotlines;
}

export function useLogos(): SystemLogoItem[] {
  const [logos, setLogos] = useState<SystemLogoItem[]>(() => getSystemLogos());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'logos' || e.detail.type === 'all') {
        setLogos(getSystemLogos());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return logos;
}

export function useSystemConfig(): SystemConfiguration {
  const [config, setConfig] = useState<SystemConfiguration>(() => getSystemConfig());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'config' || e.detail.type === 'all') {
        setConfig(getSystemConfig());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return config;
}

export function useAuditRecords(): AuditRecord[] {
  const [audit, setAudit] = useState<AuditRecord[]>(() => getAuditRecords());
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.type === 'audit' || e.detail.type === 'all') {
        setAudit(getAuditRecords());
      }
    };
    bikaEventEmitter.addEventListener('bika-update', handleUpdate);
    return () => bikaEventEmitter.removeEventListener('bika-update', handleUpdate);
  }, []);
  return audit;
}

// Helper: Image file compressor & validator
export async function validateAndProcessImage(file: File): Promise<{ success: boolean; attachment?: Attachment; error?: string }> {
  const maxBytes = 1048576; // 1 MB
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowed.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: 'Invalid file format. Accepted formats: JPG, JPEG, PNG, WEBP.',
    };
  }

  if (file.size > maxBytes) {
    try {
      const compressedDataUrl = await compressImageFile(file, 0.7);
      const byteSize = Math.round((compressedDataUrl.length * 3) / 4);

      if (byteSize > maxBytes) {
        return {
          success: false,
          error: 'Image is too large. Please upload an image smaller than 1 MB.',
        };
      }

      return {
        success: true,
        attachment: {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          url: compressedDataUrl,
          sizeBytes: byteSize,
          type: file.type,
        }
      };
    } catch (e) {
      return {
        success: false,
        error: 'Image is too large. Please upload an image smaller than 1 MB.',
      };
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        success: true,
        attachment: {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          url: e.target?.result as string,
          sizeBytes: file.size,
          type: file.type,
        }
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file: File, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Canvas context failed');
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = (err) => reject(err);
  });
}
