import React from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  Building2, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Flame,
  AlertTriangle,
  Compass
} from 'lucide-react';

export default function LandingView({ onNavigateTab }) {
  const modules = [
    {
      id: 'planner',
      title: 'Safe Route Planner',
      badge: 'CORE ENGINE',
      icon: Navigation,
      color: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/60',
      bgColor: 'bg-emerald-500/10',
      desc: 'Dynamic corridors that actively bypass active wildfires, floodwaters, and closed bridges.'
    },
    {
      id: 'map',
      title: 'Tactical GIS Map',
      badge: 'LIVE LAYERS',
      icon: MapPin,
      color: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/60',
      bgColor: 'bg-cyan-500/10',
      desc: 'Zero-API-key dark GIS visualization with live hazard radii and interactive road toggles.'
    },
    {
      id: 'overview',
      title: 'Operations Dashboard',
      badge: 'METRICS',
      icon: ShieldAlert,
      color: 'text-blue-400',
      borderColor: 'hover:border-blue-500/60',
      bgColor: 'bg-blue-500/10',
      desc: 'Real-time telemetry: incident counts, blocked road segments, and regional shelter utilization.'
    },
    {
      id: 'shelters',
      title: 'Shelter Network',
      badge: 'TRIAGE',
      icon: Building2,
      color: 'text-teal-400',
      borderColor: 'hover:border-teal-500/60',
      bgColor: 'bg-teal-500/10',
      desc: 'Live bed intake tracker with quick adjustment steppers to prevent triage overcrowding.'
    },
    {
      id: 'hazards',
      title: 'Incident NLP Ingestion',
      badge: 'AI DISPATCH',
      icon: Cpu,
      color: 'text-amber-400',
      borderColor: 'hover:border-amber-500/60',
      bgColor: 'bg-amber-500/10',
      desc: 'Converts unstructured 911 radio reports into verified spatial hazard perimeters automatically.'
    },
    {
      id: 'notices',
      title: 'Public Bulletins',
      badge: 'EAS BROADCAST',
      icon: Radio,
      color: 'text-purple-400',
      borderColor: 'hover:border-purple-500/60',
      bgColor: 'bg-purple-500/10',
      desc: 'Official civil defense advisories with natural, articulate female Text-to-Speech (TTS).'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>INTELLIGENT EVACUATION DISPATCH CONSOLE</span>
        </div>

        {/* Main Brand Title & Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-sans">
            Evac<span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent font-sans">
            "Don't just alert people. Help them get to safety."
          </p>
        </div>

        {/* Crisp Subhead */}
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          EvacAI bridges the fatal gap in emergency response—steering evacuees away from active wildfires, flash floods, and collapsed bridges onto verified safe corridors.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
          <button
            onClick={() => onNavigateTab('planner')}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>LAUNCH ROUTE PLANNER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('overview')}
            className="px-6 py-3 rounded-lg bg-ops-surface hover:bg-ops-elevated text-slate-200 border border-ops-border text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>VIEW OPERATIONS DASHBOARD</span>
          </button>
        </div>
      </section>

      {/* Why EvacAI: 3 Crisp Key Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-ops-surface border border-ops-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Flame className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white font-sans">Hazard-Aware Routing</h3>
          <p className="text-xs text-ops-muted leading-relaxed">
            Standard GPS navigation only checks travel time. EvacAI actively penalizes routes nearing wildfire fronts and submerged bridges.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-ops-surface border border-ops-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white font-sans">0–100 Risk Scoring</h3>
          <p className="text-xs text-ops-muted leading-relaxed">
            Provides clear comparison between safe clearance corridors and dangerous direct lines before evacuees hit the road.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-ops-surface border border-ops-border space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white font-sans">Dynamic Shelter Triage</h3>
          <p className="text-xs text-ops-muted leading-relaxed">
            Continuously balances facility capacities in real time, preventing reception bottlenecks at full emergency shelters.
          </p>
        </div>
      </section>

      {/* Operations Navigation Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ops-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-sans tracking-wide">
              OPERATIONS CONSOLE MODULES
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ops-faint">CLICK ANY MODULE TO OPEN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => onNavigateTab(m.id)}
                className={`group p-4 rounded-xl bg-ops-surface border border-ops-border ${m.borderColor} transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 hover:bg-slate-900/60`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg ${m.bgColor} border border-ops-border flex items-center justify-center ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-ops-faint px-1.5 py-0.5 rounded bg-ops-bg border border-ops-border">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition font-sans">
                    {m.title}
                  </h3>
                  <p className="text-xs text-ops-muted leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-ops-muted group-hover:text-white transition">
                  <span className="text-[11px]">Open module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
