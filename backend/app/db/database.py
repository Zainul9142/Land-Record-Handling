import sqlite3
import os
import json
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "bhoomishield.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Parcels Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS land_parcels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT UNIQUE NOT NULL,
        state TEXT DEFAULT 'Jharkhand',
        district TEXT NOT NULL,
        anchal TEXT NOT NULL,
        halka TEXT NOT NULL,
        mauza TEXT NOT NULL,
        khata_no TEXT NOT NULL,
        khesra_no TEXT NOT NULL,
        area_acre REAL NOT NULL,
        land_type TEXT NOT NULL,
        polygon_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Khatian Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS khatian_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        father_husband_name TEXT,
        caste TEXT,
        khata_no TEXT NOT NULL,
        khesra_no TEXT NOT NULL,
        recorded_area_acre REAL NOT NULL,
        khatian_type TEXT DEFAULT 'Sabik',
        record_date TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Register-II Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS register2_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        current_owner_name TEXT NOT NULL,
        volume_no TEXT,
        page_no TEXT,
        lagan_status TEXT DEFAULT 'PAID',
        last_paid_year TEXT DEFAULT '2025-2026',
        recorded_area_acre REAL NOT NULL,
        remarks TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Mutation Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mutations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        application_no TEXT UNIQUE NOT NULL,
        applicant_name TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        seller_name TEXT NOT NULL,
        status TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        submitted_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        age_days INTEGER NOT NULL,
        sla_days INTEGER DEFAULT 30,
        remarks TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        deed_no TEXT NOT NULL,
        deed_type TEXT DEFAULT 'Sale Deed',
        seller_name TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        transacted_area_acre REAL NOT NULL,
        consideration_amount_inr REAL NOT NULL,
        registration_date TEXT NOT NULL,
        registration_office TEXT NOT NULL,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Court Cases Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS court_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        case_no TEXT NOT NULL,
        court_name TEXT NOT NULL,
        case_type TEXT NOT NULL,
        petitioner TEXT NOT NULL,
        respondent TEXT NOT NULL,
        status TEXT NOT NULL,
        stay_order INTEGER DEFAULT 0,
        filing_date TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Encumbrances Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encumbrances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        bank_institution TEXT NOT NULL,
        mortgage_type TEXT DEFAULT 'Equitable Mortgage',
        loan_amount_inr REAL NOT NULL,
        charge_status TEXT NOT NULL,
        registration_date TEXT NOT NULL,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Risk Findings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        rule_id TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        score_contribution INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_json TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Land Verification Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verification_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE NOT NULL,
        land_identity_id TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        findings_count INTEGER NOT NULL,
        report_hash TEXT NOT NULL,
        pdf_path TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Officer Reviews Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS officer_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_no TEXT UNIQUE NOT NULL,
        land_identity_id TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        officer_name TEXT NOT NULL,
        officer_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        comment TEXT,
        reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Authority Complaints Table (NEW)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        user_name TEXT NOT NULL,
        user_mobile TEXT NOT NULL,
        target_authority TEXT NOT NULL, -- Circle Officer (CO), LRDC, District Collector (DC), Revenue Anti-Corruption
        land_identity_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        complaint_text TEXT NOT NULL,
        status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, ASSIGNED, UNDER_INVESTIGATION, RESOLVED
        pdf_path TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # System Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details_json TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Enhanced Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT,
        role TEXT NOT NULL DEFAULT 'CITIZEN', -- CITIZEN, REVENUE_OFFICER, REVIEW_OFFICER, DISTRICT_COLLECTOR, VIGILANCE_OFFICER, ADMIN
        department TEXT,
        designation TEXT,
        employee_id TEXT,
        jurisdiction_state TEXT,
        jurisdiction_district TEXT,
        jurisdiction_tehsil TEXT,
        kyc_status TEXT DEFAULT 'VERIFIED', -- PENDING, VERIFIED, AADHAAR_LINKED
        aadhaar_last4 TEXT DEFAULT '5412',
        pan_number TEXT DEFAULT 'ABCDE1234F',
        avatar_url TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # User Bhoomi Vault - Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        land_identity_id TEXT,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL, -- SALE_DEED, KHATAUNI_ROR, SEVEN_TWELVE, RTC_PAHANI, PATTA_CHITTA, MUTATION_CERT, ENCUMBRANCE_CERT, POSSESSION_LETTER, TAX_RECEIPT, COURT_ORDER, OTHER
        state TEXT,
        district TEXT,
        khata_khasra_no TEXT,
        issuing_authority TEXT,
        issue_date TEXT,
        file_name TEXT NOT NULL,
        file_size_kb INTEGER DEFAULT 250,
        file_hash TEXT NOT NULL,
        file_data TEXT,
        mime_type TEXT DEFAULT 'application/pdf',
        verification_status TEXT DEFAULT 'PENDING', -- PENDING, OFFICIALLY_VERIFIED, FLAGGED_ANOMALY, DIGILOCKER_AUTHENTICATED
        verified_by_officer TEXT,
        verification_date TEXT,
        digital_stamp_id TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    # User Bhoomi Vault - Saved / Owned Land Properties Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        land_identity_id TEXT NOT NULL,
        property_nickname TEXT NOT NULL,
        ownership_status TEXT DEFAULT 'OWNER', -- OWNER, BUYER_INQUIRY, FAMILY_INHERITANCE, WATCHLIST
        acquired_date TEXT,
        registered_area_acre REAL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    conn.commit()
    seed_auth_and_vault_data(conn)
    conn.close()

