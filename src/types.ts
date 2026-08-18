export type Region = 'Hhohho' | 'Manzini' | 'Shiselweni' | 'Lubombo';

export type TransportMode = 
  | 'Road Transport' 
  | 'Restaurant/Food';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'Submitted' 
  | 'Received' 
  | 'Under Review' 
  | 'Verified' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Awaiting Information' 
  | 'Escalated' 
  | 'Resolved' 
  | 'Closed' 
  | 'Rejected' 
  | 'Duplicate';

export type UserRole = 
  | 'Super Admin' 
  | 'Police' 
  | 'Health Inspector' 
  | 'Rank Marshal' 
  | 'Public User';

export type ReportType = 'Incident' | 'Complaint' | 'Compliment' | 'Rating' | 'Emergency';

export interface EmergencyHotline {
  id: string;
  name: string;
  number: string;
  category: 'Emergency' | 'Police' | 'Fire & Rescue' | 'Medical' | 'Transport' | 'Anti-Corruption' | 'General';
  description: string;
  department: string;
  availableHours: string;
  isTollFree: boolean;
  priority: number;
  active: boolean;
}

export interface SystemLogoItem {
  id: string;
  name: string;
  subtitle: string;
  acronym: string;
  role: string;
  customImageUrl?: string;
  badgeColor?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  region: Region | 'Nationwide';
  department?: string;
  badgeNumber?: string;
  phone?: string;
  active: boolean;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  type: string;
}

export interface CommunicationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface IncidentAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

export interface Incident {
  id: string; // e.g. BIKA-ESW-2026-001245
  reportType: ReportType;
  category: string;
  incidentType: string;
  mode: TransportMode;
  region: Region;
  location: string;
  terminalRankName?: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  reporterName?: string;
  reporterPhone?: string;
  reporterEmail?: string;
  isAnonymous?: boolean;
  vehicleRegistration?: string;
  fleetId?: string;
  driverName?: string;
  operatorName?: string;
  restaurantName?: string;
  coordinates?: { lat: number; lng: number };
  attachments: Attachment[];
  assignedDepartment?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  createdAt: string; // ISO string
  updatedAt: string;
  acknowledgedAt?: string;
  assignedAt?: string;
  firstRespondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  messages: CommunicationMessage[];
  auditLogs: IncidentAuditLog[];
  escalatedCount?: number;
  isRepeatedAlert?: boolean;
  ratingDetails?: {
    overall: number;
    safety?: number;
    cleanliness?: number;
    customerService?: number;
    reliability?: number;
    pricing?: number;
    waitingTime?: number;
  };
}

export interface VehicleFleet {
  id: string;
  registrationNumber: string;
  fleetId: string;
  vic: string;
  vehicleType: string; // 'Kombi', 'Bus', 'Taxi', 'Truck'
  operatorName: string;
  driverName: string;
  route: string;
  region: Region;
  rank: string;
  permitStatus: 'Valid' | 'Expired' | 'Pending';
  permitExpiry: string;
  complaintsCount: number;
  complimentsCount: number;
  rating: number;
}

export interface Establishment {
  id: string;
  name: string;
  tradingName: string;
  referenceNumber: string;
  category: 'Restaurant' | 'Market' | 'Food Vendor' | 'Trade Hub';
  ownerOperator: string;
  location: string;
  region: Region;
  contactPhone: string;
  healthInspectionStatus: 'Compliant' | 'Warning' | 'Violation Found' | 'Pending Inspection';
  lastInspectionDate: string;
  rating: number;
  complaintsCount: number;
  complimentsCount: number;
}

export interface EscalationRule {
  id: string;
  severity: Severity;
  firstResponseDeadlineMins: number;
  escalationDeadlineMins: number;
  secondaryEscalationMins: number;
  responsibleDepartment: string;
  notificationChannels: ('Email' | 'SMS' | 'WhatsApp' | 'InApp')[];
}

export interface SystemConfiguration {
  appName: string;
  subTitle: string;
  maxImageSizeBytes: number; // e.g. 1048576 (1MB)
  allowedImageFormats: string[];
  sessionTimeoutMins: number;
  enable2FA: boolean;
  offlineSyncEnabled: boolean;
  whatsappGatewayUrl: string;
  smsGatewayKey: string;
  emailSmtpHost: string;
  escalationRules: EscalationRule[];
  incidentCategories: Record<TransportMode, string[]>;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetId: string;
  ipAddress: string;
  details: string;
}

export interface SystemHealth {
  status: 'Operational' | 'Warning' | 'Critical';
  dbStatus: string;
  apiStatus: string;
  storageUsageMb: number;
  imageStorageMb: number;
  activeUsersCount: number;
  concurrentSessions: number;
  errorRatePercentage: number;
  failedNotificationsCount: number;
  uptimePercentage: number;
}

export interface DataUsageStats {
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  dataConsumedMb: number;
  imagesStoredCount: number;
  apiCallsCount: number;
  dailyUsageMb: { date: string; usage: number; reports: number }[];
}

export interface BikaDatabaseSnapshot {
  version: string;
  exportedAt: string;
  system: string;
  incidents: Incident[];
  fleet: VehicleFleet[];
  establishments: Establishment[];
  users: User[];
  hotlines: EmergencyHotline[];
  logos: SystemLogoItem[];
  config: SystemConfiguration;
  audit: AuditRecord[];
}

