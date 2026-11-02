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
  RotateCw, 
  Compass, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Activity
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
  const [autoSelectShelter, setAutoSelectShelter] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState('2'); // Default to Civic Center (shows flood contrast)
  const [selectedPreset, setSelectedPreset] = useState('Westside Valley Community');
  const [activeRouteType, setActiveRouteType] = useState('safe');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWaypoints, setShowWaypoints] = useState(true);

  const presets = stateData?.presets || [];
  const shelters = stateData?.shelters || [];

  // Default to Westside Valley -> Civic Center so the flood bypass is dramatically visible on load
  useEffect(() => {
    const westside = presets.find(p => p.name.includes('Westside Valley'));
    if (westside) {
      setStartPoint([westside.lat, westside.lng]);
      setSelectedPreset(westside.name);
    }
    const civic = shelters.find(s => s.name.includes('Civic Center'));
    if (civic) {
      setSelectedShelterId(civic.id.toString());
      setSelectedShelter(civic);
    }
  }, [presets, shelters]);

  const handlePresetSelect = (e) => {
    const val = e.target.value;
    setSelectedPreset(val);
    const found = presets.find(p => p.name === val);
    if (found) {
      setStartPoint([found.lat, found.lng]);
    }
  };

  const handleCalculateRoutes = async (customStart, customShelterId, customAuto) => {
    const sPt = customStart || startPoint;
    const sId = customShelterId !== undefined ? customShelterId : selectedShelterId;
    const isAuto = customAuto !== undefined ? customAuto : autoSelectShelter;

    if (!sPt) {
      setErrorMsg('Please select an origin coordinate.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        start_lat: sPt[0],
        start_lng: sPt[1],
        auto_select_shelter: isAuto,
        shelter_id: !isAuto && sId ? parseInt(sId) : null,
      };

      const result = await planRoute(payload);
      setRoutesData(result);
      if (result.destination_shelter) {
        setSelectedShelter(result.destination_shelter);
      }
      setActiveRouteType('safe');
    } catch (err) {
      setErrorMsg(err.message || 'Routing computation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Run on initial load
  useEffect(() => {
    const westside = presets.find(p => p.name.includes('Westside Valley'));
    const civic = shelters.find(s => s.name.includes('Civic Center'));
    if (westside && civic && !routesData) {
      handleCalculateRoutes([westside.lat, westside.lng], civic.id.toString(), false);
    }
  }, [presets, shelters]);

  // Demo Scenarios Quick Pickers
  const loadScenario = (type) => {
    if (type === 'flood_detour') {
      const westside = presets.find(p => p.name.includes('Westside Valley')) || presets[3];
      const civic = shelters.find(s => s.name.includes('Civic Center')) || shelters[1];
      if (westside && civic) {
        setStartPoint([westside.lat, westside.lng]);
        setSelectedPreset(westside.name);
        setAutoSelectShelter(false);
        setSelectedShelterId(civic.id.toString());
        setSelectedShelter(civic);
        handleCalculateRoutes([westside.lat, westside.lng], civic.id.toString(), false);
      }
    } else if (type === 'wildfire_evac') {
      const pine = presets.find(p => p.name.includes('Pine Ridge')) || presets[4];
      const stadium = shelters.find(s => s.name.includes('Stadium')) || shelters[0];
      if (pine && stadium) {
        setStartPoint([pine.lat, pine.lng]);
        setSelectedPreset(pine.name);
        setAutoSelectShelter(false);
        setSelectedShelterId(stadium.id.toString());
        setSelectedShelter(stadium);
        handleCalculateRoutes([pine.lat, pine.lng], stadium.id.toString(), false);
      }
    } else if (type === 'auto_safe') {
      const plaza = presets.find(p => p.name.includes('Sector 17')) || presets[0];
      if (plaza) {
        setStartPoint([plaza.lat, plaza.lng]);
        setSelectedPreset(plaza.name);
        setAutoSelectShelter(true);
        handleCalculateRoutes([plaza.lat, plaza.lng], null, true);
      }
    }
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Column: Parameters & Comparative Analysis (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Quick Demo Scenario Switcher Banner */}
        <div className="bg-ops-surface border border-cyan-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>TEST DEMO SCENARIOS (CLICK TO SIMULATE):</span>
            </span>
            <span className="text-[10px] font-mono text-ops-faint">ONE-CLICK</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => loadScenario('flood_detour')}
              className="p-1.5 rounded bg-ops-bg hover:bg-ops-elevated text-cyan-300 border border-ops-border hover:border-cyan-500/50 text-left transition cursor-pointer"
            >
              <span className="font-bold block text-white">⚡ Flood Detour</span>
              <span className="text-[9px] text-ops-faint">Direct hits flood (89)</span>
            </button>
            <button
              type="button"
              onClick={() => loadScenario('wildfire_evac')}
              className="p-1.5 rounded bg-ops-bg hover:bg-ops-elevated text-amber-300 border border-ops-border hover:border-amber-500/50 text-left transition cursor-pointer"
            >
              <span className="font-bold block text-white">⚡ Wildfire Evac</span>
              <span className="text-[9px] text-ops-faint">Direct breaches fire</span>
            </button>
            <button
              type="button"
              onClick={() => loadScenario('auto_safe')}
              className="p-1.5 rounded bg-ops-bg hover:bg-ops-elevated text-emerald-300 border border-ops-border hover:border-emerald-500/50 text-left transition cursor-pointer"
            >
              <span className="font-bold block text-white">⚡ Auto Safe</span>
              <span className="text-[9px] text-ops-faint">AI picks safest shelter</span>
            </button>
          </div>
        </div>

        {/* Route Planning Parameters Card */}
        <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-ops-border pb-2.5">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-sans">Evacuation Corridor Parameters</h3>
            </div>
            <span className="text-[10px] font-mono text-ops-faint">GRAPH ENGINE v2.0</span>
          </div>

          {/* Origin Selection */}
          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ops-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evacuation Origin</span>
              </span>
              <span className="text-[10px] font-mono text-ops-muted">
                {startPoint ? `[${startPoint[0].toFixed(4)}, ${startPoint[1].toFixed(4)}]` : 'Not Set'}
              </span>
            </div>
            <select
              value={selectedPreset}
              onChange={handlePresetSelect}
              className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="">Select designated assembly area / sector...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Facility Selection */}
          <div className="space-y-2 pt-2 border-t border-ops-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ops-text flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destination Facility</span>
              </span>
              <label className="flex items-center gap-1.5 text-xs text-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSelectShelter}
                  onChange={(e) => setAutoSelectShelter(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-mono">Auto-Recommend</span>
              </label>
            </div>

            {autoSelectShelter ? (
              <div className="p-2.5 rounded bg-ops-bg border border-ops-border text-xs space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  AUTONOMOUS FACILITY ASSIGNMENT:
                </div>
                <div className="text-white font-medium text-xs">
                  {routesData?.destination_shelter ? routesData.destination_shelter.name : 'Calculating optimal facility...'}
                </div>
                <div className="text-[11px] text-ops-muted font-mono">
                  Optimized for remaining bed capacity, hazard-free road access, and shortest verified transit time.
                </div>
              </div>
            ) : (
              <select
                value={selectedShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select specific shelter...</option>
                {shelters.map((s) => (
                  <option key={s.id} value={s.id} disabled={!s.available}>
                    {s.name} {!s.available ? '(FULL / CLOSED)' : `(${s.occupancy}/${s.capacity} beds)`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {errorMsg && (
            <div className="p-2 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <button
            onClick={() => handleCalculateRoutes()}
            disabled={loading}
            className="w-full py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>{loading ? 'COMPUTING CORRIDORS...' : 'COMPUTE EVACUATION CORRIDORS'}</span>
          </button>
        </div>

        {/* Route Comparative Cards */}
        {routesData && routesData.routes && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono uppercase text-ops-muted tracking-wider flex items-center justify-between">
              <span>Corridor Risk Comparison:</span>
              <span className="text-cyan-400">CLICK CARD TO HIGHLIGHT</span>
            </div>

            {/* Recommended Safe Route */}
            {routesData.routes.safe && (
              <div 
                onClick={() => setActiveRouteType('safe')}
                className={`p-3.5 rounded-lg border transition cursor-pointer space-y-2 ${
                  activeRouteType === 'safe'
                    ? 'bg-ops-surface border-emerald-500 ring-1 ring-emerald-500/40'
                    : 'bg-ops-surface/60 border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-xs text-white">Recommended Safe Corridor</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/60">
                    RISK SCORE: {routesData.routes.safe.risk_score} / 100 ({routesData.routes.safe.risk_level})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 px-2 bg-ops-bg rounded border border-ops-border text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Distance</span>
                    <strong className="text-white">{(routesData.routes.safe.distance_m / 1000).toFixed(2)} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Transit Time</span>
                    <strong className="text-white">{routesData.routes.safe.eta_minutes} min</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Breaches</span>
                    <strong className="text-emerald-400">0 Active</strong>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-300/90 leading-relaxed font-sans">
                  {routesData.routes.safe.clearance_text}
                </p>
              </div>
            )}

            {/* Direct Naive Route */}
            {routesData.routes.direct && (
              <div 
                onClick={() => setActiveRouteType('direct')}
                className={`p-3.5 rounded-lg border transition cursor-pointer space-y-2 ${
                  activeRouteType === 'direct'
                    ? 'bg-ops-surface border-amber-500 ring-1 ring-amber-500/40'
                    : 'bg-ops-surface/60 border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-bold text-xs text-amber-300">Direct Route (Standard GPS)</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    routesData.routes.direct.risk_score > 60
                      ? 'bg-red-950/80 text-red-400 border-red-800'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  }`}>
                    RISK SCORE: {routesData.routes.direct.risk_score} / 100 ({routesData.routes.direct.risk_level})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 px-2 bg-ops-bg rounded border border-ops-border text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Distance</span>
                    <strong className="text-white">{(routesData.routes.direct.distance_m / 1000).toFixed(2)} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Transit Time</span>
                    <strong className="text-white">{routesData.routes.direct.eta_minutes} min</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Danger Zones</span>
                    <strong className={routesData.routes.direct.hazard_breaches?.length > 0 ? 'text-red-400' : 'text-ops-muted'}>
                      {routesData.routes.direct.hazard_breaches?.length || 0} Breached
                    </strong>
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed font-sans ${
                  routesData.routes.direct.risk_score > 60 ? 'text-red-300' : 'text-ops-muted'
                }`}>
                  {routesData.routes.direct.clearance_text}
                </p>
              </div>
            )}

            {/* Outer Perimeter Bypass */}
            {routesData.routes.alternative && (
              <div 
                onClick={() => setActiveRouteType('alternative')}
                className={`p-3.5 rounded-lg border transition cursor-pointer space-y-2 ${
                  activeRouteType === 'alternative'
                    ? 'bg-ops-surface border-blue-500 ring-1 ring-blue-500/40'
                    : 'bg-ops-surface/60 border-ops-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="font-bold text-xs text-blue-300">Outer Ring Highway Bypass</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 font-bold border border-blue-800/60">
                    RISK SCORE: {routesData.routes.alternative.risk_score} / 100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 px-2 bg-ops-bg rounded border border-ops-border text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Distance</span>
                    <strong className="text-white">{(routesData.routes.alternative.distance_m / 1000).toFixed(2)} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Transit Time</span>
                    <strong className="text-white">{routesData.routes.alternative.eta_minutes} min</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ops-faint uppercase block">Corridor</span>
                    <strong className="text-blue-400">Outer Ring</strong>
                  </div>
                </div>

                <p className="text-[11px] text-ops-muted leading-relaxed font-sans">
                  High-capacity perimeter ring designed for municipal bus convoys and emergency responder staging.
                </p>
              </div>
            )}

            {/* Strategic Assessment Log */}
            {routesData.strategic_summary && (
              <div className="p-3 rounded bg-ops-surface border border-ops-border text-xs text-ops-muted space-y-1 font-sans">
                <span className="font-bold font-mono text-[10px] text-cyan-400 block uppercase">
                  OPERATIONAL DECISION SUMMARY:
                </span>
                <p className="leading-relaxed text-[11px] text-ops-text">
                  {routesData.strategic_summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Tactical Map & Waypoint Navigation (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Map Header with Export Tools */}
        <div className="bg-ops-surface border border-ops-border rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ops-muted uppercase">ACTIVE DISPLAY:</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
              activeRouteType === 'safe' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' :
              activeRouteType === 'direct' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
              'bg-blue-950/60 text-blue-400 border border-blue-800/60'
            }`}>
              {activeRouteType === 'safe' && 'RECOMMENDED SAFE CORRIDOR'}
              {activeRouteType === 'direct' && 'DIRECT NAIVE ROUTE'}
              {activeRouteType === 'alternative' && 'PERIMETER BYPASS'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadGeoJSON}
              disabled={!routesData}
              title="Download GeoJSON Route Geometry"
              className="px-2.5 py-1 rounded bg-ops-card hover:bg-ops-elevated text-ops-text border border-ops-border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>GEOJSON</span>
            </button>
            <button
              onClick={handlePrintManifest}
              disabled={!routesData}
              title="Print Operational Manifest"
              className="px-2.5 py-1 rounded bg-ops-card hover:bg-ops-elevated text-ops-text border border-ops-border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
            >
              <Printer className="w-3 h-3 text-emerald-400" />
              <span>MANIFEST</span>
            </button>
          </div>
        </div>

        {/* Live Route Map */}
        <div className="h-[460px] w-full rounded-lg overflow-hidden border border-ops-border">
          <MapComponent
            stateData={stateData}
            startPoint={startPoint}
            selectedShelter={selectedShelter}
            routesData={routesData}
            activeRouteType={activeRouteType}
            onSelectShelter={(sh) => {
              setSelectedShelter(sh);
              setAutoSelectShelter(false);
              setSelectedShelterId(sh.id.toString());
              handleCalculateRoutes(startPoint, sh.id.toString(), false);
            }}
          />
        </div>

        {/* Tactical Navigation Waypoint Log */}
        {activeRoute?.waypoints && activeRoute.waypoints.length > 0 && (
          <div className="bg-ops-surface border border-ops-border rounded-lg p-3.5 space-y-2.5">
            <div 
              onClick={() => setShowWaypoints(!showWaypoints)}
              className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-ops-border"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <h4 className="font-bold text-xs text-white font-mono uppercase tracking-wider">
                  Waypoint Guidance Log ({activeRoute.waypoints.length} Vectors)
                </h4>
              </div>
              <div className="text-[11px] font-mono text-ops-muted flex items-center gap-1">
                <span>{showWaypoints ? 'COLLAPSE' : 'EXPAND'}</span>
                {showWaypoints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>

            {showWaypoints && (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 font-mono text-xs">
                {activeRoute.waypoints.map((step) => (
                  <div
                    key={step.step_index}
                    className="p-2 rounded bg-ops-bg border border-ops-border flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {step.step_index}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="text-white text-xs font-sans font-medium">
                        {step.instruction}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-ops-muted">
                        <span>DISTANCE: {step.distance_m}m</span>
                        <span>•</span>
                        <span>VECTOR: {step.direction}</span>
                        <span>•</span>
                        <span>ETA: {step.eta_sec}s</span>
                      </div>
                      {step.warning && (
                        <div className="text-[10px] text-amber-400 font-semibold pt-0.5 flex items-center gap-1">
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
