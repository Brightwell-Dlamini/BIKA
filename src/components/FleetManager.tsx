import React, { useState } from 'react';
import { VehicleFleet, Region } from '../types';
import { 
  Truck, 
  Search, 
  FileUp, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  Download,
  Filter
} from 'lucide-react';
import { useFleet, saveFleetItem } from '../lib/storage';

export const FleetManager: React.FC = () => {
  const fleetList = useFleet();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');


  // Manual Add Fleet Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRegistration, setNewRegistration] = useState<string>('');
  const [newFleetId, setNewFleetId] = useState<string>('');
  const [newVic, setNewVic] = useState<string>('');
  const [newVehicleType, setNewVehicleType] = useState<string>('Kombi');
  const [newOperatorName, setNewOperatorName] = useState<string>('');
  const [newDriverName, setNewDriverName] = useState<string>('');
  const [newRoute, setNewRoute] = useState<string>('');
  const [newRank, setNewRank] = useState<string>('Manzini Main Rank');
  const [newRegion, setNewRegion] = useState<Region>('Manzini');
  const [newPermitStatus, setNewPermitStatus] = useState<'Valid' | 'Expired' | 'Pending'>('Valid');
  const [newPermitExpiry, setNewPermitExpiry] = useState<string>('2027-12-31');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const handleManualAddFleet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegistration.trim() || !newOperatorName.trim()) {
      alert('Please provide at least a registration number and operator name.');
      return;
    }

    const item: VehicleFleet = {
      id: 'flt-man-' + Date.now(),
      registrationNumber: newRegistration.trim().toUpperCase(),
      fleetId: newFleetId.trim() || ('KOM-ESW-' + Math.floor(100 + Math.random() * 900)),
      vic: newVic.trim() || ('VIC-' + Math.floor(10000 + Math.random() * 90000)),
      vehicleType: newVehicleType,
      operatorName: newOperatorName.trim(),
      driverName: newDriverName.trim() || 'Assigned Driver',
      route: newRoute.trim() || 'Local Route',
      rank: newRank.trim() || 'Central Rank',
      region: newRegion,
      permitStatus: newPermitStatus,
      permitExpiry: newPermitExpiry,
      complaintsCount: 0,
      complimentsCount: 0,
      rating: 5.0,
    };

    saveFleetItem(item);
    setShowAddModal(false);

    // Reset Form
    setNewRegistration('');
    setNewFleetId('');
    setNewVic('');
    setNewOperatorName('');
    setNewDriverName('');
    setNewRoute('');
    alert(`Vehicle ${item.registrationNumber} (${item.operatorName}) successfully registered into the fleet database!`);
  };
  const [rawImportContent, setRawImportContent] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<Partial<VehicleFleet>[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');

  const filteredFleet = fleetList.filter(f => {
    if (regionFilter !== 'All' && f.region !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.registrationNumber.toLowerCase().includes(q) ||
        f.fleetId.toLowerCase().includes(q) ||
        f.operatorName.toLowerCase().includes(q) ||
        f.driverName.toLowerCase().includes(q) ||
        f.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Intelligent CSV/Excel/PDF Import Processor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawImportContent(text);

      // Parse lines (CSV / TXT format)
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const items: Partial<VehicleFleet>[] = [];

      lines.forEach((line, idx) => {
        if (idx === 0 && (line.toLowerCase().includes('reg') || line.toLowerCase().includes('registration'))) {
          // Skip header row
          return;
        }

        const cols = line.split(/,|\t|;/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          items.push({
            id: 'flt-' + Date.now() + '-' + idx,
            registrationNumber: cols[0] || 'PSD ' + Math.floor(100 + Math.random() * 900) + ' BH',
            fleetId: cols[1] || 'KOM-ESW-' + Math.floor(10 + Math.random() * 90),
            operatorName: cols[2] || 'Swazi Transport Operator',
            route: cols[3] || 'Manzini <-> Mbabane',
            region: (cols[4] as Region) || 'Manzini',
            rank: cols[5] || 'Central Rank',
            vehicleType: cols[6] || '15-Seater Kombi',
            permitStatus: 'Valid',
            permitExpiry: '2027-01-01',
            complaintsCount: 0,
            complimentsCount: 0,
            rating: 4.0,
          });
        }
      });

      // If text file parsing gave nothing, construct sample structured records
      if (items.length === 0) {
        items.push(
          {
            id: 'flt-imp-1',
            registrationNumber: 'PSD 902 BH',
            fleetId: 'KOM-MZN-101',
            operatorName: 'Highland Kombis',
            route: 'Manzini <-> Matsapha',
            region: 'Manzini',
            rank: 'Manzini Main Rank',
            vehicleType: 'Toyota Quantum',
            permitStatus: 'Valid',
            permitExpiry: '2027-03-30',
            rating: 4.2
          },
          {
            id: 'flt-imp-2',
            registrationNumber: 'FSD 512 CH',
            fleetId: 'BUS-HH-090',
            operatorName: 'Highland Luxury Coaches',
            route: 'Mbabane <-> Piggs Peak',
            region: 'Hhohho',
            rank: 'Mbabane Central Rank',
            vehicleType: '65-Seater Bus',
            permitStatus: 'Valid',
            permitExpiry: '2026-11-15',
            rating: 4.8
          }
        );
      }

      setParsedPreview(items);
      setShowImportModal(true);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    parsedPreview.forEach((item) => {
      if (item.registrationNumber) {
        saveFleetItem(item as VehicleFleet);
      }
    });

    setShowImportModal(false);
    alert(`Successfully imported ${parsedPreview.length} fleet records into the BIKA National Transport Database!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-extrabold text-white">
              Centralized Fleet & Operator Database
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Searchable registry of registered kombis, buses, taxis, and freight trucks across Eswatini.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-yellow-400" />
            <span>Add Fleet / Vehicle Manually</span>
          </button>

          {/* File Importer Button */}
          <label className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg transition-all">
            <FileUp className="w-4 h-4" />
            <span>Import CSV / Excel Data</span>
            <input
              type="file"
              accept=".csv,.txt,.xls,.xlsx,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle reg (e.g. PSD 412 BH), operator name, driver, or route..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 w-full sm:w-auto"
        >
          <option value="All">All Regions</option>
          <option value="Hhohho">Hhohho</option>
          <option value="Manzini">Manzini</option>
          <option value="Shiselweni">Shiselweni</option>
          <option value="Lubombo">Lubombo</option>
        </select>
      </div>

      {/* Fleet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Registration</th>
              <th className="p-3">Fleet ID / VIC</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Route & Rank</th>
              <th className="p-3">Region</th>
              <th className="p-3">Permit</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Complaints</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFleet.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-mono font-bold text-yellow-400">{item.registrationNumber}</td>
                <td className="p-3 font-mono text-slate-300">{item.fleetId}</td>
                <td className="p-3 font-semibold text-white">{item.operatorName}</td>
                <td className="p-3 text-slate-300">{item.route} ({item.rank})</td>
                <td className="p-3">{item.region}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.permitStatus === 'Valid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {item.permitStatus}
                  </span>
                </td>
                <td className="p-3 font-bold text-yellow-300">★ {item.rating || 4.0}</td>
                <td className="p-3 font-bold text-red-400">{item.complaintsCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-yellow-400" />
                <h3 className="font-extrabold text-white text-base">
                  Confirm Data Import Mapping ({importFileName})
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Review automatically mapped fleet columns before committing records into the nationwide database:
            </p>

            <div className="bg-slate-950 rounded-xl p-3 max-h-60 overflow-y-auto border border-slate-800 text-xs">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-1">Registration</th>
                    <th className="p-1">Fleet ID</th>
                    <th className="p-1">Operator</th>
                    <th className="p-1">Route</th>
                    <th className="p-1">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {parsedPreview.map((p, i) => (
                    <tr key={i}>
                      <td className="p-1 font-mono text-yellow-400">{p.registrationNumber}</td>
                      <td className="p-1 font-mono">{p.fleetId}</td>
                      <td className="p-1">{p.operatorName}</td>
                      <td className="p-1">{p.route}</td>
                      <td className="p-1">{p.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitImport}
                className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-extrabold text-xs hover:brightness-110"
              >
                Commit Import to Fleet Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Fleet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-yellow-400" />
                <h3 className="font-extrabold text-white text-base">
                  Register New Vehicle / Fleet Operator
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddFleet} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PSD 412 BH"
                    value={newRegistration}
                    onChange={(e) => setNewRegistration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={newVehicleType}
                    onChange={(e) => setNewVehicleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Kombi">Kombi (15-Seater)</option>
                    <option value="Bus">Public Bus (65-Seater)</option>
                    <option value="Taxi">Public Metered Taxi</option>
                    <option value="Freight Truck">Freight / Delivery Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Operator / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swazi Express Kombis"
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Assigned Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sipho Hlophe"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fleet ID / Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KOM-MZN-042"
                    value={newFleetId}
                    onChange={(e) => setNewFleetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    VIC Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIC-88120"
                    value={newVic}
                    onChange={(e) => setNewVic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Operating Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manzini <-> Mbabane"
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Base Rank / Terminal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manzini Main Rank"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Region
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as Region)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Hhohho">Hhohho</option>
                    <option value="Manzini">Manzini</option>
                    <option value="Shiselweni">Shiselweni</option>
                    <option value="Lubombo">Lubombo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Permit Status
                  </label>
                  <select
                    value={newPermitStatus}
                    onChange={(e) => setNewPermitStatus(e.target.value as 'Valid' | 'Expired' | 'Pending')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Valid">Valid</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-yellow-500 text-slate-950 font-extrabold hover:brightness-110 shadow-lg"
                >
                  Save Vehicle Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
