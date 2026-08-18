import React, { useState } from 'react';
import { Establishment, Region } from '../types';
import { 
  Building2, 
  Search, 
  FileUp, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Utensils, 
  HeartPulse 
} from 'lucide-react';
import { useEstablishments, saveEstablishment } from '../lib/storage';

export const EstablishmentManager: React.FC = () => {
  const list = useEstablishments();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');


  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newTradingName, setNewTradingName] = useState<string>('');
  const [newRefNum, setNewRefNum] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Restaurant' | 'Market' | 'Food Vendor' | 'Trade Hub'>('Restaurant');
  const [newOwner, setNewOwner] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newRegion, setNewRegion] = useState<Region>('Hhohho');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newHealthStatus, setNewHealthStatus] = useState<'Compliant' | 'Warning' | 'Violation Found' | 'Pending Inspection'>('Compliant');

  const handleAddEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newOwner.trim()) {
      alert('Please provide at least the establishment name and owner/operator name.');
      return;
    }

    const item: Establishment = {
      id: 'est-man-' + Date.now(),
      name: newName.trim(),
      tradingName: newTradingName.trim() || newName.trim(),
      referenceNumber: newRefNum.trim() || ('EST-ESW-' + Math.floor(1000 + Math.random() * 9000)),
      category: newCategory,
      ownerOperator: newOwner.trim(),
      location: newLocation.trim() || 'Central Market Area',
      region: newRegion,
      contactPhone: newPhone.trim() || '+268 7600 0000',
      healthInspectionStatus: newHealthStatus,
      lastInspectionDate: new Date().toISOString().split('T')[0],
      rating: 5.0,
      complaintsCount: 0,
      complimentsCount: 0,
    };

    saveEstablishment(item);
    setShowAddModal(false);

    // Reset Form
    setNewName('');
    setNewTradingName('');
    setNewRefNum('');
    setNewOwner('');
    setNewLocation('');
    setNewPhone('');
    alert(`Establishment "${item.name}" registered successfully into the Food Trade Database!`);
  };

  const filtered = list.filter(item => {
    if (regionFilter !== 'All' && item.region !== regionFilter) return false;
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.tradingName.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.ownerOperator.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-extrabold text-white">
              Restaurants, Markets & Food Trade Registry
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized database for food trade safety inspections, hygiene compliance, and consumer reporting across Eswatini.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add Restaurant / Trade Establishment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search establishment name, reference #, owner, or location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex-1 sm:flex-none"
          >
            <option value="All">All Categories</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
            <option value="Market">Market</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex-1 sm:flex-none"
          >
            <option value="All">All Regions</option>
            <option value="Hhohho">Hhohho</option>
            <option value="Manzini">Manzini</option>
            <option value="Shiselweni">Shiselweni</option>
            <option value="Lubombo">Lubombo</option>
          </select>
        </div>
      </div>

      {/* Establishments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-yellow-400 font-bold">{item.referenceNumber}</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{item.name}</h3>
                <div className="text-xs text-slate-400">{item.location} ({item.region})</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                item.healthInspectionStatus === 'Compliant' ? 'bg-emerald-500/20 text-emerald-300' :
                item.healthInspectionStatus === 'Warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {item.healthInspectionStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[10px]">Owner / Operator</span>
                <span className="font-semibold text-slate-200">{item.ownerOperator}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Last Health Inspection</span>
                <span className="font-mono text-slate-300">{item.lastInspectionDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Star Rating</span>
                <span className="font-bold text-yellow-400">★ {item.rating} / 5.0</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Registered Complaints</span>
                <span className="font-bold text-red-400">{item.complaintsCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Add Restaurant / Establishment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-yellow-400" />
                <h3 className="font-extrabold text-white text-base">
                  Register New Restaurant / Food Trade Establishment
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEstablishment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Establishment / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mbabane Central Market Grill"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Trading Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Market Grill"
                    value={newTradingName}
                    onChange={(e) => setNewTradingName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Reference / License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EST-HH-2026-004"
                    value={newRefNum}
                    onChange={(e) => setNewRefNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Restaurant">Restaurant / Fast Food</option>
                    <option value="Market">Public Fresh Food Market</option>
                    <option value="Food Vendor">Rank Food Stall / Vendor</option>
                    <option value="Trade Hub">Trade & Logistics Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Owner / License Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nomsa Dlamini"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Phone / Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +268 7611 2233"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Physical Location / Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mbabane Plaza Food Court"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
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

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Initial Hygiene Inspection Status
                  </label>
                  <select
                    value={newHealthStatus}
                    onChange={(e) => setNewHealthStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Compliant">Compliant - Hygiene Certified</option>
                    <option value="Pending Inspection">Pending Initial Inspection</option>
                    <option value="Warning">Warning Issued</option>
                    <option value="Violation Found">Violation Found</option>
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
                  Save Establishment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
