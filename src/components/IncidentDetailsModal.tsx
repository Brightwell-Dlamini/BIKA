import React, { useState } from 'react';
import { Incident, IncidentStatus, User, UserRole, CommunicationMessage } from '../types';
import { 
  X, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  UserPlus, 
  Send, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Flame, 
  Check, 
  MessageSquare,
  Lock,
  Phone,
  Paperclip
} from 'lucide-react';
import { saveIncident, getUsers, addAuditRecord } from '../lib/storage';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  currentUser: User;
  onClose: () => void;
  onUpdate: (updated: Incident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  currentUser,
  onClose,
  onUpdate
}) => {
  if (!incident) return null;

  const [newMessage, setNewMessage] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(incident.assignedOfficerId || '');
  const allOfficers = getUsers();

  const handleStatusChange = (newStatus: IncidentStatus) => {
    const now = new Date().toISOString();
    const updated: Incident = { ...incident, status: newStatus, updatedAt: now };

    if (newStatus === 'Received' && !updated.acknowledgedAt) updated.acknowledgedAt = now;
    if (newStatus === 'Assigned' && !updated.assignedAt) updated.assignedAt = now;
    if (newStatus === 'In Progress' && !updated.firstRespondedAt) updated.firstRespondedAt = now;
    if (newStatus === 'Resolved' && !updated.resolvedAt) updated.resolvedAt = now;
    if (newStatus === 'Closed' && !updated.closedAt) updated.closedAt = now;

    // Log message
    const statusMsg: CommunicationMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: `Status updated to [${newStatus}] by ${currentUser.name} (${currentUser.role}).`,
      timestamp: now,
      isInternalNote: false,
    };
    updated.messages.push(statusMsg);

    saveIncident(updated);
    onUpdate(updated);
  };

  const handleAssignOfficer = (officerId: string) => {
    const officer = allOfficers.find(u => u.id === officerId);
    if (!officer) return;

    const now = new Date().toISOString();
    const updated: Incident = {
      ...incident,
      assignedOfficerId: officer.id,
      assignedOfficerName: officer.name,
      assignedDepartment: officer.department || officer.role,
      status: 'Assigned',
      assignedAt: now,
      updatedAt: now,
    };

    updated.messages.push({
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: `Assigned to ${officer.name} (${officer.department || officer.role}).`,
      timestamp: now,
    });

    saveIncident(updated);
    onUpdate(updated);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const now = new Date().toISOString();
    const msg: CommunicationMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: newMessage.trim(),
      timestamp: now,
      isInternalNote,
    };

    const updated: Incident = {
      ...incident,
      messages: [...incident.messages, msg],
      updatedAt: now,
    };

    saveIncident(updated);
    onUpdate(updated);
    setNewMessage('');
  };

  const handleEscalate = () => {
    const now = new Date().toISOString();
    const updated: Incident = {
      ...incident,
      status: 'Escalated',
      escalatedCount: (incident.escalatedCount || 0) + 1,
      updatedAt: now,
    };

    updated.messages.push({
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: `CRITICAL ESCALATION TRIGGERED: Incident escalated to National Supervisory Unit by ${currentUser.name}.`,
      timestamp: now,
    });

    saveIncident(updated);
    onUpdate(updated);
  };

  // Time metrics calculations
  const calculateDurationMins = (startISO?: string, endISO?: string) => {
    if (!startISO || !endISO) return 'N/A';
    const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
    const mins = Math.round(diffMs / (1000 * 60));
    return `${mins} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        {/* Header Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-yellow-400">{incident.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                incident.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                incident.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                'bg-yellow-500/20 text-yellow-300'
              }`}>
                {incident.severity}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                {incident.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Reported: {new Date(incident.createdAt).toLocaleString()} • {incident.region} ({incident.mode})
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Details, Workflow Timestamps & Officer Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Description & Entity Info */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                {incident.category} - {incident.location}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {incident.description}
              </p>

              {/* Entity details if any */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2 text-slate-300">
                {incident.vehicleRegistration && <div><span className="text-slate-500">Vehicle Reg:</span> {incident.vehicleRegistration}</div>}
                {incident.driverName && <div><span className="text-slate-500">Driver:</span> {incident.driverName}</div>}
                {incident.operatorName && <div><span className="text-slate-500">Operator:</span> {incident.operatorName}</div>}
                {incident.restaurantName && <div><span className="text-slate-500">Restaurant:</span> {incident.restaurantName}</div>}
                {incident.reporterName && <div><span className="text-slate-500">Reporter:</span> {incident.reporterName}</div>}
              </div>
            </div>

            {/* Attachments Lightbox */}
            {incident.attachments && incident.attachments.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Paperclip className="w-4 h-4 text-yellow-400" />
                  <span>Attached Photographic Evidence</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {incident.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-800 h-28 block"
                    >
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                        View Full Image
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Calculated SLA Performance Timestamps */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                <span>Core Workflow SLA Timestamps</span>
                <span className="text-yellow-400 font-mono">AUTOMATIC AUDIT ENGINE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Time to Acknowledge</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {calculateDurationMins(incident.createdAt, incident.acknowledgedAt)}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Time to Assign</span>
                  <span className="font-bold text-sky-400 font-mono">
                    {calculateDurationMins(incident.createdAt, incident.assignedAt)}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Time to First Officer Response</span>
                  <span className="font-bold text-yellow-400 font-mono">
                    {calculateDurationMins(incident.createdAt, incident.firstRespondedAt)}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Resolution Time</span>
                  <span className="font-bold text-purple-400 font-mono">
                    {calculateDurationMins(incident.createdAt, incident.resolvedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Officer Action Controls (If Official / Admin) */}
            {currentUser.role !== 'Public User' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="font-bold text-yellow-400 text-xs uppercase tracking-wider">
                  Officer Workflow Controls
                </div>

                {/* Status Changer */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Update Status:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['Received', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'] as IncidentStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          incident.status === st 
                            ? 'bg-yellow-500 text-slate-950 shadow' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Officer Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Assign Responsible Officer:</label>
                    <select
                      value={selectedOfficerId}
                      onChange={(e) => {
                        setSelectedOfficerId(e.target.value);
                        handleAssignOfficer(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="">-- Unassigned --</option>
                      {allOfficers.filter(u => u.role !== 'Public User').map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.role} - {o.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleEscalate}
                      className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-colors"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Trigger Critical Escalation</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Interactive Communication Timeline Chat */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between max-h-[500px]">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Incident Live Timeline</span>
                <span className="text-[10px] text-yellow-400 font-mono">{incident.messages.length} Messages</span>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1 no-scrollbar">
                {incident.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      msg.isInternalNote
                        ? 'bg-purple-950/50 border border-purple-800/60 text-purple-200'
                        : msg.senderRole === 'Public User'
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white flex items-center space-x-1">
                        <span>{msg.senderName}</span>
                        <span className="text-slate-400 font-normal">({msg.senderRole})</span>
                        {msg.isInternalNote && (
                          <Lock className="w-3 h-3 text-purple-400 inline ml-1" />
                        )}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Chat Message Form */}
            <form onSubmit={handleSendMessage} className="mt-3 border-t border-slate-800 pt-3">
              {currentUser.role !== 'Public User' && (
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1.5">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-purple-500"
                    />
                    <span>Post as Internal Police / Inspector Note</span>
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type response or action taken..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
                <button
                  type="submit"
                  className="bg-yellow-500 text-slate-950 font-bold p-2 rounded-xl hover:brightness-110"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
