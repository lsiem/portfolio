# Phase 1: Bilingual Content Foundation - Context

**Gathered:** 2026-07-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Sämtliche v1-Portfolio-Inhalte (Werdegang, 5–7 Projekte mit tiefen Case Studies, Skills, Über-mich, Kontakt) existieren fertig geschrieben und strukturiert in Deutsch UND Englisch als typisiertes, Git-basiertes Content-Modell (Single Source of Truth) — und rendern über eine deployte, performance-überwachte Next.js-Foundation auf Vercel. Requirements: CONT-01, I18N-01, I18N-02, TECH-06, TECH-07.

Nicht in dieser Phase: Recruiter-Overview-UI, Design/Immersion, CV-PDF, 3D — das sind Phasen 2–4. Phase 1 liefert Inhalte + Foundation, nicht Gestaltung.

</domain>

<decisions>
## Implementation Decisions

### Case-Study-Auswahl & Gewichtung
- **D-01:** Drei Projekt-Schwerpunkte in dieser Gewichtung: **ELIA (Flaggschiff, tiefste Case Study) → Vidama (Mediathek-Entwicklung, tiefe Case Study) → OpenShift-Plattformarbeit (kürzere Projekt-Karte, kein volles Problem→Tradeoff-Format)**. Das aktualisiert REQUIREMENTS.md CONT-04, wo noch Vidama als Flaggschiff genannt ist — ELIA ist jetzt Flaggschiff.
- **D-02:** ELIA-Case-Study aus **Product-Owner-Perspektive** erzählen (Problem → Architektur-Entscheidungen → Tradeoffs → Stand), mit dem OpenShift/Engineering-Hintergrund als Einstieg. Karriere-Bogen bei ITSC: Systemadministrator (OpenShift) → Software Engineering → seit ~April 2026 Product Owner ELIA. Dieser Bogen gehört auch in die Werdegang-Timeline (Phase-2-Inhalt, aber Content entsteht jetzt).
- **D-03 (Vertraulichkeit):** ELIA-Inhalte **abstrahiert** schreiben: Architektur-Patterns und Rolle konkret (Multi-Agenten-Architektur, MCP-basiertes Tool-Calling statt klassischem RAG, Orchestrator-Migration auf ein aktuelles Agent-Framework, EU-Datenresidenz/DSGVO, Teams-Integration) — aber interne Systemnamen, Roadmap-Daten und konkrete Modellnamen verallgemeinern (Kategorie-Begriffe wie „ITSM-System"/„Wiki" statt Produktnamen). Die konkreten Namen stehen NUR im lokalen Referenz-PDF (nicht committet, siehe Canonical Refs). **Dieses Repo ist öffentlich — interne Details dürfen weder in Content noch in Planungsdokumente.**

### Content-Erstellung & Übersetzung
- **D-04:** Altes deutsches Material aus `src/content/` (personal, projects, experience, skills, about, ui) als Beispiel/Rohmaterial nehmen und verfeinern — nicht komplett neu schreiben. Vor dem Löschen des alten Codes (D-07) extrahieren.
- **D-05:** Claude schreibt die englische Fassung aller Inhalte (Übersetzung/Adaption aus dem Deutschen).

### Content-Modell-Format
- **D-06:** **Hybrid-Format:** Lange Prosa (Case Studies, Über-mich) als MDX-Dateien mit Zod-validiertem Frontmatter; strukturierte Daten (Timeline, Skills, Kontakt, Projekt-Metadaten) als typisierte TS-Module. Sprachorganisation: **parallele Locale-Ordner** (`content/de/…`, `content/en/…`) mit identischer Struktur; ein Zod/TS-Vollständigkeits-Check erzwingt, dass jeder Inhalt in beiden Sprachen existiert (I18N-02).

### Repo-Strategie & Deployment
- **D-07:** Altes Vite-Rewrite beim Next.js-Scaffold **löschen** — Git-History bewahrt alles; `src/content/`-Rohmaterial vorher extrahieren (siehe D-04).
- **D-08 (AMENDED):** Phase 1 deployt **auf Vercel (Preview-/Deployment-URL)** mit kompletter Pipeline und CI-Performance-Budget. *Update: lsiem.de zeigt bereits eine interim Minimal-Version der neuen Next.js-Site.* Dies ist ein bewusstes Vorgehen außerhalb der automatisierten Phase. Das Phase-1-Erfolgskriterium „lsiem.de/de und lsiem.de/en" gilt entsprechend auf der Vercel-Deployment-URL (`/de`, `/en`); der finale Domain-Switch für die *komplette* Recruiter-Site bleibt Phase-2-Arbeit.

### Locale-Routing & Analytics
- **D-09:** **Default-Locale: Deutsch.** Root-URL leitet immer nach `/de` (keine Browser-Sprach-Weiche); Englisch über `/en` und den Sprach-Switcher. `x-default` im hreflang-Set zeigt auf die deutsche Default-Variante.
- **D-10:** **Vercel Analytics** als cookieless, DSGVO-freundliches Analytics (TECH-06) — plattformintegriert, kein Setup-Overhead.

