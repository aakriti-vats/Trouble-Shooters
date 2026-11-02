import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  Activity, 
  Compass,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Server
} from 'lucide-react';
import { resetDemoScenario } from '../api';

export default function Navbar({ activeTab, setActiveTab, overviewData, onRefresh }) {
  const [zuluTime, setZuluTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setZuluTime(now.toISOString().slice(11, 19) + 'Z');
      setLocalTime(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    if (confirm('Re-initialize operations database to baseline incident scenario?')) {
      setIsResetting(true);
      try {
        await resetDemoScenario();
        await onRefresh();
      } catch (err) {
        alert('Scenario reset failed: ' + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const toggleSirenSound = () => {
    if (isPlayingSiren) {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setIsPlayingSiren(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(853, ctx.currentTime);
      osc2.frequency.setValueAtTime(960, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 3.0);
      osc2.stop(ctx.currentTime + 3.0);

      setAudioCtx(ctx);
      setIsPlayingSiren(true);
      setTimeout(() => {
        setIsPlayingSiren(false);
        setAudioCtx(null);
      }, 3000);
    } catch (e) {
      console.warn('Audio not initialized', e);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home / Mission' },
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'map', label: 'Tactical GIS Map' },
    { id: 'planner', label: 'Evacuation Route Engine' },
    { id: 'hazards', label: 'Incident Registry & Ingestion' },
    { id: 'shelters', label: 'Shelter Network' },
    { id: 'notices', label: 'Public Safety Bulletins' },
  ];

  return (
    <header className="bg-ops-surface border-b border-ops-border select-none sticky top-0 z-50">
      {/* Top Operations Header Ribbon */}
      <div className="bg-ops-bg border-b border-ops-border/70 px-4 py-1.5 text-[11px] font-mono text-ops-muted flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-ops-text font-semibold">
            <span className="w-2 h-2 rounded-full bg-emg-critical animate-pulse"></span>
            <span>EOC DISPATCH CONSOLE</span>
          </div>
          <span className="text-ops-faint">|</span>
          <span className="text-ops-muted hidden sm:inline">JURISDICTION: REGIONAL BASIN EMERGENCY MANAGEMENT</span>
          <span className="text-ops-faint hidden sm:inline">|</span>
          <span className="text-amber-400 font-bold hidden md:inline">INCIDENT #EVAC-2026-09A (SIMULATED DATA)</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-ops-faint" />
            <span>UTC: <strong className="text-ops-text">{zuluTime}</strong></span>
            <span className="text-ops-faint">/</span>
            <span>LOCAL: <strong className="text-ops-text">{localTime}</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>SYSTEM NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-b from-slate-800 to-slate-900 border border-ops-borderLight flex items-center justify-center text-cyan-400 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-sans">
                  EVAC<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-mono text-ops-muted uppercase px-1.5 py-0.5 rounded bg-ops-card border border-ops-border">
                  OPERATIONS CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-ops-muted font-sans hidden sm:block">
                Intelligent Evacuation & Safe Route Planner
              </p>
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2">
            {/* Threat Level */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-ops-card border border-ops-border text-xs font-mono">
              <span className="text-[10px] text-ops-muted uppercase">THREAT:</span>
              <span className="text-red-400 font-bold text-[11px] tracking-wide">
                {overviewData?.threat_level || 'CRITICAL LEVEL 1'}
              </span>
            </div>

            {/* EAS Siren Simulator */}
            <button
              onClick={toggleSirenSound}
              title="Test Emergency Alert System (EAS) Dual-Tone Audio"
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
                isPlayingSiren 
                  ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                  : 'bg-ops-card hover:bg-ops-elevated text-ops-text border-ops-border'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{isPlayingSiren ? 'AUDIO TEST ACTIVE' : 'EAS SIREN'}</span>
            </button>

            {/* Reset Scenario */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Reset operations database to standard demo baseline"
              className="px-2.5 py-1 rounded bg-ops-card hover:bg-ops-elevated text-ops-text border border-ops-border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">RESET SCENARIO</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Subtle Tab Bar) */}
        <nav className="flex space-x-1 border-t border-ops-border/60 overflow-x-auto no-scrollbar pt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-white font-semibold'
                    : 'border-transparent text-ops-muted hover:text-ops-text hover:border-ops-borderLight'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
