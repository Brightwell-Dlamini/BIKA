import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MessageSquarePlus, 
  ThumbsUp, 
  Star, 
  Search, 
  Siren, 
  Bus, 
  Utensils, 
  MapPin, 
  CheckCircle2, 
  PhoneCall, 
  Camera, 
  X, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  TransportMode, 
  Region, 
  Severity, 
  ReportType, 
  Incident, 
  Attachment,
  User 
} from '../types';
import { useLanguage } from '../lib/i18n';
import { 
  getSystemConfig, 
  generateIncidentId, 
  saveIncident, 
  validateAndProcessImage, 
  checkDuplicateIncident 
} from '../lib/storage';
import { OfficialLogosBanner } from './OfficialLogosBanner';
import { HotlineDirectory } from './HotlineDirectory';

interface PublicPortalProps {
  onIncidentSubmitted: (incident: Incident) => void;
  onOpenTrackReport: (incidentId?: string) => void;
  currentUser?: User;
  onOpenAdminHotlineModal?: () => void;
  onOpenLogoEditor?: (logoId?: string) => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onIncidentSubmitted,
  onOpenTrackReport,
  currentUser,
  onOpenAdminHotlineModal,
  onOpenLogoEditor
}) => {
  const { t } = useLanguage();
  const config = getSystemConfig();

  // Active Screen Step:
  // 'sector_select' -> 1st Image (Select Transport or Trade)
  // 'action_select' -> 2nd Image (6 Action Buttons)
  // 'form'          -> Dynamic Tailored Form
  // 'track'         -> Reference ID Lookup
  // 'success'       -> Submission Confirmation
  const [activeStep, setActiveStep] = useState<'sector_select' | 'action_select' | 'form' | 'track' | 'success'>('sector_select');

  // Selected Sector: 'Road Transport' or 'Restaurant/Food'
  const [selectedSector, setSelectedSector] = useState<TransportMode>('Road Transport');

  // Selected Action Type
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('Incident');

  // Form Fields
  const [region, setRegion] = useState<Region>('Manzini');
  const [category, setCategory] = useState<string>('Dangerous Driving & Speeding');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');

  // Sector Specific Entities
  // Transport:
  const [vehicleReg, setVehicleReg] = useState<string>('');
  const [fleetId, setFleetId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('');
  const [terminalRankName, setTerminalRankName] = useState<string>('');

  // Trade:
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [ownerOperator, setOwnerOperator] = useState<string>('');
  const [tradingLicense, setTradingLicense] = useState<string>('');

  // Complaint specific fields
  const [complaintSubject, setComplaintSubject] = useState<string>('Overcharging Commuter Fares');
  const [targetEntityName, setTargetEntityName] = useState<string>('');
  const [desiredResolution, setDesiredResolution] = useState<string>('Inspector Audit & Warning');

  // Compliment specific fields
  const [commendationType, setCommendationType] = useState<string>('Exceptional Honesty (Returned Property)');
  const [personPraised, setPersonPraised] = useState<string>('');

  // Rating specific fields
  const [ratedServiceName, setRatedServiceName] = useState<string>('');
  const [starOverall, setStarOverall] = useState<number>(5);
  const [starSafety, setStarSafety] = useState<number>(5);
  const [starCleanliness, setStarCleanliness] = useState<number>(4);
  const [starService, setStarService] = useState<number>(5);
  const [starPricing, setStarPricing] = useState<number>(4);

  // Emergency specific fields
  const [emergencyType, setEmergencyType] = useState<string>('Major Road Collision / Accident');

  // Reporter details
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Duplicate Banner
  const [duplicateMatch, setDuplicateMatch] = useState<Incident | null>(null);

  // Submitted Result
  const [createdIncidentId, setCreatedIncidentId] = useState<string>('');
  const [trackInputId, setTrackInputId] = useState<string>('');

  // Public Citizens (Zero Login Friction) Guide Drawer State
  const [showCitizenGuide, setShowCitizenGuide] = useState<boolean>(false);

  // Choose Sector (Point of Contact 1)
  const handleSelectSector = (sector: TransportMode) => {
    setSelectedSector(sector);
    // Set default category for selected sector
    const cats = config.incidentCategories[sector] || [];
    setCategory(cats[0] || (sector === 'Road Transport' ? 'Dangerous Driving & Speeding' : 'Food Poisoning / Contamination'));
    if (sector === 'Restaurant/Food') {
      setComplaintSubject('Expired Food Produce / Contamination');
    } else {
      setComplaintSubject('Overcharging Commuter Fares');
    }
    setActiveStep('action_select');
  };

  // Choose Action (Point of Contact 2)
  const handleSelectAction = (action: ReportType) => {
    setSelectedReportType(action);
    if (action === 'Emergency') {
      setSeverity('CRITICAL');
      setEmergencyType(
        selectedSector === 'Road Transport' 
          ? 'Major Road Collision / Multiple Vehicles' 
          : 'Severe Food Poisoning Outbreak / Contamination'
      );
    } else if (action === 'Complaint') {
      setSeverity('HIGH');
    } else {
      setSeverity('MEDIUM');
    }
    setActiveStep('form');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError(null);
    setIsCompressing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await validateAndProcessImage(file);
      if (!result.success) {
        setImageError(result.error || 'Failed to process image.');
      } else if (result.attachment) {
        setAttachments(prev => [...prev, result.attachment!]);
      }
    }
    setIsCompressing(false);
  };

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`GPS Pin: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocation(region === 'Hhohho' ? 'Mbabane Central Rank' : 'Manzini Central Bus Rank');
        }
      );
    } else {
      setLocation('Manzini Central Bus Rank');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = generateIncidentId();
    let finalDesc = description;
    let finalCategory = category;

    if (selectedReportType === 'Complaint') {
      finalCategory = `Complaint: ${complaintSubject}`;
      finalDesc = `COMPLAINT SUBJECT: ${complaintSubject}\nTARGET ENTITY: ${targetEntityName || restaurantName || vehicleReg || 'N/A'}\nDESIRED RESOLUTION: ${desiredResolution}\nDETAILS: ${description}`;
    } else if (selectedReportType === 'Compliment') {
      finalCategory = `Compliment: ${commendationType}`;
      finalDesc = `COMMENDATION TYPE: ${commendationType}\nPERSON/SERVICE PRAISED: ${personPraised || 'N/A'}\nDETAILS: ${description}`;
    } else if (selectedReportType === 'Rating') {
      finalCategory = `Service Rating: ${ratedServiceName || selectedSector}`;
      finalDesc = `SERVICE RATED: ${ratedServiceName || selectedSector}\nOVERALL: ${starOverall}/5 Stars\nSAFETY/HYGIENE: ${starSafety}/5 Stars\nCLEANLINESS: ${starCleanliness}/5 Stars\nPRICING: ${starPricing}/5 Stars\nREVIEWS: ${description}`;
    } else if (selectedReportType === 'Emergency') {
      finalCategory = `EMERGENCY: ${emergencyType}`;
      finalDesc = `HIGH PRIORITY EMERGENCY ALERT: ${emergencyType}\nLOCATION: ${location}\nSITUATION: ${description}`;
    }

    const newIncident: Incident = {
      id: newId,
      reportType: selectedReportType,
      category: finalCategory,
      incidentType: selectedReportType === 'Emergency' ? emergencyType : finalCategory,
      mode: selectedSector,
      region,
      location: location || 'Eswatini',
      terminalRankName: selectedSector === 'Road Transport' ? terminalRankName : undefined,
      description: finalDesc,
      severity: selectedReportType === 'Emergency' ? 'CRITICAL' : severity,
      status: selectedReportType === 'Emergency' ? 'In Progress' : 'Submitted',
      reporterName: isAnonymous ? 'Anonymous' : (reporterName || 'Public Citizen'),
      reporterPhone: isAnonymous ? undefined : reporterPhone,
      reporterEmail: isAnonymous ? undefined : reporterEmail,
      isAnonymous,
      vehicleRegistration: selectedSector === 'Road Transport' ? vehicleReg : undefined,
      fleetId: selectedSector === 'Road Transport' ? fleetId : undefined,
      driverName: selectedSector === 'Road Transport' ? driverName : undefined,
      operatorName: selectedSector === 'Road Transport' ? operatorName : undefined,
      restaurantName: selectedSector === 'Restaurant/Food' ? restaurantName : undefined,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-init',
          senderId: 'system',
          senderName: 'BIKA Dispatch Command',
          senderRole: 'Public User',
          message: selectedReportType === 'Emergency'
            ? `🚨 EMERGENCY ALERT ${newId} BROADCAST TO POLICE & EMERGENCY UNITS!`
            : `Report ${newId} registered in the National BIKA Transport & Trade Database.`,
          timestamp: new Date().toISOString(),
        }
      ],
      auditLogs: [
        {
          id: 'aud-init',
          timestamp: new Date().toISOString(),
          actorName: isAnonymous ? 'Anonymous' : (reporterName || 'Public Citizen'),
          actorRole: 'Public User',
          action: 'SUBMITTED',
          details: `${selectedReportType.toUpperCase()} submitted for ${selectedSector}`,
        }
      ],
      ratingDetails: selectedReportType === 'Rating' ? {
        overall: starOverall,
        safety: starSafety,
        cleanliness: starCleanliness,
        customerService: starService,
        pricing: starPricing
      } : undefined
    };

    saveIncident(newIncident);
    setCreatedIncidentId(newId);
    onIncidentSubmitted(newIncident);
    setActiveStep('success');
  };

  const renderStarSelector = (label: string, value: number, onChange: (v: number) => void) => (
    <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
      <span className="text-xs font-semibold text-slate-200">{label}</span>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => onChange(s)}
            className="p-1 text-yellow-400 hover:scale-125 transition-transform"
          >
            <Star className={`w-5 h-5 ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100">

      {/* POINT OF CONTACT 1: SELECT TRANSPORT OR TRADE (First Image) */}
      {activeStep === 'sector_select' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Title Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-3xl mx-auto relative z-10">
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-widest inline-block mb-3">
                KINGDOM OF ESWATINI • NATIONAL REPORTING PLATFORM
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                BIKA – See something, say something.
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg mt-3 leading-relaxed">
                Welcome to Eswatini’s official integrated real-time reporting platform. Choose a sector below to report an incident, file a complaint, commend outstanding service, or rate quality.
              </p>
            </div>
          </div>

          {/* 1ST IMAGE POINT OF CONTACT: 2 Core Cards for Transport and Trade */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <span>Select Service Sector to Proceed</span>
                <ChevronRight className="w-5 h-5 text-yellow-400" />
              </h2>
              <button
                onClick={() => setActiveStep('track')}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-yellow-400 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Track Existing Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Transport */}
              <div
                onClick={() => handleSelectSector('Road Transport')}
                className="group relative rounded-3xl overflow-hidden border-2 border-slate-800 hover:border-yellow-500 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-slate-900"
              >
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80" 
                    alt="Road & Public Transport" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-yellow-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1 shadow-lg">
                    <Bus className="w-4 h-4" />
                    <span>Public & Freight Transport</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                      🚌 Transport Sector
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Report speeding kombis, overloading, fare overcharging, bus rank congestion, unsafe vehicles, driver conduct, or commend outstanding drivers across all 4 regions.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Kombis & Buses</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Taxis & Hired</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Bus Ranks & Stops</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Freight Trucks</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Trade & Food Services */}
              <div
                onClick={() => handleSelectSector('Restaurant/Food')}
                className="group relative rounded-3xl overflow-hidden border-2 border-slate-800 hover:border-emerald-500 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-slate-900"
              >
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80" 
                    alt="Restaurants & Food Trade" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1 shadow-lg">
                    <Utensils className="w-4 h-4" />
                    <span>Food Trade & Services</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      🍽️ Trade & Outlets Sector
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Report restaurant food safety, unhygienic kitchens, expired food produce, price gouging, market stall hygiene, or compliment clean establishments and friendly traders.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Restaurants & Cafes</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Food Stalls & Markets</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Supermarkets & Bakeries</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">Trade Hubs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Endorsing Government Entities & Authority Logos */}
          <div className="pt-6">
            <OfficialLogosBanner 
              currentUser={currentUser}
              onOpenLogoEditor={onOpenLogoEditor}
            />
          </div>

          {/* 24/7 National Emergency & Hotline Directory */}
          <div className="pt-4">
            <HotlineDirectory 
              currentUser={currentUser}
              onOpenAdminHotlineModal={onOpenAdminHotlineModal}
            />
          </div>

          {/* Public Citizens (Zero Login Friction) Guide Section */}
          <div className="pt-4 pb-2" id="citizen-frictionless-guide">
            <button
              onClick={() => setShowCitizenGuide(!showCitizenGuide)}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-yellow-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition-all shadow-xl group"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-sm sm:text-base font-black text-white group-hover:text-yellow-400 transition-colors">
                      Public Citizens (Zero Login Friction) Guide
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Zero Login Friction
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click here to see how citizens report incidents with no passwords, optional anonymous mode, and instant tracking.
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:text-yellow-400 group-hover:bg-slate-700 transition shrink-0 ml-2">
                {showCitizenGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showCitizenGuide && (
              <div className="mt-3 bg-slate-900/95 border-2 border-yellow-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">How Citizens Report & Track Incidents</h4>
                      <p className="text-[11px] text-slate-400">Zero-barrier citizen reporting model for the Kingdom of Eswatini</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCitizenGuide(false)}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Hide Guide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-yellow-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>1. Zero Login Friction</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      No passwords, accounts, or mobile app installation required. Any citizen or commuter in Eswatini can submit a report immediately from any device.
                    </p>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>2. Anonymous or Identified</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      You can choose to report 100% anonymously for sensitive complaints, or provide your contact details if you wish to receive direct follow-up calls from responding officers.
                    </p>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>3. Reference ID Tracking</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Every report automatically receives an incident code (e.g. <span className="font-mono text-yellow-300 font-bold">BIKA-13-12-2026-090</span>). Use this code on the "Track Existing Report" button to check response updates and live officer chat anytime.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    🔒 <strong>Official & Inspector Log In:</strong> Police, health inspectors, rank marshals, and dispatch admins authenticate using the <strong>Log In</strong> button in the top navigation header.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POINT OF CONTACT 2: 6 ACTION CARDS (Second Image) */}
      {activeStep === 'action_select' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Sector Selector Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveStep('sector_select')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Change Sector"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">SELECTED SECTOR</span>
                <div className="text-lg font-black text-white flex items-center space-x-2">
                  {selectedSector === 'Road Transport' ? (
                    <>
                      <Bus className="w-5 h-5 text-yellow-400" />
                      <span>Road & Public Transport</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5 text-emerald-400" />
                      <span>Restaurants, Food & Trade Services</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSelectSector('Road Transport')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSector === 'Road Transport'
                    ? 'bg-yellow-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Transport
              </button>
              <button
                onClick={() => handleSelectSector('Restaurant/Food')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSector === 'Restaurant/Food'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Trade & Food
              </button>
            </div>
          </div>

          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-black text-white">Select Reporting Action</h2>
            <p className="text-xs text-slate-400">
              What would you like to report or do regarding <span className="font-bold text-slate-200">{selectedSector === 'Road Transport' ? 'Public Transport' : 'Food Trade'}</span>?
            </p>
          </div>

          {/* 6 Large Action Blocks (Matching 2nd Image Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Report an Incident */}
            <button
              onClick={() => handleSelectAction('Incident')}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-yellow-500/60 p-6 rounded-2xl text-left transition-all shadow-xl hover:shadow-yellow-500/10 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white group-hover:text-yellow-400 transition-colors">
                  {t('reportAnIncident')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedSector === 'Road Transport'
                    ? 'Speeding kombis, rank congestion, unsafe road/vehicle conditions.'
                    : 'Food safety hazards, unhygienic kitchen, spoiled produce, sanitation issues.'}
                </p>
              </div>
            </button>

            {/* 2. Report a Complaint */}
            <button
              onClick={() => handleSelectAction('Complaint')}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/60 p-6 rounded-2xl text-left transition-all shadow-xl hover:shadow-red-500/10 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white group-hover:text-red-400 transition-colors">
                  {t('reportAComplaint')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedSector === 'Road Transport'
                    ? 'Fare overcharging, driver misconduct, refusal of service, long wait times.'
                    : 'Expired food sales, price gouging, abusive trader conduct, unhandled complaints.'}
                </p>
              </div>
            </button>

            {/* 3. Give a Compliment */}
            <button
              onClick={() => handleSelectAction('Compliment')}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 p-6 rounded-2xl text-left transition-all shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {t('giveACompliment')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedSector === 'Road Transport'
                    ? 'Recognize honest kombi drivers, helpful rank marshals or traffic police.'
                    : 'Commend clean restaurants, honest market traders, and friendly staff.'}
                </p>
              </div>
            </button>

            {/* 4. Rate a Service */}
            <button
              onClick={() => handleSelectAction('Rating')}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/60 p-6 rounded-2xl text-left transition-all shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white group-hover:text-sky-400 transition-colors">
                  {t('rateAService')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Provide 5-star ratings on safety, cleanliness, pricing, punctuality and service quality.
                </p>
              </div>
            </button>

            {/* 5. Track My Report */}
            <button
              onClick={() => setActiveStep('track')}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 p-6 rounded-2xl text-left transition-all shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white group-hover:text-indigo-400 transition-colors">
                  {t('checkMyReport')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Track live status & chat with assigned officers using your BIKA Reference ID.
                </p>
              </div>
            </button>

            {/* 6. Emergency Report */}
            <button
              onClick={() => handleSelectAction('Emergency')}
              className="group bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 hover:from-red-900 border border-red-600/70 p-6 rounded-2xl text-left transition-all shadow-2xl flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {t('emergencyReport')}
                </h3>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  {selectedSector === 'Road Transport'
                    ? 'Major collision, vehicle fire, hazardous chemical leak, active threat.'
                    : 'Severe mass food poisoning outbreak, active hazard, chemical contamination.'}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC FORM STEP tailored specifically to the clicked Tab and Sector! */}
      {activeStep === 'form' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveStep('action_select')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Back to Actions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                    selectedReportType === 'Emergency' ? 'bg-red-600 text-white' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {selectedReportType.toUpperCase()}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                    {selectedSector === 'Road Transport' ? '🚌 Transport' : '🍽️ Trade & Food'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {selectedReportType === 'Incident' && (selectedSector === 'Road Transport' ? 'Report a Transport Incident' : 'Report a Trade / Food Safety Incident')}
                  {selectedReportType === 'Complaint' && (selectedSector === 'Road Transport' ? 'File a Transport Complaint' : 'File a Trade / Restaurant Complaint')}
                  {selectedReportType === 'Compliment' && (selectedSector === 'Road Transport' ? 'Commend a Driver or Official' : 'Commend a Food Trader or Outlet')}
                  {selectedReportType === 'Rating' && (selectedSector === 'Road Transport' ? 'Rate Public Transport Service' : 'Rate Restaurant / Market Service')}
                  {selectedReportType === 'Emergency' && '🚨 Emergency Dispatch Broadcast'}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setActiveStep('sector_select')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* EMERGENCY HOTLINE BANNER */}
            {selectedReportType === 'Emergency' && (
              <div className="bg-red-950/90 border border-red-600/80 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center space-x-2 text-red-400 font-extrabold text-sm">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                  <span>FOR IMMEDIATE THREAT TO LIFE - CALL ESWATINI EMERGENCY HOTLINES:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-bold">
                  <div className="bg-slate-900 p-2 rounded-lg border border-red-500/30 text-center">
                    <span className="text-slate-400 block text-[10px]">POLICE</span>
                    <span className="text-white text-sm">999</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-red-500/30 text-center">
                    <span className="text-slate-400 block text-[10px]">AMBULANCE</span>
                    <span className="text-white text-sm">977</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-red-500/30 text-center">
                    <span className="text-slate-400 block text-[10px]">FIRE & RESCUE</span>
                    <span className="text-white text-sm">933</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-red-500/30 text-center">
                    <span className="text-slate-400 block text-[10px]">DISASTER MGMT</span>
                    <span className="text-white text-sm">800-2452</span>
                  </div>
                </div>
              </div>
            )}

            {/* Incident / Complaint Category Selector */}
            {selectedReportType === 'Incident' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Category of {selectedSector === 'Road Transport' ? 'Transport' : 'Trade'} Incident *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-yellow-500"
                >
                  {(config.incidentCategories[selectedSector] || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Complaint Specific Fields */}
            {selectedReportType === 'Complaint' && (
              <div className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Subject of Complaint *
                    </label>
                    <select
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-semibold"
                    >
                      {selectedSector === 'Road Transport' ? (
                        <>
                          <option value="Overcharging Commuter Fares">Overcharging Commuter Fares</option>
                          <option value="Abusive Driver / Conductor Conduct">Abusive Driver / Conductor Conduct</option>
                          <option value="Unsafe Vehicle Condition">Unsafe Vehicle Condition</option>
                          <option value="Excessive Delay & Rank Overcrowding">Excessive Delay & Rank Overcrowding</option>
                          <option value="Refusal of Short Distance Passengers">Refusal of Short Distance Passengers</option>
                          <option value="Lost Luggage / Theft at Rank">Lost Luggage / Theft at Rank</option>
                        </>
                      ) : (
                        <>
                          <option value="Expired Food Produce / Contamination">Expired Food Produce / Contamination</option>
                          <option value="Unhygienic Kitchen & Dining Sanitation">Unhygienic Kitchen & Dining Sanitation</option>
                          <option value="Price Gouging / Overcharging">Price Gouging / Overcharging</option>
                          <option value="Unlicensed Food Vendor Operations">Unlicensed Food Vendor Operations</option>
                          <option value="Customer Abuse / Refusal of Inspection">Customer Abuse / Refusal of Inspection</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Target Entity / Person Name
                    </label>
                    <input
                      type="text"
                      value={targetEntityName}
                      onChange={(e) => setTargetEntityName(e.target.value)}
                      placeholder={selectedSector === 'Road Transport' ? "e.g. Kombi Reg PSD 412 BH or Rank Marshal Name" : "e.g. Mbabane Central Market Stall #14"}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Requested Official Action / Resolution *
                  </label>
                  <select
                    value={desiredResolution}
                    onChange={(e) => setDesiredResolution(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Inspector Audit & Official Warning">Inspector Audit & Official Warning</option>
                    <option value="Fare Refund & Driver Retraining">Fare Refund & Driver Retraining</option>
                    <option value="Unannounced Health & Safety Inspection">Unannounced Health & Safety Inspection</option>
                    <option value="Permit Suspension / Impound">Permit Suspension / Impound</option>
                  </select>
                </div>
              </div>
            )}

            {/* Compliment Specific Fields */}
            {selectedReportType === 'Compliment' && (
              <div className="bg-slate-800/40 border border-emerald-500/30 p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Commendation Category *
                    </label>
                    <select
                      value={commendationType}
                      onChange={(e) => setCommendationType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold text-emerald-300"
                    >
                      {selectedSector === 'Road Transport' ? (
                        <>
                          <option value="Exceptional Honesty (Returned Property)">Exceptional Honesty (Returned Property)</option>
                          <option value="Courteous & Safe Driving">Courteous & Safe Driving</option>
                          <option value="Helpful Rank Marshal / Police Officer">Helpful Rank Marshal / Police Officer</option>
                          <option value="Outstanding Vehicle Cleanliness">Outstanding Vehicle Cleanliness</option>
                          <option value="Punctual & Friendly Service">Punctual & Friendly Service</option>
                        </>
                      ) : (
                        <>
                          <option value="Pristine Hygiene & Spotless Kitchen">Pristine Hygiene & Spotless Kitchen</option>
                          <option value="Outstanding Food Quality & Freshness">Outstanding Food Quality & Freshness</option>
                          <option value="Honest Pricing & Generous Service">Honest Pricing & Generous Service</option>
                          <option value="Friendly & Efficient Trader Conduct">Friendly & Efficient Trader Conduct</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Person / Establishment Being Praised
                    </label>
                    <input
                      type="text"
                      value={personPraised}
                      onChange={(e) => setPersonPraised(e.target.value)}
                      placeholder={selectedSector === 'Road Transport' ? "e.g. Sipho (Driver on Mbabane-Manzini Route)" : "e.g. Matsapha Food Hub Bakery"}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rating Specific Star Selectors */}
            {selectedReportType === 'Rating' && (
              <div className="bg-slate-800/40 border border-sky-500/30 p-4 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Name of {selectedSector === 'Road Transport' ? 'Route / Operator / Rank' : 'Restaurant / Market Stall'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={ratedServiceName}
                    onChange={(e) => setRatedServiceName(e.target.value)}
                    placeholder={selectedSector === 'Road Transport' ? "e.g. Manzini Main Rank / Swazi Express" : "e.g. Mbabane Central Market Grill"}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {renderStarSelector("Overall Satisfaction", starOverall, setStarOverall)}
                  {renderStarSelector(selectedSector === 'Road Transport' ? "Driving Safety" : "Food Safety & Freshness", starSafety, setStarSafety)}
                  {renderStarSelector("Cleanliness & Hygiene", starCleanliness, setStarCleanliness)}
                  {renderStarSelector("Fare / Price Honesty", starPricing, setStarPricing)}
                  {renderStarSelector("Staff Courtesy & Speed", starService, setStarService)}
                </div>
              </div>
            )}

            {/* Region & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Region in Eswatini *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="Hhohho">{t('hhohho')}</option>
                  <option value="Manzini">{t('manzini')}</option>
                  <option value="Shiselweni">{t('shiselweni')}</option>
                  <option value="Lubombo">{t('lubombo')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Location / Rank / Station / Shop *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={selectedSector === 'Road Transport' ? "e.g. Manzini Main Bus Rank / MR3 Highway" : "e.g. Shop 14, Mbabane Plaza"}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-sm text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    title="Pin GPS Location"
                    className="absolute right-2 top-2 text-yellow-400 hover:text-yellow-300"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Specific Entity Fields for Transport */}
            {selectedSector === 'Road Transport' && selectedReportType === 'Incident' && (
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Vehicle Registration #</label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="e.g. PSD 412 BH"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Operator / Line Name</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Swazi Express Kombis"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Sipho Hlophe"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {/* Specific Entity Fields for Trade */}
            {selectedSector === 'Restaurant/Food' && selectedReportType === 'Incident' && (
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Restaurant / Establishment Name</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Mbabane Central Market Grill"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Trader / Owner Name</label>
                  <input
                    type="text"
                    value={ownerOperator}
                    onChange={(e) => setOwnerOperator(e.target.value)}
                    placeholder="e.g. Gcina Nxumalo"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Detailed Report Notes & Circumstances *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('description')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Evidence Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t('evidenceUpload')}
              </label>
              
              {imageError && (
                <div className="mb-3 p-3 rounded-xl bg-red-600/20 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-yellow-400 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>{isCompressing ? 'Compressing Image...' : 'Choose / Take Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 1 MB)</span>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-80 hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reporter Contact Info */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contact Information (Optional)
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-yellow-500 focus:ring-0"
                  />
                  <span>Submit Anonymously</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Full Name"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="Phone Number (e.g. +268 7600 1122)"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-black text-base tracking-wider shadow-xl transition-all ${
                selectedReportType === 'Emergency' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:brightness-110 shadow-red-900/50'
                  : selectedReportType === 'Complaint'
                  ? 'bg-gradient-to-r from-red-500 to-amber-600 text-white hover:brightness-110'
                  : selectedReportType === 'Compliment'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:brightness-110'
                  : selectedReportType === 'Rating'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-slate-950 hover:brightness-110'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:brightness-110'
              }`}
            >
              {selectedReportType === 'Emergency' ? '🚨 TRANSMIT EMERGENCY DISPATCH ALERT NOW' : t('submitReport')}
            </button>
          </form>
        </div>
      )}

      {/* Track Report Screen */}
      {activeStep === 'track' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Search className="w-6 h-6 text-yellow-400" />
              <span>{t('checkMyReport')}</span>
            </h2>
            <button
              onClick={() => setActiveStep('sector_select')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mandatory Reference ID Alert Message */}
          <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-4 flex items-start space-x-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase tracking-wide block text-amber-400 mb-0.5">
                Mandatory Incident Reference ID Notice
              </span>
              <span>
                Please take note of your <strong>BIKA Incident Reference ID</strong> (formatted as e.g. <span className="font-mono text-yellow-300">BIKA-13-12-2026-090</span>). You will need this reference ID to track the report. <strong>You will not be able to track your report without it.</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {t('trackPrompt')}
          </p>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={trackInputId}
              onChange={(e) => setTrackInputId(e.target.value)}
              placeholder="e.g. BIKA-13-12-2026-090"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={() => {
                if (trackInputId.trim()) {
                  onOpenTrackReport(trackInputId.trim());
                } else {
                  alert('Please enter a valid BIKA Reference ID (e.g. BIKA-13-12-2026-090).');
                }
              }}
              className="bg-yellow-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl hover:brightness-110 transition-all text-sm shadow-lg shrink-0"
            >
              Track Now
            </button>
          </div>
        </div>
      )}

      {/* Success Confirmation Screen */}
      {activeStep === 'success' && (
        <div className="max-w-md mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl animate-fadeIn space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">
            Report Submitted!
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your report has been securely transmitted to the National BIKA Transport & Trade Dispatch System.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left">
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-extrabold text-center">
              YOUR BIKA INCIDENT REFERENCE ID
            </div>
            <div className="text-2xl font-black text-yellow-400 font-mono tracking-wider mt-1 text-center select-all">
              {createdIncidentId}
            </div>
            
            <div className="mt-3 bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-[11px] text-amber-200 leading-snug">
              <strong>Take note:</strong> Please copy or write down this BIKA Incident Reference ID (<span className="font-mono text-yellow-300 font-bold">{createdIncidentId}</span>). <strong>You will not be able to track your report or check for official responses without it.</strong>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onOpenTrackReport(createdIncidentId)}
              className="w-full py-3.5 rounded-xl bg-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Track Report Status & Open Live Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveStep('sector_select')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