### Claude's Discretion
- Genaue MDX-Tooling-Wahl (Content-Collections-Library vs. eigene Zod-Pipeline) beim Planning entscheiden — passend zu Next.js 16 und den Downstream-Nutzern (CV-PDF Phase 2, AI-Chat v2).
- Struktur/Schema-Details des Content-Modells (Feldnamen, Frontmatter-Shape), solange D-06 eingehalten wird.
- Auswahl und Zuschnitt der übrigen (nicht-tiefen) Projekte aus den ~7 Alt-Projekten.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ELIA (Flaggschiff-Case-Study — Quellmaterial, NUR LOKAL)
- `.planning/phases/01-bilingual-content-foundation/reference/ELIA-produktvision.pdf` — Internes ITSC-Dokument: Produkt-Vision, Architektur (Multi-Agent, MCP), Roadmap. **Gitignored (öffentliches Repo!), existiert nur lokal.** Nur abstrahiert verwenden (D-03) — interne Systemnamen/Daten nicht in Content oder committete Dokumente übernehmen.
- `.planning/phases/01-bilingual-content-foundation/reference/ELIA-produktvision.txt` — Text-Extraktion desselben Dokuments (leichter maschinell lesbar, ebenfalls gitignored).

### Recherche (Stack- und Architektur-Vorgaben für die Foundation)
- `.planning/research/STACK.md` — Verifizierte Versionen & Integrationsregeln (Next.js 16, next-intl 4, Tailwind 4, pnpm; React-Pin `~19.2.0`).
- `.planning/research/ARCHITECTURE.md` — Fünf-Schichten-Architektur; Content-Layer als Single Source of Truth; `[locale]`-Segment mit `generateStaticParams` → volle SSG.
- `.planning/research/PITFALLS.md` — Pitfall 3 (CWV-Budget ab Scaffold im CI), Pitfall 6 (routen-basiertes i18n + komplette hreflang-Sets inkl. x-default von Anfang an).

### Projekt-Grundlagen
- `.planning/REQUIREMENTS.md` — CONT-01, I18N-01, I18N-02, TECH-06, TECH-07 (Phase-1-Scope); Hinweis: CONT-04-Flaggschiff-Nennung durch D-01 aktualisiert.
- `.planning/ROADMAP.md` — Phase-1-Ziel und Erfolgskriterien (Kriterium 2 per D-08 auf Vercel-URL interpretiert).

### Altes Rohmaterial (vor Scaffold-Löschung extrahieren)
- `src/content/personal.ts`, `src/content/projects.ts`, `src/content/experience.ts`, `src/content/skills.ts`, `src/content/about.ts`, `src/content/ui.ts` — Deutsches Bestands-Material aus dem alten Rewrite (Basis für D-04). `src/content/types.ts` als Schema-Inspiration.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/*.ts` (altes Vite-Rewrite): vollständiges deutsches Rohmaterial für Werdegang, ~7 Projekte, Skills, Über-mich — wird extrahiert, verfeinert und ins neue Content-Modell überführt, dann wird der alte Code gelöscht (D-04/D-07).
- `src/content/types.ts` + `validate.ts`: Schema-Ansatz des alten Modells als Inspiration für das neue Zod/TS-Schema.
- `vercel.json` + bestehendes Vercel-Projekt: Deployment-Infrastruktur existiert bereits; Phase 1 ersetzt Build-Setup (Vite → Next.js), nicht die Plattform.

### Established Patterns
- Keine übernehmbaren Code-Patterns — bewusster Neustart. Die Recherche-Dokumente (nicht der Alt-Code) definieren die Ziel-Patterns.

### Integration Points
- Vercel-Projekt/Domain lsiem.de: lsiem.de zeigt seit einem bewussten User-Merge der interim-live-PR (außerhalb der automatisierten Phase) bereits eine interim Minimal-Version der neuen Next.js-Site (D-08 AMENDED, siehe oben). Die automatisierte Phase-1-Arbeit läuft weiterhin ausschließlich auf Vercel-Deployment-URLs und rührt Produktion nicht an; der finale Domain-Switch für die komplette Recruiter-Site bleibt Phase-2-Arbeit.

</code_context>

<specifics>
## Specific Ideas

- ELIA-Story-Kern, den der User hervorhebt: Entwicklung vom Systemadministrator (OpenShift) über Software Engineering zum Product Owner eines internen KI-Assistenten — die Rollenentwicklung ist Teil der Erzählung, nicht nur die Technik.
- Erzählbare ELIA-Architektur-Momente (abstrahiert erlaubt): Ablösung des klassischen RAG-Pfads durch MCP-basiertes Tool-Calling (Live-Daten statt Vektor-Index, keine Berechtigungs-Duplizierung); feature-geflaggte Orchestrator-Migration im Parallelbetrieb; EU-Datenresidenz/DSGVO als bewusste Plattform-Entscheidung. Details im lokalen Referenz-PDF.
- Vidama-Case-Study fokussiert auf die **Mediathek-Entwicklung** (vom User präzisiert).

</specifics>

<deferred>
## Deferred Ideas

- Finaler Domain-Switch von lsiem.de auf die *komplette* Recruiter-Site → Phase 2 (Teil von „Recruiter Overview Live", D-08 AMENDED); eine interim Minimal-Version der neuen Site ist bereits live.
- Werdegang-Timeline-UI und Case-Study-Darstellung → Phase 2 (Inhalte entstehen in Phase 1, Präsentation in Phase 2).

</deferred>

---

*Phase: 1-Bilingual Content Foundation*
*Context gathered: 2026-07-02*
