# Nidaan — Frontend Redesign Specification & Instructions

This document is a comprehensive design contract and implementation blueprint. It outlines the visual language, color tokens, visual components, layout changes, and code guardrails required to redesign the Nidaan interface.

---

## 1. Visual Identity & Theme (The "Oceanic Obsidian" System)

### Primary Directive
* **NO GREEN COLOR:** Do not use any green or teal-green colors anywhere in standard buttons, navigation tabs, banners, or charts.
* **Success/Resolved State:** Use a high-end **Steel-Cyan/Sky-Blue** (`#0284C7`) instead of green.
* **Tone:** Professional, fast, clean, and modern. Inspired by Stripe, Vercel, and Linear.
* **Texture:** A subtle paper/slate grain background (3% opacity) on the canvas to enhance the depth of frosted glass panels.

### Color Tokens (CSS Custom Properties)
Completely replace the `:root` variables in `src/index.css` with these exact tokens:

```css
:root {
  /* ---- Fonts ---- */
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* ---- Neutral Obsidian & Slate Surfaces ---- */
  --ink-strong:   #020617;   /* Slate 950 (Big numbers, headers) */
  --ink:          #0F172A;   /* Slate 900 (Body text) */
  --ink-muted:    #475569;   /* Slate 600 (Secondary text/labels) */
  --ink-rgb:      15, 23, 42;
  
  --cream-50:    #FFFFFF;   /* Solid Card Backgrounds */
  --cream-100:   #F8FAFC;   /* Canvas Background (Slate-grey tint) */
  --cream-200:   #F1F5F9;   /* Sunken tracks & background fills */
  --cream-300:   #E2E8F0;   /* Hairline borders & dividers */
  --cream-400:   #CBD5E1;   /* Strong borders */

  /* ---- Brand Cobalt & Indigo Ramp ---- */
  --brand:        #2563EB;   /* Primary Cobalt Blue */
  --brand-600:    #1D4ED8;
  --brand-700:    #1E40AF;
  --brand-tint:   #EFF6FF;   /* Soft highlight bg */
  --brand-rgb:    37, 99, 235;

  /* ---- Semantic Signaling (ABSOLUTELY NO GREEN) ---- */
  --grass:        #0284C7;   /* Success / Resolved (Steel-Cyan) */
  --grass-600:    #0369A1;
  --grass-tint:   #F0F9FF;
  --grass-rgb:    2, 132, 199;

  --alert:        #D97706;   /* Warning / Mid-Severity (Amber) */
  --alert-600:    #B45309;
  --alert-tint:   #FFFBEB;
  --alert-rgb:    217, 119, 6;

  --critical:        #EF4444;   /* Hazard / RedAlert / SLA breach (Crimson) */
  --critical-tint:   #FEF2F2;
  --critical-border: rgba(239, 68, 68, 0.4);
  --critical-rgb:    239, 68, 68;

  --pressure:   #EF4444;   /* Cost of inaction (large numbers) */

  /* ---- Liquid Glassmorphism ---- */
  --glass-bg:        rgba(255, 255, 255, 0.65);
  --glass-bg-strong: rgba(255, 255, 255, 0.85);
  --glass-border:    rgba(255, 255, 255, 0.6);
  --glass-blur:      blur(16px);
  --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.8);

  /* ---- Shadows ---- */
  --shadow-xs:   0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-soft: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03);
  --shadow-lift: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
  --shadow-pop:  0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04);
  --shadow-glow: 0 8px 24px rgba(37, 99, 235, 0.15);

  /* ---- Border Radius ---- */
  --radius-card: 16px;
  --radius-ctl:  10px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
}
```

---

## 2. File-by-File Redesign Instructions

### A) Global Reset & Utility Styles (`src/index.css`)
* Remap all colors, shadow variables, and fonts.
* Set global `body` background using the textured background:
  ```css
  body {
    background-color: var(--cream-100);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-attachment: fixed;
  }
  ```
* Customize scrollbars to have subtle rounded tracks matching `var(--cream-200)` and thumb buttons styled in light indigo.
* Refine key transitions (`--transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1)`) to ensure interactive clicks and hovers feel snappy.

