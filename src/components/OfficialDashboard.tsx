import React, { useState } from 'react';
import { User, Incident, VehicleFleet, Establishment } from '../types';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  FileCheck, 
  Search, 
  Truck, 
  Building2, 
  Siren, 
  Layers,
  MapPin,
  Flame,
  UserCheck
} from 'lucide-react';
import { saveIncident, generateIncidentId } from '../lib/storage';

interface OfficialDashboardProps {
  currentUser: User;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onRefreshData: () => void;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  currentUser,
  incidents,
  onSelectIncident,
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'all' | 'newRecord'>('assigned');
  
  // Filter incidents assigned to this user or department
  const myAssignedIncidents = incidents.filter(
    i => i.assignedOfficerId === currentUser.id || i.assignedDepartment === currentUser.department
  );

  // Regional incidents
  const regionalIncidents = incidents.filter(
    i => currentUser.region === 'Nationwide' || i.region === currentUser.region
  );

  // Quick BIKA Incident Reference ID Search State
  const [bikaSearchId, setBikaSearchId] = useState<string>('');

  const handleSearchBikaId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikaSearchId.trim()) return;
    const found = incidents.find(
      i => i.id.toLowerCase() === bikaSearchId.trim().toLowerCase()
    );
    if (found) {
      onSelectIncident(found);
      setBikaSearchId('');
    } else {
      alert(`No reported incident found with BIKA Reference ID: "${bikaSearchId.trim()}"`);
    }
  };

  // Quick Action Modal states for Inspectors/Police
  const [showQuickNoteModal, setShowQuickNoteModal] = useState<boolean>(false);
  const [selectedIncForNote, setSelectedIncForNote] = useState<Incident | null>(null);
  const [quickActionText, setQuickActionText] = useState<string>('');

  const handleRecordOfficialAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncForNote || !quickActionText.trim()) return;

    const now = new Date().toISOString();
    const updated: Incident = {
      ...selectedIncForNote,
      status: 'In Progress',
      firstRespondedAt: selectedIncForNote.firstRespondedAt || now,
      updatedAt: now,
    };

    updated.messages.push({
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: `OFFICIAL ACTION LOGGED (${currentUser.role}): ${quickActionText.trim()}`,
      timestamp: now,
      isInternalNote: true,
    });

    saveIncident(updated);
    onRefreshData();
    setShowQuickNoteModal(false);
    setQuickActionText('');
  };

  const getRoleHeaderSubtitle = () => {
    switch (currentUser.role) {
      case 'Police': return 'Traffic Control, Highway Patrol & Emergency Response Console';
      case 'Health Inspector': return 'Public Hygiene, Food Safety & Trade Inspection Unit';
      case 'Rank Marshal': return 'Rank Management, Kombi Fleet & Route Compliance Console';
      case 'Super Admin': return 'National Platform Oversight & System Dispatch Console';
      default: return 'Government Inspectorate & Response Management';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Role Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-yellow-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase">
              OFFICIAL DASHBOARD • {currentUser.role}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              REGION: {currentUser.region}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            {currentUser.department || currentUser.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {getRoleHeaderSubtitle()}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'assigned'
                ? 'bg-yellow-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            My Assigned Cases ({myAssignedIncidents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'all'
                ? 'bg-yellow-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Regional Feed ({regionalIncidents.length})
          </button>
        </div>
      </div>

      {/* BIKA Reference ID Search Bar */}
      <form onSubmit={handleSearchBikaId} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-yellow-400 font-bold shrink-0">
          <Search className="w-4 h-4" />
          <span>Quick Incident Search:</span>
        </div>
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={bikaSearchId}
            onChange={(e) => setBikaSearchId(e.target.value)}
            placeholder="Search incident by BIKA Reference ID (e.g. BIKA-13-12-2026-090)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-yellow-500"
          />
        </div>
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs shadow-lg transition-all w-full sm:w-auto shrink-0"
        >
          Find Incident Case
        </button>
      </form>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Directly Assigned</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{myAssignedIncidents.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Assigned to {currentUser.name}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-amber-400 font-bold uppercase">In Progress</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {myAssignedIncidents.filter(i => i.status === 'In Progress').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under Investigation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-emerald-400 font-bold uppercase">Resolved Cases</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {myAssignedIncidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Successfully Concluded</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-red-400 font-bold uppercase">High & Critical</div>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {myAssignedIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Urgent Response</div>
        </div>
      </div>

      {/* Incidents Table / Cards Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-base font-extrabold text-white mb-4">
          {activeSubTab === 'assigned' ? 'Assigned Incidents Requiring Action' : `Regional Incidents Feed (${currentUser.region})`}
        </h2>

        <div className="space-y-3">
          {(activeSubTab === 'assigned' ? myAssignedIncidents : regionalIncidents).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No incidents assigned currently in this queue.
            </div>
          ) : (
            (activeSubTab === 'assigned' ? myAssignedIncidents : regionalIncidents).map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-yellow-400 text-sm">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      inc.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• {inc.status}</span>
                  </div>

                  <div className="text-sm font-bold text-white">
                    {inc.category} - {inc.location}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">
                    {inc.description}
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Reporter: {inc.reporterName || 'Anonymous'} • Mode: {inc.mode}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setSelectedIncForNote(inc);
                      setShowQuickNoteModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Log Official Note
                  </button>
                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="px-4 py-1.5 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110"
                  >
                    Open Case Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Official Action Note Modal */}
      {showQuickNoteModal && selectedIncForNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Log Official Inspection / Police Action
            </h3>
            <div className="text-xs text-slate-400 mb-4">
              Recording action for <span className="font-mono text-yellow-400 font-bold">{selectedIncForNote.id}</span> as {currentUser.role}.
            </div>

            <form onSubmit={handleRecordOfficialAction} className="space-y-4">
              <textarea
                required
                rows={4}
                value={quickActionText}
                onChange={(e) => setQuickActionText(e.target.value)}
                placeholder="Describe official action taken (e.g. Dispatched patrol, issued compliance warning, conducted health inspection)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
              />

              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowQuickNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110"
                >
                  Save Action Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
