import random
import json
import sqlite3
import datetime
from pathlib import Path
from app.db.database import get_db_connection, init_db
from app.engine.normalization import generate_land_identity_id

DISTRICTS_DATA = {
    "Bokaro": {
        "anchals": {
            "Chas": ["Bandhdih", "Kura", "Kamas", "Tupkadih", "Pundru", "Chas Khas"],
            "Bermo": ["Phusro", "Bermo Khas", "Jarangdih", "Durgapur", "Angwali", "Bhandaridah"]
        }
    },
    "Ranchi": {
        "anchals": {
            "Kanke": ["Boreya", "Sangkura", "Arsande", "Chutia", "Pithoria", "Husir"],
            "Ormanjhi": ["Dudri", "Irba", "Gagari", "Anandi", "Sadma", "Kuchu"]
        }
    },
    "Dhanbad": {
        "anchals": {
            "Jharia": ["Bhaga", "Tisra", "Jharia Khas", "Lodna", "Bhowra", "Sijua"],
            "Govindpur": ["Govindpur Khas", "Khartanga", "Asanboni", "Neechpur", "Kalipahar", "Barwa"]
        }
    },
    "East Singhbhum": {
        "anchals": {
            "Jamshedpur": ["Kadma", "Sonari", "Jugsalai", "Golmuri", "Mango", "Adityapur"],
            "Ghatshila": ["Ghatshila Khas", "Dhalbhumgarh", "Mouhanda", "Kashida", "Pawa", "Fuldungri"]
        }
    },
    "Hazaribagh": {
        "anchals": {
            "Sadar": ["Pelawal", "Demotand", "Matwari", "Korrah", "Sindoor", "Hurhuru"],
            "Ichak": ["Ichak Khas", "Gobardar", "Kura", "Parijan", "Bara", "Simra"]
        }
    }
}

FIRST_NAMES = ["Ramesh", "Suresh", "Sunil", "Rajesh", "Anita", "Prakash", "Manish", "Deepak", "Binod", "Amit", "Manoj", "Sanjay", "Vikram", "Preeti", "Suman", "Arun", "Pankaj", "Alok"]
LAST_NAMES = ["Mahato", "Singh", "Soren", "Kumar", "Verma", "Sharma", "Prasad", "Munda", "Murmu", "Devi", "Roy", "Yadav", "Tudu", "Hembram", "Orao", "Mishra"]

LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Gair Majarua (Public)", "Forest Boundary"]

def random_person_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_random_polygon(base_lat, base_lng):
    """Generates a realistic 4-point parcel polygon relative to base coordinates."""
    offset_lat = random.uniform(0.001, 0.005)
    offset_lng = random.uniform(0.001, 0.005)
    
    p1 = [base_lng, base_lat]
    p2 = [base_lng + offset_lng, base_lat]
    p3 = [base_lng + offset_lng, base_lat + offset_lat]
    p4 = [base_lng, base_lat + offset_lat]
    p5 = p1 # Close loop
    
    return json.dumps({
        "type": "Polygon",
        "coordinates": [[p1, p2, p3, p4, p5]]
    })

