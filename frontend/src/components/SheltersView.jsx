import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  Users, 
  Navigation, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  MapPin, 
  Package, 
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { createShelter, updateShelter, patchShelterOccupancy } from '../api';

export default function SheltersView({ stateData, onRefresh, onSelectShelterForRouting }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: 30.7333,
    lng: 76.7794,
    capacity: 400,
    occupancy: 50,
    available: true,
    shelter_type: 'Municipal High School / Community Center',
    supplies: ['Clean Water Supply', 'Emergency Cots', 'Backup Generators', 'First Aid Station'],
    contact_phone: '(555) 019-2000',
  });

  const shelters = stateData?.shelters || [];

  const handleOccupancyDelta = async (shelter, delta) => {
    const newOcc = Math.max(0, Math.min(shelter.capacity * 2, shelter.occupancy + delta));
    try {
      await patchShelterOccupancy(shelter.id, newOcc);
      await onRefresh();
    } catch (err) {
      alert('Failed to update occupancy: ' + err.message);
    }
  };

  const handleToggleAvailable = async (shelter) => {
    try {
      await updateShelter(shelter.id, { available: !shelter.available });
      await onRefresh();
    } catch (err) {
      alert('Failed to toggle shelter status: ' + err.message);
    }
  };

  const handleCreateShelter = async (e) => {
    e.preventDefault();
    try {
      await createShelter({
        ...form,
        capacity: parseInt(form.capacity),
        occupancy: parseInt(form.occupancy),
      });
      setShowAddModal(false);
      setForm({
        name: '',
        address: '',
        lat: 30.7333,
        lng: 76.7794,
        capacity: 400,
        occupancy: 50,
        available: true,
        shelter_type: 'Municipal High School / Community Center',
        supplies: ['Clean Water Supply', 'Emergency Cots', 'Backup Generators', 'First Aid Station'],
        contact_phone: '(555) 019-2000',
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to create shelter: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Designated Evacuation Shelters</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time facility status, bed capacity, resource allocation, and incoming evacuee intake management.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shelter</span>
        </button>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shelters.map((shelter) => {
          const isFull = !shelter.available || shelter.status === 'full';
          const isNearCapacity = shelter.status === 'near_capacity' || shelter.occupancy_rate >= 85;

          return (
            <div
              key={shelter.id}
              className="bg-ops-card border border-ops-border hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{shelter.name}</h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isFull ? 'bg-slate-800 text-slate-400' :
                        isNearCapacity ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {shelter.available ? shelter.status.replace('_', ' ') : 'UNAVAILABLE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{shelter.address || shelter.shelter_type}</p>
                  </div>

                  <button
                    onClick={() => handleToggleAvailable(shelter)}
                    title={shelter.available ? 'Mark as Unavailable' : 'Mark as Available'}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition cursor-pointer ${
                      shelter.available 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    {shelter.available ? 'OPEN' : 'CLOSED'}
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 bg-ops-surface p-3 rounded-lg border border-ops-border">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <span className="font-bold text-white">
                      {shelter.occupancy} / {shelter.capacity} Beds ({shelter.occupancy_rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' :
                        isNearCapacity ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, shelter.occupancy_rate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Supplies / Assets Tag Cloud */}
                {shelter.supplies && shelter.supplies.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Available Provisions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {shelter.supplies.map((sup, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] bg-slate-900 text-slate-300 border border-ops-border px-2 py-0.5 rounded"
                        >
                          {sup}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Controls: Quick +/- Occupancy and Route Here */}
              <div className="pt-3 border-t border-ops-border space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{shelter.contact_phone || '(555) 010-0000'}</span>
                  </div>
                  <span>[{shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}]</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* Quick Intake Counter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 font-mono mr-1">Intake:</span>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, -10)}
                      disabled={shelter.occupancy <= 0}
                      className="px-2 py-1 rounded bg-ops-surface hover:bg-slate-800 text-slate-200 border border-ops-border text-xs font-mono cursor-pointer disabled:opacity-30"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, 10)}
                      className="px-2 py-1 rounded bg-ops-surface hover:bg-slate-800 text-slate-200 border border-ops-border text-xs font-mono cursor-pointer"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, 25)}
                      className="px-2 py-1 rounded bg-ops-surface hover:bg-slate-800 text-slate-200 border border-ops-border text-xs font-mono cursor-pointer"
                    >
                      +25
                    </button>
                  </div>

                  {/* Route Button */}
                  <button
                    onClick={() => onSelectShelterForRouting(shelter)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Plan Route Here</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-ops-card border border-ops-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ops-border">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Building2 className="w-5 h-5" />
                <span>Register Emergency Shelter Facility</span>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShelter} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Sector Civic Pavilion"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 500 South Boulevard, Sector 20"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Bed Capacity</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="5000"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Occupancy</label>
                  <input
                    type="number"
                    min="0"
                    value={form.occupancy}
                    onChange={(e) => setForm({ ...form, occupancy: e.target.value })}
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Dispatch Contact Phone</label>
                <input
                  type="text"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 text-xs font-medium border border-ops-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
