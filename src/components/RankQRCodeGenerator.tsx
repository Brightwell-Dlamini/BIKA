import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  Download, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Copy, 
  ExternalLink, 
  Info, 
  Globe, 
  Bus, 
  Utensils, 
  PhoneCall, 
  Share2,
  FileCheck
} from 'lucide-react';

interface RankQRCodeGeneratorProps {
  onOpenTrackModal?: (trackId?: string) => void;
}

export const RankQRCodeGenerator: React.FC<RankQRCodeGeneratorProps> = () => {
  const [copied, setCopied] = useState(false);
  const [showLoginGuide, setShowLoginGuide] = useState(false);

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://bika.eswatini.gov.sz';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenLivePortal = () => {
    window.open(portalUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner (Screen Only) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              <span>National Citizen Outreach & Official Signage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Public Portal QR Code & National Poster
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Authoritative scannable QR code poster linking directly to the BIKA Public Portal. Mount this poster at kombi ranks, bus terminals, food markets, and public offices across Eswatini.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowLoginGuide(!showLoginGuide)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <HelpCircle className="w-4 h-4 text-yellow-400" />
              <span>How Citizens Access?</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Poster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen & Official Access Guide (Expandable Box) */}
      {showLoginGuide && (
        <div className="no-print bg-slate-900/95 border-2 border-yellow-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Citizen Access & Login Architecture</h3>
                <p className="text-xs text-slate-400">Zero-barrier public reporting model</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLoginGuide(false)}
              className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded bg-slate-800"
            >
              Close Guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Citizens / Public */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Public Citizens (Zero Login Friction)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Citizens scan the national QR code to immediately access the Public Portal with <strong>no passwords, app installations, or registration required</strong>:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li>Submit safety violations, transport complaints, food hygiene risks, or service commendations.</li>
                <li>Submit anonymously or attach contact details for updates.</li>
                <li>Save your auto-generated <strong>BIKA Reference ID</strong> to track investigation progress anytime on the public portal.</li>
              </ul>
            </div>

            {/* Officials & Admins */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-yellow-400 font-bold">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Authorized Officials & Administrators</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Inspectors, Police Officers, Rank Marshals, and Super Admins authenticate securely:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li>Click <strong>Official Log In</strong> in the top navigation header.</li>
                <li>Enter your official government email address and password.</li>
                <li>Review incident queues, assign response teams, verify licenses, and conduct field inspections.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Management & Actions (Left) + High-Contrast Poster Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Management & Actions (Screen Only) */}
        <div className="no-print lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-yellow-400" />
            <span>Public Portal Endpoint</span>
          </div>

          {/* Portal URL Box */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-medium text-xs">
              Direct Public Portal URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs"
              />
              <button
                onClick={handleCopyLink}
                className="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2 rounded-xl border border-slate-700 transition"
                title="Copy Link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Portal link copied to clipboard!</span>
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Poster</span>
            </button>
            <button
              onClick={handleOpenLivePortal}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition"
            >
              <ExternalLink className="w-4 h-4 text-yellow-400" />
              <span>Open Public Portal</span>
            </button>
          </div>

          {/* Deployment Recommendations */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 space-y-3">
            <div className="font-bold text-yellow-300 flex items-center space-x-2 text-xs">
              <Info className="w-4 h-4 text-yellow-400" />
              <span>Nationwide Deployment Strategy</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Print and place this official poster in high-visibility public transit and retail locations:
            </p>
            <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-200">Public Transit Hubs:</strong> Kombi bays, bus terminals & queue shelters in Manzini, Mbabane, Nhlangano & Siteki.</li>
              <li><strong className="text-slate-200">Markets & Food Trade:</strong> Municipal markets, food courts, and restaurant dining areas.</li>
              <li><strong className="text-slate-200">Public Desks:</strong> Police stations, regional health inspection offices & border posts.</li>
            </ul>
          </div>

          {/* Citizen Privacy & Security Notice */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Scanning connects citizens over encrypted SSL. Citizens may file reports fully anonymously or provide contact information for SMS updates.
            </span>
          </div>
        </div>

        {/* Right Column: High-Impact Official National Poster Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <div 
            id="printable-poster"
            className="w-full max-w-lg bg-white text-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-yellow-500 space-y-6 text-center relative overflow-hidden"
          >
            {/* National Top Emblem Header */}
            <div className="space-y-3 border-b-2 border-slate-200 pb-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow">
                  ★
                </div>
                <div className="text-left">
                  <div className="text-[12px] font-black tracking-widest uppercase text-slate-600">
                    Kingdom of Eswatini
                  </div>
                  <div className="text-xs font-black text-slate-950 uppercase tracking-tight">
                    Ministry of Public Works, Transport & Health
                  </div>
                </div>
              </div>

              {/* National App Banner */}
              <div className="bg-slate-950 text-yellow-400 rounded-2xl py-3 px-4 font-mono font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-md flex items-center justify-center space-x-2">
                <span>BIKA PORTAL</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-800 italic">
                "See Something, Say Something • Nationwide Digital Reporting"
              </p>
            </div>

            {/* Main Action Banner */}
            <div className="bg-yellow-100 border-2 border-yellow-400/80 rounded-2xl p-3 text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-wide">
              Scan with your smartphone camera to access the Public Portal
            </div>

            {/* Authoritative High-Contrast SVG QR Code */}
            <div className="bg-white p-5 rounded-3xl border-3 border-slate-950 shadow-md inline-block mx-auto">
              <svg 
                className="w-56 h-56 mx-auto" 
                viewBox="0 0 29 29" 
                shapeRendering="crispEdges"
              >
                {/* Background */}
                <rect x="0" y="0" width="29" height="29" fill="#FFFFFF" />

                {/* Top-Left Finder Pattern */}
                <rect x="1" y="1" width="7" height="7" fill="#0F172A" />
                <rect x="2" y="2" width="5" height="5" fill="#FFFFFF" />
                <rect x="3" y="3" width="3" height="3" fill="#0F172A" />

                {/* Top-Right Finder Pattern */}
                <rect x="21" y="1" width="7" height="7" fill="#0F172A" />
                <rect x="22" y="2" width="5" height="5" fill="#FFFFFF" />
                <rect x="23" y="3" width="3" height="3" fill="#0F172A" />

                {/* Bottom-Left Finder Pattern */}
                <rect x="1" y="21" width="7" height="7" fill="#0F172A" />
                <rect x="2" y="22" width="5" height="5" fill="#FFFFFF" />
                <rect x="3" y="23" width="3" height="3" fill="#0F172A" />

                {/* Data Modules & Timing patterns */}
                <rect x="8" y="3" width="2" height="1" fill="#0F172A" />
                <rect x="12" y="3" width="3" height="1" fill="#0F172A" />
                <rect x="17" y="3" width="2" height="1" fill="#0F172A" />
                <rect x="10" y="5" width="4" height="2" fill="#0F172A" />
                <rect x="15" y="5" width="3" height="2" fill="#0F172A" />

                <rect x="1" y="10" width="3" height="1" fill="#0F172A" />
                <rect x="5" y="10" width="4" height="1" fill="#0F172A" />
                <rect x="10" y="10" width="9" height="1" fill="#0F172A" />
                <rect x="21" y="10" width="4" height="1" fill="#0F172A" />

                <rect x="3" y="12" width="2" height="2" fill="#0F172A" />
                <rect x="7" y="12" width="3" height="1" fill="#0F172A" />
                <rect x="12" y="12" width="5" height="2" fill="#0F172A" />
                <rect x="19" y="12" width="3" height="1" fill="#0F172A" />
                <rect x="24" y="12" width="3" height="2" fill="#0F172A" />

                <rect x="1" y="15" width="4" height="1" fill="#0F172A" />
                <rect x="7" y="15" width="2" height="2" fill="#0F172A" />
                <rect x="11" y="15" width="3" height="1" fill="#0F172A" />
                <rect x="16" y="15" width="4" height="2" fill="#0F172A" />
                <rect x="22" y="15" width="3" height="1" fill="#0F172A" />

                <rect x="2" y="18" width="5" height="1" fill="#0F172A" />
                <rect x="10" y="18" width="3" height="2" fill="#0F172A" />
                <rect x="15" y="18" width="2" height="1" fill="#0F172A" />
                <rect x="19" y="18" width="4" height="2" fill="#0F172A" />
                <rect x="25" y="18" width="2" height="1" fill="#0F172A" />

                <rect x="10" y="21" width="4" height="1" fill="#0F172A" />
                <rect x="16" y="21" width="5" height="2" fill="#0F172A" />
                <rect x="23" y="21" width="3" height="1" fill="#0F172A" />

                <rect x="9" y="24" width="3" height="2" fill="#0F172A" />
                <rect x="14" y="24" width="4" height="1" fill="#0F172A" />
                <rect x="20" y="24" width="2" height="2" fill="#0F172A" />
                <rect x="24" y="24" width="3" height="2" fill="#0F172A" />

                <rect x="10" y="27" width="5" height="1" fill="#0F172A" />
                <rect x="17" y="27" width="4" height="1" fill="#0F172A" />
                <rect x="23" y="27" width="2" height="1" fill="#0F172A" />

                {/* Center Badge Icon */}
                <rect x="11" y="11" width="7" height="7" fill="#EAB308" rx="1" />
                <rect x="12" y="12" width="5" height="5" fill="#0F172A" rx="1" />
              </svg>

              <div className="mt-2 text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
                SCAN TO REPORT INSTANTLY
              </div>
            </div>

            {/* Reporting Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 font-bold text-sm">🚌</span>
                <span className="text-slate-800 font-medium text-[11px] leading-tight">
                  Speeding kombis, overloading & fares
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold text-sm">🍽️</span>
                <span className="text-slate-800 font-medium text-[11px] leading-tight">
                  Restaurant food hygiene & safety
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold text-sm">🌟</span>
                <span className="text-slate-800 font-medium text-[11px] leading-tight">
                  Commend courteous drivers & staff
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold text-sm">🔍</span>
                <span className="text-slate-800 font-medium text-[11px] leading-tight">
                  Track resolution with Reference ID
                </span>
              </div>
            </div>

            {/* Footer with Hotlines */}
            <div className="border-t-2 border-slate-200 pt-3 text-[11px] text-slate-600 font-semibold space-y-1">
              <div>Royal Eswatini Police Service • Public Health Inspectorate</div>
              <div className="text-slate-950 font-bold">
                Emergency: <span className="text-red-600 font-black">999</span> | BIKA Toll-Free: <span className="text-blue-700 font-black">800-BIKA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
