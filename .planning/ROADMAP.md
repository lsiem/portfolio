# Roadmap: Portfolio Neubau lsiem.de

## Overview

Vier vertikale Slices, jede endet in einem nutzbaren Stand: Zuerst entsteht das zweisprachige Content-Modell samt deploybarer Foundation auf lsiem.de (die Antwort auf "thin content" — Inhalte vor Effekten). Darauf liefert Phase 2 die komplette, schnelle Recruiter-Site live in Produktion — der direkte Gegenpol zum "Rebuild, der nie shippt". Phase 3 legt die unverwechselbare Design-Richtung fest und baut das immersive Standard-Erlebnis (Scroll-Storytelling, Micro-Interactions) auf sauberer Animations-Infrastruktur — der Recruiter-Pfad bleibt dabei immer einen Klick entfernt. Phase 4 setzt den Signature-3D-Moment obendrauf (architektonisch jederzeit streichbar) und verifiziert jede Zusage auf der Produktions-URL vor dem Launch.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Bilingual Content Foundation** - Vollständige DE/EN-Inhalte als typisiertes Content-Modell, live rendernd auf lsiem.de mit CI-Performance-Budget und Analytics (completed 2026-07-03)
- [x] **Phase 2: Recruiter Overview Live** - Komplette, schnelle, zugängliche Recruiter-Site (Timeline, Case Studies, Skills, CV-PDF, Dark Mode, SEO) in Produktion (completed 2026-07-05)
- [x] **Phase 3: Design Direction & Immersive Experience** - Identitätsbasierte Gestaltung plus Scroll-Storytelling-Erlebnis als Standard-Modus — jederzeit überspringbar, reduced-motion-vollwertig, mobil bewusst gestaltet (completed 2026-07-08 - 4/4 plans, human UAT 4/4 on /de + /en; production LCP re-check deferred to Phase 4)
- [ ] **Phase 4: Signature Moment & Launch Hardening** - Der 3D/WebGL-Wow-Moment im Hero plus Launch-Verifikation aller Zusagen auf der Produktions-URL

## Phase Details

### Phase 1: Bilingual Content Foundation

