import re

INCIDENT_TAXONOMY = {
    "wildfire": {
        "keywords": ["fire", "wildfire", "bushfire", "blaze", "smoke", "burning", "flames", "brush", "ember"],
        "default_radius": 550,
        "default_severity": 4.5,
        "title_prefix": "Wildfire Alert"
    },
    "flood": {
        "keywords": ["flood", "flooding", "water", "submerged", "overflow", "river", "creek", "surge", "inundated", "washout"],
        "default_radius": 400,
        "default_severity": 4.0,
        "title_prefix": "Flash Flood Inundation"
    },
    "chemical": {
        "keywords": ["chemical", "gas", "spill", "leak", "toxic", "fumes", "hazmat", "chlorine", "corrosive", "ammonia"],
        "default_radius": 350,
        "default_severity": 4.5,
        "title_prefix": "HAZMAT Chemical Leak"
    },
    "blocked_road": {
        "keywords": ["blocked", "closed", "collapsed", "landslide", "debris", "fallen tree", "wires", "impassable", "obstruction"],
        "default_radius": 180,
        "default_severity": 3.0,
        "title_prefix": "Road Corridor Blockage"
    },
    "restricted_exit": {
        "keywords": ["checkpoint", "gridlock", "jammed", "restricted", "bottleneck", "police barricade", "curfew"],
        "default_radius": 200,
        "default_severity": 3.2,
        "title_prefix": "Restricted Evacuation Exit"
    }
}

SEVERITY_MODIFIERS = [
    (r"\b(catastrophic|extreme|out of control|fatal|massive|uncontained|rapidly spreading|emergency)\b", 5.0),
    (r"\b(severe|critical|dangerous|submerged|heavy|fast-moving|zero visibility)\b", 4.5),
    (r"\b(major|high|significant|rising|impassable|urgent)\b", 4.0),
    (r"\b(moderate|growing|partially blocked|hazardous)\b", 3.0),
    (r"\b(minor|small|slow|contained|low risk)\b", 2.0),
]

def parse_incident_report(raw_text: str, preset_locations: list):
    """
    Parses unstructured field reports, 911 dispatches, or emergency radio logs
    into a structured hazard entity.
    """
    text_lower = raw_text.lower()

    # 1. Detect Incident Type
    detected_type = None
    matched_keyword = None
    highest_score = 0

    for inc_type, meta in INCIDENT_TAXONOMY.items():
        score = sum(1 for kw in meta["keywords"] if kw in text_lower)
        if score > highest_score:
            highest_score = score
            detected_type = inc_type
            matched_keyword = next(kw for kw in meta["keywords"] if kw in text_lower)

    if not detected_type:
        detected_type = "blocked_road"
        matched_keyword = "general hazard"

    meta = INCIDENT_TAXONOMY[detected_type]

    # 2. Extract Radius (prefer meters, km, blocks over depth like feet)
    radius = meta["default_radius"]
    radius_match = re.search(r"(\d+)\s*(?:meters?|m\b|km|miles?|blocks?|radius)", text_lower)
    if radius_match:
        val = int(radius_match.group(1))
        unit = radius_match.group(0).lower()
        if "km" in unit:
            radius = min(3000, val * 1000)
        elif "mile" in unit:
            radius = min(3000, int(val * 1609))
        elif "block" in unit:
            radius = max(100, val * 120)
        else:
            radius = min(3000, max(80, val))
    else:
        # Fallback check for feet if explicitly stated as perimeter or radius
        ft_match = re.search(r"(\d+)\s*(?:feet|ft)\s*(?:perimeter|radius|wide|area)", text_lower)
        if ft_match:
            radius = max(100, int(int(ft_match.group(1)) * 0.3048))

    # 3. Detect Severity
    severity = meta["default_severity"]
    for pattern, val in SEVERITY_MODIFIERS:
        if re.search(pattern, text_lower):
            severity = val
            break

    # 4. Match Location to Presets or Landmarks
    matched_location = None
    for loc in preset_locations:
        loc_name_clean = loc["name"].lower()
        if loc_name_clean in text_lower:
            matched_location = loc
            break
        tokens = [t for t in loc_name_clean.split() if len(t) > 3 and t not in ["operations", "command", "post", "sector"]]
        if any(t in text_lower for t in tokens):
            matched_location = loc
            break

    fallback_loc = preset_locations[0] if preset_locations else {
        "name": "Central Sector Coordination Area",
        "lat": 30.7333,
        "lng": 76.7794
    }

    loc_to_use = matched_location or fallback_loc
    confidence = 0.94 if matched_location else 0.70

    # 5. Estimate Affected Population
    pop_match = re.search(r"(\d+)\s*(?:people|residents|citizens|families|homes)", text_lower)
    if pop_match:
        affected_pop = int(pop_match.group(1))
    else:
        affected_pop = int((radius / 100.0) ** 2 * 45 * (severity / 3.0))

    generated_title = f"{meta['title_prefix']} near {loc_to_use['name'].split('(')[0].strip()}"

    return {
        "success": True,
        "parsed_type": detected_type,
        "confidence": confidence,
        "matched_keyword": matched_keyword,
        "suggested_title": generated_title,
        "lat": loc_to_use["lat"],
        "lng": loc_to_use["lng"],
        "location_name": loc_to_use["name"],
        "radius_m": radius,
        "severity": severity,
        "estimated_affected_population": affected_pop,
        "source": "AI Emergency Dispatch NLP Parser",
        "original_text": raw_text,
        "needs_coordinator_confirmation": True,
        "reasoning": f"Identified '{matched_keyword}' indicators with {severity}/5.0 severity level within {radius}m radius."
    }
