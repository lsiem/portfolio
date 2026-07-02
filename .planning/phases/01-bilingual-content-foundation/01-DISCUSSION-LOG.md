# Phase 1: Bilingual Content Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-02
**Phase:** 1-Bilingual Content Foundation
**Areas discussed:** Content-Erstellung & Übersetzung, Content-Modell-Format, Repo-Strategie & Phase-1-Sichtbarkeit, Locale-Routing & Analytics

---

## Content-Erstellung & Übersetzung

### Case-Study-Fokus (freie Nennung durch User)

**User's choice:** Neben Vidama soll ITSC im Mittelpunkt stehen. Gewichtung: ELIA am wichtigsten, dann Vidama (Mediathek-Entwicklung), zum Schluss OpenShift.
**Notes:** User lieferte das interne ELIA-Produktvisions-PDF als Quellmaterial (nach `.planning/phases/01-bilingual-content-foundation/reference/` kopiert). Karriere-Bogen bei ITSC: Systemadministrator (OpenShift) → Software Engineering → seit ~3 Monaten (≈April 2026) Product Owner ELIA.

### Vertraulichkeit der ELIA-Details

| Option | Description | Selected |
|--------|-------------|----------|
| Abstrahiert (Empfohlen) | Architektur-Patterns und Rolle konkret, interne Systemnamen/Roadmap-Daten/Modell-Details verallgemeinert | ✓ |
| Volle Details | Alles aus dem PDF 1:1 verwendbar, Freigabe-Verantwortung beim User | |
| Erst intern klären | Zweistufig: abstrahierte Fassung jetzt, Details nach Freigabe | |

**User's choice:** Abstrahiert

### ITSC-Story-Zuschnitt

| Option | Description | Selected |
|--------|-------------|----------|
| Eine Case Study: ELIA | ELIA tief aus PO-Perspektive, OpenShift-Hintergrund als Einstieg, Sysadmin-Zeit in Timeline | |
| Zwei Kapitel: Plattform + ELIA | Zwei getrennte tiefe Case Studies | |
| ELIA tief, OpenShift mittel | ELIA als tiefe Case Study, OpenShift als kürzere Projekt-Karte | ✓ |

**User's choice:** c — ELIA tief, OpenShift als kürzere Projekt-Karte

### Altes Material aus src/content/

| Option | Description | Selected |
|--------|-------------|----------|
| Rohmaterial übernehmen und vertiefen | Bestehende deutsche Inhalte als Basis | ✓ |
| Komplett frisch schreiben | Neustart ohne Alt-Texte | |

**User's choice:** „Als Beispiel nehmen und etwas verfeinern"

### Englische Fassung

| Option | Description | Selected |
|--------|-------------|----------|
| Claude übersetzt/schreibt EN | User reviewt | ✓ |
| User schreibt EN selbst | | |

**User's choice:** „Schreibe du auf englisch"

---

## Content-Modell-Format

### Speicherformat

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: MDX + TS (Empfohlen) | Prosa als MDX mit Zod-Frontmatter, strukturierte Daten als typisierte TS-Module | ✓ |
| Nur TS-Module | Wie im alten Rewrite | |
| Nur MDX/Markdown | Alles inkl. Timeline/Skills als Frontmatter | |
| Du entscheidest | Claude wählt beim Planning | |

**User's choice:** Hybrid: MDX + TS

### DE/EN-Organisation

| Option | Description | Selected |
|--------|-------------|----------|
| Parallele Locale-Ordner (Empfohlen) | content/de/… + content/en/… mit erzwungener Vollständigkeit | ✓ |
| Eine Datei, beide Sprachen | {de, en}-Felder nebeneinander | |
| Du entscheidest | | |

**User's choice:** Parallele Locale-Ordner

---

## Repo-Strategie & Phase-1-Sichtbarkeit

### Umgang mit dem alten Vite-Rewrite

| Option | Description | Selected |
|--------|-------------|----------|
| Löschen, Git bewahrt (Empfohlen) | Beim Scaffold entfernen, src/content/ vorher extrahieren | ✓ |
| Temporär in legacy/ verschieben | Bis Phase 2 behalten | |

**User's choice:** a — Löschen

### Live-Strategie Phase 1

| Option | Description | Selected |
|--------|-------------|----------|
| Preview-URL, lsiem.de bleibt alt (Empfohlen) | Vercel-Deployment mit voller Pipeline, Domain-Switch erst Phase 2 | ✓ |
| lsiem.de sofort ersetzen | Rohbau öffentlich | |
| Subdomain (next.lsiem.de) | Feste Staging-Subdomain | |

**User's choice:** „Es soll erstmal auf Vercel deployed werden" — Vercel-Deployment, lsiem.de bleibt vorerst alt

---

## Locale-Routing & Analytics

### Default-Locale / Root-URL

| Option | Description | Selected |
|--------|-------------|----------|
| Browser-Erkennung, x-default → /en | International default EN | |
| Immer /de als Default | Deutsche Recruiter im Fokus | ✓ |
| Immer /en als Default | | |

**User's choice:** „Standard: Deutsch" — Root → /de

### Analytics-Tool

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Analytics (Empfohlen) | Cookieless, plattformintegriert, null Setup | ✓ |
| Plausible | Eigenes Dashboard, ~9 €/Monat | |
| Umami | Self-hosted, Betriebsaufwand | |

**User's choice:** a — Vercel Analytics

---

## Claude's Discretion

- MDX-Tooling-Wahl (Content-Collections-Library vs. eigene Zod-Pipeline)
- Schema-Details des Content-Modells (Feldnamen, Frontmatter-Shape)
- Auswahl/Zuschnitt der übrigen nicht-tiefen Projekte aus den ~7 Alt-Projekten

## Deferred Ideas

- Domain-Switch lsiem.de → neue Site: Phase 2
- Timeline-UI und Case-Study-Darstellung: Phase 2 (Inhalte entstehen in Phase 1)
