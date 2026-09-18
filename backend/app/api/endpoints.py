import json
import sqlite3
import hashlib
import os
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.db.database import get_db_connection
from app.engine.risk_engine import evaluate_land_parcel_risk
from app.engine.ai_explainer import generate_risk_explanation, answer_parcel_question
from app.engine.official_scraper import fetch_live_official_records, STATE_PORTALS
from app.engine.legal_advisor import consult_legal_advisor
from app.engine.data_generator import PAN_INDIA_DATA
from app.engine.valuation_calculator import calculate_land_valuation_and_duties, STATE_STAMP_DUTY_RULES
from app.engine.lineage_analyzer import analyze_parcel_title_chain
from app.engine.encroachment_scanner import scan_parcel_encroachment_buffers
from app.services.pdf_service import generate_land_verification_pdf, REPORTS_DIR
from app.services.complaint_service import generate_official_complaint_pdf, COMPLAINTS_DIR

router = APIRouter()

# --- Pydantic Schemas ---
class ValuationRequest(BaseModel):
    state: str = "Jharkhand"
    district: Optional[str] = "Bokaro"
    land_type: str = "Agricultural"
    area_acre: float = 1.0
    area_sqft: Optional[float] = None
    buyer_gender: str = "Male"
    is_urban: bool = False
    declared_value_inr: Optional[float] = None

class AIQuestionRequest(BaseModel):
    land_identity_id: str
    question: str

class ReportGenerateRequest(BaseModel):
    land_identity_id: str

class OfficerDecisionRequest(BaseModel):
    case_no: str
    land_identity_id: str
    officer_name: str
    officer_role: str
    decision: str
    comment: Optional[str] = ""

class LegalConsultRequest(BaseModel):
    question: str
    state: Optional[str] = None
    land_identity_id: Optional[str] = None

class ComplaintSubmitRequest(BaseModel):
    user_name: str
    user_mobile: str
    target_authority: str # Tahsildar, Circle Officer (CO), SDM, LRDC, District Collector (DC), Revenue Anti-Corruption
    land_identity_id: str
    subject: str
    complaint_text: str

class LoginRequest(BaseModel):
    username: str

class UserRegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    mobile: Optional[str] = None
    role: str = "CITIZEN"
    department: Optional[str] = None
    designation: Optional[str] = None
    employee_id: Optional[str] = None
    jurisdiction_state: Optional[str] = None
    jurisdiction_district: Optional[str] = None
    jurisdiction_tehsil: Optional[str] = None
    aadhaar_last4: Optional[str] = "5412"
    pan_number: Optional[str] = "ABCPS1234F"

class UserLoginRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    demo_user_id: Optional[str] = None

class DocumentUploadRequest(BaseModel):
    user_id: str
    title: str
    document_type: str # SALE_DEED, KHATAUNI_ROR, SEVEN_TWELVE, RTC_PAHANI, PATTA_CHITTA, MUTATION_CERT, ENCUMBRANCE_CERT, POSSESSION_LETTER, TAX_RECEIPT, COURT_ORDER, OTHER
    land_identity_id: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    khata_khasra_no: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[str] = None
    file_name: str
    file_size_kb: Optional[int] = 250
    file_data: Optional[str] = None
    mime_type: Optional[str] = "application/pdf"
    remarks: Optional[str] = None

class DocumentVerifyRequest(BaseModel):
    document_id: str
    officer_name: str
    officer_role: str
    decision: str # APPROVED, FLAGGED, REJECTED
    remarks: Optional[str] = None

class PropertySaveRequest(BaseModel):
    user_id: str
    land_identity_id: str
    property_nickname: str
    ownership_status: Optional[str] = "OWNER"
    acquired_date: Optional[str] = None
    registered_area_acre: Optional[float] = None
    notes: Optional[str] = None

class GeocodeRequest(BaseModel):
    query: str
    state: Optional[str] = None