def seed_auth_and_vault_data(conn):
    cursor = conn.cursor()
    
    # Check if default demo users exist
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    
    # Pre-defined Demo Accounts
    demo_users = [
        # Citizens
        (
            "USR-CIT-1001", "ramesh.sharma", "demo123", "Ramesh Kumar Sharma", "ramesh.sharma@bhoomi.nic.in",
            "+91 98765 43210", "CITIZEN", "General Public", "Landowner & Farmer", None,
            "Uttar Pradesh", "Gautam Buddha Nagar", "Dadri", "AADHAAR_LINKED", "5412", "ABCPS1234F",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", "ACTIVE"
        ),
        (
            "USR-CIT-1002", "sunita.patel", "demo123", "Sunita Patel", "sunita.patel@bhoomi.nic.in",
            "+91 98111 22334", "CITIZEN", "General Public", "Property Investor", None,
            "Maharashtra", "Pune", "Haveli", "AADHAAR_LINKED", "8921", "BHYPP4567K",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", "ACTIVE"
        ),
        # Revenue Officials
        (
            "USR-OFF-2001", "rajesh.tehsildar", "demo123", "Rajesh Verma (Tahsildar)", "rajesh.verma@rev.up.gov.in",
            "+91 94150 11223", "REVENUE_OFFICER", "Revenue & Land Reforms Department", "Tahsildar / Circle Executive", "UP-REV-8492",
            "Uttar Pradesh", "Gautam Buddha Nagar", "Dadri", "VERIFIED", "1098", "GOVUP9988D",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", "ACTIVE"
        ),
        (
            "USR-OFF-2002", "priya.collector", "demo123", "Dr. Priya Nair, IAS", "priya.nair@ias.gov.in",
            "+91 99887 76655", "DISTRICT_COLLECTOR", "District Administration & Land Revenue", "District Magistrate & Collector", "IAS-KA-2014-92",
            "Karnataka", "Bengaluru Urban", "Bengaluru South", "VERIFIED", "7712", "GOVIAS7711N",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", "ACTIVE"
        ),
        (
            "USR-OFF-2003", "anand.subregistrar", "demo123", "Anand Deshmukh (Sub-Registrar)", "anand.deshmukh@igrmaharashtra.gov.in",
            "+91 98220 33445", "REVENUE_OFFICER", "Registration & Stamps Department", "Joint Sub-Registrar Class-I", "MH-IGR-3041",
            "Maharashtra", "Pune", "Haveli", "VERIFIED", "4432", "GOVMH3344P",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", "ACTIVE"
        )
    ]

    for u in demo_users:
        cursor.execute("""
        INSERT OR REPLACE INTO users (
            user_id, username, password_hash, full_name, email, mobile, role, department, designation, employee_id,
            jurisdiction_state, jurisdiction_district, jurisdiction_tehsil, kyc_status, aadhaar_last4, pan_number, avatar_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, u)

    # Pre-seed User Documents for Ramesh Sharma & Sunita Patel
    cursor.execute("SELECT COUNT(*) FROM user_documents")
    doc_count = cursor.fetchone()[0]
    if doc_count == 0:
        demo_docs = [
            (
                "DOC-2026-98101", "USR-CIT-1001", "UP-GAU-DAD-BHAN-P340-PL112-1",
                "Registered Sale Deed - Bhangel Plot 112/1", "SALE_DEED", "Uttar Pradesh", "Gautam Buddha Nagar",
                "340 / 112-1", "Sub-Registrar Office, Dadri", "2023-04-18", "SaleDeed_Bhangel_Plot112.pdf", 480,
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", None, "application/pdf",
                "OFFICIALLY_VERIFIED", "Rajesh Verma (Tahsildar)", "2024-01-15 11:30:00", "DSC-UP-2024-88412",
                "Verified against Book-1 Volume 412 Page 89 at Dadri SRO. Free of encumbrance."
            ),
            (
                "DOC-2026-98102", "USR-CIT-1001", "UP-GAU-DAD-BHAN-P340-PL112-1",
                "Official Khatauni RoR Extract (Fasli 1431)", "KHATAUNI_ROR", "Uttar Pradesh", "Gautam Buddha Nagar",
                "Khata No. 340", "Board of Revenue Uttar Pradesh", "2025-11-04", "Khatauni_Fasli1431_Gata340.pdf", 320,
                "a18a8b13be240974d6f469fa70fa1ffbf7762691b0f55c5df439ae53d100994f", None, "application/pdf",
                "DIGILOCKER_AUTHENTICATED", "UP Bhulekh System", "2025-11-04 09:12:00", "DL-UPBHU-99014",
                "DigiLocker Certified Digital Copy from upbhulekh.gov.in."
            ),
            (
                "DOC-2026-98103", "USR-CIT-1001", "UP-GAU-DAD-BHAN-P340-PL112-1",
                "Revenue Lagan & Malguzari Tax Receipt 2025-26", "TAX_RECEIPT", "Uttar Pradesh", "Gautam Buddha Nagar",
                "340", "Tehsil Dadri Revenue Counter", "2026-02-10", "Lagan_Receipt_Dadri_2025_26.pdf", 145,
                "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", None, "application/pdf",
                "OFFICIALLY_VERIFIED", "Rajesh Verma (Tahsildar)", "2026-02-12 14:20:00", "DSC-UP-2026-10492",
                "Payment cleared for Fasli 1433."
            ),
            (
                "DOC-2026-98104", "USR-CIT-1002", "MH-PUN-HAV-HINJ-P145-PL23-B",
                "7/12 (Saat Bara) Digital Extract - Gat 145/23-B", "SEVEN_TWELVE", "Maharashtra", "Pune",
                "Gat No. 145", "Revenue Department Maharashtra (MahaBhumi)", "2025-08-20", "Saat_Bara_Hinjawadi_Gat145.pdf", 390,
                "7d793037a0760186574b0282f2f435e7b1e50774690f69741a2e708151e60607", None, "application/pdf",
                "OFFICIALLY_VERIFIED", "Anand Deshmukh (Sub-Registrar)", "2025-08-22 16:45:00", "DSC-MH-2025-55912",
                "Class-I Bhumiswami rights confirmed with zero unauthorized encumbrance."
            ),
            (
                "DOC-2026-98105", "USR-CIT-1002", "MH-PUN-HAV-HINJ-P145-PL23-B",
                "Nil-Encumbrance Certificate (Form 15)", "ENCUMBRANCE_CERT", "Maharashtra", "Pune",
                "Plot 23-B", "Sub-Registrar Haveli-Pune", "2025-09-01", "Nil_Encumbrance_Hinjawadi.pdf", 280,
                "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a", None, "application/pdf",
                "PENDING", None, None, None,
                "Submitted for 30-year search verification."
            )
        ]

        for d in demo_docs:
            cursor.execute("""
            INSERT OR REPLACE INTO user_documents (
                document_id, user_id, land_identity_id, title, document_type, state, district, khata_khasra_no,
                issuing_authority, issue_date, file_name, file_size_kb, file_hash, file_data, mime_type,
                verification_status, verified_by_officer, verification_date, digital_stamp_id, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, d)

    # Pre-seed User Saved Land Properties Portfolio
    cursor.execute("SELECT COUNT(*) FROM user_properties")
    prop_count = cursor.fetchone()[0]
    if prop_count == 0:
        demo_props = [
            ("USR-CIT-1001", "UP-GAU-DAD-BHAN-P340-PL112-1", "Dadri Ancestral Agricultural Holding", "OWNER", "2023-04-18", 2.45, "Prime agricultural land with borewell connection."),
            ("USR-CIT-1001", "JH-BOK-CHA-KURA-P125-PL450-2", "Bokaro Kurpania Commercial Plot", "BUYER_INQUIRY", "2025-10-10", 0.75, "Under legal inquiry for CNT tribal compliance."),
            ("USR-CIT-1002", "MH-PUN-HAV-HINJ-P145-PL23-B", "Hinjawadi Phase-1 IT Tech Park Parcel", "OWNER", "2025-08-20", 1.80, "Class-I converted commercial plot.")
        ]
        for p in demo_props:
            cursor.execute("""
            INSERT OR REPLACE INTO user_properties (
                user_id, land_identity_id, property_nickname, ownership_status, acquired_date, registered_area_acre, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, p)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized with users, user_documents, and user_properties schema.")

