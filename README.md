# MediBot: Intra-Hospital Logistics & Autonomous Delivery System

**SGP Semester 5 Project** | CHARUSAT

MediBot is a comprehensive intra-hospital logistics and robotics platform designed to streamline medicine and supply distribution, track autonomous delivery robots, manage pharmacy inventory, and facilitate role-based workflows for doctors, nurses, pharmacists, and administrators.

---

## 🏗️ System Architecture

The project consists of two core components:

```
medibot-APP/
├── MediBotConsole/     # Frontend: React Native (Expo) Mobile & Tablet Console
└── medibot_erp/        # Backend: Django REST ERP & Robot Telemetry System
```

### 1. [MediBotConsole](./MediBotConsole) (Frontend Console)
A cross-platform React Native (Expo) application providing role-based user interfaces:
- **Doctor Portal**: Prescribe medicines, create patient delivery requests, track dispatch status.
- **Nurse Dashboard**: Bed allocations, incoming delivery monitoring, real-time alert notifications.
- **Pharmacist Hub**: Inventory replenishment, medicine catalog management, dispensing queue.
- **Robot Command**: Live telemetry, elevator override control, delivery routing status, compartment locking/unlocking.
- **Multi-Persona Selector**: Seamless switching between roles for testing and operations.
- **Dark & Light Mode Support**: Cohesive UI themes built with custom theming engine.

### 2. [medibot_erp](./medibot_erp) (Backend ERP & APIs)
A robust Django REST framework backend managing hospital data and autonomous dispatch logic:
- **Core Logistics**: Bed management (50 hospital beds), floor assignments, delivery orders.
- **Pharmacy Inventory**: 160+ drug SKUs, stock levels, automated restock alerts.
- **Robot Telemetry**: Real-time position tracking, battery monitoring, elevator interface protocols.
- **Billing & Invoicing**: Automated invoice generation upon prescription delivery.
- **Backup & Seed Engine**: Integrated data seeding (`seed_erp.py`) and JSON backup synchronization (`data_backup/`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher & npm
- **Python**: 3.10+
- **Expo Go** app (for testing on physical mobile devices)

---

### Running the Backend (`medibot_erp`)

1. Navigate to the backend directory:
   ```bash
   cd medibot_erp
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers pyjwt
   ```

4. Run migrations & start development server:
   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
   Backend portal will be accessible at: `http://localhost:8000/portal/`

---

### Running the Mobile Console (`MediBotConsole`)

1. Navigate to the console directory:
   ```bash
   cd MediBotConsole
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Press `w` to open in web browser, or scan the QR code using the **Expo Go** app on Android/iOS.

---

## 👥 Authors & Acknowledgments

- **Developer**: Keyur Rana
- **Institution**: Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT
- **Course**: Software Group Project (SGP) - Semester 5
