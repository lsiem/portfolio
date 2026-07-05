# Requirements — Portfolio Neubau lsiem.de

**Defined:** 2026-07-02
**Core value check:** Jedes v1-Requirement zahlt auf "Wow-Erlebnis + Fakten in 30 Sekunden" ein.

## v1 Requirements

### Content & Substanz

- [x] **CONT-01**: Strukturiertes, Git-basiertes DE/EN-Content-Modell als Single Source of Truth (speist Site, Overview-Mode, CV-PDF und später AI-Chat)
- [x] **CONT-02**: Besucher sieht im ersten Viewport sofort Name, Rolle und Ein-Satz-Wertversprechen — nie hinter einer Intro-Animation versteckt
- [x] **CONT-03**: Besucher kann den Werdegang als Timeline erfassen (ITSC, Just Relate, Vidama-CTO, Freelance — Daten, Rollen, Kurzbeschreibung)
- [x] **CONT-04**: Besucher kann 5–7 Projekte ansehen, davon 2–3 als tiefe Case Studies (Problem → Architektur-Entscheidungen → Tradeoffs → Ergebnis mit Zahlen; Vidama-CTO-Story als Flaggschiff)
- [x] **CONT-05**: Besucher kann Skills nach Domäne gruppiert mit Kontext einschätzen (Jahre, Projekt-Verweise — keine Prozent-Balken)
- [x] **CONT-06**: Besucher lernt die Person kennen (Über-mich mit Foto, Geschichte, Antrieb)
- [x] **CONT-07**: Besucher erreicht Kontaktmöglichkeiten (E-Mail, LinkedIn, GitHub) mit einem Klick aus jeder Sektion
- [x] **CONT-08**: Besucher kann einen aktuellen CV als PDF herunterladen, generiert aus dem Content-Modell

### Immersives Erlebnis (Wow)

- [ ] **WOW-01**: Besucher erlebt EINEN Signature-3D/WebGL-Moment im Hero, konzeptionell an Lasses Identität gebunden — lazy-loaded, capability-gated, nie im Initial-Bundle
- [ ] **WOW-02**: Besucher erlebt den Werdegang als Scroll-Storytelling-Reise (scroll-verknüpfte Szenen pro Karriere-Kapitel)
- [ ] **WOW-03**: Besucher spürt Craft durch Micro-Interactions (Hover-States, magnetische Buttons) und nahtlose Sektions-/Seitenübergänge
- [ ] **WOW-04**: Besucher kann jede immersive Sequenz überspringen — Identität und Navigation im ersten Fold sichtbar, kein unskippbarer Preloader

### Dual-Mode (Recruiter-Pfad)

- [x] **MODE-01**: Eiliger Besucher erreicht mit einem Klick ab dem ersten Fold einen dichten Überblick (Wer/Was/Skills/Timeline/Kontakt/CV-Download) und hat alle Fakten in unter 30 Sekunden
- [ ] **MODE-02**: Besucher mit `prefers-reduced-motion` bekommt eine vollwertig gestaltete ruhige Variante (geteilte Implementierung mit Overview-Mode)

### Internationalisierung

- [x] **I18N-01**: Besucher kann zwischen Deutsch und Englisch wechseln (routen-basiertes i18n mit Switcher, hreflang, per-Locale-SEO)
- [x] **I18N-02**: Alle Inhalte inkl. Case Studies liegen vollständig in beiden Sprachen vor

### Technische Basis

- [ ] **TECH-01**: Seite erreicht Core Web Vitals "good" (LCP/INP/CLS) auf Mobilgeräten — erster Viewport ist statisches/SSR-HTML, Wow-Layer lädt nach First Paint
- [ ] **TECH-02**: Mobile-Besucher bekommen ein bewusst gestaltetes Erlebnis (kein degradiertes Desktop-Erlebnis, kein Scrolljacking auf Mobile)
- [x] **TECH-03**: Seite ist zugänglich: semantisches HTML, Tastatur-Navigation, Kontraste, echter DOM-Text unter allen Effekten
- [x] **TECH-04**: Besucher bekommt Dark Mode (Systemerkennung + Toggle) oder eine dark-first Art Direction — Entscheidung in der Design-Phase
- [x] **TECH-05**: Geteilte Links zeigen gestaltete Preview-Cards (OG-Images pro Seite/Locale, Person-JSON-LD, Meta-Tags)
- [x] **TECH-06**: Seitenbetreiber sieht Besucherzahlen über cookieless, DSGVO-freundliche Analytics
- [x] **TECH-07**: Seite ist live auf lsiem.de (Vercel), Performance-Budget wird im CI geprüft
- [x] **TECH-08**: Besucher sieht Live-GitHub-Aktivität als Beleg aktiver Entwicklung (Build-Time/gecachter API-Fetch)

