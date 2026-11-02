import time
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from .database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # wildfire, flood, chemical, blocked_road, restricted_exit, debris
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    radius_m = Column(Float, default=300.0)
    severity = Column(Float, default=3.0)  # 1.0 (Low) to 5.0 (Extreme)
    status = Column(String(50), default="active")  # active, contained, monitored, cleared
    affected_population = Column(Integer, default=0)
    source = Column(String(100), default="Emergency Services")
    description = Column(Text, default="")
    created_at = Column(Integer, default=lambda: int(time.time()))
    updated_at = Column(Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "lat": self.lat,
            "lng": self.lng,
            "radius_m": self.radius_m,
            "severity": self.severity,
            "status": self.status,
            "affected_population": self.affected_population,
            "source": self.source,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(String(250), default="")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    capacity = Column(Integer, default=200)
    occupancy = Column(Integer, default=0)
    available = Column(Boolean, default=True)
    status = Column(String(50), default="open")  # open, near_capacity, full, closed
    shelter_type = Column(String(100), default="Community Facility")
    supplies = Column(Text, default="[]")  # JSON list
    contact_phone = Column(String(50), default="")
    updated_at = Column(Integer, default=lambda: int(time.time()))

    def to_dict(self):
        try:
            supplies_list = json.loads(self.supplies) if self.supplies else []
        except Exception:
            supplies_list = []
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "lat": self.lat,
            "lng": self.lng,
            "capacity": self.capacity,
            "occupancy": self.occupancy,
            "available": bool(self.available),
            "status": self.status,
            "shelter_type": self.shelter_type,
            "supplies": supplies_list,
            "contact_phone": self.contact_phone,
            "occupancy_rate": round((self.occupancy / self.capacity * 100), 1) if self.capacity > 0 else 0,
            "updated_at": self.updated_at,
        }

class BlockedRoad(Base):
    __tablename__ = "blocked_roads"

    id = Column(Integer, primary_key=True, index=True)
    road_name = Column(String(200), nullable=False)
    lat1 = Column(Float, nullable=False)
    lng1 = Column(Float, nullable=False)
    lat2 = Column(Float, nullable=False)
    lng2 = Column(Float, nullable=False)
    reason = Column(String(200), default="Flooding / Debris Obstruction")
    is_active = Column(Boolean, default=True)
    reported_at = Column(Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            "id": self.id,
            "road_name": self.road_name,
            "lat1": self.lat1,
            "lng1": self.lng1,
            "lat2": self.lat2,
            "lng2": self.lng2,
            "coordinates": [[self.lat1, self.lng1], [self.lat2, self.lng2]],
            "reason": self.reason,
            "is_active": bool(self.is_active),
            "reported_at": self.reported_at,
        }

class EmergencyNotice(Base):
    __tablename__ = "emergency_notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity_level = Column(String(50), default="WARNING")  # CRITICAL_EVACUATION, WARNING, ADVISORY, ALL_CLEAR
    affected_zones = Column(String(200), default="All Sectors")
    channels = Column(String(200), default="Emergency Alert System, Radio, SMS")
    issued_by = Column(String(100), default="Operations Command Center")
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "severity_level": self.severity_level,
            "affected_zones": self.affected_zones,
            "channels": self.channels,
            "issued_by": self.issued_by,
            "is_active": bool(self.is_active),
            "created_at": self.created_at,
        }

class PresetLocation(Base):
    __tablename__ = "preset_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), default="Residential")  # Residential, Commercial, Hospital, School, Hub
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    description = Column(String(250), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "lat": self.lat,
            "lng": self.lng,
            "description": self.description,
        }
