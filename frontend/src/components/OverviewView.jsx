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
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
  FileText,
  Volume2,
  Compass,
  Flame,
  Droplets,
  ShieldCheck,
  ChevronRight
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
      {/* ======================================================== */}
      {/* 1. FRONT PAGE EXECUTIVE MISSION HERO BANNER */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1329] p-6 sm:p-8 shadow-2xl">
        {/* Subtle background radar grid accent */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 -bottom-24 w-80 h-80 rounded-full bg-red-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Top Classification & Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-bold tracking-wider text-red-400 uppercase">
                CRITICAL EVACUATION OPERATIONS ACTIVE (LEVEL 1)
              </span>
              <span className="hidden sm:inline-block text-slate-600">•</span>
              <span className="hidden sm:inline-block font-mono text-xs text-slate-400">
                JURISDICTION: PINE VALLEY METROPOLITAN BASIN
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 font-mono text-[11px] text-cyan-300">
                SYSTEM STATUS: 100% OPERATIONAL
              </span>
              <span className="px-2.5 py-1 rounded bg-red-950/70 border border-red-800/80 font-mono text-[11px] text-red-300 font-semibold">
                THREAT: HIGH
              </span>
            </div>
          </div>

          {/* Hero Tagline & Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>INTELLIGENT CIVIL DEFENSE & SAFE ROUTE DISPATCH</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans leading-tight">
                "Don't just alert people. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Help them get to safety."
                </span>
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                EvacAI is an intelligent emergency evacuation coordination platform. When wildfires, flash floods, or hazardous chemicals compromise road infrastructure, EvacAI dynamically calculates <strong className="text-emerald-400">hazard-avoiding safe corridors</strong>, balances shelter intake capacity, and extracts field dispatches in real time.
              </p>
            </div>

            {/* Quick Action Buttons (Direct Deep-Links) */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={() => onNavigateTab('planner')}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold tracking-wider flex items-center justify-between shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-emerald-100" />
                  <span>LAUNCH ROUTE ENGINE</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('map')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-cyan-500/50 font-mono text-xs font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>TACTICAL GIS LIVE MAP</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('hazards')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-amber-500/50 font-mono text-xs font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>AI FIELD DISPATCH (NLP)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('notices')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-purple-500/50 font-mono text-xs font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>PUBLIC SAFETY BULLETINS</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Engine Telemetry Bottom Ribbon */}
          <div className="pt-3 border-t border-slate-800/70 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Routing: <strong className="text-slate-200">Dijkstra / A* Risk Graph</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>GIS: <strong className="text-slate-200">Zero-Key Dark Basemaps</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Shelters: <strong className="text-slate-200">Dynamic Load Balancer</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>NLP: <strong className="text-slate-200">Autonomous Report Parser</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CORE 4 MASTER FEATURES BANNER */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              CORE 4 MASTER SYSTEM CAPABILITIES (CLICK TO LAUNCH)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-ops-faint">OPERATIONS ENGINE v2.0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Feature 1: Safe Route Planner */}
          <div 
            onClick={() => onNavigateTab('planner')}
            className="group p-4 rounded-lg bg-ops-surface border border-ops-border hover:border-emerald-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 hover:bg-slate-900/60"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-emerald-950/70 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  FLAGSHIP
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                1. Safe Evacuation Routing
              </h3>
              <p className="text-xs text-ops-muted leading-relaxed">
                Custom topological road network engine calculating safe detour corridors vs. dangerous naive GPS paths, scoring 0-100 hazard risk independently.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 group-hover:translate-x-1 transition">
              <span>Test Flood/Wildfire Detour</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 2: Tactical GIS Map */}
          <div 
            onClick={() => onNavigateTab('map')}
            className="group p-4 rounded-lg bg-ops-surface border border-ops-border hover:border-cyan-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 hover:bg-slate-900/60"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-cyan-950/70 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                  ZERO-API-KEY
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                2. Tactical GIS Mapping
              </h3>
              <p className="text-xs text-ops-muted leading-relaxed">
                Watermark-free military-grade tactical basemaps with real-time hazard radius circles, clickable roadblocks, and live route overlays.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 group-hover:translate-x-1 transition">
              <span>Open Tactical GIS</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 3: Dynamic Shelter Balancer */}
          <div 
            onClick={() => onNavigateTab('shelters')}
            className="group p-4 rounded-lg bg-ops-surface border border-ops-border hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 hover:bg-slate-900/60"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-amber-950/70 border border-amber-800/80 flex items-center justify-center text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
                  LIVE INTAKE
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                3. Shelter Load Balancer
              </h3>
              <p className="text-xs text-ops-muted leading-relaxed">
                Real-time bed utilization matrix with live intake increment steppers (+10, +25, -10), autonomous capacity routing, and triage alerts.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 group-hover:translate-x-1 transition">
              <span>Manage Shelter Beds</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 4: AI NLP Dispatch Parser */}
          <div 
            onClick={() => onNavigateTab('hazards')}
            className="group p-4 rounded-lg bg-ops-surface border border-ops-border hover:border-purple-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 hover:bg-slate-900/60"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-purple-950/70 border border-purple-800/80 flex items-center justify-center text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/50">
                  AI DISPATCH
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition">
                4. Field Dispatch NLP
              </h3>
              <p className="text-xs text-ops-muted leading-relaxed">
                Ingests unstructured 911 dispatch radio transcripts, extracts category, severity, radius, and coordinates, and spawns verified map hazards.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-purple-400 group-hover:translate-x-1 transition">
              <span>Ingest Live Report</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HIGH-DENSITY ENTERPRISE TELEMETRY KPI CARDS */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 4. MAIN TWO-COLUMN LOGISTICS & OPERATIONAL OVERVIEW */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Facility Matrix & Algorithmic Methodology */}
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
