import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Trash2, 
  Volume2, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  AlertTriangle
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
      alert('Failed to transmit bulletin: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Rescind and archive this public emergency bulletin?')) {
      try {
        await deleteNotice(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to rescind notice: ' + err.message);
      }
    }
  };

  const handlePlayVoiceAlert = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance("Civilian Emergency Directive: " + text);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utter);
    } else {
      alert('Speech synthesis not available in this browser environment.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-ops-surface border border-ops-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-sans">Public Safety Bulletins & Emergency Broadcasts</h2>
          </div>
          <p className="text-xs text-ops-muted mt-0.5">
            Authoritative civil defense bulletins transmitted across Wireless Emergency Alerts (WEA), EAS sirens, radio, and mobile carriers.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastForm(!showBroadcastForm)}
          className="px-3.5 py-1.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{showBroadcastForm ? 'CANCEL' : 'DRAFT NEW BULLETIN'}</span>
        </button>
      </div>

      {/* Broadcast Form Drawer */}
      {showBroadcastForm && (
        <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-ops-border pb-2">
            <h3 className="font-bold text-xs font-mono text-white uppercase">Compose Public Safety Directive</h3>
            <span className="text-[10px] font-mono text-ops-faint">HIGH PRIORITY CARRIER GATEWAY</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-ops-muted mb-1">BULLETIN TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANDATORY EVACUATION ORDER: East Ridge Wildfire Sector"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">SEVERITY LEVEL</label>
                <select
                  value={form.severity_level}
                  onChange={(e) => setForm({ ...form, severity_level: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="CRITICAL_EVACUATION">CRITICAL EVACUATION (IMMEDIATE)</option>
                  <option value="WARNING">WARNING (HIGH ALERT)</option>
                  <option value="ADVISORY">ADVISORY (SHELTER PREP)</option>
                  <option value="ALL_CLEAR">ALL CLEAR (RE-ENTRY ORDER)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ops-muted mb-1">TARGETED SECTORS / JURISDICTIONS</label>
              <input
                type="text"
                required
                value={form.affected_zones}
                onChange={(e) => setForm({ ...form, affected_zones: e.target.value })}
                className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ops-muted mb-1">PUBLIC BROADCAST TEXT</label>
              <textarea
                required
                rows={3}
                placeholder="Specific guidance for civilians: routes to utilize, designated shelters, instructions..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-ops-bg border border-ops-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 font-mono">
              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                className="px-3 py-1 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted text-xs border border-ops-border cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>TRANSMIT PUBLIC DIRECTIVE</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulletins Stream */}
      <div className="space-y-3">
        {notices.map((notice) => {
          const isCritical = notice.severity_level === 'CRITICAL_EVACUATION';
          const isWarning = notice.severity_level === 'WARNING';

          return (
            <div
              key={notice.id}
              className={`p-4 rounded-lg border transition space-y-2.5 ${
                isCritical 
                  ? 'bg-ops-surface border-red-500/50' 
                  : isWarning 
                  ? 'bg-ops-surface border-amber-500/50' 
                  : 'bg-ops-surface border-ops-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ops-border pb-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    isCritical ? 'bg-red-950/60 text-red-400 border border-red-800/60' :
                    isWarning ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
                    'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                  }`}>
                    {notice.severity_level.replace('_', ' ')}
                  </span>
                  <span className="text-ops-faint">|</span>
                  <span className="text-ops-muted">
                    SECTORS: <strong className="text-white">{notice.affected_zones}</strong>
                  </span>
                </div>

                <div className="text-[11px] font-mono text-ops-faint">
                  {new Date(notice.created_at * 1000).toLocaleString()}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{notice.title}</h3>
                <p className="text-xs text-ops-text mt-1 leading-relaxed bg-ops-bg p-3 rounded border border-ops-border font-mono">
                  {notice.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-ops-faint pt-1">
                <div>
                  DISSEMINATION: <span className="text-cyan-300">{notice.channels}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayVoiceAlert(notice.message)}
                    className="px-2.5 py-1 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted hover:text-white border border-ops-border text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isPlayingAudio ? 'STOP VOICE' : 'PLAY TTS DIRECTIVE'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="px-2.5 py-1 rounded bg-ops-bg hover:bg-red-950 text-red-400 border border-ops-border text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>RESCIND</span>
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
