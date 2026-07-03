# Portfolio Neubau — lsiem.de

## What This Is

Ein kompletter Neubau des persönlichen Portfolios von Lasse Siemoneit (lsiem.de) — als immersives, spektakuläres Web-Erlebnis, das als berufliche Visitenkarte Recruiter, Tech-Leads und ein breites Publikum beeindruckt. Der bestehende Rewrite (React/Vite/GSAP-SPA) wird verworfen; Konzept, Design, Inhalte und Stack werden von Grund auf neu gedacht.

## Core Value

Wer die Seite besucht, sagt "wow" — und findet trotzdem in unter 30 Sekunden die Fakten (wer, was, Kontakt), wenn er es eilig hat.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Immersives Erlebnis als Standard-Modus (Scroll-Storytelling, mutige Animationen, ggf. 3D)
- [ ] Prominenter Skip-/Überblick-Modus für Eilige (Recruiter-Pfad: Fakten in 30 Sekunden)
- [ ] Vollständige Inhalte: Werdegang, Projekte/Case Studies, Skills, Über-mich, Kontakt
- [ ] Zweisprachig Deutsch + Englisch mit Umschalter (i18n)
- [ ] Live auf lsiem.de deployed, performant (keine Wow-Effekte auf Kosten der Ladezeit)
- [ ] Stack-Entscheidung auf Basis der Recherche (bester 2026-Stack für immersive Portfolios)

### Out of Scope

- Weiterverwendung des bestehenden Rewrites — Design, Inhalte und Codebasis überzeugen nicht; bewusster Neustart ohne Altlasten
- (Weitere Ausschlüsse werden beim Requirements-Scoping festgelegt)

## Context

- **Bestehende Seite:** lsiem.de, aktuell React 19 + Vite + TypeScript + Tailwind 4 + GSAP + Framer Motion + React Three Fiber + Lenis, deployed auf Vercel. Wird als Referenz behalten, aber nicht weiterentwickelt.
- **Vorhandene Inhalte (deutsch, als Rohmaterial verwertbar):** Werdegang (ITSC GmbH Systemadministrator, Just Relate Software Engineer, ex-CTO Vidama, Freelancer), ~7 Projekte, Skills, Über-mich-Texte in `src/content/`.
- **Profil:** Selbsterlernter Full-Stack-Entwickler & DevOps Engineer, 5+ Jahre Erfahrung, Fokus Web- und Hybrid-Apps.
- **Unzufriedenheit mit dem Rewrite:** Design wirkt generisch, Inhalte zu dünn, Codebasis unsauber — daher kompletter Neustart mit frischem Blick.
- **Ideensammlung explizit gewünscht:** Breite Recherche zu Wow-Effekten (Animationen, 3D, Interaktionen), Inhalten & Substanz (Case Studies, Blog, CV), Technik-Features (z.B. AI-Chat über den CV, CMS, Analytics) — State of the Art 2026.

## Constraints

- **Hosting**: Vercel + Domain lsiem.de — bestehende Infrastruktur weiternutzen
- **Sprache**: Inhalte zweisprachig DE/EN — internationale Tech-Leads erreichen
- **Performance**: Immersion darf Ladezeit und Core Web Vitals nicht ruinieren — Recruiter springen sonst ab
- **Tech stack**: Bewusst offen — wird durch Recherche-Phase entschieden, keine Vorfestlegung

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Kompletter Neustart statt Weiterentwicklung des Rewrites | Design, Inhalte und Codebasis überzeugen nicht; frischer Blick gewünscht | — Pending |
| "Erlebnis mit Abkürzung": immersiv als Standard, Skip/Überblick für Eilige | Löst die Spannung zwischen Wow-Anspruch und Recruiter-Bedürfnis (Fakten in 30s) | — Pending |
| Stack-Wahl an Recherche delegiert | Bester 2026-Stack für immersive Portfolios soll evidenzbasiert gewählt werden | — Pending |
| Zweisprachig DE/EN | Deutsche Recruiter UND internationale Tech-Leads als Zielgruppe | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-02 after initialization*
