# MedVault+ — Solution Proposal
### HackX 6.0 | AI-Powered Personalisation & Cybersecurity
**Team:** Tech Clan (2 members)
**Submitted by:** Ojugbele Abdullateef
**University:** Lagos State University — Electronics and Computer Engineering

---

## 1. Problem Statement

Healthcare data is among the most sensitive personal information. Yet to deliver truly personalized health AI — accurate allergy detection, relevant health tips, life-saving emergency responses — the system needs access to deeply personal medical records. This creates a core tension:

**The more personalized the AI, the more valuable the data — and the more dangerous a breach.**

Most health apps treat personalization and security as separate features: "we added AI" plus "we added encryption." We believe they must be designed as **one unified system** where the user's consent layer simultaneously controls what the AI can personalize and what data is protected.

---

## 2. Our Solution: MedVault+

MedVault+ is a mobile-first health and emergency management platform built with React Native (Expo) and Django REST Framework. It provides AI-powered personalization across healthcare, fintech, and emergency response — all governed by a user-controlled consent and visibility layer that makes security invisible and personalization transparent.

### Core Thesis
> *"The consent layer is both the privacy control and the personalization filter."*

Users choose exactly what medical data the AI can access for personalization versus what's exposed during emergencies. More data shared = better AI personalization. Less data shared = stronger privacy. The user decides — and can see exactly what happened with an audit trail.

---

## 3. Features & How They Map to Hackathon Objectives

### 🎯 Objective 1: Tailor the User Experience

**Feature: Adaptive AI Health Tips**
- OpenAI GPT-4o-mini generates health tips based on the user's full medical profile (blood type, allergies, conditions, medications, lifestyle data).
- Each tip is stored with engagement tracking: viewed, dismissed, or marked helpful.
- On subsequent requests, recent tip history is fed back into the prompt — tips evolve over time instead of repeating. Helpful categories get deeper follow-ups; dismissed topics are avoided.
- This transforms a static "call GPT" feature into a genuine personalization loop.

**Feature: Personalized Allergen Risk Scoring**
- Users scan food by photo (ML image classification via Nyckel) or by name.
- The detected allergen is cross-referenced against the user's allergy profile — but unlike generic threshold matching, each allergy has a user-defined severity level (mild/moderate/severe).
- A severe peanut allergy at 30% ML confidence still returns HIGH risk. A mild dairy allergy at 50% confidence returns LOW risk. Same AI, individualized output.

**Feature: Condition-Aware Emergency Hospital Matching**
- When an emergency is triggered, the system finds nearby hospitals using GPS + Haversine distance calculation.
- But instead of sorting by distance alone, hospitals are scored by a weighted combination of proximity AND specialization match against the user's medical conditions (e.g., a cardiac patient gets hospitals with cardiology prioritized over a closer general hospital).
- The emergency SMS includes match reasons: "★ Heart Care Specialist (3.1 km) — matches your condition: cardiology."

---

### 🔒 Objective 2: Make Security Simple

**Feature: Invisible Field-Level Encryption**
- Sensitive medical fields (blood type, conditions, medications, allergies) are encrypted at rest in the database using AES-256 encryption.
- Completely transparent to the user — they read and write data normally. Encryption/decryption happens automatically at the ORM layer.

**Feature: JWT with Automatic Token Refresh**
- Authentication uses JWT tokens with automatic refresh via Axios interceptors. Users never see "session expired" — the app silently refreshes tokens in the background.

**Feature: PIN Lockout**
- The health savings wallet uses a 4-digit PIN. After 5 consecutive failed attempts, the wallet locks for 30 minutes and the user receives an email alert.
- Prevents brute-force attacks without adding friction to legitimate use.

---

### 🤝 Objective 3: Build Trust and Transparency

**Feature: Tiered Visibility / Consent Controls**
This is our centerpiece feature — the one that unifies personalization and security.

Users control two independent tiers:
- **QR Code Visibility** (what first responders see when scanning): Toggle individual fields on/off — blood type ✅, allergies ✅, conditions ❌, medications ❌.
- **AI Personalization Scope** (what the AI uses internally): Toggle whether full profile, lifestyle data, or scan history are used for tip generation and risk scoring.

This means:
- A privacy-conscious user can hide conditions from QR scans but still allow the AI to use them for health tips.
- A user who wants maximum emergency visibility can expose everything via QR.
- The control is a simple settings screen with toggle switches — no complex security UI.

**Feature: Comprehensive Audit Log**
- Every data access is logged: QR scans (IP address, timestamp, fields exposed), profile updates, wallet transactions, health tip generations.
- Users can view their own audit history: "Your QR was scanned 3 times today from 2 different IP addresses."
- Directly demonstrates data transparency without requiring the user to understand technical details.