def seed_synthetic_dataset(num_parcels: int = 10000):
    """Seeds synthetic land parcels database with realistic risk distributions."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM land_parcels")
    existing_count = cursor.fetchone()[0]
    if existing_count >= num_parcels:
        print(f"Database already contains {existing_count} land parcels. Skipping seed.")
        conn.close()
        return

    print(f"Seeding synthetic dataset with {num_parcels} land parcels across Jharkhand...")
    
    dist_list = list(DISTRICTS_DATA.keys())
    
    # Base geo coordinates for districts
    GEO_BASES = {
        "Bokaro": (23.6693, 86.1511),
        "Ranchi": (23.3441, 85.3096),
        "Dhanbad": (23.7957, 86.4304),
        "East Singhbhum": (22.8046, 86.2029),
        "Hazaribagh": (23.9925, 85.3637)
    }

    # Prepare batches
    parcels_batch = []
    khatian_batch = []
    register2_batch = []
    mutations_batch = []
    transactions_batch = []
    court_cases_batch = []
    encumbrances_batch = []

    mutation_app_counter = 10001
    deed_counter = 50001
    case_counter = 20001

    # We will explicitly seed specific demo parcels for our pitch story:
    # E.g., Bokaro -> Chas -> Kura -> Khata 125 -> Khesra 450/2
    demo_parcels_created = False

    for i in range(1, num_parcels + 1):
        if i == 1:
            # Explicit demo parcel for SIH pitch
            district = "Bokaro"
            anchal = "Chas"
            mauza = "Kura"
            halka = "Halka 04"
            khata_no = "125"
            khesra_no = "450/2"
            anomaly_type = "DEMO_STORY" # Owner mismatch + pending mutation
        else:
            district = random.choice(dist_list)
            anchals_map = DISTRICTS_DATA[district]["anchals"]
            anchal = random.choice(list(anchals_map.keys()))
            mauza = random.choice(anchals_map[anchal])
            halka = f"Halka 0{random.randint(1, 9)}"
            khata_no = str(random.randint(10, 850))
            khesra_no = f"{random.randint(100, 999)}/{random.randint(1, 5)}"
            
            # Determine anomaly type based on target percentage
            rand_val = random.random()
            if rand_val < 0.70:
                anomaly_type = "CLEAN"
            elif rand_val < 0.80:
                anomaly_type = "R001_OWNER_MISMATCH"
            elif rand_val < 0.85:
                anomaly_type = "R002_AREA_MISMATCH"
            elif rand_val < 0.90:
                anomaly_type = "R004_R005_MUTATION"
            elif rand_val < 0.93:
                anomaly_type = "R006_TRANSACTION_MISMATCH"
            elif rand_val < 0.95:
                anomaly_type = "R007_COURT_DISPUTE"
            else:
                anomaly_type = "MULTI_RISK"

        land_id = generate_land_identity_id(district, anchal, mauza, khata_no, khesra_no)
        area_acre = round(random.uniform(0.20, 5.50), 2)
        land_type = random.choice(LAND_TYPES)
        
        base_lat, base_lng = GEO_BASES[district]
        base_lat += random.uniform(-0.05, 0.05)
        base_lng += random.uniform(-0.05, 0.05)
        
        polygon_json = generate_random_polygon(base_lat, base_lng) if anomaly_type != "R003_NO_MAP" else None

        parcels_batch.append((
            land_id, "Jharkhand", district, anchal, halka, mauza, khata_no, khesra_no, area_acre, land_type, polygon_json
        ))

        original_owner = random_person_name()
        father_name = f"{random_person_name().split()[0]} {original_owner.split()[-1]}"
        
        # Khatian
        khatian_batch.append((
            land_id, original_owner, father_name, "General", khata_no, khesra_no, area_acre, "Sabik Khatian", "1965-04-15"
        ))

        # Register-II & anomalies
        if anomaly_type == "CLEAN":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Record clear"
            ))
        elif anomaly_type == "DEMO_STORY" or anomaly_type == "R001_OWNER_MISMATCH":
            r_owner = random_person_name() # Different owner
            register2_batch.append((
                land_id, r_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Mismatch noted"
            ))
            # Active mutation in demo story
            mutations_batch.append((
                land_id, f"JH-MUT-2026-{mutation_app_counter}", r_owner, r_owner, original_owner, "PENDING", "Revenue Review", "2026-06-10", "2026-08-01", 73, 30, "Pending CO review"
            ))
            mutation_app_counter += 1

        elif anomaly_type == "R002_AREA_MISMATCH":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", round(area_acre + random.uniform(0.2, 0.8), 2), "Area discrepancy"
            ))

        elif anomaly_type == "R004_R005_MUTATION":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Mutation pending"
            ))
            applicant = random_person_name()
            age_days = random.randint(45, 120)
            mutations_batch.append((
                land_id, f"JH-MUT-2026-{mutation_app_counter}", applicant, applicant, original_owner, "PENDING", "Field Verification", "2026-04-15", "2026-05-01", age_days, 30, "SLA exceeded"
            ))
            mutation_app_counter += 1

        elif anomaly_type == "R006_TRANSACTION_MISMATCH":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Unmutated deed"
            ))
            buyer = random_person_name()
            transactions_batch.append((
                land_id, f"DEED-2025-{deed_counter}", "Sale Deed", original_owner, buyer, area_acre, round(area_acre * 800000, 2), "2025-11-20", f"Sub-Registrar Office {district}"
            ))
            deed_counter += 1

        elif anomaly_type == "R007_COURT_DISPUTE":
            register2_batch.append((
                land_id, original_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "PAID", "2025-2026", area_acre, "Dispute pending"
            ))
            petitioner = random_person_name()
            court_cases_batch.append((
                land_id, f"REV-CASE-{case_counter}/2025", f"Revenue Court {district}", "Title & Partition Suit", petitioner, original_owner, "PENDING", 1, "2025-08-14", "Interim stay order granted"
            ))
            case_counter += 1

        else: # MULTI_RISK
            r_owner = random_person_name()
            register2_batch.append((
                land_id, r_owner, f"Vol {random.randint(1,50)}", f"Page {random.randint(10,200)}", "DUE", "2023-2024", round(area_acre + 0.5, 2), "Multiple flags"
            ))
            petitioner = random_person_name()
            court_cases_batch.append((
                land_id, f"CIVIL-CASE-{case_counter}/2024", f"District Civil Court {district}", "Title Injunction", petitioner, original_owner, "PENDING", 1, "2024-11-05", "Stay on transfer"
            ))
            case_counter += 1
            encumbrances_batch.append((
                land_id, "State Bank of India", "Equitable Mortgage", round(area_acre * 600000, 2), "ACTIVE", "2024-02-18"
            ))

    # Bulk execute inserts
    cursor.executemany("""
    INSERT INTO land_parcels (land_identity_id, state, district, anchal, halka, mauza, khata_no, khesra_no, area_acre, land_type, polygon_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, parcels_batch)

    cursor.executemany("""
    INSERT INTO khatian_records (land_identity_id, owner_name, father_husband_name, caste, khata_no, khesra_no, recorded_area_acre, khatian_type, record_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, khatian_batch)

    cursor.executemany("""
    INSERT INTO register2_records (land_identity_id, current_owner_name, volume_no, page_no, lagan_status, last_paid_year, recorded_area_acre, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, register2_batch)

    cursor.executemany("""
    INSERT INTO mutations (land_identity_id, application_no, applicant_name, buyer_name, seller_name, status, current_stage, submitted_at, updated_at, age_days, sla_days, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, mutations_batch)

    cursor.executemany("""
    INSERT INTO transactions (land_identity_id, deed_no, deed_type, seller_name, buyer_name, transacted_area_acre, consideration_amount_inr, registration_date, registration_office)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transactions_batch)

    cursor.executemany("""
    INSERT INTO court_cases (land_identity_id, case_no, court_name, case_type, petitioner, respondent, status, stay_order, filing_date, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, court_cases_batch)

    cursor.executemany("""
    INSERT INTO encumbrances (land_identity_id, bank_institution, mortgage_type, loan_amount_inr, charge_status, registration_date)
    VALUES (?, ?, ?, ?, ?, ?)
    """, encumbrances_batch)

    conn.commit()
    conn.close()
    print(f"Successfully seeded {num_parcels} synthetic land parcels into BhoomiShield database.")

if __name__ == "__main__":
    seed_synthetic_dataset(10000)
