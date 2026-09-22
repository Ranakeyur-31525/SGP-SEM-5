import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIAGRAMS_DIR = os.path.join(BASE_DIR, 'diagrams')
OUTPUT_PDF = os.path.join(BASE_DIR, 'MediBot_Visual_System_and_Page_Flow_Documentation.pdf')

# -------------------------------------------------------------
# TWO-PASS NUMBERED CANVAS WITH RUNNING HEADERS & FOOTERS
# -------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Don't draw header/footer on cover page (page 1)
        if self._pageNumber == 1:
            return

        page_w, page_h = A4

        # Running Header
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0891B2"))
        self.drawString(36, page_h - 26, "MEDIBOT OS")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(100, page_h - 26, "|   Intra-Hospital Logistics, Autonomous Robotics & Multi-Persona Cloud ERP")
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.8)
        self.line(36, page_h - 32, page_w - 36, page_h - 32)

        # Running Footer
        self.line(36, 32, page_w - 36, 32)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 20, "CHARUSAT • SEM 5 SGP Project Documentation  |  Developer: Keyur Rana  |  Ver 3.0.0")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_w - 36, 20, page_str)
        self.restoreState()


def build_pdf():
    print("Building comprehensive visual MediBot PDF documentation...")

    # Document Template Setup
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44
    )

    styles = getSampleStyleSheet()

    # Custom Typography Hierarchy
    c_navy = colors.HexColor("#0F172A")
    c_cyan = colors.HexColor("#0891B2")
    c_blue = colors.HexColor("#2563EB")
    c_emerald = colors.HexColor("#059669")
    c_amber = colors.HexColor("#D97706")
    c_rose = colors.HexColor("#E11D48")
    c_slate = colors.HexColor("#334155")
    c_muted = colors.HexColor("#64748B")
    c_light = colors.HexColor("#F8FAFC")
    c_border = colors.HexColor("#E2E8F0")

    styles.add(ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0F172A"),
        alignment=0,
        spaceAfter=10
    ))

    styles.add(ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0891B2"),
        spaceAfter=18
    ))

    styles.add(ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=c_slate
    ))

    styles.add(ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_navy,
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_cyan,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'DocH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_slate,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_slate,
        spaceAfter=5
    ))

    styles.add(ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_slate,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    ))

    styles.add(ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    ))

    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    ))

    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=c_slate
    ))

    styles.add(ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=c_navy
    ))

    story = []
    page_w, page_h = A4
    content_w = page_w - 72

    # =========================================================
    # COVER / TITLE PAGE
    # =========================================================
    story.append(Spacer(1, 15))
    
    # Top Medical Badge
    badge_data = [[
        Paragraph("<font color='#0891B2'><b>CHARUSAT UNIVERSITY</b></font>  |  <b>DEPARTMENT OF COMPUTER ENGINEERING</b>  |  <b>SGP SEMESTER 5</b>", styles['TableCellBold'])
    ]]
    badge_table = Table(badge_data, colWidths=[content_w])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFEFF")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#A5F3FC")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("MEDIBOT: Intra-Hospital Logistics & Autonomous Delivery System", styles['CoverTitle']))
    story.append(Paragraph("Comprehensive Visual System Architecture, End-to-End Page Navigation Flows & Screen-by-Screen Technical Reference Manual", styles['CoverSubtitle']))
    
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0891B2"), spaceBefore=0, spaceAfter=12))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Author / Developer:</b> Keyur Rana (CHARUSAT SEM 5)", styles['CoverMeta']),
            Paragraph("<b>Project Version:</b> 3.0.0 Enterprise", styles['CoverMeta'])
        ],
        [
            Paragraph("<b>Domain:</b> Medical Robotics & Logistics Cloud ERP", styles['CoverMeta']),
            Paragraph("<b>Verification Status:</b> 18/18 Automated ERP Tests Passed (100%)", styles['CoverMeta'])
        ],
        [
            Paragraph("<b>Live Front-End URL:</b> http://localhost:8081 (Expo)", styles['CoverMeta']),
            Paragraph("<b>Live Back-End Portal:</b> http://localhost:8000/ (Django REST)", styles['CoverMeta'])
        ]
    ]
    meta_table = Table(meta_data, colWidths=[content_w*0.5, content_w*0.5])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Subsystem Highlights Banner Table
    subsystems_data = [
        [
            Paragraph("<b>100Hz LiDAR Radar</b><br/><font color='#64748B'>TF-Luna black-box flight recorder & &lt;50cm auto-brake</font>", styles['TableCell']),
            Paragraph("<b>SG90 Servo Deadbolt</b><br/><font color='#64748B'>4-digit cryptographic OTP hatch lock mechanism</font>", styles['TableCell']),
            Paragraph("<b>5-Floor Lift Bridge</b><br/><font color='#64748B'>Optocoupler relay multi-floor elevator handshake</font>", styles['TableCell']),
        ],
        [
            Paragraph("<b>Patient Bed Isolation</b><br/><font color='#64748B'>Strict Bed 12 isolation security boundary</font>", styles['TableCell']),
            Paragraph("<b>Chemist SKU Gate</b><br/><font color='#64748B'>Doctor proposal queue & 160+ drug inventory catalog</font>", styles['TableCell']),
            Paragraph("<b>Turnaround Invoicing</b><br/><font color='#64748B'>ReportLab automated clinical PDF bill generation</font>", styles['TableCell']),
        ]
    ]
    subsys_table = Table(subsystems_data, colWidths=[content_w/3, content_w/3, content_w/3])
    subsys_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
    ]))
    story.append(subsys_table)
    story.append(Spacer(1, 14))

    # Executive Overview
    story.append(Paragraph("<b>Executive Summary & Platform Scope</b>", styles['DocH2']))
    story.append(Paragraph(
        "<b>MediBot</b> is an intra-hospital autonomous robotics and cloud ERP system engineered to eliminate critical logistics bottlenecks in modern medical facilities. In conventional hospitals, manual transport of STAT medications, emergency IV fluids, and controlled pharmaceuticals consumes valuable nursing hours and introduces transit delays between floors. MediBot resolves this through a synchronised ecosystem comprising an autonomous mobile delivery robot (ESP32 dual-core, TF-Luna 100Hz LiDAR, SG90 motorized deadbolt, 5-floor elevator relay bridge) coupled directly with a React Native (Expo) multi-persona console and a Django 6.0 REST Cloud ERP.",
        styles['DocBody']
    ))
    story.append(Paragraph(
        "This document presents the complete visual blueprint of the platform, including the <b>Full System Architecture</b>, <b>Page Navigation Flows</b>, the <b>End-to-End Delivery Lifecycle</b> across hospital personas, the <b>5-Floor Facility & 50-Bed Matrix</b>, and an <b>exhaustive screen-by-screen technical specification</b> detailing every user interaction, state store, and hardware bridge.",
        styles['DocBody']
    ))

    story.append(PageBreak())

    # =========================================================
    # SECTION 1: SYSTEM & HARDWARE ARCHITECTURE (VISUALIZED)
    # =========================================================
    story.append(Paragraph("1. System & Hardware Architecture (Visual Blueprint)", styles['DocH1']))
    story.append(Paragraph(
        "The MediBot architecture is structured across four decoupled, high-performance tiers ensuring clinical safety, sub-second telemetry synchronization, and strict role segregation.",
        styles['DocBody']
    ))

    arch_img_path = os.path.join(DIAGRAMS_DIR, 'diagram_system_architecture.png')
    if os.path.exists(arch_img_path):
        story.append(Image(arch_img_path, width=content_w, height=content_w * 0.54))
        story.append(Spacer(1, 8))

    arch_table_data = [
        [Paragraph("Architectural Tier", styles['TableHeader']), Paragraph("Core Technologies", styles['TableHeader']), Paragraph("Key Functional Responsibilities", styles['TableHeader'])],
        [
            Paragraph("<b>1. Frontend Client Tier</b>", styles['TableCellBold']),
            Paragraph("React Native (Expo SDK 54), TypeScript, React Native Web, Zustand Stores", styles['TableCell']),
            Paragraph("Cross-platform mobile/tablet/web console. Provides role-adaptive views for Doctors, Nurses, Chemists, Patients (Bed 12), and Admins with live MQTT/HTTP telemetry.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Gateway & API Router</b>", styles['TableCellBold']),
            Paragraph("Django REST Framework, PyJWT, CorsAndRoleMiddleware, RoleGuard", styles['TableCell']),
            Paragraph("Authenticates JWT sessions, enforces HTTP 403 role-based access control, isolates patient bedside endpoints to Bed 12, and orchestrates autonomous transit simulations.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Backend ERP Engine</b>", styles['TableCellBold']),
            Paragraph("Django 6.0, SQLite (db.sqlite3), MongoDB Singleton (core.db), ReportLab", styles['TableCell']),
            Paragraph("Maintains 50 hospital bed allocations, 160+ drug SKUs, doctor drug proposals, 100Hz LiDAR black-box flight logs, and generates automated clinical PDF invoices.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Robotics & Facility Hardware</b>", styles['TableCellBold']),
            Paragraph("ESP32 Dual-Core (240MHz), TF-Luna LiDAR, SG90 Servo, 5-Floor Optocouplers", styles['TableCell']),
            Paragraph("Executes real-time corridor navigation, obstacle distance scanning at 100Hz, emergency brake halt (<50cm), motorized hatch deadbolt locking, and 5-floor lift call handshakes.", styles['TableCell'])
        ]
    ]
    t_arch = Table(arch_table_data, colWidths=[content_w*0.25, content_w*0.32, content_w*0.43])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # =========================================================
    # SECTION 2: GLOBAL PAGE FLOW & APPLICATION NAVIGATION MAP
    # =========================================================
    story.append(Paragraph("2. Global Page Flow & Application Navigation Map", styles['DocH1']))
    story.append(Paragraph(
        "The user experience is architected around a <b>Role-Gated Navigation Hierarchy</b>. Users enter through the animated Welcome Screen, review public operational readiness on the Home Screen, and authenticate via the 1-Tap Persona Gateway. The Root Stack Navigator then dynamically mounts one of five dedicated Bottom Tab Navigators tailored exclusively to that user's clinical clearance.",
        styles['DocBody']
    ))

    nav_img_path = os.path.join(DIAGRAMS_DIR, 'diagram_navigation_flow.png')
    if os.path.exists(nav_img_path):
        story.append(Image(nav_img_path, width=content_w, height=content_w * 0.60))
        story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Detailed Navigation Hierarchy Breakdown:</b>", styles['DocH2']))
    story.append(Paragraph("• <b>Entry Tier (Stack Navigator):</b> WelcomeScreen (Splash animation & readiness test) -> HomeScreen (Hospital overview & live telemetry) -> LoginScreen (1-Tap Persona Switcher & JWT login).", styles['DocBullet']))
    story.append(Paragraph("• <b>Patient Bottom Tabs (Bed 12 Isolated):</b> My Bed 12 (PatientScreen) | Assistance (CallingMatrix) | Track Meds (DeliveryDetail) | My Invoice (BillingScreen) | Profile (ProfileScreen).", styles['DocBullet']))
    story.append(Paragraph("• <b>Doctor Bottom Tabs (Clinical STAT):</b> Doctor Hub (DashboardScreen) | STAT Prescribe (DoctorOrderScreen) | Code Red (CallingMatrix) | Profile (ProfileScreen).", styles['DocBullet']))
    story.append(Paragraph("• <b>Nurse Bottom Tabs (Ward Station):</b> Ward Station (DashboardScreen) | Bed Calls (CallingMatrix) | Hatch Unlock (DeliveryDetail) | Ward Order (DoctorOrderScreen) | Profile (ProfileScreen).", styles['DocBullet']))
    story.append(Paragraph("• <b>Chemist Bottom Tabs (Dispensary Gate):</b> Dispensary (ChemistScreen) | Stock & Queue (InventoryManagementScreen) | Dispatch Bot (DeliveryCreateScreen) | Low Stock (LowStockScreen) | Profile (ProfileScreen).", styles['DocBullet']))
    story.append(Paragraph("• <b>Admin Bottom Tabs (Command & Fleet):</b> Command (AdminScreen) | 50 Beds (CallingMatrix) | Telemetry (RobotMonitoringScreen) | Lift IoT (ElevatorControlScreen) | Staff & RBAC (UserManagementScreen).", styles['DocBullet']))
    story.append(Paragraph("• <b>Shared Stack Screens & Modals:</b> DestinationSelect, AlertsFeed, BatteryScreen, HistoryScreen, SettingsScreen, OtpModal (Hatch Unlock PIN), SuggestDrugModal (Doctor Requisition Queue).", styles['DocBullet']))

    story.append(PageBreak())

    # =========================================================
    # SECTION 3: END-TO-END DELIVERY LIFECYCLE (CROSS-PERSONA)
    # =========================================================
    story.append(Paragraph("3. Cross-Persona Autonomous Delivery Lifecycle", styles['DocH1']))
    story.append(Paragraph(
        "The core operational workflow of MediBot synchronizes five distinct actors across a 5-stage closed loop: clinical prescription, pharmacy catalog verification, multi-floor autonomous transit, secure bedside PIN unlock, and automated turnaround billing.",
        styles['DocBody']
    ))

    del_img_path = os.path.join(DIAGRAMS_DIR, 'diagram_delivery_lifecycle.png')
    if os.path.exists(del_img_path):
        story.append(Image(del_img_path, width=content_w, height=content_w * 0.54))
        story.append(Spacer(1, 8))

    lifecycle_steps_data = [
        [Paragraph("Stage", styles['TableHeader']), Paragraph("Actor & System Action", styles['TableHeader']), Paragraph("Hardware & Backend Events", styles['TableHeader'])],
        [
            Paragraph("<b>Stage 1: Prescribe</b>", styles['TableCellBold']),
            Paragraph("Doctor logs into DoctorOrderScreen. Selects target bed (e.g. Bed 12 Floor 2), chooses medications or submits a <i>New Drug Proposal</i> (e.g. Dexamethasone REQ-1342) with clinical justification. Sets priority to STAT.", styles['TableCell']),
            Paragraph("Order placed in central queue. If a new drug is requested, it is routed exclusively to the Chemist's approval queue.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Stage 2: Dispense</b>", styles['TableCellBold']),
            Paragraph("Chemist reviews Dispensary Queue. Approves drug proposal (auto-creates SKU in catalog), packs medication into the robot compartment, specifies 4-digit OTP PIN (e.g. 4821), and clicks <i>Engage MEDIBOT Dispatch</i>.", styles['TableCell']),
            Paragraph("SG90 servo deadbolt actuates to LOCKED. ESP32 receives delivery mission destination (Floor 2, Bed 12) and arms telemetry loop.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Stage 3: Transit</b>", styles['TableCellBold']),
            Paragraph("MediBot navigates hospital corridors autonomously. TF-Luna LiDAR scans at 100Hz. If obstacle detected within 50cm, safety brake locks automatically. MediBot calls 5-floor elevator via optocoupler relay handshake, rides to Floor 2, and proceeds to Bed 12.", styles['TableCell']),
            Paragraph("LiDAR black-box flight recorder saves 100 distance samples. Elevator relays handle call, floor selection, and door interlocks.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Stage 4: Unlock</b>", styles['TableCellBold']),
            Paragraph("MediBot docks at Bed 12. Audio beacon chimes. Nurse or Patient opens DeliveryDetailScreen, taps <i>Enter Delivery PIN</i>, and inputs OTP 4821. Keypad validates passcode.", styles['TableCell']),
            Paragraph("SG90 servo rotates to 90 degrees (UNLOCKED). Compartment lid pops open. Patient retrieves prescription payload.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Stage 5: Billing</b>", styles['TableCellBold']),
            Paragraph("Hatch closure confirmed. Cloud ERP automatically adds <b>Rs. 150 Autonomous Delivery Turnaround Surcharge</b> to patient billing ledger and compiles itemized ReportLab PDF invoice. Robot navigates back to Base Dock #1.", styles['TableCell']),
            Paragraph("EMR records updated. Delivery status transitions to RETURN_TO_DOCK. Dock battery charger engaged.", styles['TableCell'])
        ]
    ]
    t_life = Table(lifecycle_steps_data, colWidths=[content_w*0.2, content_w*0.42, content_w*0.38])
    t_life.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_life)

    story.append(PageBreak())

    # =========================================================
    # SECTION 4: 5-FLOOR FACILITY & 50-BED WARD MATRIX
    # =========================================================
    story.append(Paragraph("4. 5-Floor Hospital Facility & 50-Bed Matrix Layout", styles['DocH1']))
    story.append(Paragraph(
        "Hospital bed allocation is organized in a deterministic 50-bed matrix mapped across five vertical floors (10 beds per floor). Bed 12 is uniquely configured with strict patient isolation boundaries.",
        styles['DocBody']
    ))

    fac_img_path = os.path.join(DIAGRAMS_DIR, 'diagram_facility_matrix.png')
    if os.path.exists(fac_img_path):
        story.append(Image(fac_img_path, width=content_w, height=content_w * 0.54))
        story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Ward Distribution & Facility Specifications:</b>", styles['DocH2']))
    story.append(Paragraph("• <b>Floor 5 (Beds 41 to 50) - Intensive Care & Surgical Suites (ICU/OT):</b> Critical care beds with ventilator support, sterile air handling, and Code Red priority response corridors.", styles['DocBullet']))
    story.append(Paragraph("• <b>Floor 4 (Beds 31 to 40) - Post-Operative Recovery & Orthopedics:</b> Post-surgical inpatient beds requiring routine analgesic delivery and automated nursing summons.", styles['DocBullet']))
    story.append(Paragraph("• <b>Floor 3 (Beds 21 to 30) - Cardiology Ward & High Dependency Unit:</b> Continuous ECG telemetry monitoring, rapid cardiac drug dispatches, and defibrillator response stations.", styles['DocBullet']))
    story.append(Paragraph("• <b>Floor 2 (Beds 11 to 20) - General Medicine & Post-PTCA Stent Ward:</b> Houses <b>Bed 12 (Inpatient: Ramesh Sharma)</b>. Enforces patient isolation: Bed 12 patient can view and interact only with their own bed records; cross-bed access is blocked.", styles['DocBullet']))
    story.append(Paragraph("• <b>Floor 1 (Beds 1 to 10) - Central Dispensary, Base Dock & Emergency Triage:</b> Central Pharmacy fulfillment hub, automated robot recharging dock (Dock #1), and emergency admittance triage.", styles['DocBullet']))
    story.append(Paragraph("• <b>Vertical Elevator Shaft (Floors 1-5):</b> Controlled via a 5-channel optocoupler relay board. Each floor node connects to hall-call switches, car call relays, and optical door sensors to guarantee collision-free inter-floor transit.", styles['DocBullet']))

    story.append(PageBreak())

    # =========================================================
    # SECTION 5: SCREEN-BY-SCREEN TECHNICAL ENCYCLOPEDIA
    # =========================================================
    story.append(Paragraph("5. Screen-by-Screen Technical & Functional Encyclopedia", styles['DocH1']))
    story.append(Paragraph(
        "Below is an exhaustive, screen-by-screen breakdown of every user interface in the MediBot ecosystem, including UI components, actions, state stores, and backend endpoints.",
        styles['DocBody']
    ))

    screens_list = [
        {
            "num": "5.1",
            "name": "WelcomeScreen (Splash & System Readiness)",
            "route": "Welcome",
            "role": "Public / All Personas",
            "desc": "The initial entry screen loaded when the application launches. Features a medical pulse animation with glowing radar rings. Displays a live hardware checklist validating the readiness of the TF-Luna LiDAR, SG90 servo deadbolt, 5-floor elevator bridge, and patient bed isolation boundary. Provides two primary CTAs: 'Enter Hospital Logistics Console' (navigating to Home) and 'Quick Demo Access' (navigating directly to Login).",
            "components": "Animated pulsing logo, concentric radar ring waves, system readiness checklist cards, role overview badges, navigation CTA buttons.",
            "store": "useThemeStore (theme tokens & dark/light mode)",
            "api": "Client-side animation loop; initiates autonomous telemetry simulator in App.tsx."
        },
        {
            "num": "5.2",
            "name": "HomeScreen (Public Logistics Landing & Fleet Status)",
            "route": "Home",
            "role": "Public / All Personas",
            "desc": "A comprehensive operational dashboard serving as the public hospital landing overview. Displays the live operational health of the autonomous fleet with an animated 'FLEET READY • ONLINE' status pill. Features a role portal gateway with interactive cards directing Doctors, Nurses, Chemists, Patients, and Admins to their respective environments. Includes a live telemetry strip showing current LiDAR distance, battery voltage, current floor, and hatch lock status.",
            "components": "Header with Persona Selector button, Hero card with live fleet badge, Role Gateway grid (5 cards), Live Fleet Telemetry snapshot strip, Safety Protocols badge summary.",
            "store": "useAuthStore, useRobotStore, useThemeStore",
            "api": "Reads robot state (lidar, battery, floor, hatch) from useRobotStore; settings shortcut."
        },
        {
            "num": "5.3",
            "name": "LoginScreen (Authentication Gateway & 1-Tap Persona Switcher)",
            "route": "Login",
            "role": "Authentication Gateway",
            "desc": "The unified security gateway. Features a 1-Tap Demo Persona Switcher containing pre-configured accounts for Doctor (Anita Mehta, MD), Nurse (Sarah Joseph, RN), Chemist (Rahul Verma, R.Ph), Patient (Ramesh Sharma, Bed 12), and Admin (Chief Logistics Officer). Also provides a full credential input form (Email and Password) with toggle to Register mode. Authenticates user sessions and mounts the corresponding role-gated tab navigator.",
            "components": "5 Demo Persona quick-action buttons with role-specific color keys, Email and Password TextInput fields, Login / Register toggle button, JWT session initiator.",
            "store": "useAuthStore (loginWithCredentials, loginAsPersona)",
            "api": "POST /api/auth/login/ (verifies credentials and returns JWT bearer token & role payload)."
        },
        {
            "num": "5.4",
            "name": "PatientScreen (Bedside Console • Bed 12 Isolated)",
            "route": "MainTabs -> DashboardTab (when role = PATIENT)",
            "role": "PATIENT (Bed 12 Strictly Enforced)",
            "desc": "An isolated bedside portal restricted exclusively to Bed 12 on Floor 2. Displays inpatient details (Ramesh Sharma, Cardiology Post-Op, Attending Doctor: Dr. Anita Mehta). Features a real-time 6-Stage Delivery Tracker displaying the live transit status of prescribed medications, including robot floor position and LiDAR clearance distance. Provides one-touch summon buttons: Call Nurse, Call Doctor, and CODE RED Emergency. Includes direct access to turnaround billing.",
            "components": "Bed Info Card (Bed 12, Floor 2), 6-stage Delivery Stepper, Live MediBot Transit Radar, One-Touch Assistance Summon Buttons (Nurse, Doctor, Code Red), Turnaround Invoice Card.",
            "store": "useAuthStore, useDeliveryStore, useCallingMatrixStore, useRobotStore",
            "api": "GET /api/erp/billing/patient/12/ (patient ledger); blocks access to any other bed ID with HTTP 403."
        },
        {
            "num": "5.5",
            "name": "DoctorOrderScreen (STAT Bed Prescribing & Drug Proposal Requisition)",
            "route": "DoctorOrder (or Doctor MissionTab)",
            "role": "DOCTOR, NURSE, ADMIN",
            "desc": "Clinical prescribing desk where physicians create urgent delivery orders for Beds 1 through 50. Floor number is computed automatically based on bed selection (10 beds per floor). Physicians set delivery priority (EMERGENCY_STAT, URGENT, ROUTINE), browse formulary drugs, adjust dosages, and queue orders directly to the Central Dispensary. Includes a 'Suggest New Drug' modal allowing doctors to propose uncataloged medications (e.g. Dexamethasone REQ-1342) directly to the Chemist's approval queue.",
            "components": "Bed Selector grid (Beds 1-50), Priority selector chips, Drug Search & Catalog List, Dosage stepper (+/- qty), Cart summary strip, 'Suggest New Drug to Formulary' Modal.",
            "store": "useInventoryStore (inventory, requestNewDrug), useDeliveryStore (createDelivery)",
            "api": "POST /api/erp/proposals/ (queues drug proposal); POST /api/erp/orders/ (creates dispatch order)."
        },
        {
            "num": "5.6",
            "name": "ChemistScreen (Central Dispensary, Approvals & Mission Dispatch)",
            "route": "Chemist (or Chemist DashboardTab)",
            "role": "CHEMIST, ADMIN",
            "desc": "The primary operational hub for registered pharmacists. Organized into 4 tabs: (1) PROPOSALS: Reviews doctor drug requisitions, approves them to auto-catalog new SKUs with initial stock, or rejects them. (2) DISPENSARY: Incoming prescription orders awaiting fulfillment. (3) DISPATCH: Robot mission launcher where the chemist selects destination bed, priority, custom 4-digit OTP PIN (e.g. 4821), packs the medicine payload, and launches autonomous transit. (4) LOW STOCK: Inventory warnings.",
            "components": "4-Tab Header (Proposals, Dispensary, Dispatch, Low Stock), Proposal cards with Approve/Order actions, Dispatch Bot payload packing form, 4-digit Passcode input, Stock restock cards.",
            "store": "useInventoryStore, useDeliveryStore, useAuthStore",
            "api": "POST /api/erp/proposals/{id}/approve/; POST /api/erp/inventory/restock/; POST /api/erp/orders/dispatch/."
        },
        {
            "num": "5.7",
            "name": "InventoryManagementScreen (Formulary Catalog & SKU Gate)",
            "route": "InventoryManagement (or Chemist MissionTab)",
            "role": "CHEMIST, ADMIN (Doctor Restock Blocked with HTTP 403)",
            "desc": "Dedicated pharmacy inventory management console. Enforces the strict Chemist Inventory Gate: only pharmacists can add new drugs, adjust threshold reorder levels, or restock medication quantities (+25 units). Doctors attempting to restock receive a 403 Forbidden alert. Includes real-time catalog search across 160+ SKUs, category filtering (Critical Care, Antibiotic, Analgesic, IV Fluid, Cardiac), and batch stock level indicators.",
            "components": "Search & Category filters, SKU item cards with stock bar & thresholds, Restock (+25 units) button, Add New SKU modal, Pending Doctor Proposals queue counter.",
            "store": "useInventoryStore (inventory, restockDrug, approveDrugRequest)",
            "api": "GET /api/erp/inventory/; POST /api/erp/inventory/restock/ (role-gated to Chemist)."
        },
        {
            "num": "5.8",
            "name": "DeliveryDetailScreen (Live Mission Tracker & SG90 Hatch PIN Unlock)",
            "route": "DeliveryDetail",
            "role": "All Personas (Hatch Unlock restricted to Nurse/Patient with matching PIN)",
            "desc": "Real-time delivery mission visualizer. Displays a 6-stage mission progress timeline: (1) Order Placed, (2) Chemist Compartment Loaded, (3) Transit & Lift Autonomous Navigation, (4) Arrived at Bedside Station, (5) SG90 Servo Hatch Unlocked, (6) Return to Autonomous Dock. Displays the live SG90 servo deadbolt status (LOCKED / UNLOCKED). Tapping 'Enter Delivery PIN' opens the OtpModal keypad. Entering the matching 4-digit PIN (e.g. 4821) actuates the deadbolt and triggers billing.",
            "components": "Mission Status Banner, 6-Stage Visual Timeline Stepper with waypoint milestones, Compartment Deadbolt Lock Status widget, 'Enter Delivery PIN / Unlock Hatch' button, OtpModal keypad.",
            "store": "useDeliveryStore (deliveries, advanceDeliveryStage), useRobotStore (hatchState)",
            "api": "POST /api/robot/hatch/unlock/ (verifies PIN OTP, actuates SG90 servo, injects turnaround fee)."
        },
        {
            "num": "5.9",
            "name": "CallingMatrixScreen (50-Bed Ward Intercom & Code Red Matrix)",
            "route": "CallingMatrix",
            "role": "All Personas (Patients restricted to their own bed)",
            "desc": "Hospital emergency and assistance grid. Maps all 50 beds across 5 floors (10 beds per floor) with real-time occupancy status. Staff can select any floor and bed to view patient name, active alerts, and delivery statuses. Patients see only their own bed (Bed 12). Allows triggering three levels of assistance: (1) Routine Nursing Assistance, (2) Doctor Urgent Bedside Consult, and (3) CODE RED Resuscitation Alarm. Staff can resolve active alerts with a single tap.",
            "components": "5-Floor Selector chips, 10-Bed Grid per floor with occupancy tags, Alert Dispatch Panel (Routine, Urgent, Code Red), Live Facility Alerts Feed with 'Resolve' action buttons.",
            "store": "useCallingMatrixStore (alerts, triggerAlert, resolveAlert), useAuthStore",
            "api": "POST /api/erp/alerts/create/; POST /api/erp/alerts/{id}/resolve/."
        },
        {
            "num": "5.10",
            "name": "RobotMonitoringScreen (Telemetry Radar, 100Hz LiDAR & Emergency Stop)",
            "route": "RobotMonitoring (or Admin RobotTab)",
            "role": "ADMIN, DOCTOR, NURSE, CHEMIST",
            "desc": "High-frequency robotics telemetry monitoring console. Visualizes real-time distance data streamed from the TF-Luna LiDAR rangefinder. Categorizes distance into three safety zones: Path Clear (>100cm, green), Approaching Obstacle (51-100cm, amber/slow), and Obstacle Detected (<=50cm, red/automatic safety brake locked). Includes interactive distance simulation buttons, robot coordinate telemetry (X, Y, Theta, Floor), battery diagnostics, and a manual Emergency Stop toggle.",
            "components": "LiDAR Distance Gauge & Zone Banner, Emergency Stop / Reset button, Interactive Distance Simulator chips (250cm, 80cm, 30cm), Battery & Power card, Hardware specs card.",
            "store": "useRobotStore (lidar, power, emergencyStop, hatchState, triggerEmergencyStop)",
            "api": "GET /api/robot/telemetry/ (streams 100Hz black-box flight buffer, battery mV, motor velocity)."
        },
        {
            "num": "5.11",
            "name": "ElevatorControlScreen (5-Floor IoT Lift Shaft & Relay Handshake)",
            "route": "ElevatorControl (or Admin FacilityTab)",
            "role": "ADMIN Only (RoleGuard Enforced)",
            "desc": "Industrial IoT facility interface managing multi-floor transit. Features a vertical 5-floor shaft graphic displaying the real-time position of the elevator cabin, the current floor of MediBot, and the target delivery floor. Displays the state of all 5 optocoupler relays: Floor Call Relay, In-Cabin Floor Selection Relay, Door Sensor Interlock Relay, and Travel Active Relay. Facility administrators can manually trigger lift calls to test relay handshakes.",
            "components": "Vertical 5-Floor Shaft Visualizer with cabin & MediBot markers, Relay Node Health status badge, Optocoupler Handshake diagnostics table, Manual Floor Call test buttons (Floors 1-5).",
            "store": "useRobotStore (lift, currentFloor, commandLift)",
            "api": "GET /api/erp/lift-bridge/; POST /api/erp/lift-bridge/call/ (triggers optocoupler relay pulse)."
        },
        {
            "num": "5.12",
            "name": "BillingScreen (Turnaround Surcharge & Patient EMR Settlement)",
            "route": "Billing (or Patient FacilityTab)",
            "role": "All Personas (Patient sees Bed 12 only; Admin settles discharge)",
            "desc": "Comprehensive clinical invoicing and turnaround billing ledger. Itemizes prescribed pharmaceuticals (drug names, quantities, unit prices), daily room charges, and the automated Rs. 150 Autonomous Delivery Turnaround Surcharge incurred upon SG90 hatch unlock. Doctors can submit discharge requests with clinical notes. Facility Administrators can finalize settlement and generate a clinical ReportLab PDF invoice.",
            "components": "Floor & Bed selector (Staff), Itemized Billing Table, Turnaround Delivery Surcharge line, Doctor Discharge Request modal, Admin Finalize Settlement CTA, Invoice Preview modal.",
            "store": "useBillingStore (getBillForBed, dischargeAndSettle, requestDischarge), useAuthStore",
            "api": "GET /api/erp/billing/patient/{bed_id}/; POST /api/erp/billing/discharge/ (generates ReportLab PDF)."
        },
        {
            "num": "5.13",
            "name": "AdminScreen (Enterprise Command Center & Hospital Governance)",
            "route": "Admin (or Admin DashboardTab)",
            "role": "ADMIN Only (RoleGuard Enforced)",
            "desc": "Master executive command center. Displays high-level facility KPIs: Active Fleet Deliveries, Bed Occupancy (36/50 beds), Unresolved Ward Alerts, and System Subsystems Online. Provides one-touch Emergency Fleet Killswitch, live 50-bed occupancy visualizer, elevator relay status, MongoDB collection document counters, and 1-click database backup trigger.",
            "components": "Executive KPI Metric Cards, Emergency Fleet Killswitch button, 50-Bed Matrix filterable by floor, MongoDB Collection inspector cards, Backup & Snapshot Export trigger.",
            "store": "useAuthStore, useRobotStore, useDeliveryStore, useCallingMatrixStore",
            "api": "GET /api/erp/portal/stats/; POST /api/erp/portal/export/ (creates timestamped JSON snapshot)."
        },
        {
            "num": "5.14",
            "name": "UserManagementScreen (Staff Provisioning & RBAC Privilege Matrix)",
            "route": "UserManagement (or Admin AdminTab)",
            "role": "ADMIN Only (RoleGuard Enforced)",
            "desc": "Role-Based Access Control administration portal. Displays all registered hospital staff accounts across Doctor, Nurse, Chemist, and Administrator roles with department and duty shift tags. Administrators can toggle staff active/inactive status and provision new staff members with enterprise email, department, and assigned role.",
            "components": "Staff Directory list with role badges & shift tags, Active/Inactive status switch, 'Provision New Staff Member' Form (Name, Email, Role, Department).",
            "store": "useAuthStore (userAccounts, toggleUserStatus, addUserAccount)",
            "api": "GET /api/erp/rbac/; POST /api/erp/rbac/provision/ (creates enterprise user in auth_user)."
        },
        {
            "num": "5.15",
            "name": "BackendPortalView (Django Single-Page DB & Hardware Console)",
            "route": "GET / (on http://localhost:8000/)",
            "role": "Developers, Facility Engineers, Database Administrators",
            "desc": "A unified Single-Page Developer and Operations Console served directly by Django at port 8000. Features live statistics across all 7 hospital MongoDB collections, instant document query inspector with pagination, 1-click database snapshot exporter, backup ZIP downloader, automated database seeder (seed_erp.py), and interactive hardware actuation simulator for SG90 deadbolts and elevator relays.",
            "components": "Tailwind Dark Mode UI, Collection Data Explorer table, Database Seeder button, Backup ZIP downloader, Live Subsystem Health chips, Hardware Actuation controls.",
            "store": "Django ORM & core.db.MongoDatabase",
            "api": "GET /api/erp/portal/stats/, GET /api/erp/portal/collection/<name>/, POST /api/erp/portal/seed/."
        }
    ]

    for sc in screens_list:
        story.append(Paragraph(f"<b>{sc['num']} {sc['name']}</b>", styles['DocH2']))
        
        sc_data = [
            [Paragraph("<b>Route / Navigation:</b>", styles['TableCellBold']), Paragraph(sc['route'], styles['TableCell'])],
            [Paragraph("<b>Access Role Clearance:</b>", styles['TableCellBold']), Paragraph(sc['role'], styles['TableCell'])],
            [Paragraph("<b>Functional Purpose:</b>", styles['TableCellBold']), Paragraph(sc['desc'], styles['TableCell'])],
            [Paragraph("<b>Key UI Components:</b>", styles['TableCellBold']), Paragraph(sc['components'], styles['TableCell'])],
            [Paragraph("<b>State Store / Hooks:</b>", styles['TableCellBold']), Paragraph(sc['store'], styles['TableCell'])],
            [Paragraph("<b>Backend API / Hardware:</b>", styles['TableCellBold']), Paragraph(sc['api'], styles['TableCell'])],
        ]
        t_sc = Table(sc_data, colWidths=[content_w*0.22, content_w*0.78])
        t_sc.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, c_border),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_sc)
        story.append(Spacer(1, 8))

    story.append(PageBreak())

    # =========================================================
    # SECTION 6: SECURITY & SAFETY INTERLOCK PROTOCOLS
    # =========================================================
    story.append(Paragraph("6. Security, Safety Interlocks & Compliance Protocols", styles['DocH1']))
    story.append(Paragraph(
        "To satisfy strict clinical safety and patient privacy regulations, MediBot incorporates multi-layered hardware and software interlocks.",
        styles['DocBody']
    ))

    protocols_data = [
        [Paragraph("Security / Safety Subsystem", styles['TableHeader']), Paragraph("Implementation Mechanism", styles['TableHeader']), Paragraph("Failure Mode & Mitigation", styles['TableHeader'])],
        [
            Paragraph("<b>Patient Bed 12 Isolation</b>", styles['TableCellBold']),
            Paragraph("Client-side RoleGuard filters all views; server-side CorsAndRoleMiddleware intercepts requests. Inpatient Ramesh Sharma can only access /api/erp/billing/patient/12/.", styles['TableCell']),
            Paragraph("Requests to other bed IDs return HTTP 403 Forbidden with audit logging in MongoDB hardware_logs.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chemist Inventory Gate</b>", styles['TableCellBold']),
            Paragraph("Stock replenishment endpoint (/api/erp/inventory/restock/) requires Chemist JWT token. Doctors can only submit non-binding drug proposals via REQ-xxxx.", styles['TableCell']),
            Paragraph("Prevents unauthorized formulary inflation or unverified medication stocking by non-pharmacy personnel.", styles['TableCell'])
        ],
        [
            Paragraph("<b>TF-Luna 100Hz LiDAR Brake</b>", styles['TableCellBold']),
            Paragraph("Distance readings sampled every 10ms. When clearance <= 50cm, ESP32 engages dynamic motor braking independently of high-level WiFi telemetry.", styles['TableCell']),
            Paragraph("Hardware-level safety: obstacle collisions prevented even if WiFi network latency spikes or drops.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Elevator Cabin Interlocks</b>", styles['TableCellBold']),
            Paragraph("5 optocoupler relays monitor optical door sensors. Robot drive motors cannot engage until elevator door-open interlock relay confirms full opening.", styles['TableCell']),
            Paragraph("Eliminates elevator shaft collision risks during multi-floor autonomous transitions.", styles['TableCell'])
        ],
        [
            Paragraph("<b>SG90 Deadbolt OTP Lock</b>", styles['TableCellBold']),
            Paragraph("Motorized hatch remains deadbolt locked throughout corridor and elevator transit. Opens only upon entry of matching 4-digit PIN (e.g. 4821).", styles['TableCell']),
            Paragraph("Protects scheduled drugs and controlled substances from transit tampering or theft.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Automated Turnaround Fee</b>", styles['TableCellBold']),
            Paragraph("Hatch unlock trigger initiates automated billing transaction in billing.models. Appends Rs. 150 turnaround surcharge and compiles ReportLab PDF.", styles['TableCell']),
            Paragraph("Guarantees accurate hospital cost recovery for autonomous robotics transport per patient stay.", styles['TableCell'])
        ]
    ]
    t_proto = Table(protocols_data, colWidths=[content_w*0.25, content_w*0.42, content_w*0.33])
    t_proto.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_proto)
    story.append(Spacer(1, 10))

    # =========================================================
    # SECTION 7: VERIFICATION RESULTS & TEST SUITE
    # =========================================================
    story.append(Paragraph("7. Automated Test Suite & Verification Results", styles['DocH1']))
    story.append(Paragraph(
        "The MediBot backend includes a comprehensive automated test suite (<code>test_erp.py</code>). All 18 automated tests execute synchronously with <b>100% success</b>.",
        styles['DocBody']
    ))

    test_results_data = [
        [Paragraph("Test #", styles['TableHeader']), Paragraph("Verified Subsystem / Test Case", styles['TableHeader']), Paragraph("Pass Criteria & Assertion", styles['TableHeader']), Paragraph("Result", styles['TableHeader'])],
        [Paragraph("1", styles['TableCell']), Paragraph("API Health Check", styles['TableCellBold']), Paragraph("status == 'HEALTHY', 7 subsystems active", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("2", styles['TableCell']), Paragraph("JWT Authentication", styles['TableCellBold']), Paragraph("Valid Doctor token generated & role == 'DOCTOR'", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("3", styles['TableCell']), Paragraph("160+ Drug Catalog", styles['TableCellBold']), Paragraph("total_items >= 160 (501 items cataloged)", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("4", styles['TableCell']), Paragraph("Low Stock Detection", styles['TableCellBold']), Paragraph("Identifies 29 items below reorder threshold", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("5", styles['TableCell']), Paragraph("ESP32 Telemetry", styles['TableCellBold']), Paragraph("LiDAR, battery, floor sub-second sync", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("6", styles['TableCell']), Paragraph("100Hz LiDAR Buffer", styles['TableCellBold']), Paragraph("100 samples in black-box flight recorder", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("7", styles['TableCell']), Paragraph("5-Floor Lift Handshake", styles['TableCellBold']), Paragraph("Floors 1-5 optocoupler relays pulse-linked", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("8", styles['TableCell']), Paragraph("SG90 Hatch Unlock", styles['TableCellBold']), Paragraph("Rs. 150 delivery turnaround fee injected", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("9", styles['TableCell']), Paragraph("Patient Bed Isolation", styles['TableCellBold']), Paragraph("Bed 12 allowed; Bed 24 blocked with 403", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("10", styles['TableCell']), Paragraph("ReportLab PDF Generator", styles['TableCellBold']), Paragraph("Generated 4907-byte clinical PDF invoice", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("11", styles['TableCell']), Paragraph("Doctor Drug Proposal", styles['TableCellBold']), Paragraph("REQ-1342 successfully queued for Chemist", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("12", styles['TableCell']), Paragraph("Chemist Approval Queue", styles['TableCellBold']), Paragraph("4 pending doctor proposals verified", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("13", styles['TableCell']), Paragraph("SKU Auto-Cataloging", styles['TableCellBold']), Paragraph("Approval creates 'DRG-DEX-01' in catalog", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("14", styles['TableCell']), Paragraph("Chemist Restock (+25)", styles['TableCellBold']), Paragraph("Catalog stock incremented by 25 units", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("15", styles['TableCell']), Paragraph("Chemist Gate Isolation", styles['TableCellBold']), Paragraph("Doctor restock attempt blocked with 403", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("16", styles['TableCell']), Paragraph("Order DEL-1342 Creation", styles['TableCellBold']), Paragraph("Doctor routes delivery to Bed 12 Floor 2", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("17", styles['TableCell']), Paragraph("Chemist OTP Dispatch", styles['TableCellBold']), Paragraph("Mission launched with OTP PIN 4821", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
        [Paragraph("18", styles['TableCell']), Paragraph("PIN 4821 Verification", styles['TableCellBold']), Paragraph("Hatch unlocked & turnaround billed to EMR", styles['TableCell']), Paragraph("<font color='#059669'><b>PASS</b></font>", styles['TableCell'])],
    ]
    t_test = Table(test_results_data, colWidths=[content_w*0.08, content_w*0.32, content_w*0.48, content_w*0.12])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_navy),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
    ]))
    story.append(t_test)
    story.append(Spacer(1, 10))

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built at: {OUTPUT_PDF}")

if __name__ == '__main__':
    build_pdf()
