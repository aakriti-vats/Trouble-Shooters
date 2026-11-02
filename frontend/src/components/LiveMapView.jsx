import React, { useState } from 'react';
import MapComponent from './MapComponent';
import { 
  Navigation, 
  Flame, 
  AlertOctagon, 
  MapPin, 
  RotateCcw, 
  Layers, 
  Plus, 
  ShieldAlert,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { toggleRoadPoint, createHazard, deleteHazard, deleteBlockedRoad } from '../api';

export default function LiveMapView({ 
  stateData, 
  onRefresh, 
  onNavigateTab,
  startPoint,
  setStartPoint,
  onSelectShelterForRouting 
}) {
  const [mapMode, setMapMode] = useState('start'); // 'start' | 'road' | 'hazard' | 'inspect'
  const [statusMsg, setStatusMsg] = useState('Click any location on the map to set an evacuation starting point.');
  const [quickHazardModal, setQuickHazardModal] = useState(null); // { lat, lng }
  const [hazardForm, setHazardForm] = useState({
    title: 'New Emergency Incident',
    type: 'wildfire',
    radius_m: 350,
    severity: 4.0,
    description: 'Reported by Field Recon Unit.',
  });

  const handleMapClick = async (lat, lng, mode) => {
    if (mode === 'start') {
      setStartPoint([lat, lng]);
      setStatusMsg(`Origin set to [${lat.toFixed(4)}, ${lng.toFixed(4)}]. Click 'Plan Route' below to calculate safe evacuation.`);
    } else if (mode === 'road') {
      try {
        const res = await toggleRoadPoint(lat, lng, 'Tactical Road Barricade', 'Closure placed via Live Tactical Map');
        await onRefresh();
        setStatusMsg(res.action === 'created' ? 'Road corridor blocked.' : 'Road barrier cleared.');
      } catch (err) {
        alert('Failed to toggle road closure: ' + err.message);
      }
    } else if (mode === 'hazard') {
      setQuickHazardModal({ lat, lng });
    }
  };

  const handleSaveQuickHazard = async (e) => {
    e.preventDefault();
    if (!quickHazardModal) return;
    try {
      await createHazard({
        ...hazardForm,
        lat: quickHazardModal.lat,
        lng: quickHazardModal.lng,
        radius_m: parseFloat(hazardForm.radius_m),
        severity: parseFloat(hazardForm.severity),
      });
      setQuickHazardModal(null);
      await onRefresh();
      setStatusMsg('Hazard successfully deployed to operational map.');
    } catch (err) {
      alert('Failed to deploy hazard: ' + err.message);
    }
  };

  const handleRemoveHazard = async (id) => {
    try {
      await deleteHazard(id);
      await onRefresh();
      setStatusMsg('Hazard cleared from operational map.');
    } catch (err) {
      alert('Failed to delete hazard: ' + err.message);
    }
  };

  const handleToggleRoad = async (id) => {
    try {
      await deleteBlockedRoad(id);
      await onRefresh();
      setStatusMsg('Corridor reopened.');
    } catch (err) {
      alert('Failed to reopen road: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tactical Toolbar & Mode Buttons */}
      <div className="bg-ops-card border border-ops-border rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400 mr-2 font-bold uppercase hidden sm:inline">
            Interactive Tools:
          </span>
          <button
            onClick={() => {
              setMapMode('start');
              setStatusMsg('Click map to choose where people are.');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              mapMode === 'start'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-ops-surface text-slate-300 hover:bg-slate-800 border border-ops-border'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Set Origin Point</span>
          </button>

          <button
            onClick={() => {
              setMapMode('road');
              setStatusMsg('Click near any road to toggle a tactical blockage / barrier.');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              mapMode === 'road'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-ops-surface text-slate-300 hover:bg-slate-800 border border-ops-border'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Block / Unblock Road</span>
          </button>

          <button
            onClick={() => {
              setMapMode('hazard');
              setStatusMsg('Click anywhere on the map to deploy a new disaster hazard zone.');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              mapMode === 'hazard'
                ? 'bg-red-500 text-white shadow-md font-bold'
                : 'bg-ops-surface text-slate-300 hover:bg-slate-800 border border-ops-border'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Deploy Hazard</span>
          </button>

          <button
            onClick={() => {
              setMapMode('inspect');
              setStatusMsg('Click markers on the map to view detailed situational metadata.');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              mapMode === 'inspect'
                ? 'bg-slate-700 text-white border border-slate-500'
                : 'bg-ops-surface text-slate-300 hover:bg-slate-800 border border-ops-border'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Inspect Mode</span>
          </button>
        </div>

        {/* Action Button for Planner */}
        {startPoint && (
          <button
            onClick={() => onNavigateTab('planner')}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Plan Route with Origin</span>
          </button>
        )}
      </div>

      {/* Operational Status Instruction Bar */}
      <div className="bg-ops-surface border border-ops-border px-4 py-2 rounded-lg text-xs font-mono flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-cyan-300">{statusMsg}</span>
        </div>
        {startPoint && (
          <span className="text-slate-400 hidden sm:inline">
            Origin: [{startPoint[0].toFixed(4)}, {startPoint[1].toFixed(4)}]
          </span>
        )}
      </div>

      {/* Interactive Leaflet Map */}
      <div className="h-[620px] w-full relative">
        <MapComponent
          stateData={stateData}
          mapMode={mapMode}
          onMapClick={handleMapClick}
          startPoint={startPoint}
          onSelectShelter={onSelectShelterForRouting}
          onRemoveHazard={handleRemoveHazard}
          onToggleRoad={handleToggleRoad}
          onSetStartPoint={(pt) => {
            setStartPoint(pt);
            setStatusMsg(`Origin set to [${pt[0].toFixed(4)}, ${pt[1].toFixed(4)}].`);
          }}
        />
      </div>

      {/* Modal for Quick Hazard Deployment */}
      {quickHazardModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-ops-card border border-ops-border rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ops-border mb-4">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Flame className="w-5 h-5" />
                <span>Deploy Tactical Hazard</span>
              </div>
              <button 
                onClick={() => setQuickHazardModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickHazard} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Incident Title</label>
                <input
                  type="text"
                  value={hazardForm.title}
                  onChange={(e) => setHazardForm({ ...hazardForm, title: e.target.value })}
                  required
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hazard Type</label>
                  <select
                    value={hazardForm.type}
                    onChange={(e) => setHazardForm({ ...hazardForm, type: e.target.value })}
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="wildfire">Wildfire</option>
                    <option value="flood">Flash Flood</option>
                    <option value="chemical">Chemical / HAZMAT</option>
                    <option value="blocked_road">Debris / Roadblock</option>
                    <option value="restricted_exit">Restricted Barricade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    value={hazardForm.radius_m}
                    onChange={(e) => setHazardForm({ ...hazardForm, radius_m: e.target.value })}
                    min="50"
                    max="2000"
                    className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Severity: {hazardForm.severity} / 5.0
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={hazardForm.severity}
                  onChange={(e) => setHazardForm({ ...hazardForm, severity: e.target.value })}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Operational Description</label>
                <textarea
                  value={hazardForm.description}
                  onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickHazardModal(null)}
                  className="px-4 py-2 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 text-xs font-medium border border-ops-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Deploy Hazard to Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

