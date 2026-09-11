import os
import sys
from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_sih_pdf():
    pdf_path = r"d:\SIH\1\BhoomiShield_SIH2026_TEAM_AGNI.pdf"
    
    # Standard 16:9 widescreen dimensions in points (960 x 540 pt)
    PAGE_WIDTH = 960
    PAGE_HEIGHT = 540
    
    c = canvas.Canvas(pdf_path, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    
    NAVY = colors.HexColor("#0F3D6B")
    BLUE_HEADER = colors.HexColor("#005696")
    FOOTER_BLUE = colors.HexColor("#1E6091")
    DARK_TEXT = colors.HexColor("#0F172A")
    MUTED_TEXT = colors.HexColor("#475569")
    AMBER = colors.HexColor("#D97706")
    EMERALD = colors.HexColor("#059669")
    CARD_BG = colors.HexColor("#F8FAFC")
    CARD_BORDER = colors.HexColor("#CBD5E1")
    ACCENT_BLUE = colors.HexColor("#2563EB")
    
    logo_path = r"d:\SIH\1\backend\extracted_assets\sih_logo_clean.png"
    if not os.path.exists(logo_path):
        logo_path = r"d:\SIH\1\backend\extracted_assets\page_1_img_1_Im35.jpg"
    has_logo = os.path.exists(logo_path)

    styles = getSampleStyleSheet()

    def draw_common_header_footer(slide_num, title_text):
        c.setFillColor(colors.white)
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

        # Top Left Oval Badge: TEAM AGNI
        c.setStrokeColor(DARK_TEXT)
        c.setLineWidth(1.5)
        c.setFillColor(colors.white)
        c.ellipse(30, PAGE_HEIGHT - 85, 150, PAGE_HEIGHT - 20, fill=1, stroke=1)
        
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(90, PAGE_HEIGHT - 48, "TEAM")
        c.setFillColor(AMBER)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(90, PAGE_HEIGHT - 65, "AGNI")

        # Top Center Title
        c.setFillColor(DARK_TEXT)
        c.setFont("Helvetica-Bold", 17)
        c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 50, title_text)

        # Top Right SIH Logo
        if has_logo:
            c.drawImage(logo_path, PAGE_WIDTH - 150, PAGE_HEIGHT - 75, width=130, height=58, preserveAspectRatio=True, mask='auto')
        else:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(PAGE_WIDTH - 80, PAGE_HEIGHT - 45, "SMART INDIA")
            c.drawCentredString(PAGE_WIDTH - 80, PAGE_HEIGHT - 60, "HACKATHON 2026")

        # Bottom Footer Bar
        c.setFillColor(FOOTER_BLUE)
        c.rect(0, 0, PAGE_WIDTH, 35, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 11)
        c.drawCentredString(PAGE_WIDTH / 2, 13, f"@SIH Idea submission- Template {slide_num}")

    # ==========================================
    # SLIDE 1: TITLE PAGE
    # ==========================================
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(60, PAGE_HEIGHT - 55, "SMART INDIA HACKATHON 2026")

    if has_logo:
        c.drawImage(logo_path, PAGE_WIDTH - 160, PAGE_HEIGHT - 80, width=140, height=65, preserveAspectRatio=True, mask='auto')

    c.setFillColor(DARK_TEXT)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 95, "TITLE PAGE")

    # Left Box
    c.setFillColor(CARD_BG)
    c.setStrokeColor(CARD_BORDER)
    c.setLineWidth(1.5)
    c.roundRect(50, 45, 520, 375, 10, fill=1, stroke=1)

    fields = [
        ("• Problem Statement ID – ", "SIH26014", AMBER),
        ("• Problem Statement Title – ", "BhoomiShield: Pan-India AI Land Record Governance, Cadastral GIS Mapping & Multi-Jurisdictional Fraud Prevention Engine", NAVY),
        ("• Theme – ", "Smart Governance / Digital India / Land Administration Modernization", DARK_TEXT),
        ("• PS Category – ", "Software", ACCENT_BLUE),
        ("• Team ID / Leader Roll No – ", "2404921540161", DARK_TEXT),
        ("• Team Name (Registered on portal) – ", "TEAM AGNI", AMBER),
        ("• Team Leader – ", "Priyanshu kumar yadav", DARK_TEXT)
    ]

    y_pos = PAGE_HEIGHT - 130
    for lbl, val, col in fields:
        p_style = ParagraphStyle(
            'FieldStyle',
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=14,
            textColor=DARK_TEXT
        )
        val_hex = col.hexval() if hasattr(col, 'hexval') else '#0F172A'
        html_text = f"<b>{lbl}</b><font color='{val_hex}'><b>{val}</b></font>"
        p = Paragraph(html_text, p_style)
        w, h = p.wrap(490, 100)
        p.drawOn(c, 65, y_pos - h)
        y_pos -= (h + 12)

    # Right Box: Proposed Innovation
    c.setFillColor(colors.HexColor("#EEF6FF"))
    c.setStrokeColor(ACCENT_BLUE)
    c.setLineWidth(1.5)
    c.roundRect(590, 45, 320, 375, 10, fill=1, stroke=1)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(750, PAGE_HEIGHT - 135, "PROPOSED INNOVATION")

    highlights = [
        ("🌐 Pan-India Live Ingestion", "28 States & 8 UTs land registry integration (Khatiyan, RoR, 7/12, Patta)."),
        ("🗺️ Cadastral GIS & GPS Search", "Satellite parcel mapping, Ray-Casting Point-in-Polygon boundary detection."),
        ("🛡️ 7-Rule AI Risk Engine", "Deterministic 0-100 scoring for owner mismatch, area variance & court stays."),
        ("🔐 Citizen Bhoomi Vault", "SHA-256 cryptographic document store & tamper-proof QR audit reports."),
        ("🗣️ 11-Language Multimodal AI", "Voice/Text legal guidance in Hindi, Bengali, Tamil, Telugu, Marathi, etc.")
    ]

    y_h = PAGE_HEIGHT - 165
    for title, desc in highlights:
        c.setFillColor(ACCENT_BLUE)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(605, y_h, title)
        
        c.setFillColor(DARK_TEXT)
        c.setFont("Helvetica", 8.5)
        p_desc = Paragraph(desc, ParagraphStyle('Desc', fontName='Helvetica', fontSize=8.5, leading=11, textColor=DARK_TEXT))
        w_d, h_d = p_desc.wrap(290, 50)
        p_desc.drawOn(c, 605, y_h - h_d - 3)
        y_h -= (h_d + 16)

    c.showPage()

    # ==========================================
    # SLIDE 2: IDEA TITLE
    # ==========================================
    draw_common_header_footer(2, "BHOOMISHIELD: PAN-INDIA LAND RECORD AI & GOVERNANCE PLATFORM")
    
    c.setFillColor(BLUE_HEADER)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, PAGE_HEIGHT - 105, "❖ Proposed Solution (Describe your Idea/Solution/Prototype)")

    s2_cards = [
        ("• Detailed Explanation of the Proposed Solution", NAVY, [
            ("Unified Pan-India Aggregation", "Standardizes fragmented state land data (Khatian, RoR, Register-II, Jamabandi, Deeds, Mutation logs) into an interoperable ULPIN canonical schema."),
            ("Interactive Cadastral GIS & Location Search", "Instant 1-click parcel lookup by GPS coordinates, satellite boundary polygons, Khata/Plot number, or owner name."),
            ("Bhoomi Vault & Authority Portal", "Secure citizen repository for land deeds and tax receipts paired with real-time revenue officer mutation & dispute dashboards.")
        ]),
        ("• How It Addresses the Problem", AMBER, [
            ("Eliminates Portal Fragmentation", "Replaces 30+ disparate regional portals with a centralized, unified intelligent query and verification interface."),
            ("Prevents Fraudulent Resales", "Instantly flags unmutated deeds, pending bank mortgages, and active civil court stay orders before financial transaction."),
            ("Protects Tribal & Protected Land", "Enforces statutory tenancy regulations (e.g. CNT/SPT Act, UP Revenue Code §98, Karnataka PTCL) preventing illegal land alienation.")
        ]),
        ("• Innovation and Uniqueness of the Solution", EMERALD, [
            ("Deterministic 0–100 AI Risk Engine", "Heuristic rule-based scoring (R001–R007) ensuring transparent, fully explainable risk factors with zero hallucination."),
            ("Multilingual Voice Legal Assistant", "Conversational legal aid and dispute drafting in 11 Indian regional languages for high rural accessibility."),
            ("Cryptographic SHA-256 Audit Trail", "Generates QR-coded official Land Health Certificates verifying textual & spatial consistency across state archives.")
        ])
    ]

    for idx, (hdr_text, hdr_col, pts) in enumerate(s2_cards):
        x_card = 40 + idx * 295
        c.setFillColor(CARD_BG)
        c.setStrokeColor(hdr_col)
        c.setLineWidth(1.5)
        c.roundRect(x_card, 45, 285, 375, 8, fill=1, stroke=1)

        c.setFillColor(hdr_col)
        c.setFont("Helvetica-Bold", 9.5)
        p_hdr = Paragraph(f"<b>{hdr_text}</b>", ParagraphStyle('Hdr', fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=hdr_col))
        w_h, h_h = p_hdr.wrap(265, 40)
        p_hdr.drawOn(c, x_card + 10, PAGE_HEIGHT - 130 - h_h)

        y_pt = PAGE_HEIGHT - 135 - h_h
        for p_title, p_desc in pts:
            txt = f"<b><font color='#0F172A'>✔ {p_title}:</font></b> <font color='#475569'>{p_desc}</font>"
            p_bullet = Paragraph(txt, ParagraphStyle('Bullet', fontName='Helvetica', fontSize=8, leading=10.5, textColor=MUTED_TEXT))
            w_b, h_b = p_bullet.wrap(265, 100)
            p_bullet.drawOn(c, x_card + 10, y_pt - h_b)
            y_pt -= (h_b + 8)

    c.showPage()

    # ==========================================
    # SLIDE 3: TECHNICAL APPROACH
    # ==========================================
    draw_common_header_footer(3, "TECHNICAL APPROACH")

    c.setFillColor(CARD_BG)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.5)
    c.roundRect(40, 45, 425, 395, 8, fill=1, stroke=1)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(55, PAGE_HEIGHT - 115, "• Technologies to be used")

    tech_stack = [
        ("Frontend Application", "React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Mobile Responsive PWA architecture."),
        ("Backend & Microservices", "FastAPI (Python 3.11+), Asynchronous REST Endpoints, Uvicorn, Pydantic v2 validation."),
        ("Cadastral GIS & Spatial", "Leaflet.js, Esri Satellite Imagery, OpenStreetMap, Point-in-Polygon (Ray Casting) & Turf.js / Shapely."),
        ("Database & Hashing", "SQLite / PostgreSQL with Spatial Indexing, Document Store, Cryptographic SHA-256 integrity checks."),
        ("AI & Multilingual NLP", "Custom 7-Rule Deterministic Risk Engine, Speech Recognition API & Web Speech Synthesis (11 Indian Languages)."),
        ("Report Generation", "ReportLab Automated PDF Engine with dynamic QR Code verification & bilingual summaries.")
    ]

    y_t = PAGE_HEIGHT - 135
    for cat, desc in tech_stack:
        txt = f"<b><font color='#2563EB'>▪ {cat}:</font></b> <font color='#0F172A'>{desc}</font>"
        p_tech = Paragraph(txt, ParagraphStyle('Tech', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=DARK_TEXT))
        w_t, h_t = p_tech.wrap(400, 70)
        p_tech.drawOn(c, 55, y_t - h_t)
        y_t -= (h_t + 7)

    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.setStrokeColor(AMBER)
    c.setLineWidth(1.5)
    c.roundRect(485, 45, 435, 395, 8, fill=1, stroke=1)

    c.setFillColor(AMBER)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(500, PAGE_HEIGHT - 115, "• Methodology & Process for Implementation")

    method_steps = [
        ("Step 1: Multi-State Ingestion Pipeline", "State land portals (e.g. Jharbhoomi, Bhulekh UP, Mahabhumi, BanglarBhumi) ingested into canonical schema matching ULPIN standard."),
        ("Step 2: Cadastral Polygon & Location Binding", "Associates survey numbers with GIS polygon geometries. Live GPS / click queries locate parcel boundaries on satellite map."),
        ("Step 3: Multi-Layer Deterministic Risk Engine", "Evaluates R001 (Owner Mismatch), R002 (Area Variance), R003 (Missing Geo), R004/R005 (Mutation SLA), R006 (Deed Mismatch), R007 (Court Litigation)."),
        ("Step 4: Bhoomi Vault & Citizen Governance", "Citizens securely upload land records; officials triage grievances; real-time tamper-proof PDF audit certificates generated instantly.")
    ]

    y_m = PAGE_HEIGHT - 135
    for stitle, sdesc in method_steps:
        txt = f"<b><font color='#0F3D6B'>▶ {stitle}</font></b><br/><font color='#0F172A'>{sdesc}</font>"
        p_meth = Paragraph(txt, ParagraphStyle('Meth', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=DARK_TEXT))
        w_m, h_m = p_meth.wrap(410, 80)
        p_meth.drawOn(c, 500, y_m - h_m)
        y_m -= (h_m + 8)

    c.showPage()

    # ==========================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # ==========================================
    draw_common_header_footer(4, "FEASIBILITY AND VIABILITY")

    s4_sections = [
        ("• Analysis of Feasibility", NAVY, [
            ("Technical Feasibility", "Fully functional prototype deployed with 10,000+ parcels across Jharkhand, UP, Maharashtra, and pan-India states with sub-150ms query latency."),
            ("Operational Feasibility", "Non-invasive architecture that operates as an analytical intelligence layer over existing state databases without requiring costly database re-engineering."),
            ("Financial Viability", "Built on high-performance open-source stack (FastAPI, React, SQLite/PostgreSQL, Leaflet) minimizing infrastructure and licensing overhead.")
        ]),
        ("• Potential Challenges & Risks", AMBER, [
            ("Heterogeneous Terminology", "Varied state revenue terminologies (Khatian, RoR, 7/12, Jamabandi, Patta, Chitta, Dag) across different state jurisdictions."),
            ("State Portal Downtime", "Legacy government servers experience intermittent downtime and strict IP rate-limiting during peak daytime traffic."),
            ("Digital Literacy in Rural India", "Complex land laws and technical legal terminology pose adoption hurdles for rural farmers and non-English speakers.")
        ]),
        ("• Mitigation Strategies", EMERALD, [
            ("Universal Canonical Adapter", "Standardizes diverse state terminologies into a unified Bhu-Aadhaar / ULPIN compliant schema automatically."),
            ("Asynchronous Edge Caching", "Multi-tiered local SQLite/Redis caching layer with graceful fallback simulation to guarantee 99.9% uptime."),
            ("Multilingual Voice AI", "Interactive voice assistance in 11 vernacular Indian languages and intuitive Green/Yellow/Red risk badges for instant clarity.")
        ])
    ]

    for idx, (hdr_text, hdr_col, pts) in enumerate(s4_sections):
        x_card = 40 + idx * 295
        c.setFillColor(CARD_BG)
        c.setStrokeColor(hdr_col)
        c.setLineWidth(1.5)
        c.roundRect(x_card, 45, 285, 395, 8, fill=1, stroke=1)

        c.setFillColor(hdr_col)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x_card + 10, PAGE_HEIGHT - 115, hdr_text)

        y_pt = PAGE_HEIGHT - 130
        for p_title, p_desc in pts:
            txt = f"<b><font color='#0F172A'>✔ {p_title}:</font></b> <font color='#475569'>{p_desc}</font>"
            p_bullet = Paragraph(txt, ParagraphStyle('Bullet4', fontName='Helvetica', fontSize=8, leading=10.5, textColor=MUTED_TEXT))
            w_b, h_b = p_bullet.wrap(265, 100)
            p_bullet.drawOn(c, x_card + 10, y_pt - h_b)
            y_pt -= (h_b + 9)

    c.showPage()

    # ==========================================
    # SLIDE 5: IMPACT AND BENEFITS
    # ==========================================
    draw_common_header_footer(5, "IMPACT AND BENEFITS")

    c.setFillColor(CARD_BG)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.5)
    c.roundRect(40, 45, 425, 395, 8, fill=1, stroke=1)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(55, PAGE_HEIGHT - 115, "• Potential Impact on the Target Audience")

    audiences = [
        ("Citizens & Rural Farmers", "Prevents fraudulent land dispossession, unauthorized transfers, and opaque broker commissions with instant verified ownership history."),
        ("Property Buyers & Developers", "Conducts instantaneous 360° title due-diligence, mortgage checks, and litigation status before capital investment."),
        ("Banks & Financial Institutions", "Accelerates loan origination and mortgage collateral verification from weeks to seconds while reducing non-performing assets."),
        ("Revenue Officers & Administration", "Provides automated SLA tracking for pending mutation files, grievance analytics, and rapid dispute resolution workflows.")
    ]

    y_a = PAGE_HEIGHT - 135
    for aud, adesc in audiences:
        txt = f"<b><font color='#2563EB'>👥 {aud}:</font></b> <font color='#0F172A'>{adesc}</font>"
        p_aud = Paragraph(txt, ParagraphStyle('Aud', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=DARK_TEXT))
        w_a, h_a = p_aud.wrap(400, 70)
        p_aud.drawOn(c, 55, y_a - h_a)
        y_a -= (h_a + 7)

    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.setStrokeColor(EMERALD)
    c.setLineWidth(1.5)
    c.roundRect(485, 45, 435, 395, 8, fill=1, stroke=1)

    c.setFillColor(EMERALD)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(500, PAGE_HEIGHT - 115, "• Benefits of the Solution (Social, Economic, Environmental)")

    benefits = [
        ("Social Equity & Tenancy Protection", "Safeguards tribal and marginalized farmers under CNT/SPT Acts and UP Revenue Code §98; democratizes legal literacy across rural Bharat."),
        ("Economic Acceleration", "Unlocks locked economic capital in disputed land parcels; directly targets India's 66% civil court land litigation backlog."),
        ("Environmental & Wetland Protection", "Cadastral satellite overlay automatically identifies illegal encroachments on forest land, waterbodies (Jalasay), and flood plains."),
        ("Governance Transparency", "End-to-end cryptographic audit trails (SHA-256) eliminate document tampering and backdated mutation entries.")
    ]

    y_b = PAGE_HEIGHT - 135
    for bcat, bdesc in benefits:
        txt = f"<b><font color='#0F3D6B'>🌟 {bcat}</font></b><br/><font color='#0F172A'>{bdesc}</font>"
        p_ben = Paragraph(txt, ParagraphStyle('Ben', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=DARK_TEXT))
        w_b, h_b = p_ben.wrap(410, 80)
        p_ben.drawOn(c, 500, y_b - h_b)
        y_b -= (h_b + 8)

    c.showPage()

    # ==========================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # ==========================================
    draw_common_header_footer(6, "RESEARCH AND REFERENCES")

    c.setFillColor(CARD_BG)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.5)
    c.roundRect(40, 45, 880, 395, 8, fill=1, stroke=1)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(55, PAGE_HEIGHT - 115, "• Details / Links of the Reference and Research Work")

    references = [
        ("1. Digital India Land Records Modernization Programme (DILRMP)", 
         "Department of Land Resources (DoLR), Ministry of Rural Development, Government of India. Framework for computerization of land records, cadastral map digitization, and survey integration."),
        ("2. Unique Land Parcel Identification Number (ULPIN) / Bhu-Aadhaar Guidelines (2021-2024)",
         "National standards for assigning 14-digit alphanumeric geo-referenced identification to each land parcel across India."),
        ("3. Statutory State Revenue Acts & Tenancy Codes Studied",
         "• Chota Nagpur Tenancy Act (CNT), 1908 & Santhal Parganas Tenancy Act (SPT), 1949 (Jharkhand)\n• Uttar Pradesh Revenue Code, 2006 (Section 98 - Tenancy Restrictions & Mutation SLAs)\n• Maharashtra Land Revenue Code (MLRC), 1966 & Karnataka PTCL Act, 1978\n• Real Estate (Regulation and Development) Act (RERA), 2016"),
        ("4. NITI Aayog Report on Land Governance in India & Judicial Reforms",
         "Research findings on title verification bottlenecks, land dispute litigation resolution, and automated conclusive titling systems."),
        ("5. Open-Source Implementation & Live Prototype Repository",
         "• GitHub Codebase: https://github.com/Zainul9142/Land-Record-Handling\n• Modules Deployed: Multi-State Ingestion Pipeline, Cadastral GIS Leaflet Map, 7-Rule Heuristic Engine, 11-Language Multilingual Localization, Citizen Bhoomi Vault & Official Officer Portal.")
    ]

    y_r = PAGE_HEIGHT - 135
    for title, body in references:
        body_fmt = body.replace('\n', '<br/>')
        txt = f"<b><font color='#2563EB'>{title}</font></b><br/><font color='#0F172A'>{body_fmt}</font>"
        p_ref = Paragraph(txt, ParagraphStyle('Ref', fontName='Helvetica', fontSize=8.2, leading=10.8, textColor=DARK_TEXT))
        w_r, h_r = p_ref.wrap(850, 90)
        p_ref.drawOn(c, 55, y_r - h_r)
        y_r -= (h_r + 7)

    c.showPage()
    c.save()
    print(f"Successfully generated clean SIH 2026 PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_sih_pdf()
