import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Printer, 
  Download, 
  Sparkles, 
  RotateCw,
  Compass,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { planRoute } from '../api';

export default function RoutePlannerView({ 
  stateData, 
  startPoint, 
  setStartPoint,
  selectedShelter,
  setSelectedShelter,
  routesData,
  setRoutesData 
}) {
  const [autoSelectShelter, setAutoSelectShelter] = useState(true);
  const [selectedShelterId, setSelectedShelterId] = useState(selectedShelter?.id || '');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [activeRouteType, setActiveRouteType] = useState('safe'); // 'safe' | 'direct' | 'alternative'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWaypoints, setShowWaypoints] = useState(true);

  const presets = stateData?.presets || [];
  const shelters = stateData?.shelters || [];

  // Initialize start point if not set
  useEffect(() => {
    if (!startPoint && presets.length > 0) {
      setStartPoint([presets[0].lat, presets[0].lng]);
      setSelectedPreset(presets[0].name);
    }
  }, [presets, startPoint, setStartPoint]);

  // Handle Preset change
  const handlePresetSelect = (e) => {
    const val = e.target.value;
    setSelectedPreset(val);
    const found = presets.find(p => p.name === val);
    if (found) {
      setStartPoint([found.lat, found.lng]);
    }
  };

  const handleCalculateRoutes = async () => {
    if (!startPoint) {
      setErrorMsg('Please select or click on the map to set an origin coordinate.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        start_lat: startPoint[0],
        start_lng: startPoint[1],
        auto_select_shelter: autoSelectShelter,
        shelter_id: !autoSelectShelter && selectedShelterId ? parseInt(selectedShelterId) : null,
      };

      const result = await planRoute(payload);
      setRoutesData(result);
      if (result.destination_shelter) {
        setSelectedShelter(result.destination_shelter);
      }
      setActiveRouteType('safe');
    } catch (err) {
      setErrorMsg(err.message || 'Routing failed.');
    } finally {
      setLoading(false);
    }
  };

  // Run calculation on initial load if route not present
  useEffect(() => {
    if (!routesData && startPoint) {
      handleCalculateRoutes();
    }
  }, []);

  const handlePrintManifest = () => {
    window.print();
  };

  const handleDownloadGeoJSON = () => {
    if (!routesData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routesData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `evacuation_manifest_${Date.now()}.json`);
    dl.click();
  };

  const activeRoute = routesData?.routes?.[activeRouteType];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Route Setup & Strategic Comparison (5 Cols) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Route Planning Control Panel */}
        <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ops-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Safe Route Planner</h3>
                <p className="text-[11px] text-slate-400">Hazard Avoidance & Risk Optimization</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
              AI ENGINE READY
            </span>
          </div>

          {/* Origin Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evacuation Origin (Starting Point)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {startPoint ? `[${startPoint[0].toFixed(4)}, ${startPoint[1].toFixed(4)}]` : 'Not Set'}
              </span>
            </label>
            <select
              value={selectedPreset}
              onChange={handlePresetSelect}
              className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="">Select a known landmark / sector...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 italic">
              Tip: You can also click anywhere on the live map to set a custom coordinate.
            </p>
          </div>

          {/* Destination Shelter Selection */}
          <div className="space-y-2 pt-2 border-t border-ops-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destination Shelter Facility</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSelectShelter}
                  onChange={(e) => setAutoSelectShelter(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Auto-Select Safest</span>
              </label>
            </div>

            {autoSelectShelter ? (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Destination Recommendation:</span>
                </div>
                <p className="text-slate-300">
                  {routesData?.destination_shelter ? (
                    <>
                      Target: <span className="text-white font-semibold">{routesData.destination_shelter.name}</span>
                      <br />
                      <span className="text-emerald-400 font-mono text-[11px]">
                        Evaluated for optimal distance, remaining capacity ({routesData.destination_shelter.occupancy}/{routesData.destination_shelter.capacity}), and zero hazard exposure.
                      </span>
                    </>
                  ) : (
                    'Calculates closest available shelter with verified spare beds and lowest route danger factor.'
                  )}
                </p>
              </div>
            ) : (
              <select
                value={selectedShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select specific evacuation shelter...</option>
                {shelters.map((s) => (
                  <option key={s.id} value={s.id} disabled={!s.available}>
                    {s.name} {!s.available ? '(FULL / CLOSED)' : `(${s.occupancy}/${s.capacity} beds)`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Calculate Button */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleCalculateRoutes}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>{loading ? 'Evaluating Corridors...' : 'Calculate Safe Evacuation Routes'}</span>
          </button>
        </div>

        {/* Route Comparison Cards */}
        {routesData && routesData.routes && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
              Comparative Route Analysis:
            </h4>

            {/* 1. Recommended Safe Route */}
            {routesData.routes.safe && (
              <div 
                onClick={() => setActiveRouteType('safe')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  activeRouteType === 'safe'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : 'bg-ops-card border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-sm text-emerald-400">Recommended Safe Route</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    RISK {routesData.routes.safe.risk_score} / 100 ({routesData.routes.safe.risk_level})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-ops-surface/60 rounded-lg border border-ops-border mb-2.5 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Distance</div>
                    <div className="font-bold text-white">{(routesData.routes.safe.distance_m / 1000).toFixed(2)} km</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Est. ETA</div>
                    <div className="font-bold text-white">{routesData.routes.safe.eta_minutes} min</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Breaches</div>
                    <div className="font-bold text-emerald-400">0 Active</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal">
                  {routesData.routes.safe.clearance_text}
                </p>
              </div>
            )}

            {/* 2. Direct Naive Route (Shortest) */}
            {routesData.routes.direct && (
              <div 
                onClick={() => setActiveRouteType('direct')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  activeRouteType === 'direct'
                    ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                    : 'bg-ops-card border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="font-bold text-sm text-amber-400">Direct Route (Standard GPS)</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    routesData.routes.direct.risk_score > 60 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    RISK {routesData.routes.direct.risk_score} / 100 ({routesData.routes.direct.risk_level})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-ops-surface/60 rounded-lg border border-ops-border mb-2.5 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Distance</div>
                    <div className="font-bold text-white">{(routesData.routes.direct.distance_m / 1000).toFixed(2)} km</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Est. ETA</div>
                    <div className="font-bold text-white">{routesData.routes.direct.eta_minutes} min</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Blocked Rds</div>
                    <div className={`font-bold ${routesData.routes.direct.blocked_points > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {routesData.routes.direct.blocked_points} Blockades
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/90 leading-normal">
                  {routesData.routes.direct.clearance_text}
                </p>
              </div>
            )}

            {/* 3. Secondary Perimeter Bypass */}
            {routesData.routes.alternative && (
              <div 
                onClick={() => setActiveRouteType('alternative')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  activeRouteType === 'alternative'
                    ? 'bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500'
                    : 'bg-ops-card border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <span className="font-bold text-sm text-blue-400">Outer Perimeter Bypass</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    RISK {routesData.routes.alternative.risk_score} / 100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-ops-surface/60 rounded-lg border border-ops-border mb-2.5 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Distance</div>
                    <div className="font-bold text-white">{(routesData.routes.alternative.distance_m / 1000).toFixed(2)} km</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Est. ETA</div>
                    <div className="font-bold text-white">{routesData.routes.alternative.eta_minutes} min</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Corridor</div>
                    <div className="font-bold text-blue-400">Ring Highway</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal">
                  Uses wide ring expressways suitable for municipal bus evacuation convoys and emergency ambulances.
                </p>
              </div>
            )}

            {/* Strategic Summary Banner */}
            {routesData.strategic_summary && (
              <div className="p-3.5 rounded-lg bg-ops-surface border border-ops-border text-xs text-slate-300 leading-relaxed font-sans">
                <span className="font-bold text-cyan-400 block mb-1">STRATEGIC COMMAND ASSESSMENT:</span>
                {routesData.strategic_summary}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Interactive Map & Turn-by-Turn Waypoint Guidance (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Map Header with Export Actions */}
        <div className="bg-ops-card border border-ops-border rounded-xl p-3 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase">
              Route Geometry:
            </span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase ${
              activeRouteType === 'safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              activeRouteType === 'direct' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {activeRouteType === 'safe' && 'Recommended Safe Route'}
              {activeRouteType === 'direct' && 'Direct Naive Route'}
              {activeRouteType === 'alternative' && 'Perimeter Bypass'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadGeoJSON}
              disabled={!routesData}
              title="Export Evacuation Manifest JSON"
              className="px-2.5 py-1.5 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 border border-ops-border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={handlePrintManifest}
              disabled={!routesData}
              title="Print Turn-by-Turn Manifest"
              className="px-2.5 py-1.5 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 border border-ops-border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print Manifest</span>
            </button>
          </div>
        </div>

        {/* Live Route Map */}
        <div className="h-[460px] w-full rounded-xl overflow-hidden border border-ops-border shadow-xl">
          <MapComponent
            stateData={stateData}
            startPoint={startPoint}
            selectedShelter={selectedShelter}
            routesData={routesData}
            activeRouteType={activeRouteType}
            onSelectShelter={(sh) => {
              setSelectedShelter(sh);
              setAutoSelectShelter(false);
              setSelectedShelterId(sh.id);
            }}
          />
        </div>

        {/* Turn-by-Turn Waypoint Guidance Drawer */}
        {activeRoute?.waypoints && activeRoute.waypoints.length > 0 && (
          <div className="bg-ops-card border border-ops-border rounded-xl p-4 shadow-lg space-y-3">
            <div 
              onClick={() => setShowWaypoints(!showWaypoints)}
              className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-ops-border"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                  Tactical Waypoint Guidance ({activeRoute.waypoints.length} Steps)
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{showWaypoints ? 'Collapse' : 'Expand'}</span>
                {showWaypoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showWaypoints && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeRoute.waypoints.map((step) => (
                  <div
                    key={step.step_index}
                    className="p-2.5 rounded-lg bg-ops-surface border border-ops-border/70 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                      {step.step_index}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-medium text-slate-200">
                        {step.instruction}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Distance: {step.distance_m}m</span>
                        <span>•</span>
                        <span>Heading: {step.direction}</span>
                        <span>•</span>
                        <span>Est: {step.eta_sec}s</span>
                      </div>
                      {step.warning && (
                        <div className="text-[11px] text-amber-400 font-semibold pt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{step.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
