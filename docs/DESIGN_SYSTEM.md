# Nidaan — CSS Design Token System (T2)

**Owner:** Claude (declares the token system)
**Lives in:** `src/index.css` `:root` — this doc is the human-readable index of those tokens.
**Consumed by:** T6 (UI components) and T7 (App.jsx assembly).

**Theme:** premium dark, glassmorphism, electric-violet / cyber-teal accents. Components must reference these tokens — **never hard-code hex/HSL values** in component styles.

---

## 1. Color tokens — stored as raw HSL channels

Colors are stored as **space-separated HSL channels** (no `hsl()` wrapper) so opacity can be composed at the call site:

```css
/* token:  --primary: 263 85% 65%; */
color: hsl(var(--primary));              /* solid            */
background: hsla(var(--primary), 0.15);  /* 15% alpha        */
border: 1px solid hsla(var(--primary), 0.4);
```

| Token                    | Value (HSL)     | Role                                  |
| :----------------------- | :-------------- | :------------------------------------ |
| `--bg-main`              | `226 23% 6%`    | app background                        |
| `--bg-surface`           | `224 20% 10%`   | card/panel base                       |
| `--bg-surface-elevated`  | `224 20% 14%`   | raised surface                        |
| `--primary`              | `263 85% 65%`   | Electric Violet — primary actions     |
| `--secondary`            | `190 90% 50%`   | Cyber Teal — secondary accent         |
| `--accent-purple`        | `280 75% 60%`   | gradient partner                      |
| `--accent-pink`          | `325 80% 60%`   | highlight accent                      |
| `--status-info`          | `208 95% 55%`   | info badge (blue)                     |
| `--status-success`       | `142 70% 45%`   | success / verified / escrow released  |
| `--status-warning`       | `38 92% 50%`    | warning / SLA nearing                 |
| `--status-danger`        | `350 85% 55%`   | **RedAlert** hazard, SLA breach       |
| `--text-primary`         | `210 40% 98%`   | headings, key numbers                 |
| `--text-secondary`       | `215 20% 68%`   | body copy                             |
| `--text-muted`           | `217 15% 45%`   | captions, metadata                    |

### Status-color → IssueStatus / Severity mapping (for T6 badges)
| Token              | Maps to                                                          |
| :----------------- | :-------------------------------------------------------------- |
| `--status-danger`  | severity `RedAlert`, breached SLA, `escalated`                  |
| `--status-warning` | severity `high`/`medium`, SLA nearing, `bidding`               |
| `--status-info`    | `reported`, `triaged`, `assigned` (in-flight)                  |
| `--status-success` | `verified`, escrow released, severity `low`                    |

---

## 2. Composed tokens (full values, used directly)

| Token                  | Purpose                                              |
| :--------------------- | :--------------------------------------------------- |
| `--primary-glow`       | `263 85% 65% / 0.15` — glow fills                    |
| `--secondary-glow`     | `190 90% 50% / 0.15`                                 |
| `--border-light`       | `255 255 255 / 0.07` — hairline borders (RGB+alpha)  |
| `--border-glow`        | `263 85% 65% / 0.25` — focused/active borders        |
| `--gradient-card`      | subtle white glass sheen                             |
| `--gradient-primary`   | violet → purple (primary buttons)                    |
| `--gradient-secondary` | teal → violet (secondary emphasis)                   |

> `--border-light` is **RGB** channels (`r g b / a`), so it is consumed as `rgba(var(--border-light))` — note the different wrapper from the HSL color tokens.

---

## 3. Typography

| Token         | Value                                          |
| :------------ | :--------------------------------------------- |
| `--font-sans` | `'Plus Jakarta Sans', …` — UI text             |
| `--font-mono` | `'JetBrains Mono', monospace` — numbers, agent terminal, pressure counters |

---

## 4. Radius & motion

| Token               | Value   | Use                          |
| :------------------ | :------ | :--------------------------- |
| `--radius-sm`       | `8px`   | badges, inputs               |
| `--radius-md`       | `12px`  | buttons                      |
| `--radius-lg`       | `20px`  | cards / glass panels         |
| `--radius-xl`       | `30px`  | hero containers              |
| `--transition-fast` | `0.15s` | hover/press feedback         |
| `--transition-normal`| `0.3s` | panel/border transitions     |
| `--transition-slow` | `0.6s`  | ambient/background motion    |

All transitions use the easing `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 5. Component primitives (defined in `src/index.css`)

Reusable classes T6 should build on rather than re-style:

| Class                       | Purpose                                                  |
| :-------------------------- | :------------------------------------------------------- |
| `.mesh-bg`                  | fixed radial-mesh page background                        |
| `.glass-panel`              | base glassmorphism card                                  |
| `.glass-panel-interactive`  | + hover lift/glow (for clickable issue cards)            |
| `.red-alert-card`           | left danger border + tint for `RedAlert` issues          |
| `.glow-btn-primary` / `-secondary` | the two button styles                            |
| `.badge` + `.badge-{danger,warning,success,info}` | status/severity pills        |
| `.pulsing-indicator`        | live agent "active" dot (`pulseGlow`)                    |
| `.terminal-cursor`          | blinking cursor for the Agent Activity stream           |
| `.animate-fade-in-up`       | entrance animation for streamed ledger entries          |
| `.dashboard-grid`           | 2fr/1fr responsive split (dashboard + agent panel)      |
| `.stats-grid`               | auto-fit metric cards                                    |
| `.pressure-counter-val`     | large mono gradient number (signature pressure screen)  |

---

## 6. Rules for T6
1. Reference tokens; never hard-code colors.
2. Wrap correctly: `hsl()/hsla()` for color tokens, `rgba()` for `--border-light`.
3. Map status/severity to status tokens via the table in §1.
4. Use `--font-mono` for every number that should read as data (₹, counts, ETAs, days-open).
