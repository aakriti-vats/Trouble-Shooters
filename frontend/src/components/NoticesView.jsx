import React, { useState } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  Send, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { createNotice, deleteNotice } from '../api';

export default function NoticesView({ stateData, onRefresh }) {
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity_level: 'CRITICAL_EVACUATION',
    affected_zones: 'East Ridge & River Basin Sectors',
    channels: 'Wireless Emergency Alerts (WEA), EAS Siren, Local FM Radio, SMS',
    issued_by: 'Incident Commander – Regional EOC',
  });

  const notices = stateData?.notices || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createNotice(form);
      setShowBroadcastForm(false);
      setForm({
        title: '',
        message: '',
        severity_level: 'CRITICAL_EVACUATION',
        affected_zones: 'East Ridge & River Basin Sectors',
        channels: 'Wireless Emergency Alerts (WEA), EAS Siren, Local FM Radio, SMS',
        issued_by: 'Incident Commander – Regional EOC',
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to broadcast notice: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Rescind and archive this emergency notice?')) {
      try {
        await deleteNotice(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to rescind notice: ' + err.message);
      }
    }
  };

  // Text to Speech playback for realistic civilian broadcast simulation
  const handlePlayVoiceAlert = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance("Emergency Alert: " + text);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utter);
    } else {
      alert('Speech synthesis not supported on this browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Public Emergency Notices & Broadcasts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative multi-channel civil protection alerts sent via WEA, EAS sirens, radio, and mobile carriers.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastForm(!showBroadcastForm)}
          className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>{showBroadcastForm ? 'Cancel Notice' : 'Draft New Broadcast'}</span>
        </button>
      </div>

      {/* Broadcast Composer Form */}
      {showBroadcastForm && (
        <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ops-border">
            <h3 className="font-bold text-sm text-white">Draft Emergency Alert Order</h3>
            <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
              HIGH PRIORITY CHANNELS
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANDATORY EVACUATION: East Ridge Wildfire Sector"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Severity Classification</label>
                <select
                  value={form.severity_level}
                  onChange={(e) => setForm({ ...form, severity_level: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL_EVACUATION">CRITICAL EVACUATION (IMMEDIATE)</option>
                  <option value="WARNING">WARNING (HIGH ALERT)</option>
                  <option value="ADVISORY">ADVISORY (SHELTER PREP)</option>
                  <option value="ALL_CLEAR">ALL CLEAR (RE-ENTRY ORDER)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Affected Sectors / Zones</label>
              <input
                type="text"
                required
                value={form.affected_zones}
                onChange={(e) => setForm({ ...form, affected_zones: e.target.value })}
                className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Public Alert Text</label>
              <textarea
                required
                rows={3}
                placeholder="Clear instructions for civilians: routes to take, designated shelters, items to carry..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dissemination Channels</label>
                <input
                  type="text"
                  value={form.channels}
                  onChange={(e) => setForm({ ...form, channels: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={form.issued_by}
                  onChange={(e) => setForm({ ...form, issued_by: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                className="px-4 py-2 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 text-xs font-medium border border-ops-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Broadcast Notice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices Stream */}
      <div className="space-y-4">
        {notices.map((notice) => {
          const isCritical = notice.severity_level === 'CRITICAL_EVACUATION';
          const isWarning = notice.severity_level === 'WARNING';

          return (
            <div
              key={notice.id}
              className={`p-5 rounded-xl border transition shadow-lg space-y-3 ${
                isCritical 
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500' 
                  : isWarning 
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500' 
                  : 'bg-ops-card border-ops-border hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`}></span>
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {notice.severity_level.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Sectors: <strong className="text-slate-200">{notice.affected_zones}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{new Date(notice.created_at * 1000).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white">{notice.title}</h3>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-ops-border font-sans">
                  {notice.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-ops-border text-xs">
                <div className="text-slate-400 font-mono">
                  Channels: <span className="text-cyan-300">{notice.channels}</span> • Issued By: <span className="text-slate-300">{notice.issued_by}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayVoiceAlert(notice.message)}
                    className="px-3 py-1.5 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-200 border border-ops-border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isPlayingAudio ? 'Stop Voice Alert' : 'Civilian Voice TTS'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="px-3 py-1.5 rounded-lg bg-ops-surface hover:bg-red-950 text-red-400 border border-ops-border text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Rescind</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