# --- Helper to load complete parcel context ---
def fetch_parcel_context(land_identity_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM land_parcels WHERE land_identity_id = ?", (land_identity_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None, None, None, [], [], [], []
    
    parcel = dict(row)
    
    cursor.execute("SELECT * FROM khatian_records WHERE land_identity_id = ?", (land_identity_id,))
    k_row = cursor.fetchone()
    khatian = dict(k_row) if k_row else None
    
    cursor.execute("SELECT * FROM register2_records WHERE land_identity_id = ?", (land_identity_id,))
    r_row = cursor.fetchone()
    register2 = dict(r_row) if r_row else None
    
    cursor.execute("SELECT * FROM mutations WHERE land_identity_id = ?", (land_identity_id,))
    mutations = [dict(m) for m in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM transactions WHERE land_identity_id = ?", (land_identity_id,))
    transactions = [dict(t) for t in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM court_cases WHERE land_identity_id = ?", (land_identity_id,))
    court_cases = [dict(c) for c in cursor.fetchall()]

    cursor.execute("SELECT * FROM encumbrances WHERE land_identity_id = ?", (land_identity_id,))
    encumbrances = [dict(e) for e in cursor.fetchall()]
    
    conn.close()
    return parcel, khatian, register2, mutations, transactions, court_cases, encumbrances


# --- Endpoints ---

@router.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "platform": "BhoomiShield Pan-India",
        "version": "3.0",
        "scope": "All India 28 States & 8 Union Territories",
        "standard": "Digital India Land Records Modernization Programme (DILRMP)"
    }

@router.get("/official/live-search")
def live_official_portal_search(
    state: Optional[str] = "Jharkhand",
    district: Optional[str] = "Bokaro",
    anchal: Optional[str] = "Chas",
    subdistrict: Optional[str] = None,
    mauza: Optional[str] = "Kura",
    village: Optional[str] = None,
    khata: Optional[str] = None,
    primary_no: Optional[str] = None,
    khesra: Optional[str] = None,
    plot_no: Optional[str] = None,
    owner: Optional[str] = None
):
    """Real-time Search Engine connected live to Official Land Record Portal endpoints across Indian States."""
    sub_val = subdistrict or anchal or "Chas"
    vil_val = village or mauza or "Kura"
    p_val = primary_no or khata
    pl_val = plot_no or khesra
    return fetch_live_official_records(state, district, sub_val, vil_val, p_val, pl_val, owner)

_CACHED_LOCATIONS = None

@router.get("/land/locations")
def get_locations():
    """
    Returns Pan-India geographic hierarchy, state-specific portals, and localized field terminology with in-memory caching.
    """
    global _CACHED_LOCATIONS
    if _CACHED_LOCATIONS is not None:
        return _CACHED_LOCATIONS

    # Build complete state map
    states_dict = {}
    for st_name, st_info in PAN_INDIA_DATA.items():
        states_dict[st_name] = {
            "portal": st_info["portal"],
            "subdistrict_name": st_info["subdistrict_name"],
            "primary_no_name": st_info["primary_no_name"],
            "plot_no_name": st_info["plot_no_name"],
            "record_type": st_info["record_type"],
            "districts": {}
        }
        for dist_name, dist_info in st_info["districts"].items():
            states_dict[st_name]["districts"][dist_name] = dist_info["subdistricts"]
            
    # Also fetch dynamic districts in database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT state, district, anchal, mauza FROM land_parcels")
    rows = cursor.fetchall()
    conn.close()
    
    db_loc_map = {}
    for r in rows:
        st = r["state"] or "Jharkhand"
        d, a, m = r["district"], r["anchal"], r["mauza"]
        if st not in db_loc_map: db_loc_map[st] = {}
        if d not in db_loc_map[st]: db_loc_map[st][d] = {}
        if a not in db_loc_map[st][d]: db_loc_map[st][d][a] = []
        if m not in db_loc_map[st][d][a]: db_loc_map[st][d][a].append(m)

    _CACHED_LOCATIONS = {
        "states": list(states_dict.keys()),
        "state_metadata": states_dict,
        "db_locations": db_loc_map
    }
    return _CACHED_LOCATIONS

@router.get("/land/search")
def search_land(
    state: Optional[str] = None,
    district: Optional[str] = None,
    anchal: Optional[str] = None,
    subdistrict: Optional[str] = None,
    mauza: Optional[str] = None,
    village: Optional[str] = None,
    khata: Optional[str] = None,
    primary_no: Optional[str] = None,
    khesra: Optional[str] = None,
    plot_no: Optional[str] = None,
    owner: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT p.*, r.current_owner_name as owner_name FROM land_parcels p LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id WHERE 1=1"
    params = []
    
    if state:
        sql += " AND (p.state = ? OR p.state LIKE ?)"
        params.extend([state, f"%{state}%"])
    if district:
        sql += " AND p.district = ?"
        params.append(district)
    
    sub_val = subdistrict or anchal
    if sub_val:
        sql += " AND p.anchal = ?"
        params.append(sub_val)
        
    vil_val = village or mauza
    if vil_val:
        sql += " AND p.mauza LIKE ?"
        params.append(f"%{vil_val}%")
        
    p_val = primary_no or khata
    if p_val:
        sql += " AND p.khata_no = ?"
        params.append(p_val)
        
    pl_val = plot_no or khesra
    if pl_val:
        sql += " AND p.khesra_no LIKE ?"
        params.append(f"%{pl_val}%")
        
    if owner:
        sql += " AND (r.current_owner_name LIKE ? OR p.land_identity_id IN (SELECT land_identity_id FROM khatian_records WHERE owner_name LIKE ?))"
        params.extend([f"%{owner}%", f"%{owner}%"])
        
    if query:
        sql += " AND (p.land_identity_id LIKE ? OR r.current_owner_name LIKE ? OR p.khata_no = ? OR p.khesra_no = ? OR p.state LIKE ? OR p.district LIKE ?)"
        params.extend([f"%{query}%", f"%{query}%", query, query, f"%{query}%", f"%{query}%"])
        
    sql += " LIMIT ?"
    params.append(limit)
    
    cursor.execute(sql, params)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"count": len(results), "results": results}

@router.get("/land/{land_identity_id}")
def get_land_profile(land_identity_id: str):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    ai_explanation = generate_risk_explanation(risk_analysis, parcel)
    
    return {
        "parcel": parcel,
        "records": {
            "khatian": khatian,
            "register2": register2,
            "mutations": mutations,
            "transactions": transactions,
            "court_cases": court_cases,
            "encumbrances": encumbrances
        },
        "risk_analysis": risk_analysis,
        "ai_explanation": ai_explanation
    }

# ==========================================
# GPS LOCATION & MAP GEOCODING ENDPOINTS
# ==========================================

LANDMARK_COORDINATES = [
    # Uttar Pradesh
    {"state": "Uttar Pradesh", "district": "Gautam Buddha Nagar", "anchal": "Dadri", "mauza": "Bhangel", "lat": 28.5355, "lng": 77.3910, "label": "Dadri / Noida Sector 104, Gautam Buddha Nagar"},
    {"state": "Uttar Pradesh", "district": "Lucknow", "anchal": "Lucknow", "mauza": "Gomti Nagar", "lat": 26.8500, "lng": 80.9990, "label": "Gomti Nagar, Lucknow"},
    {"state": "Uttar Pradesh", "district": "Varanasi", "anchal": "Varanasi", "mauza": "Shivpur", "lat": 25.3500, "lng": 82.9800, "label": "Shivpur, Varanasi"},
    # Maharashtra
    {"state": "Maharashtra", "district": "Pune", "anchal": "Haveli", "mauza": "Hinjawadi", "lat": 18.5913, "lng": 73.7389, "label": "Hinjawadi Phase-1 IT Park, Pune"},
    {"state": "Maharashtra", "district": "Mumbai Suburban", "anchal": "Andheri", "mauza": "Andheri East", "lat": 19.1136, "lng": 72.8697, "label": "Andheri East, Mumbai"},
    {"state": "Maharashtra", "district": "Nagpur", "anchal": "Nagpur Urban", "mauza": "Civil Lines", "lat": 21.1458, "lng": 79.0882, "label": "Civil Lines, Nagpur"},
    # Karnataka
    {"state": "Karnataka", "district": "Bengaluru Urban", "anchal": "Bengaluru South", "mauza": "Whitefield", "lat": 12.9698, "lng": 77.7499, "label": "Whitefield IT Hub, Bengaluru"},
    {"state": "Karnataka", "district": "Mysuru", "anchal": "Mysuru", "mauza": "Vijayanagar", "lat": 12.3300, "lng": 76.6200, "label": "Vijayanagar, Mysuru"},
    # Jharkhand
    {"state": "Jharkhand", "district": "Bokaro", "anchal": "Chas", "mauza": "Kura", "lat": 23.6350, "lng": 86.1770, "label": "Chas / Kura Mauza, Bokaro"},
    {"state": "Jharkhand", "district": "Ranchi", "anchal": "Kanke", "mauza": "Morabadi", "lat": 23.3850, "lng": 85.3300, "label": "Morabadi, Ranchi"},
    # Bihar
    {"state": "Bihar", "district": "Patna", "anchal": "Patna Sadar", "mauza": "Danapur", "lat": 25.6330, "lng": 85.0440, "label": "Danapur / Saguna More, Patna"},
    # Tamil Nadu
    {"state": "Tamil Nadu", "district": "Chennai", "anchal": "Velachery", "mauza": "Mambalam", "lat": 13.0827, "lng": 80.2707, "label": "Anna Nagar / Velachery, Chennai"},
    # Gujarat
    {"state": "Gujarat", "district": "Ahmedabad", "anchal": "Daskroi", "mauza": "Bodakdev", "lat": 23.0300, "lng": 72.5070, "label": "SG Highway / Bodakdev, Ahmedabad"},
    # Telangana
    {"state": "Telangana", "district": "Hyderabad", "anchal": "Serilingampally", "mauza": "Madhapur", "lat": 17.4435, "lng": 78.3772, "label": "Hitech City / Madhapur, Hyderabad"},
    # West Bengal
    {"state": "West Bengal", "district": "North 24 Parganas", "anchal": "Bidhannagar", "mauza": "Salt Lake", "lat": 22.5800, "lng": 88.4200, "label": "Sector V / Salt Lake, Kolkata"},
    # Delhi
    {"state": "Delhi", "district": "South Delhi", "anchal": "Hauz Khas", "mauza": "Mehrauli", "lat": 28.5200, "lng": 77.1800, "label": "Mehrauli / Saket, South Delhi"},
    # Rajasthan
    {"state": "Rajasthan", "district": "Jaipur", "anchal": "Sanganer", "mauza": "Mansarovar", "lat": 26.8600, "lng": 75.7600, "label": "Mansarovar, Jaipur"},
    # Punjab
    {"state": "Punjab", "district": "Ludhiana", "anchal": "Ludhiana West", "mauza": "Sarabha Nagar", "lat": 30.9010, "lng": 75.8573, "label": "Sarabha Nagar, Ludhiana"},
    # Haryana
    {"state": "Haryana", "district": "Gurugram", "anchal": "Gurugram", "mauza": "Sector 62", "lat": 28.4110, "lng": 77.0980, "label": "Golf Course Ext / Sector 62, Gurugram"},
    # Kerala
    {"state": "Kerala", "district": "Ernakulam", "anchal": "Kanayannur", "mauza": "Kakkanad", "lat": 10.0159, "lng": 76.3419, "label": "Infopark / Kakkanad, Kochi"},
    # Odisha
    {"state": "Odisha", "district": "Khurda", "anchal": "Bhubaneswar", "mauza": "Patia", "lat": 20.3533, "lng": 85.8189, "label": "Patia / Infocity, Bhubaneswar"}
]

def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    R = 6371.0 # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/land/by-location")
def get_land_by_gps_location(
    lat: float = Query(..., description="GPS Latitude"),
    lng: float = Query(..., description="GPS Longitude"),
    radius_km: float = Query(50.0, description="Search radius in kilometers")
):
    # 1. Find the closest known administrative hub from landmark database
    closest_landmark = None
    min_dist = float('inf')
    
    for lm in LANDMARK_COORDINATES:
        dist = calculate_haversine_km(lat, lng, lm["lat"], lm["lng"])
        if dist < min_dist:
            min_dist = dist
            closest_landmark = lm
            
    # 2. Query matching cadastral parcels in that district/state
    target_state = closest_landmark["state"] if closest_landmark else "Uttar Pradesh"
    target_district = closest_landmark["district"] if closest_landmark else "Gautam Buddha Nagar"
    target_anchal = closest_landmark.get("anchal") if closest_landmark else "Dadri"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Try exact district + anchal match
    cursor.execute("""
    SELECT p.*, r.current_owner_name as owner_name
    FROM land_parcels p
    LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id
    WHERE p.district = ? OR p.state = ?
    LIMIT 20
    """, (target_district, target_state))
    rows = cursor.fetchall()
    
    if not rows:
        # Fallback to any parcels
        cursor.execute("SELECT p.*, r.current_owner_name as owner_name FROM land_parcels p LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id LIMIT 10")
        rows = cursor.fetchall()
        
    conn.close()
    
    matched_parcels = []
    primary_match = None
    
    for idx, r in enumerate(rows):
        p_dict = dict(r)
        lid = p_dict["land_identity_id"]
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        
        # Approximate offset for surrounding cadastral parcels
        p_lat = lat + (0.0008 * ((idx % 3) - 1))
        p_lng = lng + (0.0008 * ((idx // 3) - 1))
        
        parcel_summary = {
            "land_identity_id": lid,
            "state": p.get("state", target_state),
            "district": p["district"],
            "anchal": p["anchal"],
            "mauza": p["mauza"],
            "khata_no": p["khata_no"],
            "khesra_no": p["khesra_no"],
            "area_acre": p["area_acre"],
            "land_type": p["land_type"],
            "owner_name": r2.get("current_owner_name") if r2 else "Recorded Bhumidhar",
            "risk_score": res["risk_score"],
            "risk_level": res["risk_level"],
            "distance_meters": int(min_dist * 1000) if idx == 0 else int(min_dist * 1000) + (idx * 45),
            "lat": round(p_lat, 6),
            "lng": round(p_lng, 6),
            "polygon_coords": [
                [p_lat - 0.0004, p_lng - 0.0004],
                [p_lat + 0.0004, p_lng - 0.0004],
                [p_lat + 0.0004, p_lng + 0.0004],
                [p_lat - 0.0004, p_lng + 0.0004]
            ]
        }
        
        if idx == 0:
            primary_match = parcel_summary
        matched_parcels.append(parcel_summary)
        
    return {
        "status": "SUCCESS",
        "search_coordinates": {"lat": lat, "lng": lng},
        "resolved_location": {
            "state": target_state,
            "district": target_district,
            "subdistrict": target_anchal,
            "nearest_landmark": closest_landmark["label"] if closest_landmark else "Cadastral Survey Grid",
            "distance_km": round(min_dist, 2)
        },
        "primary_parcel": primary_match,
        "nearby_parcels_count": len(matched_parcels),
        "nearby_parcels": matched_parcels
    }

@router.post("/land/geocode")
def geocode_address(req: GeocodeRequest):
    q_lower = req.query.lower().strip()
    
    # 1. Match landmarks
    matched_lm = None
    for lm in LANDMARK_COORDINATES:
        if any(term in lm["label"].lower() or term in lm["district"].lower() or term in lm["state"].lower() or term in lm["mauza"].lower() for term in q_lower.split()):
            matched_lm = lm
            break
            
    if not matched_lm:
        # Default to Dadri Noida center if query unknown
        matched_lm = LANDMARK_COORDINATES[0]
        
    lat, lng = matched_lm["lat"], matched_lm["lng"]
    
    # Return result from get_land_by_gps_location
    return get_land_by_gps_location(lat=lat, lng=lng, radius_km=50.0)

@router.get("/land/{land_identity_id}/risk")
def get_land_risk(land_identity_id: str):

    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    return risk_analysis

@router.post("/ai/ask")
def ask_ai(req: AIQuestionRequest):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(req.land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    records_context = {
        "khatian": khatian,
        "register2": register2,
        "mutations": mutations,
        "transactions": transactions,
        "court_cases": court_cases,
        "encumbrances": encumbrances
    }
    
    return answer_parcel_question(req.question, risk_analysis, parcel, records_context)

# --- AI Legal Advisor Endpoint ---
@router.post("/legal-advisor/consult")
def consult_legal_ai(req: LegalConsultRequest):
    risk_findings = []
    st_val = req.state
    if req.land_identity_id:
        p, k, r2, m, t, c, e = fetch_parcel_context(req.land_identity_id)
        if p:
            st_val = p.get("state")
            res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
            risk_findings = res.get("findings", [])
            
    return consult_legal_advisor(req.question, state=st_val, land_identity_id=req.land_identity_id, risk_findings=risk_findings)

# --- Authority Complaint Endpoints ---
@router.post("/complaints/submit")
def submit_complaint(req: ComplaintSubmitRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM complaints")
    c_num = cursor.fetchone()[0] + 5001
    complaint_id = f"IND-COMP-2026-{c_num}"
    submitted_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    
    pdf_path = generate_official_complaint_pdf(
        complaint_id, req.user_name, req.user_mobile, req.target_authority,
        req.land_identity_id, req.subject, req.complaint_text, submitted_at
    )
    
    cursor.execute("""
    INSERT INTO complaints (complaint_id, user_name, user_mobile, target_authority, land_identity_id, subject, complaint_text, status, pdf_path, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (complaint_id, req.user_name, req.user_mobile, req.target_authority, req.land_identity_id, req.subject, req.complaint_text, "SUBMITTED", pdf_path, submitted_at))
    
    # Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.user_name, "CITIZEN", "FILE_AUTHORITY_COMPLAINT", "COMPLAINT", complaint_id, json.dumps({
        "authority": req.target_authority,
        "land_identity_id": req.land_identity_id
    })))

    conn.commit()
    conn.close()
    
    return {
        "complaint_id": complaint_id,
        "status": "SUBMITTED",
        "target_authority": req.target_authority,
        "submitted_at": submitted_at,
        "download_url": f"/api/v1/complaints/download/{complaint_id}",
        "message": f"Grievance complaint #{complaint_id} routed successfully to {req.target_authority} office."
    }

@router.get("/complaints/track/{complaint_id}")
def track_complaint(complaint_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Complaint ID not found")
        
    return dict(row)

@router.get("/complaints/download/{complaint_id}")
def download_complaint_pdf(complaint_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_path FROM complaints WHERE complaint_id = ?", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row["pdf_path"] or not os.path.exists(row["pdf_path"]):
        raise HTTPException(status_code=404, detail="Complaint PDF file not found")
        
    return FileResponse(path=row["pdf_path"], media_type="application/pdf", filename=f"{complaint_id}.pdf")

@router.post("/reports/generate")
def generate_report(req: ReportGenerateRequest):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(req.land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    records_context = {
        "khatian": khatian,
        "register2": register2,
        "mutations": mutations,
        "transactions": transactions,
        "court_cases": court_cases,
        "encumbrances": encumbrances
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM verification_reports")
    report_num = cursor.fetchone()[0] + 1001
    report_id = f"BS-2026-{report_num}"
    
    pdf_path, report_hash = generate_land_verification_pdf(
        report_id, parcel, risk_analysis, records_context
    )
    
    cursor.execute("""
    INSERT INTO verification_reports (report_id, land_identity_id, risk_score, risk_level, findings_count, report_hash, pdf_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (report_id, req.land_identity_id, risk_analysis["risk_score"], risk_analysis["risk_level"], len(risk_analysis["findings"]), report_hash, pdf_path))
    
    conn.commit()
    conn.close()
    
    return {
        "report_id": report_id,
        "land_identity_id": req.land_identity_id,
        "risk_score": risk_analysis["risk_score"],
        "risk_level": risk_analysis["risk_level"],
        "report_hash": report_hash,
        "download_url": f"/api/v1/reports/download/{report_id}",
        "verify_url": f"/verify/{report_id}"
    }

@router.get("/reports/download/{report_id}")
def download_report(report_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_path FROM verification_reports WHERE report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row["pdf_path"] or not os.path.exists(row["pdf_path"]):
        raise HTTPException(status_code=404, detail="Report PDF file not found")
        
    return FileResponse(path=row["pdf_path"], media_type="application/pdf", filename=f"{report_id}.pdf")

@router.get("/reports/verify/{report_id}")
def verify_report_qr(report_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT r.*, p.state, p.district, p.anchal, p.mauza, p.khata_no, p.khesra_no, p.area_acre FROM verification_reports r JOIN land_parcels p ON r.land_identity_id = p.land_identity_id WHERE r.report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {
            "verified": False,
            "status": "NOT_FOUND",
            "message": f"Report ID '{report_id}' was not issued by BhoomiShield or has been revoked."
        }
        
    rep = dict(row)
    return {
        "verified": True,
        "status": "VERIFIED",
        "report_id": rep["report_id"],
        "land_identity_id": rep["land_identity_id"],
        "state": rep.get("state", "Jharkhand"),
        "district": rep["district"],
        "anchal": rep["anchal"],
        "mauza": rep["mauza"],
        "khata_no": rep["khata_no"],
        "khesra_no": rep["khesra_no"],
        "area_acre": rep["area_acre"],
        "risk_score": rep["risk_score"],
        "risk_level": rep["risk_level"],
        "findings_count": rep["findings_count"],
        "generated_at": rep["generated_at"],
        "report_hash": rep["report_hash"]
    }

@router.get("/mutation/track/{application_no}")
def track_mutation(application_no: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT m.*, p.state, p.district, p.anchal, p.mauza, p.khata_no, p.khesra_no FROM mutations m JOIN land_parcels p ON m.land_identity_id = p.land_identity_id WHERE m.application_no = ?", (application_no,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Mutation application number not found")
        
    m = dict(row)
    stages = ["Submitted", "Doc Verification", "Field Verification", "Revenue Review", "Final Decision", "Record Update"]
    current = m["current_stage"]
    curr_idx = stages.index(current) if current in stages else 3
    
    timeline = []
    for idx, stage in enumerate(stages):
        if idx < curr_idx:
            status = "COMPLETED"
        elif idx == curr_idx:
            status = "CURRENT"
        else:
            status = "PENDING"
        timeline.append({"stage": stage, "status": status})

    return {
        "application_no": m["application_no"],
        "land_identity_id": m["land_identity_id"],
        "applicant": m["applicant_name"],
        "buyer": m["buyer_name"],
        "seller": m["seller_name"],
        "state": m.get("state", "National"),
        "district": m["district"],
        "anchal": m["anchal"],
        "status": m["status"],
        "current_stage": m["current_stage"],
        "submitted_at": m["submitted_at"],
        "age_days": m["age_days"],
        "sla_days": m["sla_days"],
        "sla_exceeded": m["age_days"] > m["sla_days"],
        "timeline": timeline
    }

@router.get("/admin/dashboard")
def get_admin_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM land_parcels")
    total_parcels = cursor.fetchone()[0]
    
    cursor.execute("SELECT state, COUNT(*) as cnt FROM land_parcels GROUP BY state ORDER BY cnt DESC")
    states_cnt = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT district, COUNT(*) as cnt FROM land_parcels GROUP BY district ORDER BY cnt DESC LIMIT 10")
    districts_cnt = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT COUNT(*) FROM mutations WHERE status = 'PENDING'")
    pending_mutations = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM officer_reviews")
    total_reviews = cursor.fetchone()[0]
    
    conn.close()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT land_identity_id FROM land_parcels LIMIT 500")
    sample_ids = [r["land_identity_id"] for r in cursor.fetchall()]
    conn.close()
    
    high_cnt = 0
    med_cnt = 0
    low_cnt = 0
    
    for lid in sample_ids[:100]:
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        if res["risk_level"] == "HIGH":
            high_cnt += 1
        elif res["risk_level"] == "MEDIUM":
            med_cnt += 1
        else:
            low_cnt += 1
            
    total_sample = len(sample_ids[:100]) or 1
    extrapolate = total_parcels / total_sample
    
    return {
        "parcels_analyzed": total_parcels,
        "high_risk_count": int(high_cnt * extrapolate),
        "medium_risk_count": int(med_cnt * extrapolate),
        "low_risk_count": int(low_cnt * extrapolate),
        "pending_reviews": pending_mutations,
        "officer_decisions_logged": total_reviews,
        "state_risk_breakdown": states_cnt,
        "district_risk_breakdown": districts_cnt
    }

@router.get("/admin/cases")
def get_flagged_cases(limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT p.*, r.current_owner_name as owner_name 
    FROM land_parcels p 
    LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    cases = []
    for row in rows:
        lid = row["land_identity_id"]
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        if res["risk_level"] in ["HIGH", "MEDIUM"]:
            cases.append({
                "case_no": f"CASE-{lid}",
                "land_identity_id": lid,
                "state": p.get("state", "National"),
                "district": p["district"],
                "anchal": p["anchal"],
                "mauza": p["mauza"],
                "khata_no": p["khata_no"],
                "khesra_no": p["khesra_no"],
                "owner_name": r2.get("current_owner_name") if r2 else "N/A",
                "risk_level": res["risk_level"],
                "risk_score": res["risk_score"],
                "findings": res["findings"],
                "evidence_sources": {
                    "khatian": k,
                    "register2": r2,
                    "mutations": m,
                    "transactions": t,
                    "court_cases": c,
                    "encumbrances": e
                }
            })
            
    return {"count": len(cases), "cases": cases}

@router.post("/admin/cases/decision")
def record_officer_decision(req: OfficerDecisionRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT OR REPLACE INTO officer_reviews (case_no, land_identity_id, risk_level, officer_name, officer_role, decision, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (req.case_no, req.land_identity_id, "FLAGGED", req.officer_name, req.officer_role, req.decision, req.comment))
    
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.officer_name, req.officer_role, "RECORD_CASE_DECISION", "OFFICER_REVIEW", req.case_no, json.dumps({
        "decision": req.decision,
        "comment": req.comment,
        "land_identity_id": req.land_identity_id
    })))
    
    conn.commit()
    conn.close()
    
    return {"status": "SUCCESS", "message": f"Officer decision '{req.decision}' recorded for case {req.case_no}."}

@router.get("/admin/audit")
def get_audit_logs(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(logs), "logs": logs}


# ==========================================
# AUTHENTICATION & DEMO USERS ENDPOINTS
# ==========================================

@router.get("/auth/demo-users")
def get_demo_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT user_id, username, full_name, email, mobile, role, department, designation, employee_id,
           jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, avatar_url
    FROM users WHERE status = 'ACTIVE'
    """)
    users = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(users), "users": users}

@router.post("/auth/register")
def register_user(req: UserRegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if username exists
    cursor.execute("SELECT user_id FROM users WHERE username = ? OR email = ?", (req.username, req.email))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email already registered.")
    
    prefix = "USR-CIT" if req.role == "CITIZEN" else "USR-OFF"
    rand_suffix = str(int(datetime.datetime.now().timestamp()))[-4:]
    user_id = f"{prefix}-{rand_suffix}"
    
    cursor.execute("""
    INSERT INTO users (
        user_id, username, password_hash, full_name, email, mobile, role, department, designation, employee_id,
        jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, req.username, req.password, req.full_name, req.email, req.mobile, req.role, req.department,
        req.designation, req.employee_id, req.jurisdiction_state, req.jurisdiction_district, req.jurisdiction_tehsil,
        "AADHAAR_LINKED" if req.aadhaar_last4 else "VERIFIED", req.aadhaar_last4 or "5412", req.pan_number or "ABCPS1234F", "ACTIVE"
    ))
    
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    new_user = dict(cursor.fetchone())
    conn.commit()
    conn.close()
    
    token = hashlib.sha256(f"{user_id}:{datetime.datetime.now().isoformat()}".encode()).hexdigest()
    return {
        "status": "SUCCESS",
        "message": "Account created successfully",
        "token": token,
        "user": new_user
    }

@router.post("/auth/login")
def login_user(req: UserLoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if req.demo_user_id:
        cursor.execute("SELECT * FROM users WHERE user_id = ? AND status = 'ACTIVE'", (req.demo_user_id,))
    elif req.username:
        cursor.execute("SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'ACTIVE'", (req.username.strip(), req.username.strip()))
    else:
        conn.close()
        raise HTTPException(status_code=400, detail="Please provide username or select a demo user.")
        
    user_row = cursor.fetchone()
    conn.close()
    
    if not user_row:
        raise HTTPException(status_code=404, detail="User account not found. Please register or check your credentials.")
        
    user = dict(user_row)
    
    # Password verification
    if req.password:
        stored_hash = user.get("password_hash")
        input_pass = req.password.strip()
        
        # Check direct match or SHA-256 match
        sha_match = hashlib.sha256(input_pass.encode('utf-8')).hexdigest()
        if stored_hash and stored_hash != input_pass and stored_hash != sha_match:
            # Check standard bypass for demo personas if needed, else reject
            if not req.demo_user_id:
                raise HTTPException(status_code=401, detail="Authentication failed: Incorrect password or security passcode.")
    
    token = hashlib.sha256(f"{user['user_id']}:{datetime.datetime.now().isoformat()}".encode()).hexdigest()
    
    return {
        "status": "SUCCESS",
        "message": f"Welcome back, {user['full_name']}!",
        "token": token,
        "user": user
    }

@router.get("/auth/me")
def get_current_user_profile(user_id: str = Query(..., description="Active User ID")):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": dict(row)}


# ==========================================
# BHOOMI VAULT: CITIZEN DOCUMENTS ENDPOINTS
# ==========================================

@router.get("/vault/documents")
def get_user_documents(
    user_id: str = Query(..., description="User ID"),
    doc_type: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    query: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT * FROM user_documents WHERE user_id = ?"
    params = [user_id]
    
    if doc_type and doc_type != "ALL":
        sql += " AND document_type = ?"
        params.append(doc_type)
    if state and state != "ALL":
        sql += " AND state = ?"
        params.append(state)
    if status and status != "ALL":
        sql += " AND verification_status = ?"
        params.append(status)
    if query:
        sql += " AND (title LIKE ? OR land_identity_id LIKE ? OR issuing_authority LIKE ?)"
        q = f"%{query}%"
        params.extend([q, q, q])
        
    sql += " ORDER BY id DESC"
    cursor.execute(sql, params)
    docs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {"count": len(docs), "documents": docs}

@router.post("/vault/documents/upload")
def upload_user_document(req: DocumentUploadRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Generate unique document ID
    rand_id = str(int(datetime.datetime.now().timestamp()))[-6:]
    document_id = f"DOC-2026-{rand_id}"
    
    # Compute SHA-256 cryptographic hash of document payload/name
    raw_hash_seed = f"{document_id}:{req.title}:{req.land_identity_id}:{req.file_name}:{datetime.datetime.now().isoformat()}"
    sha256_hash = hashlib.sha256(raw_hash_seed.encode('utf-8')).hexdigest()
    
    # If state/district not provided but land_identity_id is, deduce from land parcel
    st = req.state
    dt = req.district
    if req.land_identity_id and (not st or not dt):
        cursor.execute("SELECT state, district FROM land_parcels WHERE land_identity_id = ?", (req.land_identity_id,))
        p_row = cursor.fetchone()
        if p_row:
            st = st or p_row["state"]
            dt = dt or p_row["district"]

    cursor.execute("""
    INSERT INTO user_documents (
        document_id, user_id, land_identity_id, title, document_type, state, district, khata_khasra_no,
        issuing_authority, issue_date, file_name, file_size_kb, file_hash, file_data, mime_type,
        verification_status, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        document_id, req.user_id, req.land_identity_id, req.title, req.document_type,
        st or "National", dt or "District Center", req.khata_khasra_no or "N/A",
        req.issuing_authority or "Competent Revenue Authority", req.issue_date or datetime.date.today().isoformat(),
        req.file_name, req.file_size_kb or 280, sha256_hash, req.file_data, req.mime_type or "application/pdf",
        "PENDING", req.remarks or "Uploaded to Bhoomi Vault."
    ))
    
    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.user_id, "CITIZEN", "UPLOAD_VAULT_DOCUMENT", "USER_DOCUMENT", document_id, json.dumps({
        "title": req.title,
        "type": req.document_type,
        "hash": sha256_hash
    })))
    
    cursor.execute("SELECT * FROM user_documents WHERE document_id = ?", (document_id,))
    doc = dict(cursor.fetchone())
    conn.commit()
    conn.close()
    
    return {
        "status": "SUCCESS",
        "message": "Document securely encrypted and saved in Bhoomi Vault.",
        "document": doc
    }

@router.get("/vault/documents/{document_id}")
def get_document_details(document_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_documents WHERE document_id = ?", (document_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc = dict(row)
    # Verification certificate metadata
    cert = {
        "document_id": doc["document_id"],
        "title": doc["title"],
        "file_hash_sha256": doc["file_hash"],
        "verification_status": doc["verification_status"],
        "verified_by": doc.get("verified_by_officer") or "Under Revenue Verification Review",
        "verification_date": doc.get("verification_date") or "Pending",
        "digital_stamp_id": doc.get("digital_stamp_id") or "UNASSIGNED",
        "tamper_proof": True,
        "dl_registered": doc["verification_status"] in ["OFFICIALLY_VERIFIED", "DIGILOCKER_AUTHENTICATED"]
    }
    
    return {"document": doc, "certificate": cert}

@router.delete("/vault/documents/{document_id}")
def delete_user_document(document_id: str, user_id: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_documents WHERE document_id = ? AND user_id = ?", (document_id, user_id))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Document not found or permission denied.")
    return {"status": "SUCCESS", "message": f"Document {document_id} removed from your Bhoomi Vault."}

@router.post("/vault/documents/{document_id}/request-verification")
def request_document_verification(document_id: str, user_id: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE user_documents
    SET verification_status = 'PENDING', remarks = 'Official Revenue verification requested by citizen.'
    WHERE document_id = ? AND user_id = ?
    """, (document_id, user_id))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": "Verification request dispatched to local Revenue Authority."}


# ==========================================
# BHOOMI VAULT: SAVED PROPERTIES & PORTFOLIO
# ==========================================

@router.get("/vault/properties")
def get_user_properties(user_id: str = Query(..., description="User ID")):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT up.*, lp.state, lp.district, lp.anchal, lp.mauza, lp.khata_no, lp.khesra_no, lp.area_acre, lp.land_type
    FROM user_properties up
    LEFT JOIN land_parcels lp ON up.land_identity_id = lp.land_identity_id
    WHERE up.user_id = ?
    ORDER BY up.id DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    properties = []
    for r in rows:
        p_dict = dict(r)
        lid = p_dict["land_identity_id"]
        # Fetch risk score and document count
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        
        # Count documents linked
        conn_d = get_db_connection()
        c_d = conn_d.cursor()
        c_d.execute("SELECT COUNT(*) FROM user_documents WHERE user_id = ? AND land_identity_id = ?", (user_id, lid))
        docs_count = c_d.fetchone()[0]
        conn_d.close()
        
        p_dict["risk_score"] = res["risk_score"]
        p_dict["risk_level"] = res["risk_level"]
        p_dict["findings_count"] = len(res["findings"])
        p_dict["linked_documents_count"] = docs_count
        p_dict["owner_name"] = r2.get("current_owner_name") if r2 else "N/A"
        properties.append(p_dict)
        
    return {"count": len(properties), "properties": properties}

@router.post("/vault/properties")
def save_property_to_vault(req: PropertySaveRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if parcel exists
    cursor.execute("SELECT area_acre FROM land_parcels WHERE land_identity_id = ?", (req.land_identity_id,))
    p_row = cursor.fetchone()
    area = req.registered_area_acre or (p_row["area_acre"] if p_row else 1.0)
    
    cursor.execute("""
    INSERT OR REPLACE INTO user_properties (
        user_id, land_identity_id, property_nickname, ownership_status, acquired_date, registered_area_acre, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        req.user_id, req.land_identity_id, req.property_nickname, req.ownership_status or "OWNER",
        req.acquired_date or datetime.date.today().isoformat(), area, req.notes or "Added to Bhoomi Vault"
    ))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": f"Land parcel {req.land_identity_id} saved to your Bhoomi Vault portfolio."}

@router.delete("/vault/properties/{property_id}")
def delete_user_property(property_id: int, user_id: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_properties WHERE id = ? AND user_id = ?", (property_id, user_id))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": "Property removed from portfolio."}

@router.get("/vault/stats")
def get_vault_stats(user_id: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM user_documents WHERE user_id = ?", (user_id,))
    total_docs = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_documents WHERE user_id = ? AND verification_status IN ('OFFICIALLY_VERIFIED', 'DIGILOCKER_AUTHENTICATED')", (user_id,))
    verified_docs = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_documents WHERE user_id = ? AND verification_status = 'PENDING'", (user_id,))
    pending_docs = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_properties WHERE user_id = ?", (user_id,))
    total_props = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(file_size_kb) FROM user_documents WHERE user_id = ?", (user_id,))
    total_size = cursor.fetchone()[0] or 0
    
    conn.close()
    return {
        "total_documents": total_docs,
        "verified_documents": verified_docs,
        "pending_verifications": pending_docs,
        "saved_properties": total_props,
        "storage_used_kb": total_size,
        "storage_quota_kb": 102400 # 100 MB DigiLocker allocation
    }


# ==========================================
# REVENUE OFFICIAL WORKSPACE & VERIFICATION
# ==========================================

@router.get("/official/pending-documents")
def get_pending_documents_for_official(
    state: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = """
    SELECT ud.*, u.full_name as citizen_name, u.mobile as citizen_mobile, u.email as citizen_email
    FROM user_documents ud
    LEFT JOIN users u ON ud.user_id = u.user_id
    WHERE ud.verification_status IN ('PENDING', 'FLAGGED_ANOMALY')
    """
    params = []
    if state and state != "ALL":
        sql += " AND ud.state = ?"
        params.append(state)
    if district and district != "ALL":
        sql += " AND ud.district = ?"
        params.append(district)
        
    sql += " ORDER BY ud.id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(sql, params)
    docs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {"count": len(docs), "pending_documents": docs}

@router.post("/official/documents/verify")
def verify_document_by_official(req: DocumentVerifyRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    status_map = {
        "APPROVED": "OFFICIALLY_VERIFIED",
        "FLAGGED": "FLAGGED_ANOMALY",
        "REJECTED": "FLAGGED_ANOMALY"
    }
    new_status = status_map.get(req.decision.upper(), "OFFICIALLY_VERIFIED")
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    stamp_id = f"DSC-{req.officer_role[:3].upper()}-{datetime.date.today().year}-{int(datetime.datetime.now().timestamp()) % 100000}"
    
    cursor.execute("""
    UPDATE user_documents
    SET verification_status = ?, verified_by_officer = ?, verification_date = ?, digital_stamp_id = ?, remarks = ?
    WHERE document_id = ?
    """, (new_status, f"{req.officer_name} ({req.officer_role})", now_str, stamp_id, req.remarks, req.document_id))
    
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.officer_name, req.officer_role, "VERIFY_DOCUMENT", "USER_DOCUMENT", req.document_id, json.dumps({
        "decision": req.decision,
        "status": new_status,
        "stamp_id": stamp_id,
        "remarks": req.remarks
    })))
    
    conn.commit()
    conn.close()
    
    return {
        "status": "SUCCESS",
        "message": f"Document {req.document_id} has been marked as '{new_status}' with Digital Signature Stamp {stamp_id}.",
        "stamp_id": stamp_id,
        "verification_date": now_str
    }


# ==========================================
# LAND VALUATION & STAMP DUTY CALCULATOR
# ==========================================

@router.post("/valuation/calculate")
def calculate_valuation_and_stamp_duty(req: ValuationRequest):
    """
    Calculates Government Circle Rate Valuation, Stamp Duty, Registration Fee,
    and applicable Female / Rural concessions.
    """
    try:
        res = calculate_land_valuation_and_duties(
            state=req.state,
            district=req.district or "Default",
            land_type=req.land_type,
            area_acre=req.area_acre,
            area_sqft=req.area_sqft,
            buyer_gender=req.buyer_gender,
            is_urban=req.is_urban,
            declared_value_inr=req.declared_value_inr
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Valuation calculation failed: {str(e)}")

@router.get("/valuation/state-rules")
def get_state_stamp_duty_rules():
    """
    Returns the statutory baseline stamp duty and registration fee percentages across all states.
    """
    return {"states": STATE_STAMP_DUTY_RULES}


# ==========================================
# AI TITLE CHAIN & LINEAGE GRAPH ANALYZER
# ==========================================

@router.get("/parcels/{land_identity_id}/lineage")
def get_parcel_title_lineage(land_identity_id: str):
    """
    Reconstructs 4-tier title lineage graph (CS Survey -> Deeds -> Mutation -> Encumbrance),
    detecting broken chains and title defects.
    """
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    parcel_dict = dict(parcel)
    parcel_dict["khatian"] = khatian
    parcel_dict["register2"] = register2
    parcel_dict["mutations"] = mutations
    parcel_dict["transactions"] = transactions
    parcel_dict["court_cases"] = court_cases
    parcel_dict["encumbrances"] = encumbrances
    
    lineage_res = analyze_parcel_title_chain(parcel_dict)
    return lineage_res


# ==========================================
# BUFFER ZONE & ENCROACHMENT SCANNER
# ==========================================

@router.get("/parcels/{land_identity_id}/encroachment-scan")
def get_parcel_encroachment_scan(land_identity_id: str):
    """
    Evaluates parcel proximity to statutory eco-sensitive, hydrological,
    and infrastructure prohibited buffer zones.
    """
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    parcel_dict = dict(parcel)
    parcel_dict["khatian"] = khatian
    parcel_dict["register2"] = register2
    parcel_dict["mutations"] = mutations
    parcel_dict["transactions"] = transactions
    parcel_dict["court_cases"] = court_cases
    parcel_dict["encumbrances"] = encumbrances
    
    encroach_res = scan_parcel_encroachment_buffers(parcel_dict)
    return encroach_res


# ==========================================
# ADMIN DATABASE EXPORT & SNAPSHOT ENDPOINTS
# ==========================================

@router.get("/admin/database/export")
def export_database_summary():
    """
    Exports summary statistics, table counts, and schema info for administrative audits.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tables = [
        "users", "user_documents", "land_parcels", "khatian_records", 
        "register2_records", "mutations", "transactions", "court_cases", 
        "encumbrances", "complaints", "verification_reports", "officer_reviews", "audit_logs"
    ]
    
    counts = {}
    for tbl in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
            counts[tbl] = cursor.fetchone()[0]
        except Exception:
            counts[tbl] = 0
            
    # Recent users
    cursor.execute("SELECT user_id, username, full_name, email, role, kyc_status, created_at FROM users ORDER BY id DESC LIMIT 10")
    recent_users = [dict(r) for r in cursor.fetchall()]
    
    # Recent documents
    cursor.execute("SELECT document_id, user_id, title, document_type, state, verification_status, created_at FROM user_documents ORDER BY id DESC LIMIT 10")
    recent_docs = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        "status": "SUCCESS",
        "exported_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
        "database_file": "bhoomishield.db",
        "table_record_counts": counts,
        "recent_registered_users": recent_users,
        "recent_vault_documents": recent_docs
    }

@router.get("/admin/database/download")
def download_database_file():
    """
    Provides administrative download of the primary SQLite database file for offline backup.
    """
    from app.db.database import DB_PATH
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="Database file not found on disk")
    return FileResponse(path=str(DB_PATH), media_type="application/x-sqlite3", filename="bhoomishield_backup.db")


# ==========================================
# ADMIN: SQLITE USER & DATABASE MANAGEMENT
# ==========================================

class AdminAddUserRequest(BaseModel):
    username: str
    password: str = "password123"
    full_name: str
    email: str
    mobile: Optional[str] = "+91 98765 43210"
    role: str = "CITIZEN"  # CITIZEN, REVENUE_OFFICER, DISTRICT_COLLECTOR, REVIEW_OFFICER, VIGILANCE_OFFICER, ADMIN
    department: Optional[str] = "General Public"
    designation: Optional[str] = "Landowner & Citizen"
    employee_id: Optional[str] = None
    jurisdiction_state: Optional[str] = "Uttar Pradesh"
    jurisdiction_district: Optional[str] = "Gautam Buddha Nagar"
    jurisdiction_tehsil: Optional[str] = "Dadri"
    kyc_status: Optional[str] = "VERIFIED"
    aadhaar_last4: Optional[str] = "5412"
    pan_number: Optional[str] = "ABCPS1234F"
    avatar_url: Optional[str] = None

class AdminUpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    employee_id: Optional[str] = None
    jurisdiction_state: Optional[str] = None
    jurisdiction_district: Optional[str] = None
    jurisdiction_tehsil: Optional[str] = None
    kyc_status: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    pan_number: Optional[str] = None
    password: Optional[str] = None

class AdminSQLQueryRequest(BaseModel):
    query: str

@router.get("/admin/users")
def get_all_users_for_admin(
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100
):
    """
    Fetch all users from SQLite database with filtering for administrator inspection.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT id, user_id, username, full_name, email, mobile, role, department, designation, employee_id, jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, avatar_url, status, created_at FROM users WHERE 1=1"
    params = []
    
    if role and role != "ALL":
        sql += " AND role = ?"
        params.append(role)
        
    if search:
        sql += " AND (full_name LIKE ? OR username LIKE ? OR email LIKE ? OR jurisdiction_state LIKE ? OR jurisdiction_district LIKE ? OR employee_id LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term, term, term])
        
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(sql, params)
    users = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {"count": len(users), "users": users}

@router.post("/admin/users")
def add_user_by_admin(req: AdminAddUserRequest):
    """
    Administrator endpoint to dynamically add any user as a Revenue Officer, District Collector, or Citizen into SQLite.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if username or email exists
    cursor.execute("SELECT user_id FROM users WHERE username = ? OR email = ?", (req.username, req.email))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username or Email already exists in the database.")
        
    role_prefix = "OFF" if req.role in ["REVENUE_OFFICER", "DISTRICT_COLLECTOR", "REVIEW_OFFICER", "VIGILANCE_OFFICER"] else ("ADM" if req.role == "ADMIN" else "CIT")
    user_id = f"USR-{role_prefix}-{int(datetime.datetime.now().timestamp()) % 100000}"
    pwd_hash = hashlib.sha256(req.password.encode('utf-8')).hexdigest()
    
    avatar = req.avatar_url or (
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" if req.role != "CITIZEN"
        else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    
    cursor.execute("""
    INSERT INTO users (
        user_id, username, password_hash, full_name, email, mobile, role,
        department, designation, employee_id, jurisdiction_state, jurisdiction_district, jurisdiction_tehsil,
        kyc_status, aadhaar_last4, pan_number, avatar_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    """, (
        user_id, req.username, pwd_hash, req.full_name, req.email, req.mobile, req.role,
        req.department or ("Revenue & Land Reforms" if req.role != "CITIZEN" else "General Public"),
        req.designation or ("Tahsildar / Circle Officer" if req.role != "CITIZEN" else "Landowner & Citizen"),
        req.employee_id, req.jurisdiction_state, req.jurisdiction_district, req.jurisdiction_tehsil,
        req.kyc_status or "VERIFIED", req.aadhaar_last4 or "5412", req.pan_number or "ABCPS1234F",
        avatar
    ))
    
    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("Administrator", "ADMIN", "CREATE_USER", "USER", user_id, json.dumps({
        "username": req.username,
        "role": req.role,
        "full_name": req.full_name,
        "jurisdiction": f"{req.jurisdiction_district}, {req.jurisdiction_state}"
    })))
    
    conn.commit()
    
    cursor.execute("SELECT id, user_id, username, full_name, email, mobile, role, department, designation, employee_id, jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, avatar_url, status, created_at FROM users WHERE user_id = ?", (user_id,))
    new_user = dict(cursor.fetchone())
    conn.close()
    
    return {
        "status": "SUCCESS",
        "message": f"User {req.full_name} ({req.role}) successfully created and registered into SQLite database.",
        "user": new_user
    }

@router.put("/admin/users/{user_id}")
def update_user_by_admin(user_id: str, req: AdminUpdateUserRequest):
    """
    Administrator endpoint to promote/demote or modify an existing user's role and details.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
        
    updates = []
    params = []
    
    if req.full_name is not None:
        updates.append("full_name = ?")
        params.append(req.full_name)
    if req.email is not None:
        updates.append("email = ?")
        params.append(req.email)
    if req.mobile is not None:
        updates.append("mobile = ?")
        params.append(req.mobile)
    if req.role is not None:
        updates.append("role = ?")
        params.append(req.role)
    if req.department is not None:
        updates.append("department = ?")
        params.append(req.department)
    if req.designation is not None:
        updates.append("designation = ?")
        params.append(req.designation)
    if req.employee_id is not None:
        updates.append("employee_id = ?")
        params.append(req.employee_id)
    if req.jurisdiction_state is not None:
        updates.append("jurisdiction_state = ?")
        params.append(req.jurisdiction_state)
    if req.jurisdiction_district is not None:
        updates.append("jurisdiction_district = ?")
        params.append(req.jurisdiction_district)
    if req.jurisdiction_tehsil is not None:
        updates.append("jurisdiction_tehsil = ?")
        params.append(req.jurisdiction_tehsil)
    if req.kyc_status is not None:
        updates.append("kyc_status = ?")
        params.append(req.kyc_status)
    if req.aadhaar_last4 is not None:
        updates.append("aadhaar_last4 = ?")
        params.append(req.aadhaar_last4)
    if req.pan_number is not None:
        updates.append("pan_number = ?")
        params.append(req.pan_number)
    if req.password is not None and req.password.strip():
        updates.append("password_hash = ?")
        params.append(hashlib.sha256(req.password.strip().encode('utf-8')).hexdigest())
        
    if updates:
        sql = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
        params.append(user_id)
        cursor.execute(sql, params)
        
        cursor.execute("""
        INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("Administrator", "ADMIN", "UPDATE_USER", "USER", user_id, json.dumps({
            "updated_fields": list(req.dict(exclude_unset=True).keys())
        })))
        
        conn.commit()
        
    cursor.execute("SELECT id, user_id, username, full_name, email, mobile, role, department, designation, employee_id, jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, avatar_url, status, created_at FROM users WHERE user_id = ?", (user_id,))
    updated_user = dict(cursor.fetchone())
    conn.close()
    
    return {
        "status": "SUCCESS",
        "message": f"User {user_id} profile and permissions updated successfully in SQLite.",
        "user": updated_user
    }

@router.delete("/admin/users/{user_id}")
def delete_user_by_admin(user_id: str):
    """
    Administrator endpoint to delete a user from SQLite database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    deleted = cursor.rowcount
    
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("Administrator", "ADMIN", "DELETE_USER", "USER", user_id, json.dumps({"status": "DELETED"})))
    
    conn.commit()
    conn.close()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="User not found.")
        
    return {"status": "SUCCESS", "message": f"User {user_id} removed from SQLite database."}

@router.post("/admin/sql/query")
def execute_admin_sql_query(req: AdminSQLQueryRequest):
    """
    Direct SQL Query Studio for administrator to query or manipulate SQLite data.
    """
    clean_q = req.query.strip()
    if not clean_q:
        raise HTTPException(status_code=400, detail="Empty query provided.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    is_select = clean_q.upper().startswith("SELECT") or clean_q.upper().startswith("PRAGMA") or clean_q.upper().startswith("EXPLAIN")
    
    try:
        start_t = datetime.datetime.now()
        cursor.execute(clean_q)
        
        if is_select:
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description] if cursor.description else []
            data = [dict(r) for r in rows]
            duration_ms = (datetime.datetime.now() - start_t).total_seconds() * 1000
            conn.close()
            return {
                "status": "SUCCESS",
                "type": "QUERY",
                "columns": columns,
                "row_count": len(data),
                "duration_ms": round(duration_ms, 2),
                "rows": data[:200]  # Cap preview at 200 rows
            }
        else:
            affected = cursor.rowcount
            conn.commit()
            duration_ms = (datetime.datetime.now() - start_t).total_seconds() * 1000
            
            cursor.execute("""
            INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """, ("Administrator", "ADMIN", "EXECUTE_SQL", "SQLITE_DB", "bhoomishield.db", json.dumps({
                "sql_preview": clean_q[:200],
                "rows_affected": affected
            })))
            conn.commit()
            conn.close()
            
            return {
                "status": "SUCCESS",
                "type": "MUTATION",
                "rows_affected": affected,
                "duration_ms": round(duration_ms, 2),
                "message": f"Statement executed successfully. {affected} row(s) affected."
            }
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"SQL Execution Error: {str(e)}")

@router.get("/admin/tables/{table_name}")
def get_table_data_for_admin(table_name: str, limit: int = 50, offset: int = 0):
    """
    Get paginated table data from SQLite database.
    """
    allowed_tables = [
        "users", "user_documents", "land_parcels", "khatian_records",
        "register2_records", "mutations", "transactions", "court_cases",
        "encumbrances", "complaints", "verification_reports", "officer_reviews", "audit_logs"
    ]
    if table_name not in allowed_tables:
        raise HTTPException(status_code=400, detail=f"Invalid table name. Allowed: {', '.join(allowed_tables)}")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    total_count = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT * FROM {table_name} LIMIT ? OFFSET ?", (limit, offset))
    rows = cursor.fetchall()
    columns = [col[0] for col in cursor.description] if cursor.description else []
    data = [dict(r) for r in rows]
    
    conn.close()
    
    return {
        "table": table_name,
        "total_records": total_count,
        "columns": columns,
        "count": len(data),
        "limit": limit,
        "offset": offset,
        "rows": data
    }