---

### 🚨 Objective 4: Stop Threats in Real Time

**Feature: Shake-to-Alert Emergency System**
- The phone's accelerometer continuously monitors for violent shaking (threshold: magnitude > 50).
- On detection: alarm sound plays, 10-second countdown modal appears.
- If not cancelled: automated voice call + SMS sent to emergency contact via Twilio, with GPS location + nearest condition-matched hospitals.
- QR code auto-activated for 1 hour so first responders can scan it.
- Designed for scenarios where the user may be incapacitated — the alert sends automatically if the countdown expires.

**Feature: Withdrawal Anomaly Detection**
- Rule-based real-time checks on wallet withdrawals:
  - Amount > 3x user's historical average → flagged
  - Multiple withdrawals within 1 hour → flagged
  - Withdrawal > 80% of total balance → flagged
- Flagged transactions require additional confirmation before processing.

**Feature: Rate Limiting on Public Endpoints**
- The QR scan endpoint (`/emergency/<uuid>/`) is publicly accessible by design. Rate limiting (10 requests/minute per IP) prevents scraping or brute-force UUID guessing.

---

## 4. Technical Architecture

```
┌──────────────────────────────────────────────┐
│           React Native / Expo App            │
│  (Zustand state + AsyncStorage + Axios)      │
├──────────────────────────────────────────────┤
│                    ↕ REST API (JWT)           │
├──────────────────────────────────────────────┤
│         Django REST Framework Backend        │
│  ┌────────────┐  ┌─────────────────────┐     │
│  │ Auth (JWT) │  │ Tiered Visibility   │     │
│  │ + Refresh  │  │ Consent Controls    │     │
│  └────────────┘  └─────────────────────┘     │
│  ┌────────────┐  ┌─────────────────────┐     │
│  │ Audit Log  │  │ Anomaly Detection   │     │
│  │ System     │  │ (Rule-based)        │     │
│  └────────────┘  └─────────────────────┘     │
├──────────────────────────────────────────────┤
│              External Services               │
│  Nyckel ML │ OpenAI │ Twilio │ Paystack     │
│  Cloudinary │ Gmail SMTP                     │
├──────────────────────────────────────────────┤
│    SQLite + AES-256 Field Encryption         │
└──────────────────────────────────────────────┘
```

**Tech Stack:**
- **Frontend:** React Native 0.79, Expo 53, Expo Router, Zustand, Axios
- **Backend:** Python/Django 5.2, Django REST Framework, SimpleJWT
- **AI/ML:** OpenAI GPT-4o-mini (adaptive tips), Nyckel (food identification + allergen detection)
- **Communications:** Twilio (SMS + voice calls)
- **Payments:** Paystack (PCI-compliant checkout)
- **Storage:** Cloudinary (media), SQLite (data), AsyncStorage (tokens)
- **Security:** AES-256 field encryption, JWT with auto-refresh, rate limiting

---

## 5. How We Balance Personalization & Security

| More Personalization | Security Implication | Our Solution |
|---|---|---|
| Full medical profile → better health tips | More sensitive data stored | Field-level encryption at rest |
| Allergy severity → personalized risk scores | Detailed allergy data exists | User controls what AI can access |
| Condition-aware hospitals → better emergency match | Conditions must be stored | Tiered visibility — user decides QR vs AI access |
| Scan history → improved tip accuracy | Behavioral data accumulates | Audit log — user sees all data usage |
| Wallet transactions → financial personalization | Financial data at risk | PIN lockout + anomaly detection |

**The consent layer is the bridge.** It doesn't force users to choose between privacy and personalization — it lets them calibrate the tradeoff themselves.

---

## 6. Categories Addressed

| Category | How MedVault+ Addresses It |
|---|---|
| **Healthcare** | Emergency profiles, condition-aware hospital matching, adaptive health tips, allergen detection |
| **Fintech** | Health savings wallet with Paystack, deposits, withdrawals, transaction history |
| **Fraud Prevention** | PIN lockout, withdrawal anomaly flagging, rate limiting |
| **Identity & Privacy** | Tiered visibility controls, field encryption, audit logging, consent management |

---

## 7. Team

| Member | Role |
|---|---|
| Ojugbele Abdullateef | Full-stack Developer (Backend + Frontend) |
| Team Member 2 | [Role] |

**University:** Lagos State University — Electronics and Computer Engineering

---

*MedVault+ — Because personalization and security aren't opposing forces. They're the same system, built on consent.*