### B) Role Entry Screen (`src/screens/RoleSelect.jsx`)
* **Hero Section:** Make the typography tight and bold. The text `"Nidaan runs the rest."` must use a clean brand gradient (`linear-gradient(135deg, var(--brand) 0%, #4F46E5 100%)`).
* **Signature Loop Spine (`LoopSpine`):** Redesign this sequence to look like a premium timeline tracker. Clean up the node circles, make connecting lines thin, and add a soft indigo glow to active stages.
* **Role Selection Cards:** Symmetrically align the three cards (Citizen, Contractor, Official). Give them:
  - An absolute top border corresponding to their accent color (replace green with Sky Blue).
  - Hover transforms (`transform: translateY(-4px)`) and modern shadow transitions.
  - Generous spacing and clean, distinct action labels.

### C) Layout, Header, and Shell (`src/components/Layout.jsx` & `src/screens/Workspace.jsx`)
* **Glass Top Bar:** Style the navigation header to be thin and sticky with `backdrop-filter: var(--glass-blur)` and a subtle `cream-300` bottom border.
* **Navigation Switcher:** Turn tabs into a clean rounded pill menu with slate borders. Give the active button a solid blue base and a small shadow-glow, and make inactive buttons slide with smooth hover highlights.
* **Orchestrator Pulse:** Redesign the state indicator. Replace cluttered text with a breathing blue indicator dot and minimal, modern text labels.

### D) Citizen Dashboard (`src/components/SnapToSolve.jsx` & `src/screens/sections/CitizenSections.jsx`)
* **Report Filing Console:**
  - Modernize the upload button and image preview viewport. Give it a clean dashed border, central upload icons, and a high-resolution preview border.
  - Redesign the voice recorder interface. Keep the voice waveform container clean and make it display visual height bar animations on recording.
  - Simplify input forms: keep fields bordered with a 2px cobalt focus ring on active text fields.
* **My Reports Timeline:** Upgrade the vertical stage tracker. It must feel like an elegant delivery tracking step list with modern status icons and timestamp details.

### E) Contractor & Bid Marketplace (`src/components/FixForceMarketplace.jsx` & `src/screens/sections/ContractorSections.jsx`)
* **Jobs Cards Grid:** Remove basic table lists. Build a responsive card list for open bidding tickets:
  - Estimated pay shown in large mono typography with a blue badge background.
  - Detailed distance indicators and active bidder counters.
  - SLA timers showing hours remaining.
* **Proof Slider & Grid:** Redesign the before/after inspection view to show structured comparison panels with high-fidelity margins.
* **Escrow releases:** Turn the triple-lock proof checklist into a sleek panel that flips cleanly from Slate to Cyan as checks pass.

### F) Official Command & War Room (`src/screens/sections/OfficialSections.jsx` & `src/components/LivePressureDashboard.jsx`)
* **Municipal Header:** Redesign the top banner card. Remove the green background and replace it with a sleek, premium deep-indigo slate gradient or solid obsidian background card.
* **Command Statistics:** Reformat the metrics grid. Each card must have a clean layout, a hollow circular icon badge, and large, clear data typography.
* **Live Pressure Dashboard:** The `₹/day` inaction loss metrics should be styled in bold Red JetBrains Mono font, utilizing a count-up animation. Severity should be represented by a clean left-border accent.
* **Agent activity feed (`src/components/AgentActivityPanel.jsx`):** Format logs to stream like a clean chat history.
  - Place code blocks inside rounded dark containers.
  - Mark key tool outputs with clean status borders.
  - Inline the "Approve" and "Override" actions as high-fidelity glass buttons.

---

## 3. Implementation and Logic Guardrails

> [!IMPORTANT]
> Keep the functional code logic completely intact. Do not disrupt the React state machines, API connections, database seed setups, or event listeners.

* **Do NOT change context keys:** Keep `useAppData` and `useRole` hook variables and functions as-is.
* **Do NOT change endpoints:** Do not modify fetching links such as `/api/triage`, `/api/issues`, or payment release routines.
* **Do NOT change routing:** Keep the role switching, section active hooks, and navigation keys intact.
* **Focus solely on visual markup:** Make all changes by updating JSX wrapper structures, replacing inline `style` objects with clean layouts, and styling HTML elements using standard CSS classes.
