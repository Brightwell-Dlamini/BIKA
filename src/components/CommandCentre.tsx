import React, { useState } from 'react';
import { Incident, Region, TransportMode, Severity, IncidentStatus } from '../types';
import { EswatiniMap } from './EswatiniMap';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  Filter, 
  Search, 
  MessageSquare, 
  Calendar, 
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface CommandCentreProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const CommandCentre: React.FC<CommandCentreProps> = ({
  incidents,
  onSelectIncident
}) => {
  // Filter States
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered List Calculation
  const filteredIncidents = incidents.filter(i => {
    if (regionFilter !== 'All' && i.region !== regionFilter) return false;
    if (modeFilter !== 'All' && i.mode !== modeFilter) return false;
    if (severityFilter !== 'All' && i.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && i.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        i.id.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.vehicleRegistration && i.vehicleRegistration.toLowerCase().includes(q)) ||
        (i.restaurantName && i.restaurantName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate Command Stats
  const totalToday = incidents.length;
  const openIncidents = incidents.filter(i => i.status !== 'Closed' && i.status !== 'Resolved').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'Closed').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH' && i.status !== 'Closed').length;
  const awaitingResponse = incidents.filter(i => i.status === 'Submitted' || i.status === 'Received').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const complaintsCount = incidents.filter(i => i.reportType === 'Complaint').length;
  const complimentsCount = incidents.filter(i => i.reportType === 'Compliment').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Title & Live Status Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              BIKA VIRTUAL COMMAND CENTRE • LIVE STREAM
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Eswatini National Incident & Intelligence Command
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-400">Avg Response Time</div>
            <div className="font-bold text-yellow-400 font-mono text-sm">8.4 Mins</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-400">Avg Resolution Time</div>
            <div className="font-bold text-emerald-400 font-mono text-sm">31.2 Mins</div>
          </div>
        </div>
      </div>

      {/* Live Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{totalToday}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Nationwide Feed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Open Incidents</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{openIncidents}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active Operational</div>
        </div>

        <div className="bg-slate-900 border border-red-900/50 p-4 rounded-xl shadow-lg bg-red-950/20">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Flame className="w-3 h-3 text-red-500" />
            <span>Critical Alerts</span>
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">{criticalCount}</div>
          <div className="text-[10px] text-red-300 mt-0.5">Immediate Escalation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Awaiting Officer</div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">{awaitingResponse}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Unassigned/Pending</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Resolved Cases</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Closed Successfully</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Compliments / Ratings</div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-1">{complimentsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Positive Commendations</div>
        </div>
      </div>

      {/* Main Grid: Map & Live Feed Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Eswatini Map */}
        <div className="lg:col-span-7">
          <EswatiniMap
            incidents={filteredIncidents}
            onSelectIncident={onSelectIncident}
            selectedRegion={regionFilter}
            onSelectRegion={(r) => setRegionFilter(r)}
          />
        </div>

        {/* Live Filterable Incidents List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between max-h-[520px]">
          <div>
            {/* Search and Filters Bar */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, vehicle reg, location..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                >
                  <option value="All">All Regions</option>
                  <option value="Hhohho">Hhohho</option>
                  <option value="Manzini">Manzini</option>
                  <option value="Shiselweni">Shiselweni</option>
                  <option value="Lubombo">Lubombo</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                >
                  <option value="All">All Severity</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                >
                  <option value="All">All Modes</option>
                  <option value="Road Transport">Road Transport</option>
                  <option value="Restaurant/Food">Trade & Food</option>
                </select>
              </div>
            </div>

            {/* Incidents Stream */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 no-scrollbar">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No incidents match the active filters.
                </div>
              ) : (
                filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-yellow-500/50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-extrabold text-yellow-400">{inc.id}</span>
                        {inc.isRepeatedAlert && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] px-1.5 rounded font-bold">
                            REPEATED
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                        inc.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                        inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                      {inc.category} • {inc.location}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {inc.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 border-t border-slate-900 pt-1.5">
                      <span>{inc.region} • {inc.mode}</span>
                      <span className="text-slate-400 font-semibold">{inc.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
