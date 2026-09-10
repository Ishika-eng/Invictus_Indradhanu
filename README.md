# 🌈 Indradhanu (इंद्रधनुष)
> **AI-Powered Hyperlocal Climate & Crop Advisories for Smallholder Farmers**

[![Deploy to GitHub Pages](https://github.com/Mahajanram15/Invictus_Indradhanu/actions/workflows/deploy.yml/badge.svg)](https://github.com/Mahajanram15/Invictus_Indradhanu/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2D6A4F?style=flat&logo=github)](https://mahajanram15.github.io/Invictus_Indradhanu/)

---

## 📌 Executive Summary

Smallholder farmers cultivate over 70% of agricultural food supply in developing nations, yet remain highly vulnerable to sudden micro-climate shocks, unpredictable convective downpours, thermal stress, and pest windows.

**Indradhanu** bridges the gap between complex satellite climate data (Open-Meteo & NASA POWER) and smallholder decision-making. Using AI agronomy reasoning, it transforms real-time meteorological and root-zone soil physics into direct, localized farming advice delivered over zero-internet channels (**GSM Voice IVR, basic phone SMS, and WhatsApp**).

---

## 🌟 The 6-Step End-to-End Smallholder Journey

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ STEP 1: FARMER  │ ──► │  STEP 2: CROP   │ ──► │ STEP 3: AI RADAR│ ──► │ STEP 4: CLIMATE │ ──► │ STEP 5: ADVISORY│ ──► │ STEP 6: DELIVERY│
│ Profile & GPS   │     │ Visual Cards &  │     │ 4-Phase Multi-  │     │ Weather, Soil & │     │ Action, Why,    │     │ Voice IVR, SMS  │
│ Location Map    │     │ Growth Stage    │     │ Step Reasoning  │     │ Risk Gauge Meter│     │ When & Risk     │     │ & Push Receipt  │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Step 1: Farmer Profile & Micro-Location**: Connect farmer details with satellite micro-grid coordinates across dialects (*मराठी, हिन्दी, తెలుగు, Kiswahili, English*).
2. **Step 2: Visual Crop Selection**: Select from Tomato 🍅, Rice 🌾, Wheat 🌱, Cotton ☁️, Maize 🌽, Sugarcane 🎋 and phenological growth stages (*Flowering, Growing, Planting*).
3. **Step 3: AI Synthesis**: 4-phase animated reasoning evaluating radar telemetry and root hydrology.
4. **Step 4: Climate Intelligence Layer**: Real-time temperature, 7-day timeline, animated circular soil moisture gauge (74%), and composite risk score (**62/100 Moderate**).
5. **Step 5: Actionable Recommendation ("YOUR FARMER ADVISORY")**:
   - **Action**: *"Delay irrigation for 24 hours."*
   - **Why**: *"Rain is likely in the next 24 hours and soil moisture is currently adequate. Irrigating now may cause waterlogging."*
   - **When**: *"Reassess tomorrow morning."*
   - **Risk If Ignored**: *"Possible waterlogging and root-zone nutrient loss."*
6. **Step 6: Multi-Channel Last-Mile Delivery**:
   - 📞 **Voice Call (GSM IVR)** with interactive waveform & speech player.
   - 💬 **Feature Phone SMS** on simulated handset frame with 160-char counter.
   - 📱 **Mobile Push & WhatsApp** notification.
   - **Verified Receipt**: *"Rain expected tomorrow. Delay irrigation by 24 hours."*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Animations
- **Icons & Micro-Interactions**: Lucide React, Canvas Confetti
- **Data Integrations Simulated**: Open-Meteo High-Resolution Ensemble, NASA POWER Climatology, Soil Physics Models
- **Dialect Localization**: Hindi, Marathi, Telugu, Swahili, English

---

## 🚀 Getting Started Locally

```bash
# 1. Clone repository
git clone https://github.com/Mahajanram15/Invictus_Indradhanu.git
cd Invictus_Indradhanu

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 🎯 Presentation Mode

The application includes an interactive **Presentation Mode** (`🎯`) designed for hackathon demos and slide decks:
- Hides sidebars for clean screen-sharing.
- Dedicated presenter slide controls with keyboard support (`←` Left, `→` Right, `Esc` to exit).

---

## 📄 License
MIT © 2026 Indradhanu Team. Built with ❤️ for Smallholder Farmers.
