import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output directory for diagrams
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Modern Medical Color Palette
NAVY_DARK = '#0F172A'
NAVY_CARD = '#1E293B'
NAVY_LIGHT = '#334155'
TEXT_WHITE = '#F8FAFC'
TEXT_MUTED = '#94A3B8'
CYAN_ACCENT = '#06B6D4'
BLUE_PRIMARY = '#3B82F6'
EMERALD_SUCCESS = '#10B981'
AMBER_WARNING = '#F59E0B'
ROSE_DANGER = '#F43F5E'
PURPLE_ACCENT = '#8B5CF6'
BG_LIGHT = '#F1F5F9'

# -------------------------------------------------------------
# DIAGRAM 1: FULL SYSTEM ARCHITECTURE
# -------------------------------------------------------------
def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(15, 8.5), dpi=300)
    ax.set_facecolor('#0B0F19')
    fig.patch.set_facecolor('#0B0F19')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 96, "MEDIBOT ENTERPRISE SYSTEM ARCHITECTURE", ha='center', va='center', 
            fontsize=18, fontweight='bold', color=TEXT_WHITE)
    ax.text(50, 93, "Intra-Hospital Logistics, Autonomous Robotics & Multi-Persona Cloud ERP", 
            ha='center', va='center', fontsize=11, color=CYAN_ACCENT)

    # 4 Main Columns / Layers
    layers = [
        {"title": "1. FRONTEND CONSOLE (REACT NATIVE / EXPO)", "x": 3, "w": 21, "color": BLUE_PRIMARY},
        {"title": "2. GATEWAY & API ROUTER (DJANGO REST)", "x": 27, "w": 21, "color": CYAN_ACCENT},
        {"title": "3. BACKEND ERP & DATABASE ENGINE", "x": 51, "w": 21, "color": PURPLE_ACCENT},
        {"title": "4. ROBOTICS & FACILITY HARDWARE", "x": 75, "w": 22, "color": EMERALD_SUCCESS},
    ]

    for lay in layers:
        # Layer Header Box
        hdr_rect = patches.FancyBboxPatch((lay['x'], 84), lay['w'], 5, boxstyle="round,pad=0.3,rounding_size=1",
                                          facecolor=lay['color'], edgecolor='none')
        ax.add_patch(hdr_rect)
        ax.text(lay['x'] + lay['w']/2, 86.5, lay['title'], ha='center', va='center',
                fontsize=8, fontweight='bold', color=TEXT_WHITE)
        
        # Layer Container Background
        bg_rect = patches.FancyBboxPatch((lay['x'], 5), lay['w'], 77, boxstyle="round,pad=0.3,rounding_size=1.5",
                                         facecolor=NAVY_CARD, edgecolor=NAVY_LIGHT, linewidth=1.2)
        ax.add_patch(bg_rect)

    # FRONTEND MODULES (Col 1)
    fe_boxes = [
        ("Doctor Portal", "STAT Bed Prescribing (Beds 1-50)\nNew Drug Proposal Requisitions\nEmergency Intercom & Code Red", ROSE_DANGER),
        ("Chemist Dispensary", "160+ Drug Catalog & Restock\nDoctor Drug Proposal Approvals\nRobot Payload Packing & OTP Dispatch", CYAN_ACCENT),
        ("Nurse Ward Station", "50-Bed Ward Call Monitoring\nSG90 Hatch Unlock Keypad\nWard Stock Delivery Verification", BLUE_PRIMARY),
        ("Patient Bedside", "Strict Bed 12 Isolation Boundary\nReal-Time 6-Stage Delivery Stepper\nNurse Call & Turnaround Invoice", AMBER_WARNING),
        ("Admin Command", "Live Fleet Telemetry Radar\n5-Floor Elevator Optocoupler IoT\nStaff RBAC Provisioning", PURPLE_ACCENT),
    ]
    y_pos = 73
    for title, desc, col in fe_boxes:
        box = patches.FancyBboxPatch((4.5, y_pos), 18, 10, boxstyle="round,pad=0.2,rounding_size=0.8",
                                     facecolor=NAVY_DARK, edgecolor=col, linewidth=1.5)
        ax.add_patch(box)
        ax.text(5.5, y_pos + 7.5, title, fontsize=9, fontweight='bold', color=col)
        ax.text(5.5, y_pos + 3.5, desc, fontsize=6.8, color=TEXT_MUTED, linespacing=1.2)
        y_pos -= 13.5

    # GATEWAY MODULES (Col 2)
    gw_boxes = [
        ("Authentication & RBAC", "JWT Bearer Authentication\nRoleGuard HTTP 403 Enforcers\nMulti-Persona Instant Switcher", BLUE_PRIMARY),
        ("REST API Router", "/api/erp/proposals/ (Formulary)\n/api/erp/lift-bridge/ (IoT Lift)\n/api/erp/beds/ (Ward Isolation)", CYAN_ACCENT),
        ("Telemetry Stream Gateway", "100Hz TF-Luna LiDAR Polling\nRobot Coordinates (X, Y, Floor)\nESP32 Battery & Motor Status", EMERALD_SUCCESS),
        ("Autonomous Simulation Loop", "mqttService Autonomous Simulator\nCorridor Waypoint Calculation\nElevator Floor Handshake Bridge", PURPLE_ACCENT),
        ("CORS & Security Middleware", "Cross-Origin Header Whitelist\nRole-Based Endpoint Gates\nBed 12 Patient Route Interceptor", ROSE_DANGER),
    ]
    y_pos = 73
    for title, desc, col in gw_boxes:
        box = patches.FancyBboxPatch((28.5, y_pos), 18, 10, boxstyle="round,pad=0.2,rounding_size=0.8",
                                     facecolor=NAVY_DARK, edgecolor=col, linewidth=1.5)
        ax.add_patch(box)
        ax.text(29.5, y_pos + 7.5, title, fontsize=9, fontweight='bold', color=col)
        ax.text(29.5, y_pos + 3.5, desc, fontsize=6.8, color=TEXT_MUTED, linespacing=1.2)
        y_pos -= 13.5

    # BACKEND ERP MODULES (Col 3)
    be_boxes = [
        ("Single-Page Operations Console", "Django BackendPortalView (Port 8000)\nLive DB Query & JSON Synchronizer\nSnapshot Seed Engine (backup_manager)", PURPLE_ACCENT),
        ("Turnaround Invoicing Engine", "ReportLab Automated Clinical PDF\nRs. 150 Autonomous Delivery Fee\nEMR Patient Ledger Settlement", EMERALD_SUCCESS),
        ("Relational SQLite Database", "db.sqlite3 Core Models:\n- BedAllocation (50 Ward Units)\n- InventorySKU (160+ Drugs)\n- IoTLiftBridge (Floors 1-5)", BLUE_PRIMARY),
        ("Document MongoDB Singleton", "core.db.MongoDatabase\nCollections: users, inventory, orders,\ntelemetry, billing, hardware_logs", CYAN_ACCENT),
        ("Hardware Actuation Endpoints", "/api/erp/portal/hardware/actuate/\nRemote Deadbolt Actuation & Relay Test\nBlack-Box Flight Buffer Exporter", ROSE_DANGER),
    ]
    y_pos = 73
    for title, desc, col in be_boxes:
        box = patches.FancyBboxPatch((52.5, y_pos), 18, 10, boxstyle="round,pad=0.2,rounding_size=0.8",
                                     facecolor=NAVY_DARK, edgecolor=col, linewidth=1.5)
        ax.add_patch(box)
        ax.text(53.5, y_pos + 7.5, title, fontsize=9, fontweight='bold', color=col)
        ax.text(53.5, y_pos + 3.5, desc, fontsize=6.8, color=TEXT_MUTED, linespacing=1.2)
        y_pos -= 13.5

    # HARDWARE MODULES (Col 4)
    hw_boxes = [
        ("ESP32 Dual-Core Controller", "240MHz Embedded IoT Engine\nFreeRTOS Telemetry Pipeline\nWiFi & BLE Connectivity Matrix", EMERALD_SUCCESS),
        ("TF-Luna LiDAR Rangefinder", "100Hz High-Speed Obstacle Scanning\nBlack-Box Flight Buffer (100 Samples)\nAutomatic Emergency Brake (<50cm)", ROSE_DANGER),
        ("SG90 Servo Deadbolt Hatch", "Motorized Medicine Chamber Lock\n4-Digit Cryptographic OTP Gate\nPhysical Tamper-Proof Enclosure", AMBER_WARNING),
        ("5-Floor Lift Optocoupler Relay", "5-Channel Opto-Isolated Relay Board\nInterlock: Call, Floor Select, Door Sensor\nMulti-Floor Elevator Cabin Bridge", BLUE_PRIMARY),
        ("Power & Drive Train", "12V 10Ah LiFePO4 Battery Pack\nDual DC Encoders & Motor Drivers\nContinuous Voltage & Current Monitor", CYAN_ACCENT),
    ]
    y_pos = 73
    for title, desc, col in hw_boxes:
        box = patches.FancyBboxPatch((77, y_pos), 18, 10, boxstyle="round,pad=0.2,rounding_size=0.8",
                                     facecolor=NAVY_DARK, edgecolor=col, linewidth=1.5)
        ax.add_patch(box)
        ax.text(78, y_pos + 7.5, title, fontsize=9, fontweight='bold', color=col)
        ax.text(78, y_pos + 3.5, desc, fontsize=6.8, color=TEXT_MUTED, linespacing=1.2)
        y_pos -= 13.5

    # Inter-Layer Communication Arrows
    arrow_props = dict(arrowstyle="->,head_width=0.4,head_length=0.6", color=CYAN_ACCENT, lw=2)
    ax.annotate("", xy=(27, 50), xytext=(24, 50), arrowprops=arrow_props)
    ax.annotate("", xy=(51, 50), xytext=(48, 50), arrowprops=arrow_props)
    ax.annotate("", xy=(75, 50), xytext=(72, 50), arrowprops=arrow_props)

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'diagram_system_architecture.png'), facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
    plt.close()
    print("Generated: diagram_system_architecture.png")

