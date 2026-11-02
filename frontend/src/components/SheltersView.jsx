import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Navigation, 
  Plus, 
  Phone, 
  MapPin, 
  Package, 
  CheckCircle2
} from 'lucide-react';
import { createShelter, updateShelter, patchShelterOccupancy } from '../api';

export default function SheltersView({ stateData, onRefresh, onSelectShelterForRouting }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: 30.7333,
    lng: 76.7794,
    capacity: 400,
    occupancy: 50,
    available: true,
    shelter_type: 'Municipal High School / Community Center',
    supplies: ['Clean Water Reserve', 'Emergency Cots', 'Backup Generators', 'First Aid Station'],
    contact_phone: '(555) 019-2000',
  });

  const shelters = stateData?.shelters || [];

  const handleOccupancyDelta = async (shelter, delta) => {
    const newOcc = Math.max(0, Math.min(shelter.capacity * 2, shelter.occupancy + delta));
    try {
      await patchShelterOccupancy(shelter.id, newOcc);
      await onRefresh();
    } catch (err) {
      alert('Failed to update facility intake: ' + err.message);
    }
  };

  const handleToggleAvailable = async (shelter) => {
    try {
      await updateShelter(shelter.id, { available: !shelter.available });
      await onRefresh();
    } catch (err) {
      alert('Failed to update facility availability: ' + err.message);
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
        supplies: ['Clean Water Reserve', 'Emergency Cots', 'Backup Generators', 'First Aid Station'],
        contact_phone: '(555) 019-2000',
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to register shelter: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-ops-surface border border-ops-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-sans">Civilian Shelter Network & Logistics</h2>
          </div>
          <p className="text-xs text-ops-muted mt-0.5">
            Operational facility readiness, real-time bed occupancy tracking, resource provisions, and intake controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>REGISTER NEW FACILITY</span>
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((shelter) => {
          const isFull = !shelter.available || shelter.status === 'full';
          const isNearCapacity = shelter.status === 'near_capacity' || shelter.occupancy_rate >= 85;

          return (
            <div
              key={shelter.id}
              className="bg-ops-surface border border-ops-border hover:border-slate-700 rounded-lg p-4 space-y-3.5 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{shelter.name}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isFull ? 'bg-slate-800 text-slate-400' :
                        isNearCapacity ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
                        'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      }`}>
                        {shelter.available ? shelter.status.replace('_', ' ') : 'UNAVAILABLE'}
                      </span>
                    </div>
                    <p className="text-xs text-ops-muted mt-0.5">{shelter.address || shelter.shelter_type}</p>
                  </div>

                  <button
                    onClick={() => handleToggleAvailable(shelter)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                      shelter.available 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40' 
                        : 'bg-red-950/40 text-red-400 border-red-800/60 hover:bg-red-900/40'
                    }`}
                  >
                    {shelter.available ? 'AVAILABLE' : 'CLOSED'}
                  </button>
                </div>

                {/* Occupancy Gauge */}
                <div className="bg-ops-bg p-2.5 rounded border border-ops-border space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-ops-muted text-[11px]">
                    <span>Occupancy:</span>
                    <strong className="text-white">
                      {shelter.occupancy} / {shelter.capacity} Beds ({shelter.occupancy_rate}%)
                    </strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' :
                        isNearCapacity ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, shelter.occupancy_rate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Provision Tags */}
                {shelter.supplies && shelter.supplies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-ops-faint uppercase block">Inventory Provisions:</span>
                    <div className="flex flex-wrap gap-1">
                      {shelter.supplies.map((sup, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] font-mono bg-ops-bg text-ops-muted border border-ops-border px-1.5 py-0.5 rounded"
                        >
                          {sup}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2.5 border-t border-ops-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-ops-faint">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{shelter.contact_phone || '(555) 010-0000'}</span>
                  </div>
                  <span>[{shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}]</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* Intake Steppers */}
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-[10px] text-ops-faint mr-1">INTAKE:</span>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, -10)}
                      disabled={shelter.occupancy <= 0}
                      className="px-2 py-0.5 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted hover:text-white border border-ops-border text-[11px] cursor-pointer disabled:opacity-30"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, 10)}
                      className="px-2 py-0.5 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted hover:text-white border border-ops-border text-[11px] cursor-pointer"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleOccupancyDelta(shelter, 25)}
                      className="px-2 py-0.5 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted hover:text-white border border-ops-border text-[11px] cursor-pointer"
                    >
                      +25
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectShelterForRouting(shelter)}
                    className="px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>ROUTE HERE</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-ops-surface border border-ops-border rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-ops-border pb-2">
              <h3 className="font-bold text-xs font-mono text-white uppercase">Register Civilian Evacuation Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="text-ops-faint hover:text-white cursor-pointer font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShelter} className="space-y-3 font-sans">
              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">FACILITY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Sector Municipal Arena"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">STREET ADDRESS</label>
                <input
                  type="text"
                  placeholder="e.g. 500 South Boulevard, Sector 20"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[10px] text-ops-muted mb-1">LATITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                    className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-ops-muted mb-1">LONGITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
                    className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[10px] text-ops-muted mb-1">TOTAL BED CAPACITY</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="5000"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-ops-muted mb-1">INITIAL OCCUPANCY</label>
                  <input
                    type="number"
                    min="0"
                    value={form.occupancy}
                    onChange={(e) => setForm({ ...form, occupancy: e.target.value })}
                    className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted text-xs border border-ops-border cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  REGISTER FACILITY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
