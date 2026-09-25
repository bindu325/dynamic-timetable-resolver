# 🎓 Dynamic Timetable Conflict Resolver (MERN Stack)

A production-grade, enterprise college timetable management platform equipped with an autonomous **Constraint Satisfaction Problem (CSP) solver engine**, multi-factor alternative ranking optimizer, and real-time collision detection.

Built specifically with the **MERN** stack:
- **Frontend**: React.js (Vite) + Tailwind CSS + Lucide React + Recharts + jsPDF
- **Backend**: Node.js + Express.js + REST APIs
- **Database**: MongoDB Atlas / Embedded MongoDB Memory Server
- **ODM**: Mongoose
- **Security & Auth**: JWT + bcryptjs + Role-Based Access Control (RBAC)

---

## 🌟 Key Architecture & Capabilities

### 1. Dynamic Timetable Conflict Detection Engine (`conflictEngine.js`)
Autonomous validation of 7 distinct constraints:
- 👨‍🏫 **Faculty Conflict**: Same faculty double-booked at overlapping times.
- 🏫 **Room Conflict**: Same room or laboratory occupied simultaneously.
- 👥 **Section Conflict**: Student cohort scheduled for multiple concurrent lectures.
- 📐 **Capacity Conflict**: Section student count exceeds room seating capacity.
- ⏳ **Faculty Availability Conflict**: Faculty assigned when marked `UNAVAILABLE`.
- 🛠️ **Room Availability / Maintenance Conflict**: Room marked inactive or undergoing maintenance.
- 🕒 **Invalid Time Slot**: Start time $\ge$ End time or overlapping custom slots.

### 2. Multi-Factor Alternative Ranking Optimizer (`resolverEngine.js`)
When collisions occur, the engine systematically generates candidate triples: `(Day, TimeSlot, Room)`.
Surviving candidates passing all hard constraints are scored on a **0 – 100 Scale**:
- **+30 Points**: Matches faculty's explicitly listed `PREFERRED` working hours.
- **+25 Points**: Room type matches course requirement (e.g. `LAB` facility for laboratory courses).
- **+15 Points**: Maintains original scheduled day (minimal disruption).
- **+15 Points**: Compact schedule (eliminates awkward idle gaps between classes for students).
- **+10 Points**: Optimal seat utilization efficiency (60%–95% room fullness).

### 3. What-If Simulation Mode & Impact Analysis
Allows administrators to simulate proposed timetable modifications before committing them to the database, viewing affected classes and prospective collisions in real-time.

### 4. Role-Based Access Control (RBAC)
- **ADMIN**: Complete control over faculty, sections, subjects, rooms, slots, publishing, conflict resolutions, and database management.
- **FACULTY**: View personal teaching schedule, assigned rooms, subjects, and configure personal weekly availability matrix.
- **VIEWER**: Search, filter, and view published schedules; export PDF and CSV reports.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Clone & Setup Backend
```bash
cd dynamic-timetable-resolver/server
npm install
npm run dev
```
*Note: The server includes zero-config in-memory MongoDB fallback or can connect directly to MongoDB Atlas via `MONGO_URI`.*

### 2. Setup Frontend
```bash
cd dynamic-timetable-resolver/client
npm install
npm run dev
```

The application will be accessible at: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Admin Secret Key |
|---|---|---|---|
| **System Administrator** | `admin@college.edu` | `password123` | `ADMIN_2026` |
| **Faculty Member** | `priya.sharma@college.edu` | `password123` | — |
| **Student / Viewer** | `viewer@college.edu` | `password123` | — |

*(Quick-login buttons for all three roles are also available directly on the login screen for instant demoing!)*

---

## 📊 Pre-Loaded Demo Scenarios

The initial database seed automatically provisions **16 Faculty**, **10 Sections**, **22 Subjects**, **12 Rooms**, **36 Time Slots**, and **50+ Timetable Entries**, including 4 intentional conflicts:

1. **Scenario 1 — Faculty Double-Booking**: Dr. Ramesh Kumar assigned to CSE-A and CSE-B simultaneously on Monday 09:00–10:00.
2. **Scenario 2 — Room Double-Booking**: Room LH-101 assigned to both CSE-A (OS) and CSE-B (CN) on Monday 12:15–13:15.
3. **Scenario 3 — Faculty Availability Conflict**: Dr. Priya Sharma scheduled on Monday 10:00–11:00 while marked `UNAVAILABLE`.
4. **Scenario 4 — Capacity Constraint Violation**: CSE-A (60 students) assigned to Room LH-202 (capacity 35 seats).

---

## 📑 Export Options
- **Timetable PDF Report**: Section-wise, Faculty-wise, Room-wise, or Complete.
- **CSV Data Export**: Direct spreadsheet import.
- **Conflict Audit Report**: Printable summary of active system collisions.