# -------------------------------------------------------------
# DIAGRAM 2: COMPLETE PAGE FLOW & NAVIGATION MAP
# -------------------------------------------------------------
def generate_navigation_flow():
    fig, ax = plt.subplots(figsize=(15, 9.5), dpi=300)
    ax.set_facecolor('#0B0F19')
    fig.patch.set_facecolor('#0B0F19')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 97, "MEDIBOT APPLICATION PAGE FLOW & NAVIGATION MAP", ha='center', va='center',
            fontsize=18, fontweight='bold', color=TEXT_WHITE)
    ax.text(50, 94, "Complete Screen Hierarchy, Multi-Persona Routing & Shared Stack Screens",
            ha='center', va='center', fontsize=10.5, color=CYAN_ACCENT)

    # ENTRY LEVEL (Top)
    # 1. Welcome Screen
    w_box = patches.FancyBboxPatch((5, 83), 24, 7.5, boxstyle="round,pad=0.2,rounding_size=1",
                                   facecolor=NAVY_CARD, edgecolor=CYAN_ACCENT, linewidth=1.5)
    ax.add_patch(w_box)
    ax.text(17, 88, "1. WelcomeScreen", ha='center', va='center', fontsize=10, fontweight='bold', color=CYAN_ACCENT)
    ax.text(17, 85, "Splash Animation • Subsystem Readiness", ha='center', va='center', fontsize=7.5, color=TEXT_MUTED)

    # 2. Home Screen
    h_box = patches.FancyBboxPatch((38, 83), 24, 7.5, boxstyle="round,pad=0.2,rounding_size=1",
                                   facecolor=NAVY_CARD, edgecolor=BLUE_PRIMARY, linewidth=1.5)
    ax.add_patch(h_box)
    ax.text(50, 88, "2. HomeScreen", ha='center', va='center', fontsize=10, fontweight='bold', color=BLUE_PRIMARY)
    ax.text(50, 85, "Hospital Overview • Fleet Telemetry Banner", ha='center', va='center', fontsize=7.5, color=TEXT_MUTED)

    # 3. Login Screen
    l_box = patches.FancyBboxPatch((71, 83), 24, 7.5, boxstyle="round,pad=0.2,rounding_size=1",
                                   facecolor=NAVY_CARD, edgecolor=EMERALD_SUCCESS, linewidth=1.5)
    ax.add_patch(l_box)
    ax.text(83, 88, "3. LoginScreen", ha='center', va='center', fontsize=10, fontweight='bold', color=EMERALD_SUCCESS)
    ax.text(83, 85, "1-Tap Persona Switcher • JWT Auth Gateway", ha='center', va='center', fontsize=7.5, color=TEXT_MUTED)

    # Connect Top level
    arr_top = dict(arrowstyle="->,head_width=0.3,head_length=0.5", color=TEXT_MUTED, lw=1.5)
    ax.annotate("", xy=(38, 86.75), xytext=(29, 86.75), arrowprops=arr_top)
    ax.annotate("", xy=(71, 86.75), xytext=(62, 86.75), arrowprops=arr_top)

    # Downward arrow to Role Navigators
    ax.annotate("", xy=(50, 77), xytext=(83, 83), arrowprops=dict(arrowstyle="->,head_width=0.4,head_length=0.6", color=EMERALD_SUCCESS, lw=2, connectionstyle="arc3,rad=-0.15"))

    # MIDDLE LEVEL: 5 ROLE TAB NAVIGATORS
    role_tabs = [
        {"role": "PATIENT PORTAL", "sub": "Bed 12 Isolated Ward", "x": 2, "w": 18, "col": AMBER_WARNING,
         "tabs": ["My Bed 12 (PatientScreen)", "Assistance (CallingMatrix)", "Track Meds (DeliveryDetail)", "My Invoice (BillingScreen)", "Profile (ProfileScreen)"]},
        {"role": "DOCTOR PORTAL", "sub": "STAT Clinical Prescribing", "x": 21.5, "w": 18, "col": ROSE_DANGER,
         "tabs": ["Doctor Hub (DashboardScreen)", "STAT Prescribe (DoctorOrderScreen)", "Code Red (CallingMatrix)", "Profile (ProfileScreen)"]},
        {"role": "NURSE PORTAL", "sub": "Ward Station & Assistance", "x": 41, "w": 18, "col": BLUE_PRIMARY,
         "tabs": ["Ward Station (DashboardScreen)", "Bed Calls (CallingMatrix)", "Hatch Unlock (DeliveryDetail)", "Ward Order (DoctorOrder)", "Profile (ProfileScreen)"]},
        {"role": "CHEMIST PORTAL", "sub": "Dispensary & SKU Gate", "x": 60.5, "w": 18, "col": CYAN_ACCENT,
         "tabs": ["Dispensary (ChemistScreen)", "Stock & Queue (InventoryMgmt)", "Dispatch Bot (DeliveryCreate)", "Low Stock (LowStockScreen)", "Profile (ProfileScreen)"]},
        {"role": "ADMIN PORTAL", "sub": "Command & Fleet Telemetry", "x": 80, "w": 18, "col": PURPLE_ACCENT,
         "tabs": ["Command (AdminScreen)", "50 Beds (CallingMatrix)", "Telemetry (RobotMonitoring)", "Lift IoT (ElevatorControl)", "Staff & RBAC (UserManagement)"]},
    ]

    for rt in role_tabs:
        # Header
        rh = patches.FancyBboxPatch((rt['x'], 69), rt['w'], 6.5, boxstyle="round,pad=0.2,rounding_size=0.8",
                                    facecolor=NAVY_CARD, edgecolor=rt['col'], linewidth=1.5)
        ax.add_patch(rh)
        ax.text(rt['x'] + rt['w']/2, 73.5, rt['role'], ha='center', va='center', fontsize=8.5, fontweight='bold', color=rt['col'])
        ax.text(rt['x'] + rt['w']/2, 70.8, rt['sub'], ha='center', va='center', fontsize=6.5, color=TEXT_MUTED)

        # Tab Screens Container
        rc = patches.FancyBboxPatch((rt['x'], 40), rt['w'], 27.5, boxstyle="round,pad=0.2,rounding_size=0.8",
                                    facecolor=NAVY_DARK, edgecolor=NAVY_LIGHT, linewidth=1)
        ax.add_patch(rc)
        
        y_tab = 64
        for tab_name in rt['tabs']:
            t_box = patches.FancyBboxPatch((rt['x'] + 1, y_tab - 3.5), rt['w'] - 2, 4.5, boxstyle="round,pad=0.1,rounding_size=0.5",
                                           facecolor=NAVY_CARD, edgecolor=rt['col'] + '55', linewidth=0.8)
            ax.add_patch(t_box)
            ax.text(rt['x'] + rt['w']/2, y_tab - 1.25, tab_name, ha='center', va='center', fontsize=6.2, color=TEXT_WHITE)
            y_tab -= 5.3

    # BOTTOM LEVEL: SHARED SYSTEM STACK SCREENS & MODALS
    shared_box = patches.FancyBboxPatch((2, 5), 96, 30, boxstyle="round,pad=0.3,rounding_size=1.2",
                                        facecolor=NAVY_CARD, edgecolor=CYAN_ACCENT, linewidth=1.5)
    ax.add_patch(shared_box)
    ax.text(50, 32.5, "SHARED DETAIL SCREENS & SPECIALIZED MODALS (STACK NAVIGATOR)", ha='center', va='center',
            fontsize=11, fontweight='bold', color=CYAN_ACCENT)

    shared_screens = [
        ("DeliveryDetailScreen & OtpModal", "6-stage mission tracker, waypoint timeline, SG90 servo hatch 4-digit PIN verification keypad (actuates deadbolt & generates turnaround billing)", 4, 19, 29),
        ("DoctorOrder & SuggestDrugModal", "Prescribe to beds 1-50, multi-item drug cart, priority flag. Includes Doctor Drug Proposal Modal to queue unlisted drugs (REQ-xxxx) for Chemist approval", 35.5, 19, 29),
        ("RobotMonitoringScreen", "Live 100Hz TF-Luna LiDAR rangefinder, black-box flight buffer, manual distance simulator, battery diagnostics, safety brake lock & emergency stop button", 67, 19, 29),
        ("ElevatorControlScreen", "5-Floor vertical shaft visualizer, 5-channel optocoupler relay handshake, cabin position tracking, door open/close interlock, and manual floor call override", 4, 7, 29),
        ("BillingScreen & InvoiceModal", "Bedside patient ledger, pharmacy items tally, Rs. 150 autonomous delivery fee, doctor discharge request submission, admin discharge settlement, ReportLab PDF", 35.5, 7, 29),
        ("CallingMatrix & AlertModal", "50-bed ward calling grid mapped across 5 floors, routine nursing call, doctor urgent bedside summons, Code Red emergency resuscitation buzzer", 67, 7, 29),
    ]

    for title, desc, sx, sy, sw in shared_screens:
        s_card = patches.FancyBboxPatch((sx, sy), sw, 10, boxstyle="round,pad=0.2,rounding_size=0.6",
                                        facecolor=NAVY_DARK, edgecolor=NAVY_LIGHT, linewidth=1)
        ax.add_patch(s_card)
        ax.text(sx + 1, sy + 8, title, fontsize=8, fontweight='bold', color=TEXT_WHITE)
        ax.text(sx + 1, sy + 4, desc, fontsize=6.2, color=TEXT_MUTED, linespacing=1.2)

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'diagram_navigation_flow.png'), facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
    plt.close()
    print("Generated: diagram_navigation_flow.png")

