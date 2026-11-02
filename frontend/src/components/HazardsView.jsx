import React, { useState } from 'react';
import { 
  Flame, 
  Droplet, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Radio, 
  RotateCw,
  Search,
  Filter
} from 'lucide-react';
import { createHazard, deleteHazard, parseAiReport } from '../api';

const PRESET_NLP_REPORTS = [
  "Engine 7 reports flash flood submerged River Road Causeway with fast moving water, depth 4 feet, 350 meters affected.",
  "Recon UAV 3: Active brush fire spreading fast near Pine Ridge Summit, heavy smoke, zero visibility, 450m perimeter.",
  "Industrial dispatch: HAZMAT chlorine tanker leaking noxious fumes near North Gate Industrial Corridor, 260m radius quarantined.",
];

export default function HazardsView({ stateData, onRefresh, onNavigateTab }) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    title: '',
    type: 'wildfire',
    lat: 30.7333,
    lng: 76.7794,
    radius_m: 350,
    severity: 4.0,
    status: 'active',
    affected_population: 500,
    description: '',
  });

  // NLP Extractor State
  const [rawReportText, setRawReportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [parseError, setParseError] = useState('');

  const incidents = stateData?.incidents || [];
  const presets = stateData?.presets || [];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesType = filterType === 'all' || inc.type === filterType;
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHazard({
        ...manualForm,
        radius_m: parseFloat(manualForm.radius_m),
        severity: parseFloat(manualForm.severity),
        affected_population: parseInt(manualForm.affected_population) || 0,
      });
      setShowAddForm(false);
      setManualForm({
        title: '',
        type: 'wildfire',
        lat: 30.7333,
        lng: 76.7794,
        radius_m: 350,
        severity: 4.0,
        status: 'active',
        affected_population: 500,
        description: '',
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to create hazard: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Clear this hazard incident from the active map?')) {
      try {
        await deleteHazard(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to delete hazard: ' + err.message);
      }
    }
  };

  const handleParseReport = async () => {
    if (!rawReportText.trim()) return;
    setIsParsing(true);
    setParseError('');
    setParsedResult(null);
    try {
      const res = await parseAiReport(rawReportText);
      setParsedResult(res);
    } catch (err) {
      setParseError(err.message || 'Failed to parse text report.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmDeployNLP = async () => {
    if (!parsedResult) return;
    try {
      await createHazard({
        title: parsedResult.suggested_title,
        type: parsedResult.parsed_type,
        lat: parsedResult.lat,
        lng: parsedResult.lng,
        radius_m: parsedResult.radius_m,
        severity: parsedResult.severity,
        status: 'active',
        affected_population: parsedResult.estimated_affected_population,
        source: 'AI Emergency Dispatch NLP Parser (Confirmed)',
        description: `Auto-extracted from radio log: "${parsedResult.original_text}"`,
      });
      setParsedResult(null);
      setRawReportText('');
      await onRefresh();
      alert('Hazard successfully confirmed and deployed to live map!');
    } catch (err) {
      alert('Failed to deploy parsed hazard: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ops-card border border-ops-border rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Active Hazards & Disaster Zones</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of wildfires, flood inundations, chemical hazmats, and impassable debris.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Hazard'}</span>
        </button>
      </div>

      {/* AI Emergency Report NLP Parser Card */}
      <div className="bg-gradient-to-br from-ops-card via-slate-900 to-ops-card border border-cyan-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-ops-border mb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Emergency Dispatch Report Parser (NLP)</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            NATURAL LANGUAGE ENTITY EXTRACTION
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Paste unstructured 911 transcripts, citizen radio reports, or field observations. The AI will extract hazard category, severity, danger radius, and match coordinates automatically.
        </p>

        {/* Preset quick test buttons */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[11px] font-mono text-slate-400">Sample Dispatches:</span>
          {PRESET_NLP_REPORTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setRawReportText(preset)}
              className="text-[11px] bg-ops-surface hover:bg-slate-800 text-slate-300 border border-ops-border px-2.5 py-1 rounded cursor-pointer transition text-left"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={rawReportText}
            onChange={(e) => setRawReportText(e.target.value)}
            rows={2}
            placeholder="e.g. Engine 7 reports flash flood submerged River Road Causeway with fast moving water, depth 4 feet, 350 meters affected."
            className="flex-1 bg-ops-surface border border-ops-border rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleParseReport}
            disabled={isParsing || !rawReportText.trim()}
            className="px-5 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isParsing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Extract & Parse</span>
          </button>
        </div>

        {parseError && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {parseError}
          </div>
        )}

        {/* NLP Parsed Result Card with One-Click Confirm */}
        {parsedResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted Incident Entity (Confidence: {(parsedResult.confidence * 100).toFixed(0)}%)</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                {parsedResult.parsed_type} · SEV {parsedResult.severity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono py-2 bg-ops-card/50 rounded-lg p-3 border border-ops-border">
              <div>
                <span className="text-slate-500 block text-[10px]">SUGGESTED TITLE</span>
                <span className="font-bold text-white">{parsedResult.suggested_title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RESOLVED LOCATION</span>
                <span className="font-bold text-cyan-300">{parsedResult.location_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DANGER RADIUS</span>
                <span className="font-bold text-white">{parsedResult.radius_m} meters</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EST. AFFECTED POP</span>
                <span className="font-bold text-amber-400">~{parsedResult.estimated_affected_population}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic">
              AI Note: {parsedResult.reasoning}
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setParsedResult(null)}
                className="px-3 py-1.5 rounded-lg bg-ops-surface text-slate-400 hover:text-white text-xs border border-ops-border cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirmDeployNLP}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Deploy to Operations Map</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Hazard Add Form Drawer */}
      {showAddForm && (
        <div className="bg-ops-card border border-ops-border rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ops-border">
            <h3 className="font-bold text-sm text-white">Manual Incident Injection</h3>
            <span className="text-xs text-slate-500 font-mono">Coordinator Authority</span>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Incident Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ridge Fire Breakout Sector 4"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hazard Category</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="wildfire">Wildfire (Rapid Spread)</option>
                  <option value="flood">Flash Flood (Inundation)</option>
                  <option value="chemical">Chemical / HAZMAT Spill</option>
                  <option value="blocked_road">Debris / Roadblock</option>
                  <option value="restricted_exit">Restricted Bottleneck</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={manualForm.lat}
                  onChange={(e) => setManualForm({ ...manualForm, lat: parseFloat(e.target.value) })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={manualForm.lng}
                  onChange={(e) => setManualForm({ ...manualForm, lng: parseFloat(e.target.value) })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="3000"
                  value={manualForm.radius_m}
                  onChange={(e) => setManualForm({ ...manualForm, radius_m: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Affected Pop.</label>
                <input
                  type="number"
                  value={manualForm.affected_population}
                  onChange={(e) => setManualForm({ ...manualForm, affected_population: e.target.value })}
                  className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Severity Level: {manualForm.severity} / 5.0
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={manualForm.severity}
                onChange={(e) => setManualForm({ ...manualForm, severity: e.target.value })}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                rows={2}
                className="w-full bg-ops-surface border border-ops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-ops-surface hover:bg-slate-800 text-slate-300 text-xs font-medium border border-ops-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Inject Incident
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-ops-card border border-ops-border rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['all', 'wildfire', 'flood', 'chemical', 'blocked_road'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                filterType === type
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-ops-surface text-slate-300 hover:bg-slate-800 border border-ops-border'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hazards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ops-surface border border-ops-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map((hazard) => {
          const isWildfire = hazard.type === 'wildfire' || hazard.type === 'fire';
          const isFlood = hazard.type === 'flood';
          const isChemical = hazard.type === 'chemical' || hazard.type === 'hazmat';

          return (
            <div
              key={hazard.id}
              className="bg-ops-card border border-ops-border hover:border-slate-700 rounded-xl p-4 shadow-lg space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isWildfire ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    isFlood ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                    isChemical ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {hazard.type} · SEV {hazard.severity} / 5.0
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {hazard.radius_m}m radius
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white leading-tight">{hazard.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{hazard.description}</p>
              </div>

              <div className="pt-3 border-t border-ops-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Source: {hazard.source}</span>
                  <span>Pop: ~{hazard.affected_population?.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    [{hazard.lat.toFixed(4)}, {hazard.lng.toFixed(4)}]
                  </span>
                  <button
                    onClick={() => handleDelete(hazard.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Hazard</span>
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
