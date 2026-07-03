# Feature Research

**Domain:** Immersive personal developer portfolio (professional business card, "wow"-first with recruiter fast path)
**Researched:** 2026-07-02
**Confidence:** MEDIUM (web research cross-checked across multiple sources; award-site analysis and hiring-manager survey are strongest signals; individual differentiator ideas are LOW-confidence inspiration, not verified best practice)

## Context Framing

Two findings frame everything below:

1. **The site shell doesn't get you hired — the content inside does.** A survey of 60+ hiring managers (profy.dev): 93% will look at a portfolio site if provided, but 51% say having none doesn't lower a candidate's chances. Projects, case studies, and evidence of real work are what convert. For this project the site itself IS also evidence (frontend/creative craft), but that only holds if the craft is flawless — a janky 3D scene is worse than no 3D scene.
2. **2026's dominant design direction is consolidation, not maximalism.** Award-winning sites still go big (Bruno Simon's drivable 3D world won Site of the Month Jan 2026; OHZI won a Developer Award for cursor-driven WebGL), but the broader trend rewards restraint: legible type, fast loads, real accessibility, Core Web Vitals as table stakes. The winning formula is **one exceptional signature interaction + ruthless discipline everywhere else**, not ten stacked effects.

This validates PROJECT.md's core decision: immersive default + prominent skip/overview mode is exactly the right resolution of the wow-vs-30-seconds tension.

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these makes the site feel broken or amateur — no credit for having them, penalty for missing them.

#### Content

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero: name, role, one-line value prop | First 5 seconds must answer "who is this, what do they do" | LOW | Must survive the immersive treatment — never hide identity behind an intro animation |
| Projects with real case-study depth | #1 thing recruiters and tech leads look for | MEDIUM | Per project: problem, role, stack, challenges, outcome/impact, live link + source link where possible. ~7 existing projects are raw material; each needs a rewrite to case-study format |
| Werdegang / experience timeline | Recruiters scan career history in seconds | LOW | ITSC, Just Relate, ex-CTO Vidama, freelancing — dates, roles, one-liners |
| Skills presentation | Expected section; tech leads use it to gauge fit | LOW | Grouped by domain (frontend/backend/DevOps), honest levels. Avoid meaningless progress bars (see anti-features) |
| About/personality section | Differentiates a person from a CV; hiring is human | LOW | Photo, short story, what drives him |
| Contact (email + links, obvious placement) | If they can't reach you in one click, the site failed | LOW | mailto + LinkedIn + GitHub; visible from every page/section |
| Downloadable CV (PDF) | Recruiters need it for their pipeline | LOW | Ideally generated from the same content source as the site (single source of truth) |
| Up-to-date content | Outdated portfolio reads worse than none | LOW | Ongoing discipline; content architecture should make updates cheap |

#### Technical baseline

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fast load / good Core Web Vitals | Recruiters bounce; 2026: LCP/INP/CLS "good" is table stakes even for immersive sites | HIGH (for an immersive site) | The hard constraint of the whole project. 3D/WebGL drains budgets more than expected — defer/lazy-load heavy assets, hero must render fast |
| Flawless mobile experience | Large share of first visits are mobile (recruiter opens link from LinkedIn on phone) | MEDIUM–HIGH | Immersive desktop experience needs a deliberate, designed mobile equivalent — not a degraded afterthought |
| `prefers-reduced-motion` support | 2026 accessibility norm; vestibular users; also the technical backbone of "skip mode" | MEDIUM | Design a full reduced-motion variant, not just disabled animations. Synergy: reduced-motion path ≈ overview mode |
| Accessibility (contrast, keyboard, screen reader, semantic HTML) | Treated as design quality in 2026, not a legal checkbox; also SEO | MEDIUM | Animated/canvas text fights screen readers — keep real DOM text underneath effects |
| Dark mode | Standard expectation (82%+ of mobile users run dark mode); with system detection + manual toggle | LOW–MEDIUM | Decide early: dual-theme or a single dark-first art direction (legitimate for immersive sites — many award winners are dark-only by design) |
| i18n DE/EN with switcher | Explicit requirement; German recruiters + international tech leads | MEDIUM | Affects everything: routing, content model, SEO (hreflang), CV PDF, AI chat answers. Must be architected from day one, painful to retrofit |
| SEO + social sharing (OG images, meta, structured data) | The link gets shared in Slack/LinkedIn/email — the preview card is the real first impression | LOW–MEDIUM | Person/JSON-LD structured data; per-page OG images (per locale) |
| Basic privacy-friendly analytics | Need to know if anyone visits and where they drop off | LOW | Plausible/Umami/Vercel Analytics; GDPR-relevant for a German audience — cookieless preferred |

