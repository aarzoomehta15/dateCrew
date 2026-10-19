# The Date Crew (TDC) Matchmaker CRM & Compatibility Engine MVP

> A full-stack, interview-ready internal matchmaking CRM for **The Date Crew (TDC)**, enabling professional matchmakers to manage client journeys, review verified biodatas, discover compatible candidates through an explainable multi-factor algorithm, record consultation notes, and dispatch mock match introductions.

---

## 🌟 Key Features

1. **Executive Matchmaker Dashboard (`/`)**:
   - High-level KPIs: Total Assigned Customers, Verified Biodata Rate, Ready for Matching Queue, and Introductions Dispatched.
   - Interactive Pipeline Visualizer spanning all 8 customer journey stages:
     `New` ➔ `Profile Review` ➔ `Ready for Matching` ➔ `Matches Sent` ➔ `Meeting Scheduled` ➔ `In Progress` ➔ `On Hold` ➔ `Closed`.
   - Real-time audit activity feed tracking customer status updates, notes, and dispatched matches.

2. **Customer Roster & Directory (`/customers`)**:
   - Multi-field search across client names, occupations, degrees, and cities.
   - Filter controls by Journey Stage, Verification Status (Verified, Pending, Unverified), and Gender.
   - Responsive cards with at-a-glance biodata (compensation in LPA/Cr, education, designation, age, city).

3. **360° Verified Customer Dossier (`/customers/:id`)**:
   - **Personal & Cultural Attributes**: Height, marital status, mother tongue, languages known, religion, community, gotra.
   - **Education & Career**: College, degree, employer, designation, annual income, employment classification.
   - **Family & Lineage**: Family type (Nuclear/Joint), values (Liberal/Moderate/Traditional), siblings, family location, background overview.
   - **Lifestyle & Values**: Diet preference, children expectations, relocation willingness, pets, interests tags, and relationship expectations.
   - **Preferences & Mandatory Dealbreakers**: Desired age range, height range, target locations, dealbreaker rule checks.
   - **Verification Badge**: Method (Govt ID / DigiLocker / Degree / Bar Council / MCI), timestamp, and verification remarks.
   - **One-Click Journey Status Progression**: Transition clients between stages with automatic audit activity logging.

4. **Transparent Explainable Matching Engine (`/customers/:id` ➔ Match Discovery Tab)**:
   - **Multi-Factor Scoring**: Evaluates Age Proximity, Geographic Proximity, Education & Career synergy, Lifestyle/Diet alignment, and Family Values.
   - **Tier Badges**: High Potential (80%+), Good Potential (65-79%), Explore (<65%).
   - **Radial Score Meter**: Visual circular compatibility meter.
   - **Dealbreaker Enforcement**: Rigid candidate filtering for mandatory criteria (marital status, kids, location).
   - **Score Decomposition**: Interactive category breakdown bars and positive synergy bullet points.
   - **AI Qualitative Synthesis**: Generates conversational matchmaker talking points and compatibility rationale.
   - **Dynamic Overrides**: Adjust filter criteria (city, age range, min score, verified only) and recalculate matches on the fly.

5. **Mock Match Introduction Dispatcher**:
   - Preview customer and candidate profiles with compatibility score.
   - Pre-populated, editable personalized introductory email note.
   - Generates simulated email preview with recipient, subject, timestamp, and body.
   - Duplicate prevention ensuring the same pair is not dispatched twice.

6. **Consultation Notes & Meeting Logs**:
   - Record interactions tagged as `Meeting`, `Call`, `Follow-up`, or `General`.
   - Chronological notes feed tied to customer and actor.

7. **Sent Matches Registry (`/matches`)**:
   - Track dispatched introductions across statuses: `Sent`, `Awaiting Response`, `Interested`, `Meeting Scheduled`, `Declined`, `Completed`.
   - Update response status with instant persistence.
   - Inspector dialog to review the exact simulated email sent to the customer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, Vanilla CSS Design System, Lucide React, React Router 7 |
| **Backend** | Node.js (ES Modules), Express 4, Cookie-Parser, CORS, Zod, Bcryptjs, JSONWebToken, Dotenv |
| **Data Store** | Persistent JSON Repository (`jsonRepository.js`) storing structured collections in `./data/` |
| **Testing** | Jest 29 (`--experimental-vm-modules`) testing matching engine rules and REST endpoints |

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js** v18+ and **npm**

### 2. Backend Setup & Tests
```bash
cd backend
npm install
npm run seed      # Seeds 2 matchmakers, 16 realistic customer biodatas, notes, and activity
npm test          # Runs 22 unit & integration tests
npm start         # Starts backend API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

| Matchmaker | Email | Password | Role |
|---|---|---|---|
| **Priya Sharma** | `priya.sharma@datecrew.com` | `Password123!` | Lead Matchmaker (Bangalore / Mumbai / Delhi) |
| **Arjun Kapoor** | `arjun.kapoor@datecrew.com` | `Password123!` | Senior Matchmaker |

*Tip: On the login screen, click the quick-login pills for instant one-click credential population.*

---

## 📡 Key API Endpoints

### Auth
- `POST /api/auth/login` — Authenticate and receive `tdc_session` HttpOnly cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Get current matchmaker profile

### Dashboard
- `GET /api/dashboard/stats` — Metrics, pipeline funnel counts, recent clients, activity

### Customers
- `GET /api/customers` — Search, filter, paginate assigned customers
- `GET /api/customers/:id` — Full 360° biodata dossier
- `PATCH /api/customers/:id/status` — Update journey stage and append audit activity
- `GET /api/customers/:id/notes` — List consultation notes
- `POST /api/customers/:id/notes` — Record new consultation note

### Matching & Introductions
- `GET /api/customers/:id/matches` — Ranked match candidates with category breakdowns
- `POST /api/customers/:id/matches/recalculate` — Recalculate with filters & overrides
- `POST /api/matches/explain` — Structured AI qualitative synthesis
- `POST /api/matches/send` — Dispatch mock match introduction email
- `GET /api/matches` — Sent matches registry with status filtering
- `PATCH /api/matches/:id/status` — Update match outcome status
