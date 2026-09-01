# Nidaan — Collaboration Context & Roadmap

This document serves as the master execution map for **Nidaan**. It classifies tasks between **Claude (High-Level)**, **Gemini (Implementation)**, and **You (Human Developer)**, maps dependencies, and provides your step-by-step instructions.

---

## 1. Role Classification

| Entity | Role & Scope | Specific Responsibilities |
| :--- | :--- | :--- |
| **Claude** *(AI Brain)* | **High-Level Architecture & Algorithms** | • Designing database schemas (Firestore)<br>• Formulating reverse-auction score calculations<br>• Writing System Prompts and Tool Specifications for the Orchestrator<br>• Architecting Express REST endpoints and route logic<br>• Declaring the CSS design token system |
| **Gemini** *(AI Hands)* | **Component Implementation & Scaffolding** | • Implementing standard React components based on Claude's specifications<br>• Generating extensive seeder mock datasets (`seed.js`) for the "demo city"<br>• Writing boilerplate API helpers and configuration setups (`vite.config.js`, `metadata.json`) |
| **Human** *(You / Operator)* | **Setup, Credentials, and Integration** | • Enabling Google Maps, Gmail, and Google Calendar APIs in GCP<br>• Initializing Firestore and Google Sign-In in Firebase Console<br>• Configuring local and production secrets/environment variables<br>• Copypasting workspace files into Google AI Studio Code tab<br>• Triggering the Cloud Run deployments |

---

## 2. Dependency Matrix (Prerequisites & Blockers)

To work efficiently and in parallel, review the dependencies below:

| Task ID & Name | Assigned To | Prerequisites (Do Before) | Blocks (What It Prevents) | Is It Independent? |
| :--- | :--- | :--- | :--- | :--- |
| **T1: Cloud Setup** | **Human (You)** | None | **T4** (Express Server Routes) | **No** (Blocks DB queries) |
| **T2: Schema & CSS Design** | **Claude** | None | **T3** (Seeder), **T6** (UI Cards) | **No** (Blocks seeding/styling) |
| **T3: Write Mock Seeder** | **Gemini** | **T2** (Schema Design) | **T8** (Final Integration) | **Yes** (Can write before API is done) |
| **T4: Express API Routes** | **Claude** | **T1** (Cloud Setup), **T2** | **T5** (Agent Orchestrator) | **No** (Needs DB and schemas) |
| **T5: Agent Orchestrator** | **Claude** | **T4** (API Routes) | **T7** (App.jsx assembly) | **No** (Needs APIs to trigger tools) |
| **T6: Build UI Components** | **Gemini** | **T2** (CSS Tokens) | **T7** (App.jsx assembly) | **Yes** (Uses mock states initially) |
| **T7: App.jsx Assembly** | **Gemini** | **T5** (Agent), **T6** (UI) | **T8** (Vite Build & Sync) | **No** (Requires UI and Agent) |
| **T8: Sync & Publish** | **Human (You)** | **T7** (App.jsx) | None | **No** (Needs full codebase) |

---

## 3. Human Developer Step-by-Step Instructions

Follow these chronological steps to set up, run, and deploy Nidaan.

### Step 1: Initialize Cloud Services (First Step - Blocking)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project named `Nidaan`.
2. Enable **Cloud Firestore** in test mode.
3. Enable **Google Sign-In** under **Authentication -> Sign-in method**.
4. Go to the [Google Cloud Console](https://console.cloud.google.com/), select your Firebase project, and enable:
   * **Google Calendar API**
   * **Gmail API**
   * **Google Maps JavaScript API**

### Step 2: Environment Configuration
1. Generate Firebase Service Account credentials from **Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key**.
2. Create a `.env` file at the root of the project:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-service-account-email"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GEMINI_API_KEY="your-gemini-api-key"
   ```
   *Note: If these env variables are left empty, the application will automatically fall back to local JSON files (`server/mock_db.json`) and simulated AI orchestration, meaning the application remains fully runnable out-of-the-box.*

### Step 3: Run Database Seeder
1. Run `npm install` in your terminal to set up local dependencies.
2. Initialize the demo city in the database by executing:
   ```bash
   npm run seed
   ```
   *Note: This will create the local `server/mock_db.json` database if Firebase is not connected, seeding Bengaluru coordinates.*

### Step 4: Run the Application Locally
1. Start the Node backend API server (runs on port `5000`):
   ```bash
   npm run server
   ```
2. Start the Vite React development server in a separate terminal window (runs on port `3000`):
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Test the Orchestrator Flow
1. Go to the **Snap-to-Solve** tab and lodge a new issue (e.g., a pothole).
2. Go back to the **GlassLedger** dashboard and click **Track** on your newly reported issue.
3. The **Agent Activity Panel** will open on the right.
4. Click **Trigger Agent Step** repeatedly to watch the orchestrator progress the ticket (triaging -> creating reverse-auction bids -> scheduling an inspector -> locking mock escrow).
5. Open the **FixForce** (Marketplace) tab, input a mock proof-of-fix image link, and click **Submit Proof**.
6. Trigger the final agent verification step in the activity panel to release the escrow.

### Step 6: Deploy to Google Cloud Run
1. Inside Google AI Studio, ensure camera and geolocation permissions are checked in `metadata.json`.
2. Go to the **Publish** tab inside Google AI Studio.
3. Select **Cloud Run** and trigger the deployment.
4. Keep the deployed link active and freeze the build prior to the submission deadline (29 Jun 2:00 PM).

---

## 4. Stripe Escrow Simulation Protocol (Placeholder Grid)

Actual Stripe payment intents are bypassed for safety and free-tier compatibility. The state machine simulates escrow locks and releases in `server/orchestrator.js`:
- Bids assignment: `Stripe Escrow: locked ₹[Amount] in escrow.`
- Triage verification: `Stripe Payout Released: Released ₹[Amount] from Escrow to Contractor.`
- Code placeholder location: `server/orchestrator.js` -> `agentTools.release_escrow_payment()`.
