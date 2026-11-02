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
  Layers,
  MapPin,
  AlertOctagon,
  Navigation,
  Globe,
  Satellite,
  Compass,
  CheckCircle2
} from 'lucide-react';

// Pre-configured public tile servers (All 100% free, zero API key required)
const BASEMAP_PRESETS = {
  carto_dark: {
    id: 'carto_dark',
    label: 'Tactical Dark (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  osm_standard: {
    id: 'osm_standard',
    label: 'OpenStreetMap (Public)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite_esri: {
    id: 'satellite_esri',
    label: 'Satellite Imagery (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  }
};

// Precision military/CAD styled tactical map markers
const createTacticalPin = (label, bgHex, borderHex = '#ffffff') => {
  return L.divIcon({
    className: 'tactical-div-icon',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: #0f1623;
        border: 1px solid ${borderHex};
        border-radius: 4px;
        padding: 2px 6px;
        color: #ffffff;
        font-family: SF Mono, Menlo, monospace;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        white-space: nowrap;
        transform: translate(-50%, -50%);
        pointer-events: auto;
      ">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${bgHex};"></span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -12],
  });
};

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

// Invalidate size on mount to eliminate Leaflet grey tile bugs
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
      map.invalidateSize();
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({
  stateData,
  mapMode = 'start',
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
  const [activeBasemapKey, setActiveBasemapKey] = useState('carto_dark');
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

  const currentBasemap = BASEMAP_PRESETS[activeBasemapKey] || BASEMAP_PRESETS.osm_standard;

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-ops-border bg-[#080c14]">
      {/* Top Left: Operational Mode Badge */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-ops-surface/95 backdrop-blur-md border border-ops-border text-ops-text px-3 py-1.5 rounded shadow-lg text-[11px] font-mono flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-ops-muted">INPUT MODE:</span>
          <span className="font-bold text-cyan-300">
            {mapMode === 'start' && 'SET EVACUATION ORIGIN'}
            {mapMode === 'road' && 'TOGGLE CORRIDOR BLOCKADE'}
            {mapMode === 'hazard' && 'DEPLOY INCIDENT PERIMETER'}
            {mapMode === 'inspect' && 'INSPECTION & QUERY'}
          </span>
        </div>
      </div>

      {/* Top Right: Layer Visibility & Basemap Switcher (Zero API Key) */}
      <div className="absolute top-3 right-3 z-[1000] bg-ops-surface/95 backdrop-blur-md border border-ops-border rounded p-3 shadow-xl max-w-xs text-xs font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-ops-border">
          <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS MAP SETTINGS</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-1 rounded">
            NO API KEY REQUIRED
          </span>
        </div>

        {/* Basemap Switcher */}
        <div className="mb-3 space-y-1">
          <span className="text-[10px] text-ops-faint uppercase block font-semibold">Basemap Provider:</span>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveBasemapKey('carto_dark')}
              className={`px-1.5 py-1 rounded text-center transition cursor-pointer ${
                activeBasemapKey === 'carto_dark' 
                  ? 'bg-cyan-700 text-white font-bold' 
                  : 'bg-ops-bg text-ops-muted hover:text-white border border-ops-border'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setActiveBasemapKey('osm_standard')}
              className={`px-1.5 py-1 rounded text-center transition cursor-pointer ${
                activeBasemapKey === 'osm_standard' 
                  ? 'bg-cyan-700 text-white font-bold' 
                  : 'bg-ops-bg text-ops-muted hover:text-white border border-ops-border'
              }`}
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => setActiveBasemapKey('satellite_esri')}
              className={`px-1.5 py-1 rounded text-center transition cursor-pointer ${
                activeBasemapKey === 'satellite_esri' 
                  ? 'bg-cyan-700 text-white font-bold' 
                  : 'bg-ops-bg text-ops-muted hover:text-white border border-ops-border'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Layer Checkboxes */}
        <div className="space-y-1.5 text-ops-muted text-[11px] border-t border-ops-border/70 pt-2">
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Wildfire Zones
            </span>
            <input 
              type="checkbox" 
              checked={layers.wildfire} 
              onChange={() => toggleLayer('wildfire')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Flood Inundations
            </span>
            <input 
              type="checkbox" 
              checked={layers.flood} 
              onChange={() => toggleLayer('flood')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Chemical HAZMAT
            </span>
            <input 
              type="checkbox" 
              checked={layers.chemical} 
              onChange={() => toggleLayer('chemical')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500"></span>
              Road Closures
            </span>
            <input 
              type="checkbox" 
              checked={layers.blockedRoads} 
              onChange={() => toggleLayer('blockedRoads')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Shelters
            </span>
            <input 
              type="checkbox" 
              checked={layers.shelters} 
              onChange={() => toggleLayer('shelters')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Bottom Bar: Operational Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-ops-surface/90 backdrop-blur-md border border-ops-border rounded px-3 py-1.5 text-[11px] font-mono text-ops-muted shadow-lg flex items-center gap-4 flex-wrap">
        <span className="text-ops-text font-bold">CORRIDORS:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-emerald-500 rounded-sm"></span>
          <span className="text-emerald-400 font-semibold">Recommended Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-amber-500 rounded-sm"></span>
          <span className="text-amber-400">Direct Naive (Risk)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-blue-500 rounded-sm"></span>
          <span className="text-blue-400">Outer Bypass</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full"
        zoomControl={true}
      >
        <ChangeView center={center} zoom={14} />
        <MapResizer />
        <MapClickHandler mapMode={mapMode} onMapClick={onMapClick} />

        {/* Dynamic Free Open Tile Layer (Zero API Key Needed) */}
        <TileLayer
          key={currentBasemap.id}
          attribution={currentBasemap.attribution}
          url={currentBasemap.url}
          subdomains={currentBasemap.subdomains}
          maxZoom={currentBasemap.maxZoom}
        />

        {/* Hazard Incident Danger Zones */}
        {incidents.map((hazard) => {
          const isWildfire = hazard.type === 'wildfire' || hazard.type === 'fire';
          const isFlood = hazard.type === 'flood';
          const isChemical = hazard.type === 'chemical' || hazard.type === 'hazmat';

          if (isWildfire && !layers.wildfire) return null;
          if (isFlood && !layers.flood) return null;
          if (isChemical && !layers.chemical) return null;

          const color = isWildfire ? '#ef4444' : isFlood ? '#0284c7' : '#8b5cf6';
          const labelPrefix = isWildfire ? 'FIRE' : isFlood ? 'FLOOD' : 'HAZMAT';

          return (
            <React.Fragment key={`hazard-${hazard.id}`}>
              {/* Caution Buffer Zone */}
              <Circle
                center={[hazard.lat, hazard.lng]}
                radius={hazard.radius_m * 1.5}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '3 6',
                }}
              />
              {/* Core Incident Danger Perimeter */}
              <Circle
                center={[hazard.lat, hazard.lng]}
                radius={hazard.radius_m}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.22,
                  weight: 2,
                }}
              />
              <Marker
                position={[hazard.lat, hazard.lng]}
                icon={createTacticalPin(`${labelPrefix} · ${hazard.radius_m}m`, color, color)}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 font-sans min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-ops-border pb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-red-400">
                        {hazard.type} · SEV {hazard.severity}/5.0
                      </span>
                      <span className="text-[10px] text-ops-faint font-mono">
                        RADIUS: {hazard.radius_m}m
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white">{hazard.title}</h4>
                    <p className="text-[11px] text-ops-muted leading-relaxed">{hazard.description}</p>
                    <div className="text-[10px] text-ops-faint pt-1 flex justify-between items-center font-mono">
                      <span>AFFECTED: ~{hazard.affected_population?.toLocaleString()}</span>
                      {onRemoveHazard && (
                        <button
                          onClick={() => onRemoveHazard(hazard.id)}
                          className="text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
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

        {/* Blocked Road Closures */}
        {layers.blockedRoads && blockedRoads.map((b) => (
          <React.Fragment key={`road-${b.id}`}>
            <Polyline
              positions={[[b.lat1, b.lng1], [b.lat2, b.lng2]]}
              pathOptions={{
                color: '#ef4444',
                weight: 6,
                dashArray: '6 6',
                opacity: 0.95,
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans">
                  <div className="flex items-center gap-1 text-red-400 font-mono font-bold text-[10px] uppercase">
                    <AlertOctagon className="w-3 h-3" />
                    <span>CORRIDOR CLOSURE ACTIVE</span>
                  </div>
                  <h4 className="font-semibold text-xs text-white">{b.road_name}</h4>
                  <p className="text-[11px] text-ops-muted">{b.reason}</p>
                  {onToggleRoad && (
                    <button
                      onClick={() => onToggleRoad(b.id)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline pt-1 cursor-pointer block"
                    >
                      Reopen Corridor
                    </button>
                  )}
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        ))}

        {/* Shelter Facilities */}
        {layers.shelters && shelters.map((s) => {
          const isFull = !s.available || s.status === 'full';
          const isNear = s.status === 'near_capacity' || s.occupancy / s.capacity >= 0.85;
          const pinColor = isFull ? '#64748b' : isNear ? '#f59e0b' : '#10b981';

          return (
            <Marker
              key={`shelter-${s.id}`}
              position={[s.lat, s.lng]}
              icon={createTacticalPin(
                `${s.name.split(' ')[0]} [${s.occupancy}/${s.capacity}]`, 
                pinColor, 
                pinColor
              )}
            >
              <Popup>
                <div className="p-1 space-y-2 font-sans min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-ops-border pb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                      SHELTER FACILITY
                    </span>
                    <span className="text-[11px] font-mono font-bold text-white">
                      {s.occupancy_rate}% OCCUPIED
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{s.name}</h4>
                    <p className="text-[11px] text-ops-muted">{s.address || s.shelter_type}</p>
                  </div>
                  <button
                    onClick={() => onSelectShelter && onSelectShelter(s)}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] py-1 px-2 rounded flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>CALCULATE ROUTE HERE</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Preset Landmarks */}
        {layers.presets && presets.map((p) => (
          <Marker
            key={`preset-${p.id}`}
            position={[p.lat, p.lng]}
            icon={createTacticalPin(p.name.split(' ')[0], '#6366f1', '#4f46e5')}
          >
            <Popup>
              <div className="p-1 font-sans">
                <span className="text-[10px] text-cyan-400 font-mono uppercase">{p.category} SECTOR</span>
                <h4 className="font-bold text-xs text-white">{p.name}</h4>
                <p className="text-[11px] text-ops-muted">{p.description}</p>
                {onSetStartPoint && (
                  <button
                    onClick={() => onSetStartPoint([p.lat, p.lng], p.name)}
                    className="mt-2 text-[11px] bg-cyan-700 hover:bg-cyan-600 text-white py-1 px-2 rounded block w-full text-center font-mono cursor-pointer"
                  >
                    SET AS EVACUATION ORIGIN
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Origin Marker */}
        {startPoint && (
          <Marker
            position={[startPoint[0], startPoint[1]]}
            icon={createTacticalPin('EVACUATION ORIGIN', '#06b6d4', '#06b6d4')}
          />
        )}

        {/* Calculated Routes Polylines */}
        {layers.routes && routesData && routesData.routes && (
          <>
            {/* Direct Naive Route (Amber) */}
            {routesData.routes.direct && (
              <Polyline
                positions={routesData.routes.direct.coordinates}
                pathOptions={{
                  color: '#f59e0b',
                  weight: activeRouteType === 'direct' ? 6 : 3,
                  opacity: activeRouteType === 'direct' ? 1.0 : 0.35,
                  dashArray: '5 7',
                }}
              />
            )}

            {/* Alternative Perimeter Route (Blue) */}
            {routesData.routes.alternative && (
              <Polyline
                positions={routesData.routes.alternative.coordinates}
                pathOptions={{
                  color: '#3b82f6',
                  weight: activeRouteType === 'alternative' ? 6 : 3,
                  opacity: activeRouteType === 'alternative' ? 1.0 : 0.35,
                }}
              />
            )}

            {/* Recommended Safe Route (Emerald Green) */}
            {routesData.routes.safe && (
              <Polyline
                positions={routesData.routes.safe.coordinates}
                pathOptions={{
                  color: '#10b981',
                  weight: activeRouteType === 'safe' ? 7 : 4,
                  opacity: activeRouteType === 'safe' ? 1.0 : 0.5,
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
