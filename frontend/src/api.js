const API_BASE = '/api';

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview metrics');
  return res.json();
}

export async function fetchState() {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error('Failed to fetch system state');
  return res.json();
}

export async function planRoute(params) {
  const res = await fetch(`${API_BASE}/route/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Route planning failed');
  }
  return res.json();
}

export async function fetchHazards() {
  const res = await fetch(`${API_BASE}/hazards`);
  if (!res.ok) throw new Error('Failed to fetch hazards');
  return res.json();
}

export async function createHazard(data) {
  const res = await fetch(`${API_BASE}/hazards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create hazard');
  return res.json();
}

export async function deleteHazard(id) {
  const res = await fetch(`${API_BASE}/hazards/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete hazard');
  return res.json();
}

export async function fetchShelters() {
  const res = await fetch(`${API_BASE}/shelters`);
  if (!res.ok) throw new Error('Failed to fetch shelters');
  return res.json();
}

export async function createShelter(data) {
  const res = await fetch(`${API_BASE}/shelters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create shelter');
  return res.json();
}

export async function updateShelter(id, data) {
  const res = await fetch(`${API_BASE}/shelters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update shelter');
  return res.json();
}

export async function patchShelterOccupancy(id, occupancy) {
  const res = await fetch(`${API_BASE}/shelters/${id}/occupancy`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occupancy }),
  });
  if (!res.ok) throw new Error('Failed to update shelter occupancy');
  return res.json();
}

export async function toggleRoadPoint(lat, lng, roadName, reason) {
  const res = await fetch(`${API_BASE}/roads/toggle-point`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, road_name: roadName, reason }),
  });
  if (!res.ok) throw new Error('Failed to toggle road point');
  return res.json();
}

export async function deleteBlockedRoad(id) {
  const res = await fetch(`${API_BASE}/roads/block/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unblock road');
  return res.json();
}

export async function fetchNotices() {
  const res = await fetch(`${API_BASE}/notices`);
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

export async function createNotice(data) {
  const res = await fetch(`${API_BASE}/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to publish emergency notice');
  return res.json();
}

export async function deleteNotice(id) {
  const res = await fetch(`${API_BASE}/notices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete notice');
  return res.json();
}

export async function parseAiReport(reportText) {
  const res = await fetch(`${API_BASE}/reports/ai-parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_text: reportText }),
  });
  if (!res.ok) throw new Error('Failed to parse incident report');
  return res.json();
}

export async function resetDemoScenario() {
  const res = await fetch(`${API_BASE}/system/reset-demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

