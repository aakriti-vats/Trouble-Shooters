# EvacAI – Intelligent Evacuation & Safe Route Planner

> **"Don't just alert people. Help them get to safety."**

EvacAI is a full-stack, mission-critical emergency evacuation coordination and safe routing operations dashboard designed for incident commanders, civil protection teams, and regional emergency dispatchers.

Standard consumer navigation apps (like Google Maps or Apple Maps) optimize solely for transit speed and distance—unwittingly directing fleeing civilian convoys into advancing wildfire flanks, submerged bridge causeways, or toxic chemical plumes. **EvacAI revolutionizes disaster transit by computing risk-weighted safety corridors** that dynamically avoid active hazards, blocked corridors, and overcrowded facilities.

---

## 🌟 Key Capabilities

### 1. 🛡️ Dynamic Multi-Hazard Risk Scoring & Avoidance Engine
- **Independent Risk Scoring**: Evaluates any road network corridor on a calibrated 0–100 scale, calculating Euclidean and Haversine proximity margins to active emergency zones.
- **Dynamic Hazard Decay**: Wildfires, flood surges, and chemical hazmats generate exponential risk penalties and caution buffer zones.
- **Triple Comparative Routing**:
  - **Recommended Safe Route (Emerald Green)**: Avoids all roadblocks and maintains safe clearance from hazard perimeters.
  - **Direct Naive Route (Amber/Orange)**: Contrasts the standard shortest path to demonstrate why naive navigation leads into danger.
  - **Secondary Perimeter Bypass (Blue)**: High-capacity outer ring expressway for bus convoys and emergency ambulances.
- **Dual Routing Architecture**:
  - **OSRM Integration**: Connects to public OpenStreetMap road networks when reachable.
  - **Local High-Fidelity Metro Router**: High-density topological graph with Dijkstra/A* routing ensuring 100% offline autonomy.

### 2. 🤖 AI Emergency Dispatch NLP Report Parser
- Natural Language Entity Extraction parsing 911 radio logs, citizen transcripts, and dispatcher notes.
- Extracts incident type, severity (1.0–5.0), perimeter radius in meters, estimated affected population, and matches local landmarks with a single-click **"Confirm & Deploy to Operations Map"** workflow.

### 3. 🗺️ Tactical Live Operations Map
- Interactive Leaflet dark operations map styled for command centers.
- Layer toggles for Wildfire Zones, Flood Inundations, HAZMAT Leaks, Blocked Roads, Shelters, and Preset Landmarks.
- Interactive tools: Set Origin, Block/Unblock Road Corridors, Deploy Hazards on click.

### 4. 🏢 Real-Time Shelter Network Management
- Live occupancy meters and capacity warning thresholds (Open, Near Capacity, Full/Closed).
- **Auto-Select Safest Shelter Algorithm**: Evaluates spare bed capacity, distance, and route safety factor to automatically recommend the optimal destination facility.
- Real-time intake counters (+10 / +25 / -10) and relief supply inventory (Medical, Water, Backup Power, Pet Friendly, Helipads).

### 5. 📢 Emergency Broadcast & Audio Siren Alert System
- Multi-channel public alerts across Wireless Emergency Alerts (WEA), EAS sirens, radio, and mobile carriers.
- Web Audio API synthesizer generating genuine dual-tone 853Hz/960Hz emergency broadcast sirens.
- Text-to-Speech (TTS) civilian voice alert simulator.

---

## 🏗️ Technology Stack

- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS (tactical dark ops theme)
  - Lucide React icons
  - React Leaflet & Leaflet with custom SVG tactical markers
- **Backend**:
  - Python FastAPI
  - SQLite database with SQLAlchemy ORM
  - Pydantic v2 schemas
  - NetworkX for high-performance topological graph routing
  - Haversine and perpendicular segment distance algorithms
  - HTTPX / Requests for external OSRM routing

---

## 🚀 Quickstart Guide

### 1. Clone & Set Up Backend

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Build the Frontend (Pre-built in static/dist)

```bash
# If modifying frontend components
cd frontend
npm install
npm run build
cd ..
```

### 3. Run the Unified Application

```bash
# Start FastAPI server (serves API and production React frontend)
./.venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Open your browser at **`http://localhost:8000`**.

---

## 🧭 Application Navigation

| Tab | Purpose |
|---|---|
| **Overview** | Dynamic operational statistics, DEFCON threat panel, regional occupancy gauge, and recent incident feed. |
| **Live Map** | Interactive tactical GIS map with layer toggles, clickable hazard perimeters, and road blockade placement. |
| **Route Planner** | Core hazard avoidance planner: Safe vs Direct vs Bypass comparisons, risk scoring, and turn-by-turn waypoint guidance. |
| **Hazards** | Active incident manager with AI Dispatch NLP Report Parser and manual incident injection. |
| **Shelters** | Shelter directory, real-time bed occupancy adjustments, and resource provisioning. |
| **Emergency Notices** | Public warning bulletins, channel dissemination, and EAS siren simulator. |

---

## 🔒 Simulated Demonstration Disclaimer

*All incidents, coordinates, and civilian alerts displayed in this application are simulated demonstration scenarios for hackathon evaluation and emergency management training. Always confirm official guidance with civil defense authorities.*