## v2 Requirements (v1.x — nach Launch)

### AI & Interaktion

- [ ] **AI-01**: Besucher kann dem AI-Chat "Ask Lasse" Fragen zu CV und Projekten stellen (RAG über Content-Modell, Streaming-UI, DE/EN, Guardrails gegen Off-Topic/Prompt-Injection, Rate-Limiting + Kosten-Cap)
- [ ] **AI-02**: Tech-affiner Besucher kann ein interaktives Terminal-Easter-Egg nutzen (`help`, `cv`, `projects`; nutzt später das AI-Chat-Backend)

## Out of Scope

| Feature | Begründung |
|---------|------------|
| Blog / Schreib-Sektion | Keine etablierte Schreib-Routine — stale Blog schadet mehr als kein Blog; v2+ neu bewerten |
| Sound-Design | Hohes Nerv-Risiko, geringer Hiring-Wert; nur falls v1-Immersion nachweislich ankommt (v2+) |
| npx CLI-Card & Easter Eggs (Konami, Console) | Vom Nutzer abgewählt; jederzeit günstig nachrüstbar |
| Testimonials | Vom Nutzer abgewählt für v1 |
| Meta-Case-Study ("How this site was built") | Vom Nutzer abgewählt; kann nach Launch jederzeit ergänzt werden |
| `/uses`- und `/now`-Seiten | Vom Nutzer abgewählt; Pflege-Aufwand ohne Kern-Nutzen |
| Shader-Identity als Alternative | Durch Entscheidung für vollen Signature-3D-Moment ersetzt |
| Hosted CMS (Strapi/Contentful/Sanity) | Overkill für Single-Author; Git-basiertes Content-Modell ist das CMS (Anti-Feature laut Recherche) |
| Skill-Prozentbalken | Bedeutungslose Zahlen, wirken unseriös auf Tech-Leads (Anti-Feature) |
| Unskippbares Intro / erzwungener Preloader | Verletzt direkt den Core Value (Fakten in 30s) — #1 Portfolio-Fehler |
| Kommentare, Newsletter, Login, Besucherzähler | Kein Hiring-Wert, Moderations-/DSGVO-Last (Anti-Feature) |
| Autoplay-Sound/-Video | Universell gehasst, Accessibility-Verstoß (Anti-Feature) |
| Weiterverwendung des bestehenden Rewrites | Bewusster Neustart — Design, Inhalte und Codebasis überzeugen nicht |

## Traceability

<!-- Filled by roadmap creation: REQ-ID → Phase mapping -->

| REQ-ID | Phase | Status |
|--------|-------|--------|
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 2 | Complete |
| CONT-04 | Phase 2 | Complete |
| CONT-05 | Phase 2 | Complete |
| CONT-06 | Phase 2 | Complete |
| CONT-07 | Phase 2 | Complete |
| CONT-08 | Phase 2 | Complete |
| WOW-01 | Phase 4 | Pending |
| WOW-02 | Phase 3 | Pending |
| WOW-03 | Phase 3 | Pending |
| WOW-04 | Phase 3 | Pending |
| MODE-01 | Phase 2 | Complete |
| MODE-02 | Phase 3 | Pending |
| I18N-01 | Phase 1 | Complete |
| I18N-02 | Phase 1 | Complete |
| TECH-01 | Phase 2 | Pending |
| TECH-02 | Phase 3 | Pending |
| TECH-03 | Phase 2 | Complete |
| TECH-04 | Phase 2 | Complete |
| TECH-05 | Phase 2 | Complete |
| TECH-06 | Phase 1 | Complete |
| TECH-07 | Phase 1 | Complete |
| TECH-08 | Phase 2 | Complete |

**Coverage:** 24/24 v1 requirements mapped — no orphans, no duplicates.

---
*Requirements for: Portfolio Neubau lsiem.de — v1*
*Defined: 2026-07-02*
