import json
import time
from .database import SessionLocal, engine, Base
from .models import Incident, Shelter, BlockedRoad, EmergencyNotice, PresetLocation

def seed_database(force_reseed=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing_shelters = db.query(Shelter).first()
    if existing_shelters and not force_reseed:
        db.close()
        return

    if force_reseed or existing_shelters:
        db.query(Incident).delete()
        db.query(Shelter).delete()
        db.query(BlockedRoad).delete()
        db.query(EmergencyNotice).delete()
        db.query(PresetLocation).delete()
        db.commit()

    now = int(time.time())

    # 1. Preset Locations
    presets = [
        PresetLocation(
            name="Sector 17 Central Plaza (Operations Command)",
            category="Hub",
            lat=30.7333,
            lng=76.7794,
            description="Central municipal transit square, wide staging ground and main rally point."
        ),
        PresetLocation(
            name="Riverside Residential Enclave",
            category="Residential",
            lat=30.7350,
            lng=76.7860,
            description="High-density residential neighborhood threatened by upstream water surge."
        ),
        PresetLocation(
            name="North Gate Industrial Corridor",
            category="Commercial",
            lat=30.7425,
            lng=76.7760,
            description="Light industrial park and commercial logistics depot."
        ),
        PresetLocation(
            name="Westside Valley Community",
            category="Residential",
            lat=30.7280,
            lng=76.7705,
            description="Suburban residential sector on elevated, safe terrain."
        ),
        PresetLocation(
            name="Pine Ridge Summit",
            category="Hub",
            lat=30.7445,
            lng=76.7880,
            description="Elevated ridgeline overlooking timber forest zone."
        ),
        PresetLocation(
            name="Metropolitan Hospital Annex",
            category="Hospital",
            lat=30.7350,
            lng=76.7725,
            description="Regional emergency medical triage and acute trauma bay."
        ),
        PresetLocation(
            name="South Basin Crossing",
            category="Commercial",
            lat=30.7240,
            lng=76.7810,
            description="Commercial junction near southern flood mitigation canal."
        )
    ]
    db.add_all(presets)

    # 2. Shelters
    shelters = [
        Shelter(
            name="Westside Regional Stadium Complex",
            address="800 Olympic Boulevard, Sector 23",
            lat=30.7260,
            lng=76.7680,
            capacity=950,
            occupancy=195,
            available=True,
            status="open",
            shelter_type="Sports Arena & Triage Pavilion",
            supplies=json.dumps(["Full Trauma Triage Station", "Veterinary Pet Shelter", "Helipad Landing Zone", "Satellite Uplink", "Emergency Rations (30 Days)"]),
            contact_phone="(555) 017-7331",
            updated_at=now - 120
        ),
        Shelter(
            name="Civic Center Grand Auditorium",
            address="1200 Capitol Way, Sector 15",
            lat=30.7255,
            lng=76.7890,
            capacity=600,
            occupancy=545,
            available=True,
            status="near_capacity",
            shelter_type="Municipal Convention Center",
            supplies=json.dumps(["Field Kitchen", "Infant / Child Care Supplies", "ADA Accessible Ramps", "High-Capacity Power"]),
            contact_phone="(555) 014-9920",
            updated_at=now - 240
        ),
        Shelter(
            name="Riverside High Gymnasium",
            address="450 East River Parkway, Sector 19",
            lat=30.7375,
            lng=76.7895,
            capacity=450,
            occupancy=230,
            available=True,
            status="open",
            shelter_type="School Gymnasium & Shelter",
            supplies=json.dumps(["Clean Water Supply", "Emergency Medical Kit", "250 Cots & Blankets", "Backup Diesel Generator"]),
            contact_phone="(555) 019-4821",
            updated_at=now - 420
        ),
        Shelter(
            name="North Valley Academy Shelter",
            address="15 Northgate Road, Sector 12",
            lat=30.7440,
            lng=76.7710,
            capacity=300,
            occupancy=300,
            available=False,
            status="full",
            shelter_type="Secondary School Shelter",
            supplies=json.dumps(["Emergency First Aid", "Drinking Water Reserve"]),
            contact_phone="(555) 012-3304",
            updated_at=now - 1800
        )
    ]
    db.add_all(shelters)

    # 3. Incidents / Hazards
    incidents = [
        Incident(
            title="Pine Ridge Wildfire Front",
            type="wildfire",
            lat=30.7430,
            lng=76.7870,
            radius_m=420.0,
            severity=4.8,
            status="active",
            affected_population=1850,
            source="Fire Recon UAV & Satellite IR",
            description="Active wildfire progressing south-west with rapid timber fuel consumption. Heavy ember cast and zero visibility within 420 meters.",
            created_at=now - 3600,
            updated_at=now - 180
        ),
        Incident(
            title="Lower River Basin Flash Flood",
            type="flood",
            lat=30.7290,
            lng=76.7845,
            radius_m=340.0,
            severity=4.2,
            status="active",
            affected_population=1200,
            source="Hydrological Sensor Station 4B",
            description="Water depth exceeds 4 feet along roadway embankments. Fast current rendering standard vehicles submerged and immobile.",
            created_at=now - 2400,
            updated_at=now - 300
        ),
        Incident(
            title="North Gate Chemical HAZMAT Alert",
            type="chemical",
            lat=30.7440,
            lng=76.7750,
            radius_m=260.0,
            severity=3.6,
            status="contained",
            affected_population=420,
            source="Industrial Sector Hazmat Dispatch",
            description="Commercial transport container ruptured. Non-flammable corrosive gas containment perimeter established with water curtains.",
            created_at=now - 4800,
            updated_at=now - 600
        ),
    ]
    db.add_all(incidents)

    # 4. Blocked Roads
    blocked = [
        BlockedRoad(
            road_name="River Road Bridge Causeway",
            lat1=30.7290,
            lng1=76.7830,
            lat2=30.7290,
            lng2=76.7860,
            reason="Submerged under 4.5ft rapidly flowing floodwaters. Guard rails collapsed.",
            is_active=True,
            reported_at=now - 2200
        ),
        BlockedRoad(
            road_name="East Ridge Highway Exit 4",
            lat1=30.7410,
            lng1=76.7850,
            lat2=30.7425,
            lng2=76.7870,
            reason="Wildfire tree falls and dense smoke zero-visibility corridor.",
            is_active=True,
            reported_at=now - 3100
        ),
        BlockedRoad(
            road_name="North Gate Boulevard Barricade",
            lat1=30.7430,
            lng1=76.7735,
            lat2=30.7445,
            lng2=76.7755,
            reason="HAZMAT decontamination checkpoint and police barricade.",
            is_active=True,
            reported_at=now - 4500
        )
    ]
    db.add_all(blocked)

    # 5. Emergency Notices
    notices = [
        EmergencyNotice(
            title="CRITICAL EVACUATION ORDER: East Ridge & River Basin",
            message="Immediate evacuation required for all civilians east of Central Avenue. Wildfire and flash flood have closed primary bridges. Evacuate WEST toward Westside Regional Stadium Complex. Follow marked green corridors only.",
            severity_level="CRITICAL_EVACUATION",
            affected_zones="Sectors 18, 19, and Lower River Basin",
            channels="Wireless Emergency Alerts (WEA), EAS Siren, Local FM 98.5",
            issued_by="Chief Incident Commander – Regional EOC",
            is_active=True,
            created_at=now - 900
        ),
        EmergencyNotice(
            title="SHELTER CAPACITY ADVISORY: Civic Center Near Full",
            message="Civic Center Auditorium has reached 91% occupancy. Directing all incoming family units to Westside Regional Stadium, which has full medical triage and pet accommodation.",
            severity_level="WARNING",
            affected_zones="Sector 15 & Central Transit Corridor",
            channels="Public Information Officer Portal, Push Notification",
            issued_by="Shelter Logistics Branch",
            is_active=True,
            created_at=now - 1800
        ),
        EmergencyNotice(
            title="TRAFFIC ADVISORY: River Road Bridge Completely Impassable",
            message="Do NOT attempt to cross River Road Causeway. Multiple vehicles stalled. Rescue watercraft units on scene.",
            severity_level="WARNING",
            affected_zones="River Crossing Arterials",
            channels="Emergency Radio, Variable Message Signs",
            issued_by="Highway Patrol Operations",
            is_active=True,
            created_at=now - 3200
        )
    ]
    db.add_all(notices)

    db.commit()
    db.close()
