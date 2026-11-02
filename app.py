import os
import time
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db, Base, engine
from backend.models import Incident, Shelter, BlockedRoad, EmergencyNotice, PresetLocation
from backend.seed_data import seed_database
from backend.routing_engine import router_instance, haversine
from backend.nlp_parser import parse_incident_report

# Ensure tables and seed data exist
Base.metadata.create_all(bind=engine)
seed_database(force_reseed=False)

app = FastAPI(
    title="EvacAI API",
    description="Intelligent Evacuation & Safe Route Planner – Don't just alert people. Help them get to safety.",
    version="2.0.0"
)

# CORS setup for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class RoutePlanRequest(BaseModel):
    start_lat: float
    start_lng: float
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    shelter_id: Optional[int] = None
    auto_select_shelter: bool = False

class HazardCreateRequest(BaseModel):
    title: str
    type: str  # wildfire, flood, chemical, blocked_road, restricted_exit, debris
    lat: float
    lng: float
    radius_m: float = 300.0
    severity: float = 3.0
    status: str = "active"
    affected_population: int = 0
    source: str = "Operations Command Dispatch"
    description: str = ""

class HazardUpdateRequest(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_m: Optional[float] = None
    severity: Optional[float] = None
    status: Optional[str] = None
    affected_population: Optional[int] = None
    description: Optional[str] = None

class ShelterCreateRequest(BaseModel):
    name: str
    address: str = ""
    lat: float
    lng: float
    capacity: int = 300
    occupancy: int = 0
    available: bool = True
    status: str = "open"
    shelter_type: str = "Community Facility"
    supplies: List[str] = []
    contact_phone: str = ""

class ShelterUpdateRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    occupancy: Optional[int] = None
    available: Optional[bool] = None
    status: Optional[str] = None
    supplies: Optional[List[str]] = None
    contact_phone: Optional[str] = None

class ShelterOccupancyPatch(BaseModel):
    occupancy: int

class BlockedRoadCreateRequest(BaseModel):
    road_name: str
    lat1: float
    lng1: float
    lat2: float
    lng2: float
    reason: str = "Flooding / Debris Obstruction"
    is_active: bool = True

class ToggleRoadPointRequest(BaseModel):
    lat: float
    lng: float
    road_name: Optional[str] = "Tactical Road Block"
    reason: Optional[str] = "Field Coordinator Checkpoint"

class NoticeCreateRequest(BaseModel):
    title: str
    message: str
    severity_level: str = "WARNING"  # CRITICAL_EVACUATION, WARNING, ADVISORY, ALL_CLEAR
    affected_zones: str = "All Sectors"
    channels: str = "EAS, SMS, Mobile App"
    issued_by: str = "Operations Command Center"

class ReportParseRequest(BaseModel):
    report_text: str

# ----------------- API ENDPOINTS -----------------

@app.get("/api/overview")
def get_overview_dashboard(db: Session = Depends(get_db)):
    """Dynamic operational metrics directly queried from SQLite database."""
    incidents = db.query(Incident).all()
    active_incidents = [i for i in incidents if i.status in ["active", "monitored"]]
    shelters = db.query(Shelter).all()
    blocked_roads = db.query(BlockedRoad).filter(BlockedRoad.is_active == True).all()
    notices = db.query(EmergencyNotice).filter(EmergencyNotice.is_active == True).all()

    available_shelters = [s for s in shelters if s.available and s.status != "closed"]
    unavailable_shelters = [s for s in shelters if not s.available or s.status == "closed"]

    total_capacity = sum(s.capacity for s in shelters)
    total_occupancy = sum(s.occupancy for s in shelters)
    affected_pop = sum(i.affected_population for i in active_incidents)

    # Determine Threat Level
    max_severity = max([i.severity for i in active_incidents], default=0.0)
    if max_severity >= 4.5:
        threat_level = "CRITICAL EVACUATION (LEVEL 1)"
        threat_color = "red"
    elif max_severity >= 3.5:
        threat_level = "HIGH WARNING"
        threat_color = "orange"
    elif max_severity > 0:
        threat_level = "ELEVATED ADVISORY"
        threat_color = "yellow"
    else:
        threat_level = "ALL CLEAR"
        threat_color = "green"

    return {
        "status": "online",
        "timestamp": int(time.time()),
        "threat_level": threat_level,
        "threat_color": threat_color,
        "metrics": {
            "total_active_incidents": len(active_incidents),
            "blocked_roads": len(blocked_roads),
            "available_shelters": len(available_shelters),
            "unavailable_shelters": len(unavailable_shelters),
            "total_shelters": len(shelters),
            "total_capacity": total_capacity,
            "total_occupancy": total_occupancy,
            "overall_occupancy_rate": round((total_occupancy / total_capacity * 100), 1) if total_capacity > 0 else 0,
            "estimated_affected_population": affected_pop,
            "active_evacuation_notices": len(notices),
        },
        "recent_incidents": [i.to_dict() for i in incidents[:6]],
        "shelters_overview": [s.to_dict() for s in shelters],
        "active_notices": [n.to_dict() for n in notices],
        "system_notice": "DEMONSTRATION SIMULATOR ACTIVE · Real-time graph routing with multi-hazard decay analysis."
    }

@app.get("/api/state")
def get_full_state(db: Session = Depends(get_db)):
    """Full operational state for interactive mapping and live layers."""
    incidents = db.query(Incident).all()
    shelters = db.query(Shelter).all()
    blocked_roads = db.query(BlockedRoad).all()
    notices = db.query(EmergencyNotice).all()
    presets = db.query(PresetLocation).all()

    return {
        "center": [router_instance.center[0], router_instance.center[1]],
        "default_zoom": 14,
        "incidents": [i.to_dict() for i in incidents],
        "shelters": [s.to_dict() for s in shelters],
        "blocked_roads": [b.to_dict() for b in blocked_roads],
        "notices": [n.to_dict() for n in notices],
        "presets": [p.to_dict() for p in presets],
        "routing_graph": router_instance.graph_type,
        "simulated_label": "SIMULATED DEMONSTRATION DATA · PINE VALLEY EMERGENCY OPERATIONS CENTER"
    }

@app.post("/api/route/plan")
def plan_route(req: RoutePlanRequest, db: Session = Depends(get_db)):
    """Intelligent safe route planning with hazard avoidance and shelter optimization."""
    incidents = [i.to_dict() for i in db.query(Incident).filter(Incident.status.in_(["active", "monitored"])).all()]
    blocked_roads = [b.to_dict() for b in db.query(BlockedRoad).filter(BlockedRoad.is_active == True).all()]
    shelters = db.query(Shelter).all()

    # Determine destination shelter
    dest_shelter = None
    if req.auto_select_shelter or (not req.dest_lat and not req.shelter_id):
        available = [s for s in shelters if s.available and s.occupancy < s.capacity]
        if not available:
            available = [s for s in shelters if s.available]

        if not available:
            raise HTTPException(400, "No available evacuation shelters found in database.")

        best_score = float("inf")
        best_candidate = available[0]

        for sh in available:
            dist = haversine((req.start_lat, req.start_lng), (sh.lat, sh.lng))
            occ_pct = (sh.occupancy / sh.capacity) * 100 if sh.capacity > 0 else 100
            occ_penalty = (occ_pct / 100.0) * 1500.0

            hazard_prox_penalty = 0.0
            for h in incidents:
                h_dist = haversine((sh.lat, sh.lng), (h["lat"], h["lng"]))
                if h_dist < h["radius_m"] * 2.0:
                    hazard_prox_penalty += (h["radius_m"] * 2.0 - h_dist) * 8.0

            total_cost = dist + occ_penalty + hazard_prox_penalty
            if total_cost < best_score:
                best_score = total_cost
                best_candidate = sh

        dest_shelter = best_candidate
        dest_lat = dest_shelter.lat
        dest_lng = dest_shelter.lng
    elif req.shelter_id:
        dest_shelter = db.query(Shelter).filter(Shelter.id == req.shelter_id).first()
        if not dest_shelter:
            raise HTTPException(404, "Specified shelter ID not found.")
        dest_lat = dest_shelter.lat
        dest_lng = dest_shelter.lng
    else:
        dest_lat = req.dest_lat
        dest_lng = req.dest_lng

    result = router_instance.plan_evacuation_routes(
        req.start_lat, req.start_lng,
        dest_lat, dest_lng,
        incidents, blocked_roads
    )

    result["destination_shelter"] = dest_shelter.to_dict() if dest_shelter else {
        "name": "Target Geographic Coordinates",
        "lat": dest_lat,
        "lng": dest_lng,
        "available": True
    }
    result["origin"] = {"lat": req.start_lat, "lng": req.start_lng}

    return result

# ----------------- HAZARD / INCIDENT CRUD -----------------

@app.get("/api/hazards")
def list_hazards(db: Session = Depends(get_db)):
    return [i.to_dict() for i in db.query(Incident).order_by(Incident.created_at.desc()).all()]

@app.post("/api/hazards")
def create_hazard(req: HazardCreateRequest, db: Session = Depends(get_db)):
    new_inc = Incident(
        title=req.title,
        type=req.type,
        lat=req.lat,
        lng=req.lng,
        radius_m=req.radius_m,
        severity=req.severity,
        status=req.status,
        affected_population=req.affected_population,
        source=req.source,
        description=req.description
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return {"success": True, "incident": new_inc.to_dict()}

@app.put("/api/hazards/{hazard_id}")
def update_hazard(hazard_id: int, req: HazardUpdateRequest, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == hazard_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    for key, val in req.model_dump(exclude_unset=True).items():
        setattr(inc, key, val)
    inc.updated_at = int(time.time())
    db.commit()
    db.refresh(inc)
    return {"success": True, "incident": inc.to_dict()}

@app.delete("/api/hazards/{hazard_id}")
def delete_hazard(hazard_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == hazard_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    db.delete(inc)
    db.commit()
    return {"success": True, "message": "Incident deleted successfully"}

# ----------------- SHELTER CRUD -----------------

@app.get("/api/shelters")
def list_shelters(db: Session = Depends(get_db)):
    return [s.to_dict() for s in db.query(Shelter).all()]

@app.post("/api/shelters")
def create_shelter(req: ShelterCreateRequest, db: Session = Depends(get_db)):
    import json
    new_sh = Shelter(
        name=req.name,
        address=req.address,
        lat=req.lat,
        lng=req.lng,
        capacity=req.capacity,
        occupancy=req.occupancy,
        available=req.available,
        status=req.status,
        shelter_type=req.shelter_type,
        supplies=json.dumps(req.supplies),
        contact_phone=req.contact_phone
    )
    db.add(new_sh)
    db.commit()
    db.refresh(new_sh)
    return {"success": True, "shelter": new_sh.to_dict()}

@app.put("/api/shelters/{shelter_id}")
def update_shelter(shelter_id: int, req: ShelterUpdateRequest, db: Session = Depends(get_db)):
    import json
    sh = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not sh:
        raise HTTPException(404, "Shelter not found")
    for key, val in req.model_dump(exclude_unset=True).items():
        if key == "supplies":
            setattr(sh, key, json.dumps(val))
        else:
            setattr(sh, key, val)
    sh.updated_at = int(time.time())
    db.commit()
    db.refresh(sh)
    return {"success": True, "shelter": sh.to_dict()}

@app.patch("/api/shelters/{shelter_id}/occupancy")
def update_occupancy(shelter_id: int, req: ShelterOccupancyPatch, db: Session = Depends(get_db)):
    sh = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not sh:
        raise HTTPException(404, "Shelter not found")
    sh.occupancy = max(0, min(req.occupancy, sh.capacity * 2))
    if sh.occupancy >= sh.capacity:
        sh.status = "full"
    elif sh.occupancy >= sh.capacity * 0.85:
        sh.status = "near_capacity"
    else:
        sh.status = "open"
    sh.updated_at = int(time.time())
    db.commit()
    return {"success": True, "shelter": sh.to_dict()}

# ----------------- BLOCKED ROADS -----------------

@app.get("/api/roads/blocked")
def list_blocked_roads(db: Session = Depends(get_db)):
    return [b.to_dict() for b in db.query(BlockedRoad).all()]

@app.post("/api/roads/block")
def add_blocked_road(req: BlockedRoadCreateRequest, db: Session = Depends(get_db)):
    blk = BlockedRoad(
        road_name=req.road_name,
        lat1=req.lat1,
        lng1=req.lng1,
        lat2=req.lat2,
        lng2=req.lng2,
        reason=req.reason,
        is_active=req.is_active
    )
    db.add(blk)
    db.commit()
    db.refresh(blk)
    return {"success": True, "blocked_road": blk.to_dict()}

@app.post("/api/roads/toggle-point")
def toggle_point_closure(req: ToggleRoadPointRequest, db: Session = Depends(get_db)):
    """Toggles or creates a blockade near a clicked point on the map."""
    existing = db.query(BlockedRoad).all()
    for b in existing:
        mid_lat = (b.lat1 + b.lat2) / 2
        mid_lng = (b.lng1 + b.lng2) / 2
        if haversine((req.lat, req.lng), (mid_lat, mid_lng)) < 70:
            db.delete(b)
            db.commit()
            return {"success": True, "action": "removed", "road_id": b.id}

    delta = 0.0012
    blk = BlockedRoad(
        road_name=req.road_name or "Tactical Road Block",
        lat1=req.lat,
        lng1=req.lng - delta,
        lat2=req.lat,
        lng2=req.lng + delta,
        reason=req.reason or "Tactical closure placed by Incident Coordinator",
        is_active=True
    )
    db.add(blk)
    db.commit()
    db.refresh(blk)
    return {"success": True, "action": "created", "blocked_road": blk.to_dict()}

@app.delete("/api/roads/block/{road_id}")
def delete_blocked_road(road_id: int, db: Session = Depends(get_db)):
    b = db.query(BlockedRoad).filter(BlockedRoad.id == road_id).first()
    if not b:
        raise HTTPException(404, "Blocked road record not found")
    db.delete(b)
    db.commit()
    return {"success": True, "message": "Road unblocked successfully"}

# ----------------- EMERGENCY NOTICES -----------------

@app.get("/api/notices")
def list_notices(db: Session = Depends(get_db)):
    return [n.to_dict() for n in db.query(EmergencyNotice).order_by(EmergencyNotice.created_at.desc()).all()]

@app.post("/api/notices")
def create_notice(req: NoticeCreateRequest, db: Session = Depends(get_db)):
    new_notice = EmergencyNotice(
        title=req.title,
        message=req.message,
        severity_level=req.severity_level,
        affected_zones=req.affected_zones,
        channels=req.channels,
        issued_by=req.issued_by,
        is_active=True
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return {"success": True, "notice": new_notice.to_dict()}

@app.delete("/api/notices/{notice_id}")
def delete_notice(notice_id: int, db: Session = Depends(get_db)):
    n = db.query(EmergencyNotice).filter(EmergencyNotice.id == notice_id).first()
    if not n:
        raise HTTPException(404, "Notice not found")
    db.delete(n)
    db.commit()
    return {"success": True, "message": "Notice rescinded successfully"}

# ----------------- AI REPORT NLP PARSING -----------------

@app.post("/api/reports/ai-parse")
def parse_field_report(req: ReportParseRequest, db: Session = Depends(get_db)):
    """Parses raw dispatcher / citizen text reports into structured incident entities."""
    presets = [p.to_dict() for p in db.query(PresetLocation).all()]
    result = parse_incident_report(req.report_text, presets)
    return result

# ----------------- SYSTEM CONTROLS -----------------

@app.post("/api/system/reset-demo")
def reset_demo_scenario():
    """Reseeds the database to pristine demonstration scenario state."""
    seed_database(force_reseed=True)
    return {"success": True, "message": "Database reseeded to pristine demonstration state."}

# ----------------- STATIC FRONTEND SERVING -----------------

DIST_DIR = os.path.join(os.path.dirname(__file__), "static", "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
