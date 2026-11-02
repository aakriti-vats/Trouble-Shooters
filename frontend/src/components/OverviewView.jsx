import React from 'react';
import { 
  Flame, 
  Droplet, 
  AlertTriangle, 
  ShieldCheck, 
  Home, 
  Users, 
  Radio, 
  Navigation, 
  TrendingUp, 
  ArrowRight,
  Clock,
  AlertOctagon,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function OverviewView({ 
  overviewData, 
  stateData, 
  onNavigateTab, 
  onSelectShelterForRouting 
}) {
  const metrics = overviewData?.metrics || {
    total_active_incidents: 0,
    blocked_roads: 0,
    available_shelters: 0,
    unavailable_shelters: 0,
    total_shelters: 0,
    total_capacity: 0,
    total_occupancy: 0,
    overall_occupancy_rate: 0,
    estimated_affected_population: 0,
    active_evacuation_notices: 0,
  };

  const incidents = overviewData?.recent_incidents || [];
  const shelters = overviewData?.shelters_overview || [];
  const notices = overviewData?.active_notices || [];

  return (
    <div className="space-y-6">
      {/* Top Threat & Mission Status Banner */}
      <div className="bg-gradient-to-r from-ops-card via-slate-900 to-ops-card border border-ops-border rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-red-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase">
                EMERGENCY OPERATIONS STATUS
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Incident Management & Intelligent Safe Evacuation Planner
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time threat monitoring and graph routing network active. Multi-hazard decay analysis dynamically isolates active wildfire, flood, and HAZMAT plumes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('planner')}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Route Planner</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-2.5 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-200 border border-ops-border font-medium text-sm transition cursor-pointer"
            >
              <span>View Live Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Key Statistics Grid (Directly from SQLite Database) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Incidents */}
        <div className="bg-ops-card border border-ops-border hover:border-red-500/40 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Active Incidents</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {metrics.total_active_incidents}
          </div>
          <div className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
            <span>Critical Wildfire & Flood</span>
          </div>
        </div>

        {/* Blocked Roads */}
        <div className="bg-ops-card border border-ops-border hover:border-amber-500/40 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Blocked Roads</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {metrics.blocked_roads}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
            <span>Bypassed in Safe Routes</span>
          </div>
        </div>

        {/* Available Shelters */}
        <div className="bg-ops-card border border-ops-border hover:border-emerald-500/40 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Available Shelters</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {metrics.available_shelters}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            of {metrics.total_shelters} designated facilities
          </div>
        </div>

        {/* Unavailable Shelters */}
        <div className="bg-ops-card border border-ops-border hover:border-slate-600 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Full / Closed</span>
            <Home className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-300">
            {metrics.unavailable_shelters}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Shelters at 100% capacity
          </div>
        </div>

        {/* Estimated Affected Population */}
        <div className="bg-ops-card border border-ops-border hover:border-cyan-500/40 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Affected Pop.</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            {metrics.estimated_affected_population?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            in active danger zones
          </div>
        </div>

        {/* Active Evacuation Notices */}
        <div className="bg-ops-card border border-ops-border hover:border-purple-500/40 rounded-xl p-4 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono">Active Orders</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-300">
            {metrics.active_evacuation_notices}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">
            EAS & Mobile Broadcast
          </div>
        </div>
      </div>

      {/* Main Two-Column Operational Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Shelters Status & Route Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shelter Capacity & Occupancy Matrix */}
          <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Shelter Network Capacity</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('shelters')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
              >
                <span>Manage Facilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overall Progress Gauge */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-ops-border mb-4">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
                <span>Total Regional Occupancy: {metrics.total_occupancy} / {metrics.total_capacity} Persons</span>
                <span className="font-bold text-emerald-400">{metrics.overall_occupancy_rate}% Filled</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.overall_occupancy_rate > 85 ? 'bg-red-500' :
                    metrics.overall_occupancy_rate > 60 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.overall_occupancy_rate)}%` }}
                ></div>
              </div>
            </div>

            {/* Shelter List with Action Buttons */}
            <div className="space-y-3">
              {shelters.map((shelter) => {
                const isFull = !shelter.available || shelter.status === 'full';
                const isNearCapacity = shelter.status === 'near_capacity' || shelter.occupancy_rate >= 85;

                return (
                  <div 
                    key={shelter.id} 
                    className="p-3.5 rounded-lg bg-ops-surface border border-ops-border hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{shelter.name}</span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                          isFull ? 'bg-slate-800 text-slate-400' :
                          isNearCapacity ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {shelter.available ? shelter.status.replace('_', ' ') : 'CLOSED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{shelter.address || shelter.shelter_type}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="text-sm font-bold text-slate-200">
                          {shelter.occupancy} <span className="text-slate-500 text-xs">/ {shelter.capacity}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {shelter.occupancy_rate}% capacity
                        </div>
                      </div>

                      {shelter.available && (
                        <button
                          onClick={() => onSelectShelterForRouting(shelter)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Route Here</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Recommendation Summary */}
          <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Intelligent Evacuation Guidance</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                ALGORITHM ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The EvacAI routing engine combines road network graph topology with dynamic hazard decay functions. 
              Corridors passing through flood zones or within 450m of active wildfire flanks are penalized or pruned, ensuring civilian convoys avoid known roadblocks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-ops-surface border border-emerald-500/20">
                <div className="text-emerald-400 font-mono text-xs font-bold mb-1">SAFE CORRIDOR</div>
                <div className="text-xs text-slate-300">Prioritizes minimum hazard proximity, verified open arterials, and high clearance buffers.</div>
              </div>
              <div className="p-3 rounded-lg bg-ops-surface border border-amber-500/20">
                <div className="text-amber-400 font-mono text-xs font-bold mb-1">DIRECT ROUTE CONTRAST</div>
                <div className="text-xs text-slate-300">Demonstrates the naive path taken by standard GPS systems, highlighting active risk breaches.</div>
              </div>
              <div className="p-3 rounded-lg bg-ops-surface border border-blue-500/20">
                <div className="text-blue-400 font-mono text-xs font-bold mb-1">PERIMETER BYPASS</div>
                <div className="text-xs text-slate-300">Secondary arterial bypass around congested metropolitan corridors for heavy vehicle convoys.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Recent Incidents & Active Broadcast Notices */}
        <div className="space-y-6">
          {/* Recent Incident Activity */}
          <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-base text-white">Active Hazards</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('hazards')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
              >
                <span>View All ({metrics.total_active_incidents})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 4).map((inc) => (
                <div 
                  key={inc.id}
                  className="p-3 rounded-lg bg-ops-surface border border-ops-border hover:border-red-500/30 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {inc.type} · SEV {inc.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{inc.radius_m}m radius</span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-tight">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Evacuation Notices */}
          <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Emergency Broadcasts</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('notices')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
              >
                <span>Broadcasts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((notice) => (
                <div 
                  key={notice.id}
                  className="p-3 rounded-lg bg-ops-surface border border-ops-border space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                      {notice.severity_level.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(notice.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{notice.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-normal">{notice.message}</p>
                  <div className="text-[10px] text-cyan-400 font-mono pt-1">
                    Channels: {notice.channels}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
