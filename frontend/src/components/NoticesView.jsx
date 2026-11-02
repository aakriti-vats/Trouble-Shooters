import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Trash2, 
  Volume2, 
  VolumeX,
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Mic,
  Sliders,
  Play
} from 'lucide-react';
import { createNotice, deleteNotice } from '../api';

export default function NoticesView({ stateData, onRefresh }) {
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [speechRate, setSpeechRate] = useState(0.92); // Slightly deliberate, clear cadence
  const [speechPitch, setSpeechPitch] = useState(1.08); // Natural female vocal tone

  const [form, setForm] = useState({
    title: '',
    message: '',
    severity_level: 'CRITICAL_EVACUATION',
    affected_zones: 'East Ridge & River Basin Sectors',
    channels: 'Wireless Emergency Alerts (WEA), EAS Siren, Local FM Radio, SMS',
    issued_by: 'Incident Commander – Regional EOC',
  });

  const notices = stateData?.notices || [];

  // Helper to discover and prioritize understandable female voices
  const findBestFemaleVoice = (voicesList) => {
    if (!voicesList || voicesList.length === 0) return null;

    // High quality standard female English voices across macOS, Chrome, Windows, iOS
    const preferredFemaleNames = [
      'Samantha',           // macOS standard crystal-clear female en-US
      'Victoria',            // macOS articulate female en-US
      'Karen',               // macOS / iOS female en-AU
      'Moira',               // macOS / iOS female en-IE
      'Tessa',               // macOS / iOS female en-ZA
      'Google US English',   // Chrome en-US female
      'Microsoft Zira',      // Windows female en-US
      'Microsoft Jenny',     // Windows natural female en-US
      'Ava',                 // macOS / iOS female
      'Serena',              // UK female
      'Siri',                // Apple female
      'Fiona'                // Scottish female
    ];

    for (const name of preferredFemaleNames) {
      const match = voicesList.find(v => 
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (match) return match;
    }

    // Secondary: Any voice containing 'female' or 'woman' in description/name
    const explicitFemale = voicesList.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
    if (explicitFemale) return explicitFemale;

    // Tertiary: English voice that is not notoriously male
    const nonMaleEnglish = voicesList.find(v => 
      v.lang.startsWith('en') && 
      !['alex', 'fred', 'daniel', 'oliver', 'george', 'lee', 'rishi', 'david', 'mark'].some(
        m => v.name.toLowerCase().includes(m)
      )
    );
    if (nonMaleEnglish) return nonMaleEnglish;

    // Fallback: any English voice
    return voicesList.find(v => v.lang.startsWith('en')) || voicesList[0];
  };

  // Populate speech synthesis voices on mount & on change
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const bestFemale = findBestFemaleVoice(voices);
        if (bestFemale && !selectedVoiceName) {
          setSelectedVoiceName(bestFemale.name);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceName]);

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

  const handlePlayVoiceAlert = (notice) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not available in this browser environment.');
      return;
    }

    // If currently playing this notice, stop it
    if (activePlayingId === notice.id) {
      window.speechSynthesis.cancel();
      setActivePlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Natural, highly understandable spoken broadcast format
    const speechText = `Civilian Emergency Broadcast Directive. ${notice.title}. Message begins: ${notice.message}. Authoritative channels: ${notice.channels}. End of transmission.`;
    const utter = new SpeechSynthesisUtterance(speechText);

    // Find requested female voice or fallback
    const voices = window.speechSynthesis.getVoices();
    let voiceToUse = voices.find(v => v.name === selectedVoiceName);
    if (!voiceToUse) {
      voiceToUse = findBestFemaleVoice(voices);
    }

    if (voiceToUse) {
      utter.voice = voiceToUse;
    }

    utter.rate = speechRate;   // 0.92 for crystal-clear clarity
    utter.pitch = speechPitch; // 1.08 for natural female articulation
    utter.volume = 1.0;

    utter.onstart = () => {
      setActivePlayingId(notice.id);
    };

    utter.onend = () => {
      setActivePlayingId(null);
    };

    utter.onerror = () => {
      setActivePlayingId(null);
    };

    window.speechSynthesis.speak(utter);
  };

  const currentVoiceObj = availableVoices.find(v => v.name === selectedVoiceName);

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

      {/* Female Voiceover Configuration Bar */}
      <div className="bg-ops-surface border border-purple-500/30 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-300">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] text-purple-300 font-bold flex items-center gap-2">
              <span>AUDIO BROADCAST VOICE: UNDERSTANDABLE FEMALE</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-ops-muted">
              Current Dispatcher: <strong className="text-white">{currentVoiceObj?.name || 'Samantha (en-US Female Natural)'}</strong> ({currentVoiceObj?.lang || 'en-US'})
            </div>
          </div>
        </div>

        {/* Voice Selector & Cadence Tuning */}
        <div className="flex flex-wrap items-center gap-3">
          {availableVoices.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-ops-faint">SELECT VOICE:</span>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="bg-ops-bg border border-ops-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {availableVoices
                  .filter(v => v.lang.startsWith('en'))
                  .map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} {v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('google') ? '⭐ (Female)' : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-ops-faint">CADENCE:</span>
            <button
              type="button"
              onClick={() => { setSpeechRate(0.88); setSpeechPitch(1.1); }}
              className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                speechRate < 0.9 ? 'bg-purple-900/60 text-purple-200 border-purple-500' : 'bg-ops-bg text-ops-muted border-ops-border'
              }`}
            >
              Clear & Slow
            </button>
            <button
              type="button"
              onClick={() => { setSpeechRate(0.95); setSpeechPitch(1.08); }}
              className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                speechRate >= 0.9 ? 'bg-purple-900/60 text-purple-200 border-purple-500' : 'bg-ops-bg text-ops-muted border-ops-border'
              }`}
            >
              Natural
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Form Drawer */}
      {showBroadcastForm && (
        <div className="bg-ops-surface border border-purple-500/40 rounded-lg p-4 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-ops-border pb-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white font-sans">Draft Civil Defense Evacuation Directive</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">BULLETIN TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANDATORY EVACUATION ORDER – SECTOR 18"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">SEVERITY CLASSIFICATION</label>
                <select
                  value={form.severity_level}
                  onChange={(e) => setForm({ ...form, severity_level: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="CRITICAL_EVACUATION">CRITICAL EVACUATION (Immediate Danger)</option>
                  <option value="WARNING">WARNING (Evacuate Preparatory)</option>
                  <option value="ADVISORY">ADVISORY (Precautionary Notice)</option>
                  <option value="INFORMATIONAL">INFORMATIONAL (Situation Update)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-ops-muted mb-1">AFFECTED SECTORS / ZONES</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sectors 17, 18, 19, Lower River Corridor"
                  value={form.affected_zones}
                  onChange={(e) => setForm({ ...form, affected_zones: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-ops-muted mb-1">DISSEMINATION CHANNELS</label>
                <input
                  type="text"
                  required
                  value={form.channels}
                  onChange={(e) => setForm({ ...form, channels: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ops-muted mb-1">PUBLIC INSTRUCTION DIRECTIVE</label>
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
          const isCurrentlySpeaking = activePlayingId === notice.id;

          return (
            <div
              key={notice.id}
              className={`p-4 rounded-lg border transition space-y-2.5 ${
                isCurrentlySpeaking
                  ? 'bg-purple-950/20 border-purple-500 ring-1 ring-purple-500/40'
                  : isCritical 
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
                    onClick={() => handlePlayVoiceAlert(notice)}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                      isCurrentlySpeaking
                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse'
                        : 'bg-purple-950/60 hover:bg-purple-900 text-purple-200 border-purple-800/60 hover:border-purple-500'
                    }`}
                  >
                    {isCurrentlySpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>STOP VOICE</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                        <span>PLAY TTS DIRECTIVE (FEMALE)</span>
                      </>
                    )}
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
