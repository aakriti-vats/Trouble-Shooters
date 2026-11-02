import React from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  AlertOctagon, 
  Building2, 
  Users, 
  Radio, 
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle
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
    <div className="space-y-5">
      {/* Incident Command Status Banner */}
      <div className="bg-ops-surface border border-ops-border rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emg-critical animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-red-400 uppercase">
              ACTIVE SITUATION ENVELOPE: LEVEL 1 EVACUATION
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Pine Valley Metropolitan Evacuation Operations Dashboard
          </h2>
          <p className="text-xs text-ops-muted max-w-3xl leading-relaxed">
            Multi-incident coordination system active. Dynamic risk surfaces model wildfire progression, flash flood inundation boundaries, and road network interdictions in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('planner')}
            className="px-3.5 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>ROUTE PLANNER</span>
          </button>
          <button
            onClick={() => onNavigateTab('map')}
            className="px-3.5 py-2 rounded bg-ops-card hover:bg-ops-elevated text-ops-text border border-ops-border font-mono text-xs font-medium transition cursor-pointer"
          >
            <span>LIVE GIS MAP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: High-Density Enterprise Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Active Incidents
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.total_active_incidents}
          </div>
          <div className="text-[10px] font-mono text-red-400">
            Wildfire & Flood Fronts
          </div>
        </div>

        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Blocked Corridors
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.blocked_roads}
          </div>
          <div className="text-[10px] font-mono text-amber-400">
            Excluded From Safe Paths
          </div>
        </div>

        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Active Shelters
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.available_shelters} <span className="text-ops-faint text-xs">/ {metrics.total_shelters}</span>
          </div>
          <div className="text-[10px] font-mono text-ops-muted">
            {metrics.unavailable_shelters} At Capacity
          </div>
        </div>

        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Network Intake
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.overall_occupancy_rate}%
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            {metrics.total_occupancy} / {metrics.total_capacity} Beds
          </div>
        </div>

        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Civilian Exposure
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {metrics.estimated_affected_population?.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-ops-muted">
            Inside Hazard Radii
          </div>
        </div>

        <div className="bg-ops-surface border border-ops-border p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] font-mono text-ops-muted uppercase tracking-wider">
            Public Bulletins
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {metrics.active_evacuation_notices}
          </div>
          <div className="text-[10px] font-mono text-purple-400">
            Active EAS Broadcasts
          </div>
        </div>
      </div>

      {/* Main Two-Column Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Shelter Logistics & Routing Methodology */}
        <div className="lg:col-span-8 space-y-5">
          {/* Facility Logistics Matrix */}
          <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-ops-border pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white font-sans">
                  Shelter Network Capacity & Status
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab('shelters')}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>VIEW ALL FACILITIES</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Total Regional Bed Utilization Bar */}
            <div className="bg-ops-bg p-3 rounded border border-ops-border space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-ops-muted">
                <span>Aggregate Capacity Utilization: {metrics.total_occupancy} of {metrics.total_capacity} beds</span>
                <span className="font-bold text-white">{metrics.overall_occupancy_rate}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    metrics.overall_occupancy_rate > 85 ? 'bg-red-500' :
                    metrics.overall_occupancy_rate > 65 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.overall_occupancy_rate)}%` }}
                ></div>
              </div>
            </div>

            {/* Facilities List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-ops-border text-[10px] font-mono text-ops-faint uppercase">
                    <th className="py-2 px-2">Facility Name</th>
                    <th className="py-2 px-2">Type / Address</th>
                    <th className="py-2 px-2 text-right">Occupancy</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ops-border/60">
                  {shelters.map((s) => (
                    <tr key={s.id} className="hover:bg-ops-card/50 transition">
                      <td className="py-2.5 px-2 font-medium text-white">{s.name}</td>
                      <td className="py-2.5 px-2 text-ops-muted text-[11px]">{s.address || s.shelter_type}</td>
                      <td className="py-2.5 px-2 font-mono text-right text-ops-text">
                        <span className="font-bold">{s.occupancy}</span>
                        <span className="text-ops-faint">/{s.capacity}</span>
                        <span className="text-ops-muted ml-1.5">({s.occupancy_rate}%)</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          !s.available || s.status === 'full' ? 'bg-slate-800 text-slate-400' :
                          s.status === 'near_capacity' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
                          'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        }`}>
                          {s.available ? s.status.replace('_', ' ') : 'CLOSED'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {s.available && (
                          <button
                            onClick={() => onSelectShelterForRouting(s)}
                            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
                          >
                            Route
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Routing Decision Support Methodology */}
          <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-ops-border pb-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white font-sans">
                  Dynamic Evacuation Routing Methodology
                </h3>
              </div>
              <span className="text-[10px] font-mono text-ops-faint">GRAPH ALGORITHM</span>
            </div>

            <p className="text-xs text-ops-muted leading-relaxed">
              Standard commercial navigation models evaluate edge weights by travel speed and distance alone. 
              The EvacAI routing algorithm penalizes corridors intersecting active hazard perimeters with heavy exponential multipliers 
              and prunes verified blocked road segments, guaranteeing that generated evacuation routes maintain calculated safety envelopes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded bg-ops-bg border border-ops-border space-y-1">
                <div className="text-[11px] font-mono font-bold text-emerald-400">SAFE CORRIDOR</div>
                <p className="text-[11px] text-ops-muted">Guaranteed hazard clearance envelope with verified open arterial passages.</p>
              </div>
              <div className="p-2.5 rounded bg-ops-bg border border-ops-border space-y-1">
                <div className="text-[11px] font-mono font-bold text-amber-400">DIRECT ROUTE</div>
                <p className="text-[11px] text-ops-muted">Demonstrates the naive GPS route, exposing risk factors and submerged bridges.</p>
              </div>
              <div className="p-2.5 rounded bg-ops-bg border border-ops-border space-y-1">
                <div className="text-[11px] font-mono font-bold text-blue-400">PERIMETER BYPASS</div>
                <p className="text-[11px] text-ops-muted">Outer ring thoroughfares for heavy emergency apparatus and bus convoys.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Active Incidents Feed & Public Bulletins */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Incidents Log */}
          <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-ops-border pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-sm text-white font-sans">Active Hazards</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('hazards')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                LOG ({metrics.total_active_incidents})
              </button>
            </div>

            <div className="space-y-2.5">
              {incidents.slice(0, 3).map((inc) => (
                <div key={inc.id} className="p-2.5 rounded bg-ops-bg border border-ops-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-red-400">
                      {inc.type} · SEV {inc.severity}/5.0
                    </span>
                    <span className="text-[10px] font-mono text-ops-faint">
                      {inc.radius_m}m radius
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-white leading-tight">{inc.title}</h4>
                  <p className="text-[11px] text-ops-muted line-clamp-2">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Public Safety Broadcasts */}
          <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-ops-border pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white font-sans">Public Bulletins</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('notices')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                BROADCAST
              </button>
            </div>

            <div className="space-y-2.5">
              {notices.map((n) => (
                <div key={n.id} className="p-2.5 rounded bg-ops-bg border border-ops-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {n.severity_level.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-ops-faint">
                      {new Date(n.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-white leading-tight">{n.title}</h4>
                  <p className="text-[11px] text-ops-muted leading-normal">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
