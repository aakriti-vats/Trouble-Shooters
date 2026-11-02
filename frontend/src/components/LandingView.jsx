import React from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  AlertOctagon, 
  Building2, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Flame,
  Droplets,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

export default function LandingView({ onNavigateTab }) {
  const pages = [
    {
      id: 'overview',
      title: 'Operations Dashboard',
      category: 'SITUATION OVERVIEW',
      icon: ShieldAlert,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/70',
      bgColor: 'bg-cyan-950/20',
      btnColor: 'bg-cyan-700 hover:bg-cyan-600 text-white',
      description: 'Comprehensive operational telemetry: real-time incident counters, regional road interdictions, shelter bed intake rates, and active alert statuses.',
      actionText: 'Open Dashboard Overview'
    },
    {
      id: 'planner',
      title: 'Evacuation Route Engine',
      category: 'FLAGSHIP CAPABILITY',
      icon: Navigation,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40 hover:border-emerald-500/80',
      bgColor: 'bg-emerald-950/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      description: 'Calculates verified hazard-avoiding safe corridors vs. dangerous direct GPS paths with calibrated 0–100 risk scoring and one-click demo simulations.',
      actionText: 'Launch Route Planner'
    },
    {
      id: 'map',
      title: 'Tactical GIS Live Map',
      category: 'SPATIAL INTELLIGENCE',
      icon: MapPin,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30 hover:border-blue-500/70',
      bgColor: 'bg-blue-950/20',
      btnColor: 'bg-blue-700 hover:bg-blue-600 text-white',
      description: 'Zero-API-key tactical GIS map with high-contrast dark basemaps, live wildfire/flood/hazmat radius circles, and interactive road closure toggles.',
      actionText: 'Open Tactical Map'
    },
    {
      id: 'hazards',
      title: 'Incident Registry & AI NLP',
      category: 'FIELD DISPATCH INGESTION',
      icon: Cpu,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-500/70',
      bgColor: 'bg-amber-950/20',
      btnColor: 'bg-amber-700 hover:bg-amber-600 text-white',
      description: 'Active disaster registry with an AI Natural Language Parser that extracts category, coordinates, radius, and severity from raw 911 radio reports.',
      actionText: 'View Incident Registry'
    },
    {
      id: 'shelters',
      title: 'Shelter Network & Triage',
      category: 'CAPACITY MANAGEMENT',
      icon: Building2,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/30 hover:border-teal-500/70',
      bgColor: 'bg-teal-950/20',
      btnColor: 'bg-teal-700 hover:bg-teal-600 text-white',
      description: 'Real-time bed utilization matrix with live intake increment steppers (+10, +25, -10), autonomous capacity routing, and triage alerts.',
      actionText: 'Manage Shelter Network'
    },
    {
      id: 'notices',
      title: 'Public Safety Bulletins',
      category: 'CIVIL DEFENSE BROADCAST',
      icon: Radio,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30 hover:border-purple-500/70',
      bgColor: 'bg-purple-950/20',
      btnColor: 'bg-purple-700 hover:bg-purple-600 text-white',
      description: 'Authoritative Emergency Alert System (EAS) bulletin dispatcher equipped with an articulate natural female Text-to-Speech (TTS) voiceover.',
      actionText: 'View Public Bulletins'
    }
  ];

  return (
    <div className="space-y-12 py-4">
      {/* ======================================================== */}
      {/* 1. HERO SECTION: WHAT IS EVACAI & TAGLINE */}
      {/* ======================================================== */}
      <section className="text-center space-y-5 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 font-mono text-xs">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>CIVIL DEFENSE & EMERGENCY OPERATIONS PLATFORM</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
            Evac<span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent font-sans">
            "Don't just alert people. Help them get to safety."
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
          EvacAI is an intelligent emergency evacuation coordination platform that combines 
          topological graph routing, tactical GIS mapping, and dynamic hazard risk assessment 
          to steer populations safely away from active disasters.
        </p>

        {/* Primary Quick Start CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
          <button
            onClick={() => onNavigateTab('planner')}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>START SAFE ROUTE PLANNER</span>
          </button>
          <button
            onClick={() => onNavigateTab('overview')}
            className="px-6 py-2.5 rounded-lg bg-ops-surface hover:bg-ops-elevated text-white border border-ops-border text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>OPEN OPERATIONS DASHBOARD</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. WHY EVACAI? (THE CRITICAL PROBLEM & THE SOLUTION) */}
      {/* ======================================================== */}
      <section className="bg-ops-surface border border-ops-border rounded-xl p-6 sm:p-8 max-w-5xl mx-auto shadow-xl space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            THE MISSION RATIONALE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Why EvacAI Exists: Fixing the Evacuation Blind Spot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* The Problem */}
          <div className="p-5 rounded-lg bg-red-950/20 border border-red-900/40 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>The Fatal Flaw in Existing Systems</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Alerts Tell People to Leave, But Not Where to Go Safely
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When disaster strikes, municipal sirens and phone alerts urge citizens to evacuate immediately. 
              Frightened evacuees instinctively open commercial GPS navigation apps. 
              However, <strong>standard commercial GPS only optimizes for travel speed and distance</strong>. 
              They are completely blind to rapidly moving wildfire fronts, submerged floodwaters, and structural bridge collapses, 
              directing thousands of fleeing vehicles directly into impassable death traps.
            </p>
          </div>

          {/* The Solution */}
          <div className="p-5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>The EvacAI Intelligent Solution</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Hazard-Aware Corridors & Real-Time Resource Balancing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              EvacAI bridges this fatal gap. Our routing engine overlays an active topological road network with 
              <strong> continuous exponential hazard decay functions</strong>. It penalizes roads nearing wildfire perimeters, 
              prunes submerged causeways, and calculates verified safe detours with 0–100 risk scoring. 
              Simultaneously, it load-balances shelter triage beds so evacuees are never routed to facilities that have already reached maximum capacity.
            </p>
          </div>
        </div>

        {/* 3 Core Pillars Pill */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono text-xs">
          <div className="p-2.5 rounded bg-ops-bg border border-ops-border">
            <strong className="text-emerald-400 block mb-0.5">1. Guaranteed Clearance</strong>
            <span className="text-[11px] text-ops-muted">Safety envelopes maintained away from fire & water fronts.</span>
          </div>
          <div className="p-2.5 rounded bg-ops-bg border border-ops-border">
            <strong className="text-cyan-400 block mb-0.5">2. Resilient Routing</strong>
            <span className="text-[11px] text-ops-muted">Topological fallback graph runs even if external APIs fail.</span>
          </div>
          <div className="p-2.5 rounded bg-ops-bg border border-ops-border">
            <strong className="text-amber-400 block mb-0.5">3. Live Field Ingestion</strong>
            <span className="text-[11px] text-ops-muted">AI parses 911 radio reports into instant map perimeters.</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PLATFORM NAVIGATION MATRIX (ALL PAGES) */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ops-border pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              OPERATIONS NAVIGATION MATRIX
            </span>
            <h2 className="text-xl font-bold text-white font-sans mt-0.5">
              Explore All Platform Modules
            </h2>
          </div>
          <p className="text-xs text-ops-muted font-mono">
            Click any module below to open it immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <div
                key={page.id}
                onClick={() => onNavigateTab(page.id)}
                className={`p-5 rounded-xl bg-ops-surface border ${page.borderColor} transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:translate-y-[-2px] hover:shadow-lg`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg ${page.bgColor} border border-ops-border flex items-center justify-center ${page.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-ops-faint uppercase font-semibold">
                      {page.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-sans">
                      {page.title}
                    </h3>
                    <p className="text-xs text-ops-muted mt-1 leading-relaxed">
                      {page.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-ops-border/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab(page.id);
                    }}
                    className={`w-full py-2 px-3 rounded text-xs font-mono font-bold flex items-center justify-between transition cursor-pointer ${page.btnColor}`}
                  >
                    <span>{page.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
