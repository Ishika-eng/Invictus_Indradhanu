# 🌈 Indradhanu (इंद्रधनुष): Frontend Architecture & Platform Deep Dive

> **AI-Powered Hyperlocal Climate & Agricultural Advisory Platform for Smallholder Farmers**  
> *Transforming real-time atmospheric physics and root-zone sensor telemetry into direct, actionable farming directives delivered across zero-barrier communication channels.*

---

## 📖 Table of Contents
1. [About Indradhanu](#1-about-indradhanu)
   - [The Name & Identity](#the-name--identity)
   - [The Core Challenge (Problem Statement)](#the-core-challenge-problem-statement)
   - [The Platform Vision & Solution](#the-platform-vision--solution)
   - [Target Audience & Socio-Economic Impact](#target-audience--socio-economic-impact)
   - [Key Differentiators & Scientific Principles](#key-differentiators--scientific-principles)
2. [Frontend Technology Stack](#2-frontend-technology-stack)
3. [Design System, Theme & UI/UX Philosophy](#3-design-system-theme--uiux-philosophy)
4. [Application Layout & Shell](#4-application-layout--shell)
   - [Desktop Sidebar](#desktop-sidebar)
   - [Global Topbar](#global-topbar)
   - [Interactive Hackathon Presentation Mode](#interactive-hackathon-presentation-mode)
5. [In-Depth Feature & Component Walkthrough](#5-in-depth-feature--component-walkthrough)
   - [Module 1: The 6-Step Hero Advisory Wizard](#module-1-the-6-step-hero-advisory-wizard)
   - [Module 2: Operations & Admin Overview Dashboard](#module-2-operations--admin-overview-dashboard)
   - [Module 3: Climate Intelligence & Decision Science Hub](#module-3-climate-intelligence--decision-science-hub)
   - [Module 4: Farmers Directory & Multi-Plot Registry](#module-4-farmers-directory--multi-plot-registry)
   - [Module 5: Advisory History & Immutable Audit Logs](#module-5-advisory-history--immutable-audit-logs)
   - [Module 6: Authentication & Multi-Role Security](#module-6-authentication--multi-role-security)
6. [State Management & Data Architecture](#6-state-management--data-architecture)
7. [Multilingual & Localization Engine](#7-multilingual--localization-engine)
8. [Multichannel Communication Simulator](#8-multichannel-communication-simulator)
9. [Summary Table of Frontend Views & Components](#9-summary-table-of-frontend-views--components)

---

## 1. About Indradhanu

### The Name & Identity
**Indradhanu** (इंद्रधनुष) translates to **"Rainbow"** in Sanskrit and Hindi. In agricultural folklore and climate science, a rainbow represents the emergence of calm and clarity after a turbulent storm. The platform embodies this promise: turning complex, unpredictable climate shocks into crystal-clear operational guidance, restoring agency and economic security to farmers.

### The Core Challenge (Problem Statement)
Smallholder farmers—cultivating farms under 2 hectares—produce over **70% of the food supply** in developing regions like South Asia and Sub-Saharan Africa. Yet, they remain the most vulnerable demographic on Earth to rapid climate disruptions:
1. **Unpredictable Convective Weather**: Sudden localized cloudbursts wash away freshly applied synthetic fertilizers and expensive pesticides, wasting input costs (₹2,500 – ₹5,000 per spray) and causing soil contamination.
2. **Extreme Heat & Moisture Stress**: Critical crop reproductive phases (e.g., wheat anthesis, rice flowering) suffer severe yield loss if hit by unmitigated heat stress without protective micro-irrigation.
3. **The Information Divide**: Conventional meteorological forecasts provide generic district-wide or city-level predictions (e.g., *"30% chance of rain in Pune"*). Such data lacks farm-boundary precision, fails to interpret root-zone soil dynamics, and forces farmers to guess what action to take.
4. **The Smartphone / Digital Divide**: Marginal farmers often lack smartphones, data packs, or literacy to read complex meteorology charts, isotherms, and millimeter rainfall graphs.

### The Platform Vision & Solution
**Indradhanu** bridges this gap by acting as an **autonomous agro-meteorological reasoning engine**:
- **Hyperlocal Ingestion**: Queries high-precision open satellite & reanalysis APIs (**Open-Meteo** and **NASA POWER**) pinned to the farmer's GPS coordinates.
- **Root-Zone Physics**: Interprets multi-depth soil moisture ($0\text{--}7\text{ cm}$, $7\text{--}28\text{ cm}$, $28\text{--}100\text{ cm}$) and temperature profiles alongside vapor pressure deficit and evapotranspiration ($ET_0$).
- **Deterministic Agronomic Rules Engine + Generative AI**: Evaluates crop phenology growth stages (tillering, flowering, grain-fill) against biological hazard thresholds using calibrated agronomic rules with Gemini 1.5 Flash fallback.
- **Direct Operational Directives**: Replaces ambiguous statistics with concrete verbs: **"Hold Spray"**, **"Irrigate 2 Hours"**, **"Drain Furrows"**, or **"Apply Micro-Sprinkler Cooling"**.
- **Zero-Barrier Delivery**: Dispatches alerts over everyday telecommunications: **Automated GSM Voice IVR Calls**, **DLT-compliant SMS**, and **WhatsApp Interactive Messages** in the farmer's native dialect.

### Target Audience & Socio-Economic Impact
- **Smallholder & Marginal Farmers**: Empowered with proactive, field-specific decisions that save irrigation electricity and avoid lost pesticide investment.
- **Agricultural Extension Officers (KVKs / Krishi Mitras)**: Given real-time cohort visibility across thousands of plots in their block.
- **Agricultural Cooperatives & FPOs**: Able to audit input scheduling, aggregate climate resilience, and track water conservation metrics.
- **System Operators & Agronomists**: Full audit trails, manual override capabilities, and transparent rule traceability.

---

## 2. Frontend Technology Stack

The Indradhanu frontend is built using a modern, reactive, type-safe web architecture:

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Core** | **React** | `18.3.1` | Concurrent rendering, declarative UI components, hooks |
| **Build & Dev Server**| **Vite** | `6.4.3` | Ultra-fast HMR, optimized ESM bundling, Rollup production build |
| **Language** | **TypeScript** | `5.5.3` | End-to-end type safety, strict interface models for climate & advisories |
| **Styling & Design** | **Tailwind CSS** | `3.4.1` | Utility-first CSS, custom agricultural color palettes, soft shadow system |
| **Icons & Visuals** | **Lucide React** | `0.344.0` | Crisp, semantic SVG iconography across meteorology, crops, and telemetry |
| **Animations & Confetti**| **Canvas Confetti**| `1.9.4` | Celebratory micro-interactions upon dispatch and registration |
| **Authentication** | **Supabase JS** | `2.95.3` | Client-side auth, phone OTP verification, JWT session management |
| **HTTP Client** | **Native Fetch API**| ES2022 | Lightweight REST API calls with Bearer JWT injection & offline mock fallbacks |

---

## 3. Design System, Theme & UI/UX Philosophy

The frontend interface adopts a bespoke **"Agri-Earth & Bio-Moss"** design language that balances high-tech data visualization with grounded, natural agricultural aesthetics:

### Color Palette
- **Agri Green (`agri-50` to `agri-950`)**: Rooted in fertile crop canopies (Primary action buttons, success badges, healthy growth status).
- **Moss Forest (`moss-50` to `moss-950`)**: Deep natural woodland tones (Dark navigation sidebar, header banners, slate contrasts).
- **Earth Ochre (`earth-50` to `earth-950`)**: Warm loam and terracotta hues (Soil status, seedbed indicators, regional alerts).
- **Canvas Cream (`canvas-50` to `canvas-300`)**: Soft parchment backgrounds (`#F8F9FA` to `#E9ECEF`) reducing eye strain in high-glare outdoor environments.
- **Climate Hazard Accents**: Amber/Orange for heat and moderate wind alerts; Rose/Crimson for torrential waterlogging and spore outbreaks; Sky/Indigo for precipitation radar.

### UI/UX Core Principles
1. **Clarity Over Complexity ("Don't Make the Farmer Guess")**:
   Raw numbers are always accompanied by plain-language interpretations (e.g., *“32 mm Rain Expected”* is paired with *“Risk: Severe Waterlogging — Postpone Nitrogen Fertilization”*).
2. **Zero-Latency Visual Feedback**:
   Interactive states include pulsing telemetry dots, subtle radar sweep animations, live audio playback controls, and animated step progress bars.
3. **Resilient Local Fallback**:
   If the backend API is disconnected, the frontend seamlessly degrades to verified, embedded mock scenarios (e.g., Satara Sugarcane, Varanasi Wheat) without breaking the user experience.

---

## 4. Application Layout & Shell

The entire application runs within a unified shell managed by `src/App.tsx`:

### Desktop Sidebar
The left sidebar (`src/components/layout/Sidebar.tsx`) provides persistent navigation across the platform’s core modules:
- **Brand Identity**: Features the glowing leaf emblem and system status indicator with a live pulsing ping (*"NASA & Open-Meteo Live"*).
- **Navigation Tabs**:
  1. ✨ **Farmer Advisory Flow** *(Hero Hackathon Journey)*
  2. 📊 **Overview Dashboard** *(Operational Metrics & Micro-Region Map)*
  3. 🌦️ **Climate Intelligence** *(Environmental Telemetry Hub)*
  4. 👥 **Farmers Directory** *(Directory & Multi-plot Management)*
  5. 📜 **Advisory & Audit Logs** *(Governance & Carrier Delivery Audits)*
- **Context Pill**: Displays the currently active farmer name, crop, and location pin at the bottom of the sidebar.

### Global Topbar
The header (`src/components/layout/Topbar.tsx`) remains pinned at the top:
- **Language Switcher**: Instant dropdown to switch between **English**, **Hindi (हिन्दी)**, **Marathi (मराठी)**, **Telugu (తెలుగు)**, and **Swahili (Kiswahili)**.
- **Hackathon Demo Mode Toggle**: One-click activation of presentation mode with keyboard shortcut guidance.
- **User Authentication Widget**: Shows logged-in farmer phone or email, registration status badge, and login/logout modal triggers.

### Interactive Hackathon Presentation Mode
Designed specifically for live stage presentations and jury evaluations:
- **Keyboard Navigation**: Press **Right Arrow (`→`)** to advance steps, **Left Arrow (`←`)** to backtrack, and **`Escape`** to exit.
- **Presenter Control Bar**: A sleek dark toolbar displaying current slide progress (`1 / 6`), numbered step pills, and quick jump buttons.
- **Maximized Viewport**: Automatically collapses the sidebar to allocate 100% of the screen width to the live farm demonstration.

---

## 5. In-Depth Feature & Component Walkthrough

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INDRADHANU FRONTEND                                  │
├──────────────────┬──────────────────┬──────────────────┬───────────────────────────────┤
│  1. ADVISORY     │  2. OPERATIONS   │  3. CLIMATE HUB  │  4. FARMERS & AUDIT           │
│  WIZARD (6 STEPS)│  DASHBOARD       │  & SENSORS       │  DIRECTORIES                  │
├──────────────────┼──────────────────┼──────────────────┼───────────────────────────────┤
│ • Step 1: Farmer │ • Macro Metrics  │ • Live Weather   │ • Farmer Directory & Search   │
│ • Step 2: Crop   │ • Micro-Region   │ • 7-Day Timeline │ • Multi-Plot Land Management  │
│ • Step 3: Radar  │   Spatial Map    │ • 3-Depth Soil   │ • Immutable Audit Logs        │
│ • Step 4: Intel  │ • Carrier Health │ • Risk Gauges    │ • Farmer Feedback Recording   │
│ • Step 5: Advice │ • Pipeline State │ • AI Reasoning   │ • Operator Resend / Override  │
│ • Step 6: Dispatch│• Impact Counter │ • Data Provenance│ • Supabase SMS OTP Auth       │
└──────────────────┴──────────────────┴──────────────────┴───────────────────────────────┘
```

---

### Module 1: The 6-Step Hero Advisory Wizard
Located in `src/components/advisory-wizard/HeroAdvisoryJourney.tsx`, this is the interactive core of the application:

#### Step 1: Farmer Profile & Farm Setup (`Step1FarmerProfile.tsx`)
- **Farmer Identity**: Input name, mobile number (+91 formatting), and language preference.
- **Geolocation**: Browser GPS location detection button with instant reverse geocoding into city, district, and state.
- **Soil & Plot Profile**: Selection of local soil type (Black Cotton Clay, Alluvial Loam, Red Sandy Loam, Laterite, Coastal Sand) and farm size in acres.
- **One-Click Preloaded Personas**: Buttons to instantly load real smallholder profiles:
  - *Ramesh Patil* (Kolhapur, Maharashtra — Sugarcane & Black Soil)
  - *Sunita Devi* (Varanasi, UP — Wheat & Alluvial Soil)
  - *Rajesh Kumar* (Karnal, Haryana — Basmati Rice & Loam Soil)

#### Step 2: Crop & Phenology Growth Stage (`Step2CropSelection.tsx`)
- **Diverse Crop Catalog**: Grid cards for major staple and cash crops (Rice, Wheat, Cotton, Mustard, Sugarcane, Soybean, Tomato, Maize, Potato, Chili).
- **Dynamic Growth Stage Estimation**: Selecting sowing date automatically calculates days after sowing (DAS) and highlights the current phenological phase (e.g., *Vegetative*, *Tillering*, *Panicle Initiation*, *Flowering*, *Grain Filling*).
- **Field Micro-Context**: Irrigation infrastructure (Canal, Borewell, Drip, Rainfed) and optional observed field symptoms (leaf yellowing, standing water, pest sighting).

#### Step 3: AI Processing & Telemetry Radar (`Step3Processing.tsx`)
- **High-Tech Scan Simulation**: A radar sweep interface visualizing the simultaneous query of:
  - Open-Meteo High-Resolution Numerical Weather Models
  - NASA POWER Daily Surface Solar Radiation & Temperature Reanalysis
  - Soil Physics Interpolation ($0\text{--}100\text{ cm}$ root depths)
- **Stepwise Telemetry Checklist**: Live checkmarks confirming coordinate lock, soil moisture ingestion, evapotranspiration computation, and risk weight redistribution.

#### Step 4: Climate Intelligence & Environmental Telemetry (`Step4ClimateIntelligence.tsx`)
- **Atmospheric Metrics**: Current temperature, feels-like index, relative humidity, wind speed, wind gust vector, and 24h precipitation probability.
- **Root-Zone Soil Health**: 3-tier depth gauges displaying volumetric water fraction ($\text{m}^3/\text{m}^3$) and soil temperature.
- **Composite Risk Gauges**: Visual bar meters evaluating:
  - 🌧️ *Rainfall & Waterlogging Risk*
  - 🌡️ *Extreme Temperature & Heat Stress*
  - 💧 *Fungal / Spore Disease Index*
  - 💨 *Wind Drift & Spray Inversion Hazard*

#### Step 5: Actionable Recommendation Engine (`Step5Recommendation.tsx`)
- **Primary Operational Directive**: Bold color-coded badge indicating immediate action (**HOLD ALL SPRAY**, **IRRIGATE NOW**, **HOLD IRRIGATION**, **DRAIN FIELD**).
- **"What To Do" vs. "Why" vs. "Financial Impact"**:
  - *The Action*: Step-by-step instructions (e.g., *"Delay chlorpyrifos insecticide application by 48 hours"*).
  - *The Scientific Reason*: Explanation linking wind speeds ($>22\text{ km/h}$) and incoming rain to chemical drift and runoff.
  - *The Estimated Saving*: Transparent calculation of input cost preservation (e.g., *“Saves ₹2,800 in wasted agro-chemicals”*).
- **Full Model Transparency**: Displays the model version (`Indradhanu-Hybrid-v1.0`), agronomic confidence percentage, supporting evidence citations, and official data limitations disclaimer.

#### Step 6: Multichannel Zero-Internet Delivery (`Step6Delivery.tsx`)
- **Channel 1 — GSM Voice IVR Call**:
  - Interactive simulated phone screen.
  - Realistic incoming call ringtone and pickup controls.
  - Multi-language voice playback with real speech synthesis (TTS) reading the advisory aloud in Hindi, Marathi, Telugu, Swahili, or English.
  - Animated soundwave equalizer during active audio playback.
- **Channel 2 — SMS Dispatch**:
  - Indian DLT (Distributed Ledger Technology) compliant template preview.
  - Sender Header: `VM-INDRDH`.
  - Delivery timestamp, carrier receipt ID, and character counter.
- **Channel 3 — WhatsApp Interactive Card**:
  - WhatsApp chat bubble styling with formatted bold headers, emojis, bullet points, and quick-reply action buttons (*"Applied"*, *"Need Clarification"*, *"Opt-Out"*).
- **Dispatch Execution**: Triggers actual backend carrier dispatch logging with unique idempotency keys and confetti celebrations.

---

### Module 2: Operations & Admin Overview Dashboard
Located in `src/components/overview/OverviewDashboard.tsx`:
- **Top Metrics Grid**: Live aggregates pulling directly from SQLite/PostgreSQL:
  - Total Registered Smallholders
  - Monitored Farm Acreage
  - Total Advisories Formulated
  - Carrier Delivery Success Rate ($98.4\%+$)
  - Estimated Collective Input Cost Saved (₹)
  - Liters of Irrigation Water Preserved
- **Micro-Region Spatial Map (`MicroRegionMap.tsx`)**: Visualized regional risk distribution across active agricultural clusters with plot coordinates and active risk levels.
- **Live Carrier Pipeline**: Real-time breakdown of messages queued, delivered, and confirmed across SMS, Voice IVR, and WhatsApp.

---

### Module 3: Climate Intelligence & Decision Science Hub
Located in `src/components/climate/ClimateIntelligenceHub.tsx`:
- **Live Weather Card (`LiveClimateCard.tsx`)**: Dynamic atmospheric card featuring contextual weather backdrops (sunny, rainy, overcast, windy) and live temperature/humidity readouts.
- **7-Day Weather & Precipitation Timeline (`SevenDayWeatherTimeline.tsx`)**: Horizontal day-by-day bar chart graphing daily max/min temperatures, rainfall millimeters, and rain probability percentages.
- **Soil Moisture Gauge (`SoilHealthMoistureGauge.tsx`)**: Circular SVG speedometer tracking root moisture against field capacity and permanent wilting point thresholds.
- **Climate-to-Action Decision Flow (`ClimateToActionFlow.tsx`)**: Interactive flowchart showing how raw parameters trigger specific agronomic rules.
- **Data Source Transparency (`DataSourcesTransparency.tsx`)**: Complete breakdown of Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF) and NASA POWER satellite resolution.

---

### Module 4: Farmers Directory & Multi-Plot Registry
Located in `src/components/farmers/FarmersDirectory.tsx`:
- **Farmer Search & Filtering**: Real-time search by farmer name, mobile number, or village, with district dropdown filters.
- **Farmer Profile Cards**: Displaying registered acreage, preferred communication channel (Voice/SMS/WhatsApp), primary crop, and verification status.
- **Farmer Detail Drawer / Modal**: Inspecting a farmer opens their full history, active plots, GPS boundary coordinates, and historical advisory log.
- **Quick Action**: Direct button to launch a new tailored advisory for any listed farmer with one click.

---

### Module 5: Advisory History & Immutable Audit Logs
Located in `src/components/history/AdvisoryHistory.tsx`:
- **Dual Tab Architecture**:
  1. **Advisories Feed**: Chronological list of every advisory generated, filtering by risk severity (Low, Medium, High, Extreme) and action status (Pending, Applied, Skipped).
  2. **Immutable Audit Trail (`advisory_audit_logs`)**: Regulatory-grade ledger recording every advisory event, exact climate snapshot JSON, risk scoring methodology, model version, and operator IDs.
- **Operator Actions**:
  - *Reassess Advisory*: Re-runs the climate intelligence engine against newly updated weather data.
  - *Resend Notification*: Manually dispatches the advisory again across Voice, SMS, or WhatsApp.
  - *Record Ground-Truth Feedback*: Modal allowing extension workers to record whether the farmer applied the advice, farmer satisfaction stars (1 to 5), verified water saved, and yield protection notes.

---

### Module 6: Authentication & Multi-Role Security
Located in `src/components/auth/AuthModal.tsx`:
- **Dual Sign-In Modes**:
  1. **Carrier Phone OTP (SMS)**: Farmer enters 10-digit Indian phone number (`+91`), receives Supabase SMS OTP, and enters 6-digit code.
  2. **Email & Password**: For administrative staff, agronomists, and hackathon evaluators.
- **Role-Based Access Control (RBAC)**:
  - `FARMER`: Access to own plot advisories and personal notification preferences.
  - `OPERATOR` / `ADMIN`: Access to full directory, audit reassessment, system metrics, and governance overrides.
- **Transparent Local Session**: If Supabase credentials are not configured, the modal offers instant one-click demo login so evaluators are never blocked.

---

## 6. State Management & Data Architecture

The frontend leverages React Context for clean, predictable state distribution without excessive boilerplate:

### `AdvisoryContext.tsx`
Maintains operational state across the entire user journey:
- Active Navigation Tab (`activeTab`)
- Demo Step (`demoStep`: 1 to 6)
- Hackathon Presentation Mode state (`isPresentationMode`)
- Selected Language (`selectedLanguage`: 'en' | 'hi' | 'mr' | 'te' | 'sw')
- Farmer Profile details (Name, Phone, Location coordinates, Soil Type, Farm Size)
- Crop details (Crop Name, Growth Stage, Sowing Date, Irrigation Source)
- Live Climate & Risk telemetry payloads
- Formulated advisory response data & simulated carrier status

### `AuthContext.tsx`
Maintains security and identity state:
- Supabase User Session (`user`, `session`, `access_token`)
- Farmer Database Record (`farmer`, `isRegistered`)
- Role (`role`: 'FARMER' | 'ADMIN' | 'OPERATOR')
- Auth modal open/close controls and global confirmation toast banners

---

## 7. Multilingual & Localization Engine

Indradhanu is engineered from the ground up for linguistic accessibility across diverse farming belts:

| Language Code | Language | Native Script | Primary Region |
| :---: | :--- | :--- | :--- |
| `en` | **English** | English | International / Evaluators |
| `hi` | **Hindi** | हिन्दी | Northern & Central India (UP, MP, Haryana, Rajasthan) |
| `mr` | **Marathi** | मराठी | Maharashtra (Sugarcane, Cotton & Soybean belts) |
| `te` | **Telugu** | తెలుగు | Andhra Pradesh & Telangana (Rice & Chili belts) |
| `sw` | **Swahili** | Kiswahili | East African Smallholder Communities |

The engine operates dynamically:
1. When a farmer selects their preferred language in Step 1 or the Topbar, all directive headlines, scientific explanations, SMS text, and WhatsApp cards instantly render in the chosen language.
2. The Voice IVR synthesizer loads the appropriate locale voice agent to read out recommendations naturally.

---

## 8. Multichannel Communication Simulator

Because marginal smallholders do not rely on constant mobile internet, Indradhanu simulates all three carrier channels with extreme realism:

1. **Voice IVR (Interactive Voice Response)**:
   - Full virtual smartphone interface with dialer chrome, contact photo, and calling screen.
   - Real browser SpeechSynthesis audio output matching the farmer's selected language.
   - Interactive call controls: Mute, Speakerphone, Keypad, and End Call.
2. **SMS (Short Message Service)**:
   - Formatted in accordance with Indian Telecom Regulatory Authority (TRAI) and DLT guidelines.
   - Includes mandatory headers, template IDs, concise 160-character action directives, and opt-out instructions.
3. **WhatsApp Business Messaging**:
   - High-fidelity chat bubble UI mimicking the official WhatsApp Business client.
   - Rich interactive cards with bold directives, bulleted field tips, and action response buttons.

---

## 9. Summary Table of Frontend Views & Components

| View / Component | File Path | Key Features |
| :--- | :--- | :--- |
| **Main App Shell** | `src/App.tsx` | Layout grid, presentation keyboard listener, route switching |
| **Sidebar Navigation** | `src/components/layout/Sidebar.tsx` | Brand badge, live NASA status, tab navigation, active farmer chip |
| **Header Topbar** | `src/components/layout/Topbar.tsx` | Language switcher, demo mode toggle, auth badge & notification bar |
| **Hero Advisory Journey** | `src/components/advisory-wizard/HeroAdvisoryJourney.tsx` | 6-step progress stepper, value proposition banner, reset flow |
| **Step 1: Farmer Profile**| `src/components/advisory-wizard/Step1FarmerProfile.tsx` | GPS location, phone input, soil selection, preloaded farmer personas |
| **Step 2: Crop Selection** | `src/components/advisory-wizard/Step2CropSelection.tsx` | 10+ crop catalog, sowing date, auto-stage calculation, symptoms |
| **Step 3: AI Processing** | `src/components/advisory-wizard/Step3Processing.tsx` | Radar sweep animation, API ingestion telemetry checklist |
| **Step 4: Climate Intel** | `src/components/advisory-wizard/Step4ClimateIntelligence.tsx` | Weather metrics, 3-depth soil gauges, composite risk breakdown |
| **Step 5: Recommendation**| `src/components/advisory-wizard/Step5Recommendation.tsx` | Action directives, scientific justification, cost savings, citations |
| **Step 6: Delivery Hub** | `src/components/advisory-wizard/Step6Delivery.tsx` | GSM Voice IVR caller, SMS simulator, WhatsApp preview, dispatch |
| **Operations Dashboard** | `src/components/overview/OverviewDashboard.tsx` | Live DB metrics, pipeline stages, water/rupee savings counter |
| **Micro-Region Map** | `src/components/overview/MicroRegionMap.tsx` | Visualized geographic clusters, risk markers, coordinate badges |
| **Climate Hub** | `src/components/climate/ClimateIntelligenceHub.tsx` | Live weather card, 7-day forecast, decision flowchart, data audit |
| **Farmers Directory** | `src/components/farmers/FarmersDirectory.tsx` | Farmer search, multi-plot inspection drawer, instant advisory launch |
| **Advisory & Audit Logs**| `src/components/history/AdvisoryHistory.tsx` | Regulatory audit trail, reassessment trigger, feedback recording |
| **Auth Modal** | `src/components/auth/AuthModal.tsx` | Supabase SMS Phone OTP, email auth, instant demo login |

---

*Document compiled for the Indradhanu Platform Repository.*