# -------------------------------------------------------------
# DIAGRAM 3: END-TO-END DELIVERY LIFECYCLE
# -------------------------------------------------------------
def generate_delivery_lifecycle():
    fig, ax = plt.subplots(figsize=(15, 8.5), dpi=300)
    ax.set_facecolor('#0B0F19')
    fig.patch.set_facecolor('#0B0F19')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 96, "END-TO-END INTRA-HOSPITAL AUTONOMOUS DELIVERY LIFECYCLE", ha='center', va='center',
            fontsize=17, fontweight='bold', color=TEXT_WHITE)
    ax.text(50, 93, "Cross-Persona Workflow: Doctor -> Chemist -> MediBot Robot -> Nurse/Patient -> Billing Engine",
            ha='center', va='center', fontsize=10.5, color=CYAN_ACCENT)

    steps = [
        {
            "num": "STEP 1",
            "title": "CLINICAL PRESCRIBE",
            "actor": "Doctor (MD)",
            "col": ROSE_DANGER,
            "x": 3,
            "points": [
                "Doctor logs in via DoctorOrderScreen",
                "Selects Target Bed (e.g. Bed 12, Floor 2)",
                "Picks drugs from catalog or files New Drug Proposal (REQ-1342)",
                "Sets Priority (EMERGENCY_STAT)",
                "Order queued to Central Dispensary"
            ]
        },
        {
            "num": "STEP 2",
            "title": "VERIFY & DISPATCH",
            "actor": "Chemist (R.Ph)",
            "col": CYAN_ACCENT,
            "x": 22.5,
            "points": [
                "Chemist reviews Dispensary Queue",
                "Approves drug proposal -> catalogs SKU",
                "Retrieves medicine from secure stock",
                "Packs MediBot hatch chamber",
                "Generates 4-digit PIN OTP (e.g. 4821)",
                "Engages autonomous dispatch transit"
            ]
        },
        {
            "num": "STEP 3",
            "title": "AUTONOMOUS TRANSIT",
            "actor": "MediBot Robot",
            "col": BLUE_PRIMARY,
            "x": 42,
            "points": [
                "ESP32 navigation loop engaged",
                "TF-Luna LiDAR scans corridors at 100Hz",
                "Obstacle avoidance: halt if distance < 50cm",
                "Approaches 5-floor elevator shaft",
                "Optocoupler relay triggers lift floor call",
                "Enters cabin, rides to Floor 2, exits to ward"
            ]
        },
        {
            "num": "STEP 4",
            "title": "BED ARRIVAL & UNLOCK",
            "actor": "Nurse (RN) / Patient",
            "col": EMERALD_SUCCESS,
            "x": 61.5,
            "points": [
                "Robot docks at bedside (Bed 12)",
                "Audio beacon & bedside alert chime",
                "Nurse/Patient opens DeliveryDetailScreen",
                "Enters 4-digit OTP PIN (4821)",
                "SG90 servo deadbolt actuates & unlocks",
                "Prescription payload safely retrieved"
            ]
        },
        {
            "num": "STEP 5",
            "title": "BILLING & DOCK RETURN",
            "actor": "Automated Cloud ERP",
            "col": PURPLE_ACCENT,
            "x": 81,
            "points": [
                "Hatch close verified by microswitch",
                "Turnaround surcharge (+Rs. 150) injected",
                "ReportLab generates clinical PDF invoice",
                "Patient EMR billing ledger updated",
                "Delivery status: RETURN_TO_DOCK",
                "Robot navigates back to Base Dock #1"
            ]
        }
    ]

    for s in steps:
        # Container
        box = patches.FancyBboxPatch((s['x'], 8), 16, 80, boxstyle="round,pad=0.2,rounding_size=1",
                                     facecolor=NAVY_CARD, edgecolor=s['col'], linewidth=1.5)
        ax.add_patch(box)

        # Step Header Pill
        pill = patches.FancyBboxPatch((s['x'] + 1, 80), 14, 6, boxstyle="round,pad=0.2,rounding_size=0.6",
                                      facecolor=s['col'], edgecolor='none')
        ax.add_patch(pill)
        ax.text(s['x'] + 8, 83.5, s['num'], ha='center', va='center', fontsize=9, fontweight='bold', color=TEXT_WHITE)
        ax.text(s['x'] + 8, 81.5, s['title'], ha='center', va='center', fontsize=7, fontweight='bold', color=TEXT_WHITE)

        # Actor Tag
        ax.text(s['x'] + 8, 76.5, f"Actor: {s['actor']}", ha='center', va='center', fontsize=8, fontweight='bold', color=s['col'])

        # Points
        y_pt = 70
        for pt in s['points']:
            dot = patches.Circle((s['x'] + 1.8, y_pt), 0.5, facecolor=s['col'], edgecolor='none')
            ax.add_patch(dot)
            ax.text(s['x'] + 3, y_pt, pt, va='center', fontsize=6.8, color=TEXT_WHITE, wrap=True)
            y_pt -= 10.5

    # Connecting Flow Arrows between steps
    arrow_flow = dict(arrowstyle="->,head_width=0.4,head_length=0.6", color=TEXT_WHITE, lw=2)
    ax.annotate("", xy=(22.5, 48), xytext=(19, 48), arrowprops=arrow_flow)
    ax.annotate("", xy=(42, 48), xytext=(38.5, 48), arrowprops=arrow_flow)
    ax.annotate("", xy=(61.5, 48), xytext=(58, 48), arrowprops=arrow_flow)
    ax.annotate("", xy=(81, 48), xytext=(77.5, 48), arrowprops=arrow_flow)

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'diagram_delivery_lifecycle.png'), facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
    plt.close()
    print("Generated: diagram_delivery_lifecycle.png")

