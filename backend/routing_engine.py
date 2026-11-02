import math
import time
import requests
import networkx as nx

# Default demo center (Sector 17 / Metro Demonstration Basin)
CENTER_LAT = 30.7333
CENTER_LNG = 76.7794

def haversine(p1, p2):
    """Calculate distance in meters between two (lat, lng) tuples."""
    R = 6371000
    lat1, lon1 = math.radians(p1[0]), math.radians(p1[1])
    lat2, lon2 = math.radians(p2[0]), math.radians(p2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def point_to_segment_distance(p, a, b):
    """Perpendicular distance in meters from point p to line segment a-b."""
    lat_scale = 111139.0
    lng_scale = 111139.0 * math.cos(math.radians(p[0]))

    px, py = p[1] * lng_scale, p[0] * lat_scale
    ax, ay = a[1] * lng_scale, a[0] * lat_scale
    bx, by = b[1] * lng_scale, b[0] * lat_scale

    dx = bx - ax
    dy = by - ay
    l2 = dx*dx + dy*dy
    if l2 == 0:
        return math.hypot(px - ax, py - ay)

    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l2))
    proj_x = ax + t * dx
    proj_y = ay + t * dy
    return math.hypot(px - proj_x, py - proj_y)

def calculate_bearing(p1, p2):
    """Calculates bearing between two points in degrees."""
    lat1, lon1 = math.radians(p1[0]), math.radians(p1[1])
    lat2, lon2 = math.radians(p2[0]), math.radians(p2[1])
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
    initial_bearing = math.atan2(x, y)
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360
    return compass_bearing

def bearing_to_direction(deg):
    dirs = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    idx = round(deg / 45.0) % 8
    return dirs[idx]