### Differentiators (Competitive Advantage)

Organized along the three axes the user asked for. **Pick 2–3 signature differentiators, not all of them** — award winners are remembered for one thing done exceptionally.

#### Axis 1: Wow effects (animations, 3D, interaction, visual experiments)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| One signature 3D/WebGL hero moment | The "wow" anchor; what people screenshot and remember. Award winners (Bruno Simon, OHZI, Messenger) each have ONE central metaphor | HIGH | Needs a concept tied to Lasse's identity (not generic floating blobs). Candidates: interactive scene representing full-stack/DevOps work, a navigable "world" of career stations, shader-driven identity visual |
| Scroll-driven storytelling ("Werdegang als Reise") | Turns the CV into a narrative; the strongest fit between immersion and content substance | HIGH | Scroll-linked scenes per career chapter. This is where immersion serves content instead of decorating it |
| Micro-interactions everywhere (hover states, magnetic buttons, cursor effects, link transitions) | Perceived craft; the difference between "template" and "designed" — cheap wow per unit effort | MEDIUM | High ROI. Custom cursor only if it never degrades usability; must vanish on touch devices |
| Seamless page/section transitions (View Transitions, shared elements) | Makes the site feel like one continuous experience, app-like | MEDIUM | View Transitions API is now broadly usable; graceful fallback |
| Physics/playful interactions (draggable elements, particles reacting to cursor) | Delight for the broad audience; invites exploration | MEDIUM–HIGH | Contain to one section; don't let playfulness block information access |
| Generative/shader visual identity (WebGL background, GLSL noise, image distortion on hover) | Distinctive art direction without full 3D scenes; cheaper than a 3D world | MEDIUM | OHZI pattern: cursor-reactive shader effects across the page. Good middle path if full 3D is descoped |
| Loading experience as design element | Immersive sites need asset load time; a crafted preloader turns dead time into anticipation | LOW–MEDIUM | Must be skippable and short; never gate the recruiter path behind it |