# -------------------------------------------------------------
# DIAGRAM 4: 5-FLOOR FACILITY & 50-BED WARD MATRIX
# -------------------------------------------------------------
def generate_facility_matrix():
    fig, ax = plt.subplots(figsize=(15, 8.5), dpi=300)
    ax.set_facecolor('#0B0F19')
    fig.patch.set_facecolor('#0B0F19')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 96, "5-FLOOR HOSPITAL FACILITY LAYOUT & 50-BED ALLOCATION MATRIX", ha='center', va='center',
            fontsize=17, fontweight='bold', color=TEXT_WHITE)
    ax.text(50, 93, "Elevator Optocoupler Shaft Bridge, Ward Zones & Bed 12 Strict Patient Isolation",
            ha='center', va='center', fontsize=10.5, color=CYAN_ACCENT)

    # Elevator Shaft on Left (x: 4 to 22)
    shaft_bg = patches.FancyBboxPatch((4, 8), 18, 81, boxstyle="round,pad=0.2,rounding_size=1",
                                      facecolor=NAVY_CARD, edgecolor=CYAN_ACCENT, linewidth=1.5)
    ax.add_patch(shaft_bg)
    ax.text(13, 86, "ELEVATOR SHAFT", ha='center', va='center', fontsize=9.5, fontweight='bold', color=CYAN_ACCENT)
    ax.text(13, 83.5, "5-Relay IoT Bridge", ha='center', va='center', fontsize=7.5, color=TEXT_MUTED)

    # Floors 5 to 1 (Right Side: x: 25 to 96)
    floors = [
        {"num": 5, "name": "FLOOR 5: INTENSIVE CARE & SURGICAL SUITES (ICU/OT)", "beds": "Beds 41 to 50", "col": ROSE_DANGER, "y": 74, "is_lift": False, "is_bot": False},
        {"num": 4, "name": "FLOOR 4: POST-OPERATIVE RECOVERY & ORTHOPEDICS", "beds": "Beds 31 to 40", "col": PURPLE_ACCENT, "y": 58, "is_lift": False, "is_bot": False},
        {"num": 3, "name": "FLOOR 3: CARDIOLOGY WARD & HIGH DEPENDENCY UNIT", "beds": "Beds 21 to 30", "col": BLUE_PRIMARY, "y": 42, "is_lift": True, "is_bot": False},
        {"num": 2, "name": "FLOOR 2: GENERAL MEDICINE & POST-PTCA WARD (BED 12)", "beds": "Beds 11 to 20", "col": AMBER_WARNING, "y": 26, "is_lift": False, "is_bot": True},
        {"num": 1, "name": "FLOOR 1: CENTRAL DISPENSARY, BASE DOCK & EMERGENCY", "beds": "Beds 1 to 10", "col": EMERALD_SUCCESS, "y": 10, "is_lift": False, "is_bot": False},
    ]

    for fl in floors:
        # Floor Container
        f_box = patches.FancyBboxPatch((25, fl['y']), 71, 13, boxstyle="round,pad=0.2,rounding_size=0.8",
                                       facecolor=NAVY_CARD, edgecolor=fl['col'], linewidth=1.2)
        ax.add_patch(f_box)

        # Floor Header
        ax.text(27, fl['y'] + 10.5, fl['name'], fontsize=8.5, fontweight='bold', color=fl['col'])
        ax.text(93, fl['y'] + 10.5, fl['beds'], ha='right', fontsize=7.5, fontweight='bold', color=TEXT_MUTED)

        # Shaft Floor Node
        node_box = patches.FancyBboxPatch((6, fl['y'] + 1.5), 14, 10, boxstyle="round,pad=0.1,rounding_size=0.5",
                                          facecolor=NAVY_DARK, edgecolor=fl['col'], linewidth=1)
        ax.add_patch(node_box)
        ax.text(13, fl['y'] + 8, f"FL-{fl['num']} Relay", ha='center', va='center', fontsize=7.5, fontweight='bold', color=TEXT_WHITE)
        if fl['is_lift']:
            ax.text(13, fl['y'] + 4, "[CABIN HERE]", ha='center', va='center', fontsize=6.8, fontweight='bold', color=CYAN_ACCENT)
        else:
            ax.text(13, fl['y'] + 4, "Interlock Armed", ha='center', va='center', fontsize=6, color=TEXT_MUTED)

        # Horizontal connecting bridge
        ax.plot([20, 25], [fl['y'] + 6.5, fl['y'] + 6.5], color=fl['col'], lw=1.5, linestyle='--')

        # Bed Grid within Floor (10 beds)
        bed_start = (fl['num'] - 1) * 10 + 1
        for b_idx in range(10):
            bed_no = bed_start + b_idx
            bx = 27 + b_idx * 6.8
            by = fl['y'] + 2.5
            
            # Check Bed 12 isolation highlight
            if bed_no == 12:
                b_color = AMBER_WARNING
                b_border = '#FFFFFF'
                b_lw = 2
                tag = "BED 12*"
            elif bed_no <= 36:
                b_color = NAVY_DARK
                b_border = fl['col']
                b_lw = 1
                tag = f"B-{bed_no}"
            else:
                b_color = '#0B0F19'
                b_border = NAVY_LIGHT
                b_lw = 0.8
                tag = f"B-{bed_no}"

            b_rect = patches.FancyBboxPatch((bx, by), 6, 6, boxstyle="round,pad=0.1,rounding_size=0.4",
                                            facecolor=b_color, edgecolor=b_border, linewidth=b_lw)
            ax.add_patch(b_rect)
            ax.text(bx + 3, by + 3.8, tag, ha='center', va='center', fontsize=6.2, fontweight='bold', color=TEXT_WHITE)
            if bed_no == 12:
                ax.text(bx + 3, by + 1.8, "ISOLATED", ha='center', va='center', fontsize=4.8, color=AMBER_WARNING)
            elif bed_no <= 36:
                ax.text(bx + 3, by + 1.8, "OCCUPIED", ha='center', va='center', fontsize=4.8, color=fl['col'])
            else:
                ax.text(bx + 3, by + 1.8, "VACANT", ha='center', va='center', fontsize=4.8, color=TEXT_MUTED)

        # Highlight MediBot position on Floor 2
        if fl['is_bot']:
            bot_tag = patches.FancyBboxPatch((27, fl['y'] + 8.8), 24, 3.5, boxstyle="round,pad=0.1,rounding_size=0.4",
                                            facecolor=EMERALD_SUCCESS, edgecolor='none')
            ax.add_patch(bot_tag)
            ax.text(39, fl['y'] + 10.5, "MEDIBOT CURRENT POSITION: EN ROUTE TO BED 12", ha='center', va='center',
                    fontsize=6, fontweight='bold', color=TEXT_WHITE)

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'diagram_facility_matrix.png'), facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
    plt.close()
    print("Generated: diagram_facility_matrix.png")

if __name__ == '__main__':
    generate_system_architecture()
    generate_navigation_flow()
    generate_delivery_lifecycle()
    generate_facility_matrix()
    print("All 4 architecture and flow diagrams generated successfully!")
