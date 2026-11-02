import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Radio, 
  RotateCw,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { createHazard, deleteHazard, parseAiReport } from '../api';

const PRESET_NLP_REPORTS = [
  "Engine 7 on scene: Flash flood submerged River Road Causeway with fast moving water, depth 4 feet, 350 meters affected.",
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

  // Report Ingestion State
  const [rawReportText, setRawReportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [parseError, setParseError] = useState('');

  const incidents = stateData?.incidents || [];

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
      alert('Failed to register hazard: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Clear this threat incident from the active map?')) {
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
      setParseError(err.message || 'Report ingestion failed.');
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
        source: 'Field Dispatch Ingestion (Supervisor Confirmed)',
        description: `Ingested from text log: "${parsedResult.original_text}"`,
      });
      setParsedResult(null);
      setRawReportText('');
      await onRefresh();
    } catch (err) {
      alert('Failed to deploy hazard: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-ops-surface border border-ops-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-bold text-white font-sans">Active Hazard & Incident Registry</h2>
          </div>
          <p className="text-xs text-ops-muted mt-0.5">
            Real-time geospatial tracking of active wildfire fronts, hydrological flood zones, and chemical hazmats.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'CANCEL' : 'INJECT MANUAL INCIDENT'}</span>
        </button>
      </div>

      {/* Field Dispatch Ingestion Console */}
      <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-ops-border pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>FIELD DISPATCH REPORT INGESTION & ENTITY EXTRACTION</span>
          </div>
          <span className="text-[10px] font-mono text-ops-faint">NLP PIPELINE</span>
        </div>

        <p className="text-xs text-ops-muted leading-relaxed">
          Ingest unstructured 911 radio logs, CAD notes, or field observation transcripts. 
          The extraction pipeline resolves the incident classification, severity rating (1–5), geographic radius, and coordinates.
        </p>

        {/* Sample Logs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-ops-faint">Sample Transcripts:</span>
          {PRESET_NLP_REPORTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setRawReportText(preset)}
              className="text-[11px] font-mono bg-ops-bg hover:bg-ops-elevated text-ops-muted hover:text-white border border-ops-border px-2 py-0.5 rounded cursor-pointer transition text-left"
            >
              Dispatch #{idx + 1}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <textarea
            value={rawReportText}
            onChange={(e) => setRawReportText(e.target.value)}
            rows={2}
            placeholder="Paste field dispatch text (e.g. Engine 7 reports flash flood submerged River Road Causeway, water depth 4 feet, 350 meters affected)..."
            className="flex-1 bg-ops-bg border border-ops-border rounded p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={handleParseReport}
            disabled={isParsing || !rawReportText.trim()}
            className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-40"
          >
            {isParsing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            <span>PARSE DISPATCH</span>
          </button>
        </div>

        {parseError && (
          <div className="p-2 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">
            {parseError}
          </div>
        )}

        {/* Structured Entity Review Card */}
        {parsedResult && (
          <div className="p-3.5 rounded bg-ops-bg border border-cyan-500/40 space-y-2.5">
            <div className="flex items-center justify-between border-b border-ops-border pb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXTRACTED INCIDENT ENTITY · CONFIDENCE: {(parsedResult.confidence * 100).toFixed(0)}%</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 font-bold border border-red-800/60 uppercase">
                {parsedResult.parsed_type} · SEV {parsedResult.severity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-ops-surface rounded border border-ops-border">
                <span className="text-[10px] text-ops-faint uppercase block">PROPOSED TITLE</span>
                <span className="font-bold text-white">{parsedResult.suggested_title}</span>
              </div>
              <div className="p-2 bg-ops-surface rounded border border-ops-border">
                <span className="text-[10px] text-ops-faint uppercase block">RESOLVED SECTOR</span>
                <span className="font-bold text-cyan-300">{parsedResult.location_name}</span>
              </div>
              <div className="p-2 bg-ops-surface rounded border border-ops-border">
                <span className="text-[10px] text-ops-faint uppercase block">DANGER RADIUS</span>
                <span className="font-bold text-white">{parsedResult.radius_m}m</span>
              </div>
              <div className="p-2 bg-ops-surface rounded border border-ops-border">
                <span className="text-[10px] text-ops-faint uppercase block">CIVILIAN EXPOSURE</span>
                <span className="font-bold text-amber-400">~{parsedResult.estimated_affected_population}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setParsedResult(null)}
                className="px-3 py-1 rounded bg-ops-surface text-ops-muted hover:text-white text-xs font-mono border border-ops-border cursor-pointer"
              >
                DISCARD
              </button>
              <button
                onClick={handleConfirmDeployNLP}
                className="px-3.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRM & DEPLOY TO ACTIVE THREAT MODEL</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Insertion Drawer */}
      {showAddForm && (
        <div className="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ops-border pb-2">
            <h3 className="font-bold text-xs font-mono text-white uppercase">Manual Incident Registration</h3>
            <span className="text-[10px] text-ops-faint font-mono">SUPERVISOR OVERRIDE</span>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">INCIDENT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ridge Fire Breakout Sector 4"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-ops-muted mb-1">CLASSIFICATION</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="wildfire">Wildfire (Rapid Timber Burn)</option>
                  <option value="flood">Flash Flood (Inundation Surge)</option>
                  <option value="chemical">Chemical / Toxic Hazmat Spill</option>
                  <option value="blocked_road">Structural Debris Obstruction</option>
                  <option value="restricted_exit">Restricted Police Checkpoint</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-[10px] text-ops-muted mb-1">LATITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={manualForm.lat}
                  onChange={(e) => setManualForm({ ...manualForm, lat: parseFloat(e.target.value) })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-ops-muted mb-1">LONGITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={manualForm.lng}
                  onChange={(e) => setManualForm({ ...manualForm, lng: parseFloat(e.target.value) })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-ops-muted mb-1">RADIUS (METERS)</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="3000"
                  value={manualForm.radius_m}
                  onChange={(e) => setManualForm({ ...manualForm, radius_m: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-ops-muted mb-1">CIVILIAN POP</label>
                <input
                  type="number"
                  value={manualForm.affected_population}
                  onChange={(e) => setManualForm({ ...manualForm, affected_population: e.target.value })}
                  className="w-full bg-ops-bg border border-ops-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 font-mono">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 rounded bg-ops-bg hover:bg-ops-elevated text-ops-muted text-xs border border-ops-border cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                REGISTER THREAT
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-ops-surface border border-ops-border rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto font-mono text-xs">
          {['all', 'wildfire', 'flood', 'chemical', 'blocked_road'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded capitalize transition cursor-pointer text-[11px] ${
                filterType === type
                  ? 'bg-ops-elevated text-white border border-cyan-500/50 font-bold'
                  : 'bg-ops-bg text-ops-muted hover:text-white border border-ops-border'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-ops-faint absolute left-3 top-2" />
          <input
            type="text"
            placeholder="Filter incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ops-bg border border-ops-border rounded pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Incidents Data Table */}
      <div className="bg-ops-surface border border-ops-border rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-ops-border text-[10px] font-mono text-ops-faint uppercase bg-ops-bg">
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Incident Title & Description</th>
              <th className="py-2.5 px-3">Radius & Severity</th>
              <th className="py-2.5 px-3">Coordinates</th>
              <th className="py-2.5 px-3 text-right">Civilian Pop</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ops-border/60">
            {filteredIncidents.map((hazard) => (
              <tr key={hazard.id} className="hover:bg-ops-card/50 transition">
                <td className="py-3 px-3 align-top">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    hazard.type === 'wildfire' || hazard.type === 'fire' ? 'bg-red-950/60 text-red-400 border border-red-800/60' :
                    hazard.type === 'flood' ? 'bg-sky-950/60 text-sky-400 border border-sky-800/60' :
                    hazard.type === 'chemical' ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60' :
                    'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                  }`}>
                    {hazard.type}
                  </span>
                </td>
                <td className="py-3 px-3 align-top max-w-xs">
                  <div className="font-bold text-white text-xs">{hazard.title}</div>
                  <div className="text-[11px] text-ops-muted mt-0.5 leading-relaxed">{hazard.description}</div>
                </td>
                <td className="py-3 px-3 align-top font-mono text-[11px]">
                  <div className="text-white font-semibold">{hazard.radius_m}m radius</div>
                  <div className="text-red-400">Severity {hazard.severity}/5.0</div>
                </td>
                <td className="py-3 px-3 align-top font-mono text-[10px] text-ops-faint">
                  [{hazard.lat.toFixed(4)}, {hazard.lng.toFixed(4)}]
                </td>
                <td className="py-3 px-3 align-top font-mono text-right text-ops-text">
                  ~{hazard.affected_population?.toLocaleString()}
                </td>
                <td className="py-3 px-3 align-top text-right">
                  <button
                    onClick={() => handleDelete(hazard.id)}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
