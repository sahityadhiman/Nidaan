# Nidaan — AI-Powered Civic Issue Reporting & Resolution Platform

> **Report it. Prioritize it. Fix it. Verify it.**

Nidaan is an AI-powered civic issue reporting and resolution platform that helps citizens report problems such as potholes, garbage, water leaks, and broken streetlights — while helping authorities prioritize, route, resolve, and verify those issues through one traceable workflow.

## 🚀 Live Demo

**Try Nidaan:**  
https://nidaan-1prw.onrender.com

## 📂 GitHub Repository

https://github.com/sahityadhiman/Nidaan

---

## 💡 Problem

Civic complaints are often:

- Scattered across different reporting channels
- Poorly prioritized according to severity and public impact
- Difficult for citizens to track after submission
- Manually routed to departments and responders
- Difficult to verify after a repair

This creates delays, weak accountability, and inefficient use of public resources.

### Core Question

**How can one complaint move from report → priority → action → verified resolution?**

---

## 🎯 Our Solution

Nidaan creates a single workflow connecting:

**Citizen Report → AI Triage → Prioritization → Smart Routing → Contractor → Repair → Verification → Prevention**

Instead of stopping at complaint registration, Nidaan focuses on the complete lifecycle of a civic issue.

---

## 🔄 End-to-End Workflow

### 1. Report
Citizens upload a photo and location of a civic issue.

### 2. AI Triage
Google Gemini 3.6 Flash analyzes the report and identifies the issue category and severity.

### 3. Smart Prioritization
Cases are ranked using factors such as severity, urgency, and likely public impact.

### 4. Smart Routing
The issue is mapped to the appropriate department or service workflow.

### 5. Contractor Intelligence
The prototype workflow considers responder cost, rating, and ETA when selecting a contractor.

### 6. Resolution
The assigned responder performs the repair and submits proof of work.

### 7. Triple-Lock Verification
Resolution is checked using AI inspection, repair evidence, and citizen confirmation before closure.

### 8. Prevention
Repeated civic issues can be identified to support better long-term planning and resource allocation.

---

## ✨ Key Features

### 🤖 AI-Powered Issue Detection
Understands a citizen's photo and converts it into a structured civic issue.

### 📊 Smart Prioritization
Ranks cases using severity, urgency, and likely public impact.

### 🏛️ Automatic Department Routing
Helps route reports to the relevant department or workflow.

### 👷 Contractor Intelligence
Considers cost, rating, and ETA when selecting a responder in the prototype workflow.

### ✅ Triple-Lock Verification
Uses AI inspection, repair evidence, and citizen confirmation before closure.

### 🔐 GlassLedger
Maintains a traceable history of actions and state changes across the case lifecycle.

### 🧠 Civic Intelligence
Supports detection of recurring problems, resource optimization, and unresolved high-priority issues.

---

## 🧪 Current Prototype

The deployed prototype demonstrates:

- **Gemini triage live**
- **7-step resolution workflow**
- **Public cloud deployment**
- End-to-end case tracking
- AI-based issue classification and severity detection
- Repair verification workflow
- Tamper-evident records

### Demo Workflow

**Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent**

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- Interactive dashboard
- Camera and location access

### Backend
- Node.js
- Express.js
- REST APIs
- Application logic

### AI
- Google Gemini 3.6 Flash
- Image understanding
- Issue classification
- Severity detection

### Data & Deployment
- JSON mock database for deployed demo
- Firebase-ready data layer
- Render cloud deployment

### Security
- SHA-256 cryptographic hashing
- Tamper-evident records
- Audit trail

---

## 🏗️ Architecture

```text
Citizen
   │
   ▼
Photo + Location
   │
   ▼
AI Triage (Gemini 3.6 Flash)
   │
   ├── Issue Classification
   ├── Severity Detection
   └── Structured Case
   │
   ▼
Prioritization
   │
   ▼
Smart Routing
   │
   ▼
Responder / Contractor
   │
   ▼
Repair + Proof
   │
   ▼
Triple-Lock Verification
   │
   ├── AI Inspection
   ├── Repair Evidence
   └── Citizen Confirmation
   │
   ▼
Verified Resolution
   │
   ▼
Prevention & Civic Insights
