import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  Layers, 
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { resetDemoScenario } from '../api';

export default function Navbar({ activeTab, setActiveTab, overviewData, onRefresh }) {
  const [timeStr, setTimeStr] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    if (confirm('Reset operations database to pristine demonstration scenario?')) {
      setIsResetting(true);
      try {
        await resetDemoScenario();
        await onRefresh();
      } catch (err) {
        alert('Reset failed: ' + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Synthesize realistic emergency broadcast alert tone using Web Audio API
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
      osc1.frequency.setValueAtTime(853, ctx.currentTime); // Standard EAS frequency 1
      osc2.frequency.setValueAtTime(960, ctx.currentTime); // Standard EAS frequency 2

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
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
      console.warn('Audio synthesis not permitted without gesture', e);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'map', label: 'Live Map' },
    { id: 'planner', label: 'Route Planner' },
    { id: 'hazards', label: 'Hazards' },
    { id: 'shelters', label: 'Shelters' },
    { id: 'notices', label: 'Emergency Notices' },
  ];

  const threatColor = overviewData?.threat_color || 'red';

  return (
    <header className="bg-ops-surface border-b border-ops-border sticky top-0 z-50">
      {/* Tactical Emergency Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-900/40 px-4 py-1 text-xs flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 text-red-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-semibold tracking-wider">SIMULATED DEMONSTRATION DATA</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Pine Valley Emergency Operations Command (EOC)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300">{timeStr || '00:00:00 UTC'}</span>
          </div>
          <span className="hidden sm:inline bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
            DEFCON 1 ACTIVE
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Evac<span className="text-cyan-400">AI</span>
                </span>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  v2.0 Ops
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block italic">
                "Don't just alert people. Help them get to safety."
              </p>
            </div>
          </div>

          {/* Quick Actions & Threat Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Threat Level Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ops-card border border-ops-border">
              <span className="text-[11px] text-slate-400 font-mono uppercase">Threat Status:</span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                threatColor === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                threatColor === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {overviewData?.threat_level || 'CRITICAL EVACUATION'}
              </span>
            </div>

            {/* Siren Broadcast Preview */}
            <button
              onClick={toggleSirenSound}
              title="Test Emergency Broadcast Audio Alert"
              className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono ${
                isPlayingSiren 
                  ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                  : 'bg-ops-card hover:bg-slate-800 text-slate-300 border-ops-border'
              }`}
            >
              {isPlayingSiren ? <Volume2 className="w-4 h-4 text-white" /> : <Radio className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline">{isPlayingSiren ? 'Alert Playing...' : 'EAS Siren'}</span>
            </button>

            {/* Reset Scenario Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Reseed database back to default demonstration scenario"
              className="px-3 py-2 rounded-lg bg-ops-card hover:bg-slate-800 text-slate-300 border border-ops-border hover:border-slate-600 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-ops-border/60 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ops-card'
                }`}
              >
                {item.id === 'planner' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