class EvacRouter:
    def __init__(self, center=(CENTER_LAT, CENTER_LNG)):
        self.center = center
        self.G = nx.Graph()
        self.graph_type = "High-Fidelity Metro Evacuation Network"
        self._build_road_network()

    def _build_road_network(self):
        """Builds a rich, topologically connected road network with arterial expressways,
        parallel secondary boulevards, diagonal bypass avenues, and perimeter loops."""
        G = nx.Graph()
        c_lat, c_lng = self.center

        rows, cols = 13, 13
        lat_step = 0.0018  # ~200m
        lng_step = 0.0022  # ~220m

        grid = {}
        node_id = 0
        for r in range(rows):
            for c in range(cols):
                lat = c_lat + (r - (rows // 2)) * lat_step
                lng = c_lng + (c - (cols // 2)) * lng_step

                is_perimeter = (r in [0, 1, rows - 2, rows - 1]) or (c in [0, 1, cols - 2, cols - 1])
                is_arterial = (r == rows // 2) or (c == cols // 2) or (r == 3) or (r == 9) or (c == 3) or (c == 9)

                if is_arterial:
                    road_name = f"Metro Arterial Corridor {r}-{c}"
                elif is_perimeter:
                    road_name = f"Outer Evacuation Ring {r}-{c}"
                else:
                    road_name = f"Avenue {r} West / Street {c}"

                G.add_node(node_id, lat=lat, lng=lng, name=road_name, is_arterial=is_arterial)
                grid[(r, c)] = node_id
                node_id += 1

        # Add grid edges (East and North)
        for r in range(rows):
            for c in range(cols):
                curr = grid[(r, c)]
                p_curr = (G.nodes[curr]["lat"], G.nodes[curr]["lng"])

                if c < cols - 1:
                    east = grid[(r, c + 1)]
                    p_east = (G.nodes[east]["lat"], G.nodes[east]["lng"])
                    dist = haversine(p_curr, p_east)
                    art = G.nodes[curr]["is_arterial"] and G.nodes[east]["is_arterial"]
                    G.add_edge(curr, east, length=dist, is_arterial=art)

                if r < rows - 1:
                    north = grid[(r + 1, c)]
                    p_north = (G.nodes[north]["lat"], G.nodes[north]["lng"])
                    dist = haversine(p_curr, p_north)
                    art = G.nodes[curr]["is_arterial"] and G.nodes[north]["is_arterial"]
                    G.add_edge(curr, north, length=dist, is_arterial=art)

        # Diagonal perimeter ring shortcuts for smooth detours
        diagonals = [
            ((8, 1), (9, 2)), ((9, 2), (10, 3)), ((10, 3), (11, 4)),
            ((4, 1), (3, 2)), ((3, 2), (2, 3)), ((2, 3), (1, 4)),
            ((8, 11), (9, 10)), ((9, 10), (10, 9)), ((10, 9), (11, 8)),
            ((4, 11), (3, 10)), ((3, 10), (2, 9)), ((2, 9), (1, 8)),
            ((6, 2), (5, 3)), ((6, 4), (5, 5)), ((6, 8), (5, 7)), ((6, 10), (5, 9)),
            ((6, 2), (7, 3)), ((6, 4), (7, 5)), ((6, 8), (7, 7)), ((6, 10), (7, 9)),
        ]
        for (r1, c1), (r2, c2) in diagonals:
            if (r1, c1) in grid and (r2, c2) in grid:
                u, v = grid[(r1, c1)], grid[(r2, c2)]
                dist = haversine(
                    (G.nodes[u]["lat"], G.nodes[u]["lng"]),
                    (G.nodes[v]["lat"], G.nodes[v]["lng"])
                )
                G.add_edge(u, v, length=dist, is_arterial=True)

        self.G = G

    def nearest_node(self, lat, lng):
        best_n = None
        best_d = float("inf")
        target = (lat, lng)
        for n in self.G.nodes:
            d = haversine(target, (self.G.nodes[n]["lat"], self.G.nodes[n]["lng"]))
            if d < best_d:
                best_d = d
                best_n = n
        return best_n

    def edge_key(self, u, v):
        return f"{min(u, v)}-{max(u, v)}"

    def node_pos(self, n):
        return [self.G.nodes[n]["lat"], self.G.nodes[n]["lng"]]

    def evaluate_route_risk(self, route_coords, hazards, blocked_roads):
        """
        Calibrated Independent Risk Scoring Engine (0 to 100):
        Evaluates route geometry against active hazard perimeters and road closures.
        """
        if not route_coords or len(route_coords) < 2:
            return {
                "overall_risk_score": 0,
                "risk_level": "LOW",
                "hazard_intersections": [],
                "min_hazard_distance_m": 5000,
                "blocked_points_encountered": 0,
                "safety_clearance_text": "No route to evaluate.",
                "total_length_m": 0
            }

        total_length_m = 0
        min_distance_to_hazard = float("inf")
        closest_hazard_name = None
        intersected_hazards = []
        intersected_ids = set()
        active_blockades = [b for b in blocked_roads if b.get("is_active", True)]
        encountered_blockades = 0
        max_hazard_severity = 0.0

        total_breach_length_m = 0.0
        total_buffer_length_m = 0.0

        for i in range(len(route_coords) - 1):
            p1 = route_coords[i]
            p2 = route_coords[i + 1]
            seg_len = haversine(p1, p2)
            total_length_m += seg_len

            # Check hazards
            for h in hazards:
                h_pos = (h["lat"], h["lng"])
                radius = h.get("radius_m", 300)
                sev = h.get("severity", 3.0)
                h_id = h.get("id")

                d = point_to_segment_distance(h_pos, p1, p2)
                clearance = max(0.0, d - radius)

                if clearance < min_distance_to_hazard:
                    min_distance_to_hazard = clearance
                    closest_hazard_name = h.get("title", h.get("type", "Hazard"))

                if d <= radius:
                    total_breach_length_m += seg_len
                    max_hazard_severity = max(max_hazard_severity, sev)
                    if h_id not in intersected_ids:
                        intersected_ids.add(h_id)
                        intersected_hazards.append({
                            "id": h_id,
                            "title": h.get("title", h.get("type")),
                            "type": h.get("type"),
                            "severity": sev,
                            "penetration_depth_m": round(radius - d, 1)
                        })
                elif d <= radius * 1.8:
                    total_buffer_length_m += seg_len

            # Check blocked roads (both endpoint proximity and midpoint crossing)
            for b in active_blockades:
                b_p1 = (b["lat1"], b["lng1"])
                b_p2 = (b["lat2"], b["lng2"])
                b_mid = ((b["lat1"] + b["lat2"]) / 2, (b["lng1"] + b["lng2"]) / 2)
                d1 = point_to_segment_distance(b_p1, p1, p2)
                d2 = point_to_segment_distance(b_p2, p1, p2)
                d_mid = point_to_segment_distance(b_mid, p1, p2)
                if min(d1, d2, d_mid) < 55.0:
                    encountered_blockades += 1

        # Calibrate risk score (0 to 100)
        risk = 0.0
        if intersected_hazards:
            base_breach = 48.0 + (len(intersected_hazards) * 16.0) + (max_hazard_severity * 6.0)
            breach_ratio = min(1.0, total_breach_length_m / max(1.0, total_length_m))
            risk += base_breach + (breach_ratio * 20.0)

        if encountered_blockades > 0:
            risk += 35.0 + (encountered_blockades * 15.0)

        if not intersected_hazards and encountered_blockades == 0:
            if min_distance_to_hazard < 120:
                risk = 32.0
            elif min_distance_to_hazard < 320:
                risk = 18.0
            elif min_distance_to_hazard < 600:
                risk = 8.0
            else:
                risk = 2.0

            buffer_ratio = min(1.0, total_buffer_length_m / max(1.0, total_length_m))
            risk += buffer_ratio * 12.0

        risk_score = min(100.0, max(1.0, round(risk, 1)))

        if risk_score <= 25.0:
            risk_level = "LOW"
            clearance_text = f"OPTIMAL SAFETY ENVELOPE: Maintained {round(min_distance_to_hazard)}m clearance from active {closest_hazard_name or 'hazard perimeters'}."
        elif risk_score <= 55.0:
            risk_level = "MODERATE"
            clearance_text = f"CAUTION: Passes within {round(min_distance_to_hazard)}m of {closest_hazard_name or 'incident zone'}. Reduced buffer margin."
        elif risk_score <= 80.0:
            risk_level = "HIGH"
            clearance_text = f"HIGH HAZARD EXPOSURE: Route enters {len(intersected_hazards)} incident perimeter(s) with {encountered_blockades} road closure conflict(s)."
        else:
            risk_level = "CRITICAL"
            breach_names = ", ".join([h["title"] for h in intersected_hazards]) or "active danger zones"
            clearance_text = f"CRITICAL DANGER: Direct route breaches {breach_names}! Mandatory detour required."

        return {
            "overall_risk_score": risk_score,
            "risk_level": risk_level,
            "min_hazard_distance_m": round(min_distance_to_hazard, 1) if min_distance_to_hazard != float("inf") else 5000,
            "hazard_intersections": intersected_hazards,
            "blocked_points_encountered": encountered_blockades,
            "safety_clearance_text": clearance_text,
            "total_length_m": round(total_length_m, 1)
        }

    def generate_waypoints(self, coords, hazards):
        if len(coords) < 2:
            return []

        steps = []
        for i in range(len(coords) - 1):
            p1 = coords[i]
            p2 = coords[i + 1]
            dist = haversine(p1, p2)
            bearing = calculate_bearing(p1, p2)
            cardinal = bearing_to_direction(bearing)

            hazard_warning = None
            for h in hazards:
                d = haversine(p2, (h["lat"], h["lng"]))
                if d < h.get("radius_m", 300) * 1.5:
                    hazard_warning = f"Caution: Passing {round(d)}m from active {h.get('title', h.get('type'))}"
                    break

            if i == 0:
                inst = f"Depart evacuation origin and head {cardinal} along designated safe corridor"
            elif i == len(coords) - 2:
                inst = f"Turn {cardinal} into reception triage gate at destination shelter"
            else:
                inst = f"Proceed {cardinal} via primary cleared arterial corridor"

            steps.append({
                "step_index": i + 1,
                "instruction": inst,
                "direction": cardinal,
                "distance_m": round(dist),
                "eta_sec": max(10, round(dist / (35.0 * 1000 / 3600))),
                "warning": hazard_warning
            })

        return steps

    def plan_evacuation_routes(self, start_lat, start_lng, dest_lat, dest_lng, hazards, blocked_roads):
        s_node = self.nearest_node(start_lat, start_lng)
        t_node = self.nearest_node(dest_lat, dest_lng)
        active_blockades = [b for b in blocked_roads if b.get("is_active", True)]

        # 1. Direct Naive Route (Standard shortest line across network)
        try:
            shortest_path_nodes = nx.shortest_path(self.G, s_node, t_node, weight="length")
            direct_coords = [[start_lat, start_lng]] + [self.node_pos(n) for n in shortest_path_nodes] + [[dest_lat, dest_lng]]
            direct_source = "Local Metro Network (Direct Line)"
        except Exception:
            direct_coords = [[start_lat, start_lng], [dest_lat, dest_lng]]
            direct_source = "Direct Geodesic Line"

        shortest_risk = self.evaluate_route_risk(direct_coords, hazards, blocked_roads)

        # 2. Risk-Aware Safe Graph
        SafeGraph = nx.Graph()
        for u, v, data in self.G.edges(data=True):
            p_u = self.node_pos(u)
            p_v = self.node_pos(v)
            base_len = data["length"]

            # Exclude blocked road edges
            is_blocked = False
            for b in active_blockades:
                b_p1 = (b["lat1"], b["lng1"])
                b_p2 = (b["lat2"], b["lng2"])
                b_mid = ((b["lat1"] + b["lat2"]) / 2, (b["lng1"] + b["lng2"]) / 2)
                d1 = point_to_segment_distance(b_p1, p_u, p_v)
                d2 = point_to_segment_distance(b_p2, p_u, p_v)
                d_mid = point_to_segment_distance(b_mid, p_u, p_v)
                if min(d1, d2, d_mid) < 55.0:
                    is_blocked = True
                    break

            if is_blocked:
                continue

            # Heavy hazard penalties
            hazard_factor = 0.0
            for h in hazards:
                h_pos = (h["lat"], h["lng"])
                radius = h.get("radius_m", 300)
                sev = h.get("severity", 3.0)

                d = point_to_segment_distance(h_pos, p_u, p_v)
                if d <= radius:
                    hazard_factor += 1400.0 * sev
                elif d <= radius * 2.2:
                    proximity = (radius * 2.2 - d) / radius
                    hazard_factor += 45.0 * sev * proximity

            arterial_bonus = 0.85 if data.get("is_arterial", False) else 1.0
            w = base_len * arterial_bonus * (1.0 + hazard_factor)
            SafeGraph.add_edge(u, v, weight=w, length=base_len)

        # Calculate safe path
        has_safe_path = False
        safe_coords = []
        safe_nodes = []
        if s_node in SafeGraph and t_node in SafeGraph and nx.has_path(SafeGraph, s_node, t_node):
            safe_nodes = nx.shortest_path(SafeGraph, s_node, t_node, weight="weight")
            safe_coords = [[start_lat, start_lng]] + [self.node_pos(n) for n in safe_nodes] + [[dest_lat, dest_lng]]
            has_safe_path = True
        else:
            safe_coords = direct_coords
            has_safe_path = False

        safe_risk = self.evaluate_route_risk(safe_coords, hazards, blocked_roads)

        # 3. Alternative Perimeter / Secondary Route
        alt_coords = []
        if has_safe_path and len(safe_nodes) > 4:
            AltGraph = SafeGraph.copy()
            mid_slice = safe_nodes[1 : len(safe_nodes) - 1]
            for u, v in zip(mid_slice, mid_slice[1:]):
                if AltGraph.has_edge(u, v):
                    AltGraph[u][v]["weight"] *= 10.0

            if nx.has_path(AltGraph, s_node, t_node):
                alt_nodes = nx.shortest_path(AltGraph, s_node, t_node, weight="weight")
                alt_coords = [[start_lat, start_lng]] + [self.node_pos(n) for n in alt_nodes] + [[dest_lat, dest_lng]]
            else:
                alt_coords = safe_coords
        else:
            alt_coords = safe_coords

        alt_risk = self.evaluate_route_risk(alt_coords, hazards, blocked_roads)

        # Calculate ETAs at evacuation speeds
        safe_dist_km = safe_risk["total_length_m"] / 1000.0
        direct_dist_km = shortest_risk["total_length_m"] / 1000.0
        alt_dist_km = alt_risk["total_length_m"] / 1000.0

        safe_eta_min = max(2, round((safe_dist_km / 38.0) * 60))
        direct_eta_min = max(2, round((direct_dist_km / 30.0) * 60))
        alt_eta_min = max(3, round((alt_dist_km / 42.0) * 60))

        safe_waypoints = self.generate_waypoints(safe_coords, hazards)

        risk_diff = round(shortest_risk["overall_risk_score"] - safe_risk["overall_risk_score"], 1)
        dist_diff_m = round(safe_risk["total_length_m"] - shortest_risk["total_length_m"])

        # Accurate strategic decision summary
        if risk_diff > 0:
            strategic_summary = (
                f"Recommended Safe Corridor mitigates {risk_diff} points of hazard risk compared to the direct naive route. "
                f"It safely circumvents {shortest_risk['blocked_points_encountered']} interdicted road corridor(s) and {len(shortest_risk['hazard_intersections'])} breached danger zone(s). "
                f"Safety buffer delta: +{max(0, dist_diff_m)}m with an acceptable +{max(0, safe_eta_min - direct_eta_min)} min transit difference."
            )
        elif not has_safe_path:
            strategic_summary = (
                "CRITICAL WARNING: Direct pathways to this facility are completely blocked by disaster perimeters. "
                "Convoy escort or heavy engineering breach support required."
            )
        else:
            strategic_summary = (
                "Both safe and direct pathways remain outside active hazard perimeters. Recommended route follows primary high-capacity arterial."
            )

        return {
            "success": True,
            "has_safe_path": has_safe_path,
            "strategic_summary": strategic_summary,
            "routes": {
                "safe": {
                    "label": "Recommended Safe Evacuation Corridor",
                    "type": "SAFE",
                    "color": "#10b981",
                    "coordinates": safe_coords,
                    "distance_m": safe_risk["total_length_m"],
                    "eta_minutes": safe_eta_min,
                    "risk_score": safe_risk["overall_risk_score"],
                    "risk_level": safe_risk["risk_level"],
                    "min_clearance_m": safe_risk["min_hazard_distance_m"],
                    "hazard_breaches": safe_risk["hazard_intersections"],
                    "blocked_points": safe_risk["blocked_points_encountered"],
                    "clearance_text": safe_risk["safety_clearance_text"],
                    "waypoints": safe_waypoints,
                    "routing_provider": "EvacAI Dynamic Safety Engine"
                },
                "direct": {
                    "label": "Direct Naive Route (Standard GPS)",
                    "type": "DIRECT",
                    "color": "#f59e0b",
                    "coordinates": direct_coords,
                    "distance_m": shortest_risk["total_length_m"],
                    "eta_minutes": direct_eta_min,
                    "risk_score": shortest_risk["overall_risk_score"],
                    "risk_level": shortest_risk["risk_level"],
                    "min_clearance_m": shortest_risk["min_hazard_distance_m"],
                    "hazard_breaches": shortest_risk["hazard_intersections"],
                    "blocked_points": shortest_risk["blocked_points_encountered"],
                    "clearance_text": shortest_risk["safety_clearance_text"],
                    "routing_provider": direct_source
                },
                "alternative": {
                    "label": "Secondary Perimeter Bypass",
                    "type": "ALTERNATIVE",
                    "color": "#3b82f6",
                    "coordinates": alt_coords,
                    "distance_m": alt_risk["total_length_m"],
                    "eta_minutes": alt_eta_min,
                    "risk_score": alt_risk["overall_risk_score"],
                    "risk_level": alt_risk["risk_level"],
                    "min_clearance_m": alt_risk["min_hazard_distance_m"],
                    "hazard_breaches": alt_risk["hazard_intersections"],
                    "blocked_points": alt_risk["blocked_points_encountered"],
                    "clearance_text": alt_risk["safety_clearance_text"],
                    "routing_provider": "EvacAI Regional Perimeter Router"
                }
            }
        }

router_instance = EvacRouter()