**Goal**: Sämtliche Portfolio-Inhalte existieren fertig geschrieben und strukturiert in Deutsch und Englisch als Single Source of Truth — und rendern über eine deployte, performance-überwachte Foundation auf lsiem.de
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: CONT-01, I18N-01, I18N-02, TECH-06, TECH-07
**Success Criteria** (what must be TRUE):

  1. Sämtlicher v1-Inhalt (Werdegang, 5–7 Projekte mit 2–3 tiefen Case Studies, Skills, Über-mich, Kontakt) liegt vollständig in Deutsch UND Englisch im typisierten Content-Modell — ein Reviewer kann jede Case Study in beiden Sprachen lesen
  2. Besucher kann unter lsiem.de/de und lsiem.de/en dieselben Inhalte pro Locale sehen und die Sprache umschalten (routen-basiert, hreflang inkl. x-default gesetzt)
  3. Jeder Deploy nach lsiem.de läuft durch eine Pipeline, die bei überschrittenem Performance-Budget (LCP, Initial-JS) fehlschlägt
  4. Seitenbetreiber sieht Besucherzahlen in cookieless, DSGVO-freundlichen Analytics

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton: Next.js-16-Scaffold, DE/EN-Routing mit hreflang, Content-Modell mit einer echten Case Study end-to-end (Wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Deploy-Pipeline: Parity-/Vertraulichkeits-Gate, CI-Performance-Budget (LHCI), Vercel-Preview + cookieless Analytics (Wave 2)
- [x] 01-03-PLAN.md — Strukturierte bilinguale Inhalte: Werdegang (D-02-Bogen), Projekte (D-01-Gewichtung), Skills, Kontakt, UI-Messages (Wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Prosa-Inhalte: ELIA-Flaggschiff (abstrahiert, Blocklist-Gate), Vidama-Deep-Dive, About + Impressum/Datenschutz, End-to-End-Verifikation auf Preview-URL (Wave 3)

### Phase 2: Recruiter Overview Live

**Goal**: Ein eiliger Besucher findet auf der vollständigen, schnellen, zweisprachigen Site alle Fakten (Wer/Was/Skills/Timeline/Kontakt/CV) in unter 30 Sekunden — live in Produktion auf lsiem.de
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, MODE-01, TECH-01, TECH-03, TECH-04, TECH-05, TECH-08
**Success Criteria** (what must be TRUE):

  1. Erster Viewport zeigt sofort Name, Rolle und Ein-Satz-Wertversprechen; ein fremder Tester findet Wer/Was/Kontakt in unter 30 Sekunden (Stoppuhr-Test), der dichte Überblick ist ab dem ersten Fold einen Klick entfernt
  2. Besucher kann Werdegang-Timeline, 5–7 Projekte (davon 2–3 tiefe Case Studies mit Problem → Entscheidungen → Ergebnis), nach Domäne gruppierte Skills mit Kontext und Über-mich durchsehen — und erreicht Kontakt (E-Mail, LinkedIn, GitHub) mit einem Klick aus jeder Sektion
  3. Besucher kann einen aktuellen CV als PDF herunterladen, generiert aus dem Content-Modell
  4. Site erreicht Core Web Vitals "good" auf Mobilgeräten, ist per Tastatur vollständig bedienbar (semantisches HTML, Kontraste) und bietet Dark Mode (Systemerkennung + Toggle)
  5. Geteilte Links zeigen gestaltete Preview-Cards pro Seite und Locale (OG-Images, Person-JSON-LD), und Besucher sieht Live-GitHub-Aktivität als Beleg aktiver Entwicklung

**Plans:** 7/7 plans complete

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Recruiter overview complete: hero value-prop, About (text-first), one-click contact affordance, CV download button, a11y baseline (Wave 1)
- [x] 02-02-PLAN.md — Build-time CV-PDF generation per locale from the content model (@react-pdf/renderer, embedded Geist, one-column ATS) (Wave 1)

**Wave 2** *(blocked on Wave 1)*

- [x] 02-03-PLAN.md — 3-state dark-mode toggle (System/Light/Dark), no-flash script, Tailwind 4 attribute tokens (Wave 2)
- [x] 02-04-PLAN.md — SEO share layer: OG images per page/locale (next/og) + Person JSON-LD + openGraph metadata (Wave 2)

**Wave 3** *(blocked on Wave 2)*

- [x] 02-05-PLAN.md — Build-time GitHub activity heatmap (server-only GraphQL fetch, daily ISR, graceful fallback) (Wave 3)

**Wave 4** *(blocked on Wave 3)*

- [x] 02-06-PLAN.md — Launch hardening + verification: security headers, CWV/Lighthouse budget, accessibility eval (Wave 4)

**Wave 5** *(blocked on Wave 4)*

- [x] 02-07-PLAN.md — Production cutover: siteMetadataBase → lsiem.de, promote + live verification (Wave 5)

**UI hint**: yes
**Research flag (resolved):** CV-PDF-Generierung — @react-pdf/renderer build script (RESEARCH §1); build-time static per locale

### Phase 3: Design Direction & Immersive Experience

**Goal**: Die Site bekommt ein unverwechselbares, aus Lasses Identität abgeleitetes Designkonzept, und der Standard-Besuch wird eine Scroll-Storytelling-Reise mit spürbarem Craft — ohne den Recruiter-Pfad je zu blockieren
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: WOW-02, WOW-03, WOW-04, MODE-02, TECH-02
**Success Criteria** (what must be TRUE):

  1. Besucher erlebt den Werdegang als scroll-verknüpfte Storytelling-Reise mit Szenen pro Karriere-Kapitel
  2. Besucher spürt Craft durch Micro-Interactions (Hover-States, magnetische Buttons) und nahtlose Sektions-Übergänge — getragen von genau einer Animations-Engine mit zentralen Motion-Tokens
  3. Jede immersive Sequenz ist überspringbar: Identität und Overview-Einstieg sind ab First Paint sichtbar, es gibt keinen unskippbaren Preloader
  4. Besucher mit prefers-reduced-motion bekommt eine vollwertig gestaltete ruhige Variante mit komplettem Inhalt (geteilte Implementierung mit dem Overview-Mode)
  5. Mobile-Besucher bekommt eine bewusst gestaltete Variante — kein Scrolljacking, kein degradiertes Desktop-Layout

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Motion foundation + engineered hero intro: GSAP+Lenis single engine, motion tokens, Bricolage display face, MotionProvider (reduced-motion/touch gated), Reveal/SplitHeading/HeroSceneSlot, hero "system booting" sequence (Wave 1)

**Wave 2** *(blocked on Wave 1)*

- [x] 03-02-PLAN.md — Career scroll-storytelling + bento projects: progress spine, progressive reveals, ITSC multi-beat sub-sequence, ELIA+Vidama featured bento (Wave 2)

**Wave 3** *(blocked on Wave 2)*

- [x] 03-03-PLAN.md — Craft micro-interactions + seamless transitions: magnetic buttons (pointer-only), designed hover/focus/active states, GSAP crossfade sub-route transitions (Wave 3)

**Wave 4** *(blocked on Wave 3)*

- [x] 03-04-PLAN.md — Signature treatments + full immersive verification: engineered photo treatment, reading-first case-study/about pages, wow/quiet/mobile walkthrough checkpoint (Wave 4)

**UI hint**: yes

### Phase 4: Signature Moment & Launch Hardening

**Goal**: Der Hero liefert den einen identitätsgebundenen 3D/WebGL-Wow-Moment — lazy, capability-gated und jederzeit streichbar — und jede Zusage der Site ist vor dem Launch auf der Produktions-URL verifiziert
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: WOW-01
**Success Criteria** (what must be TRUE):

  1. Besucher auf leistungsfähigem Gerät erlebt im Hero EINEN Signature-3D/WebGL-Moment, konzeptionell an Lasses Identität gebunden
  2. Der 3D-Layer lädt lazy nach First Paint und ist nie im Initial-Bundle; Besucher auf schwachen Geräten oder mit reduced-motion bekommen das volle Erlebnis ohne ihn, inkl. Fallback bei WebGL-Context-Loss
  3. Produktions-URL besteht mit aktivem 3D-Moment den mobilen Lighthouse/CWV-Audit (Launch-Verifikation von TECH-01) — getestet auch auf einem echten Mid-Tier-Android
  4. Externe Tester bestehen auf Produktion den 30-Sekunden-Stoppuhr-Test und den Reduced-Motion-Walkthrough (Launch-Verifikation von MODE-01/MODE-02)

**Plans:** 0/4 plans complete

Plans:
**Wave 1**

- [ ] 04-01-PLAN.md — Capability gate + lazy R3F mount: three/fiber/drei install (legitimacy gate), `useSyncExternalStore` tiering (D-23), idle-deferred dynamic Canvas shell, `heroSceneProgress` ref, initial Playwright gate tests (Wave 1)

**Wave 2** *(blocked on Wave 1)*

- [ ] 04-02-PLAN.md — Infrastructure Topology scene (D-20): procedural 12-node/18-edge lattice, accent pulse path, GSAP ScrollTrigger→ref→R3F scroll bridge (D-22), no ScrollControls (Wave 2)

**Wave 3** *(blocked on Wave 2)*

- [ ] 04-03-PLAN.md — WebGL resilience: context-loss degrade (D-25), geometry disposal, LHCI budget re-check + STATE.md delta (Wave 3)

**Wave 4** *(blocked on Wave 3)*

- [ ] 04-04-PLAN.md — Launch hardening: production UAT on lsiem.de (TECH-01/MODE-01/MODE-02 re-verify, Android device), WOW-01 + phase close (Wave 4)

**UI hint**: yes
**Research flag (resolved):** Device tiering, procedural scene (no Draco/KTX2 for v1), context-loss handling — see `04-RESEARCH.md`

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Bilingual Content Foundation | 4/4 | Complete    | 2026-07-03 |
| 2. Recruiter Overview Live | 7/7 | Complete   | 2026-07-05 |
| 3. Design Direction & Immersive Experience | 4/4 | Complete   | 2026-07-08 |
| 4. Signature Moment & Launch Hardening | 0/4 | Planned | - |
