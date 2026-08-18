import React, { useState } from 'react';
import { Incident } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  PieChart, 
  Download, 
  MapPin, 
  Building2, 
  Truck 
} from 'lucide-react';

interface AnalyticsProps {
  incidents: Incident[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ incidents }) => {
  const [timeframe, setTimeframe] = useState<'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');

  // Calculate Region Distribution
  const regionCounts = {
    Hhohho: incidents.filter(i => i.region === 'Hhohho').length,
    Manzini: incidents.filter(i => i.region === 'Manzini').length,
    Shiselweni: incidents.filter(i => i.region === 'Shiselweni').length,
    Lubombo: incidents.filter(i => i.region === 'Lubombo').length,
  };

  // Mode Distribution
  const modeCounts: Record<string, number> = {};
  incidents.forEach(i => {
    modeCounts[i.mode] = (modeCounts[i.mode] || 0) + 1;
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Category,Mode,Region,Location,Severity,Status,CreatedAt\n';
    incidents.forEach(i => {
      csvContent += `${i.id},"${i.category}","${i.mode}","${i.region}","${i.location}",${i.severity},${i.status},${i.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BIKA_Eswatini_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-extrabold text-white">
              Real-Time Intelligence & National Performance Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Nationwide Eswatini incident density, regional response SLAs, transport operator rankings & food hygiene compliance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            {(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeframe === tf ? 'bg-yellow-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-yellow-400"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Regional Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regional Breakdown Bar Graph Visual */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span>Regional Incident Volume Comparison</span>
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(regionCounts).map(([reg, count]) => {
              const pct = Math.round((count / Math.max(1, incidents.length)) * 100);
              return (
                <div key={reg} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{reg} Region</span>
                    <span className="font-mono text-yellow-400">{count} Incidents ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Transport & Trade Service Distribution</span>
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(modeCounts).map(([m, count]) => {
              const pct = Math.round((count / Math.max(1, incidents.length)) * 100);
              return (
                <div key={m} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{m}</span>
                    <span className="font-mono text-sky-400">{count} Reports ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
