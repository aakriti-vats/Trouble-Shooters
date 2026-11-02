import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  Polyline, 
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Flame, 
  Droplet, 
  AlertOctagon, 
  Home, 
  Navigation, 
  Compass, 
  Layers,
  MapPin,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

// Create custom SVG HTML DivIcons for crisp, high-tech rendering
const createCustomIcon = (type, color, innerSvg) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${color}88, 0 4px 6px rgba(0,0,0,0.4);
        cursor: pointer;
        color: #ffffff;
      ">
        ${innerSvg}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

const fireIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const floodIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
const chemicalIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const shelterIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const originIconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`;
const presetIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;

const FireIcon = createCustomIcon('fire', '#ef4444', fireIconSvg);
const FloodIcon = createCustomIcon('flood', '#0284c7', floodIconSvg);
const ChemicalIcon = createCustomIcon('chemical', '#8b5cf6', chemicalIconSvg);
const DefaultHazardIcon = createCustomIcon('hazard', '#f97316', fireIconSvg);

const ShelterOpenIcon = createCustomIcon('shelter', '#10b981', shelterIconSvg);
const ShelterNearFullIcon = createCustomIcon('shelter', '#f59e0b', shelterIconSvg);
const ShelterFullIcon = createCustomIcon('shelter', '#64748b', shelterIconSvg);

const OriginIcon = createCustomIcon('origin', '#06b6d4', originIconSvg);
const PresetIcon = createCustomIcon('preset', '#6366f1', presetIconSvg);

// Component to handle map clicks based on active interactive mode
function MapClickHandler({ mapMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, mapMode);
      }
    },
  });
  return null;
}

// Map center adjuster
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({
  stateData,
  mapMode = 'start', // 'start' | 'road' | 'hazard' | 'inspect'
  onMapClick,
  startPoint,
  selectedShelter,
  routesData,
  activeRouteType = 'safe',
  onSelectShelter,
  onRemoveHazard,
  onToggleRoad,
  onSetStartPoint
}) {
  const [layers, setLayers] = useState({
    wildfire: true,
    flood: true,
    chemical: true,
    blockedRoads: true,
    shelters: true,
    presets: true,
    routes: true,
  });

  const center = stateData?.center || [30.7333, 76.7794];
  const incidents = stateData?.incidents || [];
  const shelters = stateData?.shelters || [];
  const blockedRoads = stateData?.blocked_roads || [];
  const presets = stateData?.presets || [];

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getHazardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'wildfire':
      case 'fire':
        return FireIcon;
      case 'flood':
        return FloodIcon;
      case 'chemical':
      case 'hazmat':
        return ChemicalIcon;
      default:
        return DefaultHazardIcon;
    }
  };

  const getHazardColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'wildfire':
      case 'fire':
        return '#ef4444';
      case 'flood':
        return '#0284c7';
      case 'chemical':
      case 'hazmat':
        return '#8b5cf6';
      default:
        return '#f97316';
    }
  };

  const getShelterIcon = (shelter) => {
    if (!shelter.available || shelter.status === 'full' || shelter.status === 'closed') {
      return ShelterFullIcon;
    }
    if (shelter.status === 'near_capacity' || shelter.occupancy / shelter.capacity >= 0.85) {
      return ShelterNearFullIcon;
    }
    return ShelterOpenIcon;
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-ops-border shadow-2xl bg-slate-950">
      {/* Interactive Map Mode Indicator Banner */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-ops-surface/90 backdrop-blur-md border border-ops-border text-slate-200 px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>MODE:</span>
          <span className="font-bold text-cyan-300 uppercase">
            {mapMode === 'start' && 'Click map to place Evacuation Origin'}
            {mapMode === 'road' && 'Click road to toggle Tactical Closure'}
            {mapMode === 'hazard' && 'Click map to deploy Emergency Hazard'}
            {mapMode === 'inspect' && 'Inspection & Information Mode'}
          </span>
        </div>
      </div>

      {/* Layer Control Panel */}
      <div className="absolute top-3 right-3 z-[1000] bg-ops-surface/95 backdrop-blur-md border border-ops-border rounded-xl p-3 shadow-xl max-w-xs text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-ops-border">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Tactical View</span>
        </div>
        <div className="space-y-1.5 text-slate-300">
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Wildfire Zones
            </span>
            <input 
              type="checkbox" 
              checked={layers.wildfire} 
              onChange={() => toggleLayer('wildfire')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              Flood Inundations
            </span>
            <input 
              type="checkbox" 
              checked={layers.flood} 
              onChange={() => toggleLayer('flood')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              HAZMAT Leaks
            </span>
            <input 
              type="checkbox" 
              checked={layers.chemical} 
              onChange={() => toggleLayer('chemical')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-red-500 border border-white"></span>
              Blocked Corridors
            </span>
            <input 
              type="checkbox" 
              checked={layers.blockedRoads} 
              onChange={() => toggleLayer('blockedRoads')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Emergency Shelters
            </span>
            <input 
              type="checkbox" 
              checked={layers.shelters} 
              onChange={() => toggleLayer('shelters')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          {routesData && (
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400"></span>
                Calculated Routes
              </span>
              <input 
                type="checkbox" 
                checked={layers.routes} 
                onChange={() => toggleLayer('routes')}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
          )}
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-ops-surface/90 backdrop-blur-md border border-ops-border rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 shadow-lg flex items-center gap-4 flex-wrap">
        <span className="text-slate-400 font-bold uppercase">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Safe Route</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Direct Naive</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Perimeter Ring</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-red-500"></span>
          <span>Blocked Road</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full"
        zoomControl={true}
      >
        <ChangeView center={center} zoom={14} />
        <MapClickHandler mapMode={mapMode} onMapClick={onMapClick} />

        {/* Tactical Dark OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Hazard Incident Circles & Markers */}
        {incidents.map((hazard) => {
          const isWildfire = hazard.type === 'wildfire' || hazard.type === 'fire';
          const isFlood = hazard.type === 'flood';
          const isChemical = hazard.type === 'chemical' || hazard.type === 'hazmat';

          if (isWildfire && !layers.wildfire) return null;
          if (isFlood && !layers.flood) return null;
          if (isChemical && !layers.chemical) return null;

          const color = getHazardColor(hazard.type);

          return (
            <React.Fragment key={`hazard-${hazard.id}`}>
              {/* Pulsing Buffer Radius */}
              <Circle
                center={[hazard.lat, hazard.lng]}
                radius={hazard.radius_m * 1.5}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '4 6',
                }}
              />
              {/* Core Danger Zone */}
              <Circle
                center={[hazard.lat, hazard.lng]}
                radius={hazard.radius_m}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.28,
                  weight: 2,
                }}
              />
              <Marker
                position={[hazard.lat, hazard.lng]}
                icon={getHazardIcon(hazard.type)}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {hazard.type} · SEV {hazard.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {hazard.radius_m}m radius
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{hazard.title}</h4>
                    <p className="text-xs text-slate-300">{hazard.description || 'Active hazard zone. Evacuation advised.'}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700 flex justify-between items-center">
                      <span>Affected Pop: ~{hazard.affected_population?.toLocaleString() || 0}</span>
                      {onRemoveHazard && (
                        <button
                          onClick={() => onRemoveHazard(hazard.id)}
                          className="text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Blocked Road Polylines */}
        {layers.blockedRoads && blockedRoads.map((b) => (
          <React.Fragment key={`road-${b.id}`}>
            <Polyline
              positions={[[b.lat1, b.lng1], [b.lat2, b.lng2]]}
              pathOptions={{
                color: '#ef4444',
                weight: 8,
                dashArray: '8 8',
                opacity: 0.9,
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>CORRIDOR BLOCKED</span>
                  </div>
                  <h4 className="font-semibold text-sm text-white">{b.road_name}</h4>
                  <p className="text-xs text-slate-300">{b.reason}</p>
                  {onToggleRoad && (
                    <button
                      onClick={() => onToggleRoad(b.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 underline pt-1 cursor-pointer block"
                    >
                      Re-open Road Corridor
                    </button>
                  )}
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        ))}

        {/* Shelters */}
        {layers.shelters && shelters.map((s) => (
          <Marker
            key={`shelter-${s.id}`}
            position={[s.lat, s.lng]}
            icon={getShelterIcon(s)}
          >
            <Popup>
              <div className="p-1 space-y-2 font-sans min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    !s.available ? 'bg-slate-700 text-slate-300' :
                    s.status === 'near_capacity' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {s.available ? s.status.replace('_', ' ') : 'UNAVAILABLE'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {s.occupancy}/{s.capacity} ({s.occupancy_rate}%)
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{s.name}</h4>
                  <p className="text-xs text-slate-400">{s.address || s.shelter_type}</p>
                </div>
                {/* Supplies badges */}
                {s.supplies && s.supplies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {s.supplies.slice(0, 3).map((sup, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {sup}
                      </span>
                    ))}
                  </div>
                )}
                {/* Action button */}
                <div className="pt-2 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={() => onSelectShelter && onSelectShelter(s)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 transition"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Plan Route Here</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Preset Landmarks */}
        {layers.presets && presets.map((p) => (
          <Marker
            key={`preset-${p.id}`}
            position={[p.lat, p.lng]}
            icon={PresetIcon}
          >
            <Popup>
              <div className="p-1 font-sans">
                <span className="text-[10px] text-cyan-400 font-mono uppercase">{p.category} Landmark</span>
                <h4 className="font-bold text-sm text-white">{p.name}</h4>
                <p className="text-xs text-slate-300">{p.description}</p>
                {onSetStartPoint && (
                  <button
                    onClick={() => onSetStartPoint([p.lat, p.lng], p.name)}
                    className="mt-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white py-1 px-2 rounded block w-full text-center"
                  >
                    Set as Evacuation Origin
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker
            position={[startPoint[0], startPoint[1]]}
            icon={OriginIcon}
          >
            <Popup>
              <div className="p-1 font-sans">
                <span className="text-xs font-bold text-cyan-400 uppercase">Evacuation Origin</span>
                <p className="text-xs text-slate-300">Selected start coordinate for route calculation.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Evacuation Routes Polyline Overlays */}
        {layers.routes && routesData && routesData.routes && (
          <>
            {/* Direct Naive Route (Orange/Amber) */}
            {routesData.routes.direct && (
              <Polyline
                positions={routesData.routes.direct.coordinates}
                pathOptions={{
                  color: '#f59e0b',
                  weight: activeRouteType === 'direct' ? 7 : 4,
                  opacity: activeRouteType === 'direct' ? 1.0 : 0.45,
                  dashArray: '6 8',
                }}
              />
            )}

            {/* Alternative Bypass Route (Blue) */}
            {routesData.routes.alternative && (
              <Polyline
                positions={routesData.routes.alternative.coordinates}
                pathOptions={{
                  color: '#3b82f6',
                  weight: activeRouteType === 'alternative' ? 7 : 4,
                  opacity: activeRouteType === 'alternative' ? 1.0 : 0.45,
                }}
              />
            )}

            {/* Recommended Safe Route (Emerald Green) */}
            {routesData.routes.safe && (
              <Polyline
                positions={routesData.routes.safe.coordinates}
                pathOptions={{
                  color: '#10b981',
                  weight: activeRouteType === 'safe' ? 8 : 5,
                  opacity: activeRouteType === 'safe' ? 1.0 : 0.6,
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