#### Axis 2: Content & substance

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Recruiter/overview mode ("Der Abkürzungs-Pfad")** | THE structural differentiator of this project: prominent "In Eile? →" entry that jumps to a dense, scannable one-pager (who/what/skills/timeline/contact/CV-download) in one click | MEDIUM | Core requirement, treat as a first-class designed artifact, not a fallback. Self-select navigation ("recruiter / tech lead / curious visitor") is the observed award-site pattern. Shares implementation with reduced-motion variant |
| Deep case studies (2–3 flagship projects) | What tech leads/CTOs actually read; proves seniority better than any effect. "Mini case study" format is explicitly what hiring managers ask for | MEDIUM (writing-heavy) | Problem → constraints → architecture decisions → tradeoffs → outcome with numbers. Vidama CTO story is prime material (leadership + technical depth) |
| "How this site was built" meta case study | The site demos itself; turns every wow effect into documented engineering evidence for tech leads | LOW–MEDIUM | Very high ROI: one page converts the whole build effort into content. Link from footer |
| Blog / writing section | Long-term SEO + depth signal; tech leads respect people who write | MEDIUM + ongoing commitment | **Only if he'll actually write.** An empty/stale blog is a liability (anti-feature below). Alternative: 3–5 evergreen "notes" without dates |
| Testimonials / references | Third-party validation; recruiters explicitly value it | LOW | 2–4 short quotes from colleagues/clients with names and roles |
| `/uses` page (tools, setup, hardware) | Developer-culture staple; cheap personality + long-tail traffic | LOW | |
| `/now` page (what I'm doing currently) | Signals the site is alive; conversation starter | LOW | Needs quarterly updates |
| Freelance/availability signal | If freelancing matters: clear "available for X" turns the portfolio into a lead generator | LOW | Decide the goal: employment, freelance leads, or both — changes CTA design |

#### Axis 3: Tech features

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI chat over CV/portfolio ("Ask Lasse")** | The 2026-defining tech differentiator; established pattern (RAG over CV + personal docs). Serves all three audiences: recruiters ask "does he know K8s?", tech leads probe depth, everyone gets the wow. Also a live AI-engineering skill demo | HIGH | Needs: RAG/context over content, streaming UI, guardrails (only answers about Lasse, deflects prompt injection), DE/EN answers, rate limiting + cost cap, conversation logging (GDPR notice). Page-context awareness (chat knows which section you're on) is the observed state of the art. Depends on structured content model |
| Interactive terminal easter egg | Developer-culture wow; commands like `help`, `cv`, `projects`, hidden easter eggs. Could double as power-user navigation | MEDIUM | Differentiator for the tech-lead audience specifically; keep it an easter egg, not primary nav |
| `npx lsiem` CLI business card | Tiny npm package printing card + links in the terminal; beloved dev-community move, near-zero cost | LOW | Great "wow for developers"; mention it in the site footer |
| Live GitHub activity / contribution visualization | "He actually codes" — live evidence instead of claims | LOW–MEDIUM | Build-time or cached API fetch; beware: only if the graph looks active |
| Git-based content management (MDX/content collections) | Single source of truth for DE/EN content, case studies, CV data → renders site + PDF + AI-chat context | MEDIUM | Recommended over a hosted CMS for a single-author site (see anti-features). This is a foundational architecture decision, not a bolt-on |
| Easter eggs (Konami code, console message, hidden pages) | Delight + shareability; console message is literally zero cost | LOW | `console.log` recruiting message is a classic; 2–3 small ones max |
| OG-image generation per page/locale | Every shared link looks designed | LOW | Vercel OG/satori; cheap polish with outsized reach |
| Sound design (subtle, opt-in) | Rare, memorable dimension of immersion | MEDIUM | Strictly opt-in (muted default); high risk of annoyance — only with the skip/overview architecture in place |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Unskippable intro animation / forced preloader tour | "Maximize the wow" | Recruiters bounce; directly violates the 30-second core value; #1 cited portfolio mistake | Skippable intro; identity + nav visible in first fold; overview mode one click away, always |
| Effects stacked everywhere (parallax + particles + transitions + cursor + …) | Each looks cool in isolation | 2026 consolidation trend explicitly punishes this; kills performance (documented case: removing 3 animated background layers cut 700ms), reads as insecurity not skill | One signature effect + disciplined micro-interactions; performance budget per section |
| Skill percentage bars ("React 90%") | Ubiquitous in templates | Meaningless numbers; tech leads roll their eyes; invites nitpicking | Grouped skills with context: years, depth markers, "used in project X" links |
| Full hosted CMS (Strapi/Contentful/Sanity) | "Professional setup", easy edits | Overkill for one author; extra infra, cost, auth surface, and a second system to keep alive; slows the immersive build | Git-based MDX/content collections; the author is a developer — the repo IS the CMS |
| Blog launched with 1–2 posts, then abandoned | "Blogs show thought leadership" | Stale blog (last post 2024) actively signals neglect — worse than no blog | Launch without blog OR with 3+ evergreen undated notes; add a real blog only when a writing habit exists |
| Custom cursor that replaces the system cursor entirely | Award-site aesthetic | Usability/accessibility harm when done wrong; breaks on touch; frequently cited annoyance | Cursor *augmentation* (trailing element, hover morphing) with system cursor intact, disabled on touch + reduced-motion |
| Comments, likes, newsletter, login — community features | "Engagement" | Nobody comments on a portfolio; spam moderation burden; GDPR surface | Prominent contact CTA + LinkedIn; newsletter only if the blog proves sustained |
| Autoplaying sound/video | Immersion | Universally hated; instant tab-close; accessibility violation | Opt-in sound toggle; muted looping video with play control |
| Over-gamified navigation as the ONLY navigation (drive a car to find the CV) | Bruno Simon envy | Works for a WebGL freelancer whose product is the game itself; fails the recruiter path and the broad audience | Gamified layer as *optional* exploration on top of conventional navigation — the dual-mode architecture already solves this |
| Real-time visitor counters / "currently viewing" gimmicks | Feels alive | Low numbers embarrass; privacy questions; zero hiring value | Private analytics dashboard for yourself only |

## Feature Dependencies

```
Structured content model (Git-based, DE/EN, single source of truth)
    └──required by──> i18n DE/EN switcher
    └──required by──> Case studies & Werdegang sections
    └──required by──> CV PDF generation
    └──required by──> AI chat over CV (RAG context)
    └──required by──> OG-image generation (per locale)

Recruiter/overview mode
    └──requires──> Structured content model (dense facts view = same data, different rendering)
    └──shares implementation with──> prefers-reduced-motion variant
    └──unblocks──> aggressive immersive default (wow is "safe" because escape hatch exists)

Signature 3D/WebGL hero ──constrained by──> Performance budget / CWV targets
Scroll storytelling ──constrained by──> prefers-reduced-motion variant (needs a non-animated equivalent)
Scroll storytelling ──requires──> finalized narrative content (Werdegang chapters written first)

AI chat ──requires──> API route/serverless + rate limiting + guardrails
AI chat DE/EN answers ──requires──> i18n content model

Sound design ──requires──> overview mode + opt-in toggle (never without escape hatch)
Terminal easter egg ──enhances──> AI chat (could share the same answer backend)

Blog ──conflicts with──> launch scope (ongoing commitment; defer)
Full hosted CMS ──conflicts with──> Git-based content model (pick one; Git recommended)
```

### Dependency Notes

- **Content model first:** Nearly every feature (i18n, overview mode, AI chat, CV PDF, OG images) consumes the same structured content. Getting this architecture right in an early phase is the single highest-leverage decision. Retrofitting i18n or restructuring content for RAG later is expensive.
- **Overview mode unblocks boldness:** The skip path is not a compromise feature — it's what *permits* the immersive default to be aggressive. Build it early, design it as beautifully as the immersive path.
- **Writing before scroll-scenes:** Scroll storytelling choreographs content; the Werdegang narrative and case studies must be written (in both languages) before scene design, or the animation work gets rebuilt.
- **Reduced-motion ≈ overview mode:** One designed "calm" rendering can serve both `prefers-reduced-motion` users and hurried recruiters — plan them together.

## MVP Definition

### Launch With (v1)

- [ ] Structured DE/EN content model (Git-based) — foundation for everything
- [ ] Immersive default: one signature hero moment + scroll-storytelling Werdegang + disciplined micro-interactions — the core value ("wow")
- [ ] Recruiter/overview mode, prominent from first fold — the other core value (facts in 30s)
- [ ] Full content: Werdegang, 5–7 projects (2–3 as deep case studies), skills, about, contact — the substance that actually converts
- [ ] CV PDF download — recruiter pipeline necessity
- [ ] Table-stakes technical baseline: CWV targets, mobile-designed experience, reduced-motion variant, accessibility, dark theme (or dark-first art direction), SEO/OG, privacy-friendly analytics

### Add After Validation (v1.x)

- [ ] AI chat over CV — highest-value differentiator, but needs the content model live first; adding post-launch also gives a "what's new" moment
- [ ] "How this site was built" meta case study — written after the site exists
- [ ] `npx lsiem` CLI card + console easter egg — near-zero cost, fun follow-ups
- [ ] Live GitHub stats — once cached-fetch infra exists
- [ ] Terminal easter egg — when AI chat backend can be reused
- [ ] `/uses` and `/now` pages

### Future Consideration (v2+)

- [ ] Blog — only when a writing habit is proven
- [ ] Sound design — only if v1 immersion lands well and demand for "more" exists
- [ ] Additional 3D scenes / gamified exploration layer — expand the signature moment, don't multiply moments

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Structured DE/EN content model | HIGH | MEDIUM | P1 |
| Recruiter/overview mode | HIGH | MEDIUM | P1 |
| Signature hero moment (3D/shader) | HIGH | HIGH | P1 |
| Scroll-storytelling Werdegang | HIGH | HIGH | P1 |
| Deep case studies (2–3) | HIGH | MEDIUM | P1 |
| CWV/mobile/a11y/reduced-motion baseline | HIGH | MEDIUM–HIGH | P1 |
| CV PDF download | HIGH | LOW | P1 |
| Micro-interactions & transitions | MEDIUM | MEDIUM | P1–P2 |
| AI chat over CV | HIGH | HIGH | P2 |
| Meta case study ("how it's built") | MEDIUM | LOW | P2 |
| OG-image generation | MEDIUM | LOW | P2 |
| Testimonials | MEDIUM | LOW | P2 |
| npx CLI card / easter eggs | MEDIUM | LOW | P2 |
| Live GitHub stats | MEDIUM | LOW–MEDIUM | P2 |
| Terminal easter egg | MEDIUM | MEDIUM | P3 |
| `/uses`, `/now` pages | LOW–MEDIUM | LOW | P3 |
| Blog | MEDIUM | HIGH (ongoing) | P3 |
| Sound design | LOW | MEDIUM | P3 |

## Competitor Feature Analysis

| Feature | Bruno Simon (bruno-simon.com) | OHZI Interactive | Typical dev portfolio template | Our Approach |
|---------|-------------------------------|------------------|-------------------------------|--------------|
| Signature wow | Drivable 3D world (Three.js + physics), Site of the Month 01/2026 | Cursor-driven full-page WebGL/GLSL distortion, Developer Award | None (static cards) | ONE signature moment tied to Lasse's identity; scroll-storytelling as narrative spine |
| Fast-facts path | Weak — exploration IS the site (works because his product is the demo itself) | Conventional nav alongside effects | Everything is fast-facts, zero wow | Dual-mode: immersive default + designed 30s overview, prominent from first fold |
| Content depth | Portfolio/talks/teaching links | Agency case work | Thin project cards, skill bars | Deep case studies incl. CTO story + meta case study of the site itself |
| Audience handling | Single audience (creative-dev scene) | Clients | Recruiters only | Explicit self-select: recruiter / tech lead / curious visitor |
| AI features | None | None | None | RAG chat over CV (v1.x) — genuine differentiator, still rare on personal sites |
| i18n | EN only | EN only | EN only | DE/EN — differentiator for the German market |

## Sources

- [Awwwards — Storytelling collection](https://www.awwwards.com/awwwards/collections/storytelling/), [WebGL collection](https://www.awwwards.com/awwwards/collections/webgl/) — award-site feature patterns (MEDIUM)
- [Metabole Studio — Immersive Website Examples 2026](https://metabole.studio/en/blog/immersive-website-examples) — Bruno Simon, OHZI, Messenger analyses (MEDIUM)
- [CreativeDevJobs — Best Three.js Portfolio Examples 2026](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025) (MEDIUM)
- [profy.dev — Portfolio websites survey, 60+ hiring managers](https://profy.dev/article/portfolio-websites-survey) — content > shell finding (MEDIUM, strongest single source)
- [OpenDoors — How recruiters actually look at portfolios](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio), [scale.jobs — Portfolio content for tech jobs](https://scale.jobs/blog/portfolio-content-for-tech-jobs-what-recruiters-want), [Hakia — Developer Portfolio Guide 2026](https://hakia.com/skills/building-portfolio/) — table-stakes content (MEDIUM)
- [studiomeyer.io — Web Design Trends 2026 reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check), [Figma — Web Design Trends 2026](https://www.figma.com/resource-library/web-design-trends/) — consolidation trend, dark mode, a11y, CWV (MEDIUM)
- [coachfullstack — 8 portfolio mistakes](https://coachfullstack.com/posts/8-software-developer-portfolio-website-mistakes/), [dev.to — 40 portfolio reviews](https://dev.to/kethmars/what-i-learned-after-reviewing-over-40-developer-portfolios-9-tips-for-a-better-portfolio-4me7) — anti-patterns (MEDIUM)
- [medevs/smart-portfolio (GitHub)](https://github.com/medevs/smart-portfolio), [Cameron Rye — Building a RAG portfolio chatbot](https://rye.dev/blog/building-ask-rag-portfolio-chatbot/), [ProBot](https://pro-bot.dev/), [n8n CV-RAG workflow](https://n8n.io/workflows/2987-personal-portfolio-cv-rag-chatbot-with-conversation-store-and-email-summary/) — AI-chat-over-CV pattern (MEDIUM)
- [iamdhakrey/terminal-portfolio](https://github.com/iamdhakrey/terminal-portfolio), [npx CLI portfolio write-up](https://medium.com/@vishal_mahajan/a-developer-cli-portfolio-that-lives-inside-your-terminal-npx-vishalrmahajan-12b5518c9976), [emmabostian/developer-portfolios](https://github.com/emmabostian/developer-portfolios) — differentiator ideas (LOW, inspiration-grade)

---
*Feature research for: immersive personal developer portfolio (lsiem.de)*
*Researched: 2026-07-02*
