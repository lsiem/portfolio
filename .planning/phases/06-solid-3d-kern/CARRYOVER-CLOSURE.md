# Phase 04–06 Carry-Over Closure

Evidence for the non-blocking carry-over items tracked in STATE.md, closed 2026-07-25 against production `lsiem.de` (KERN solid-3D live, commit a2d0457).

## 1. ESLint toolchain breakage — ✅ FIXED (commit 48e362a)

**Root cause:** `package.json` pinned `eslint: "^10"` (resolved 10.7.0), but `eslint-config-next@16.2.10` peers `eslint >=9.0.0` and its transitive `eslint-plugin-react@7.37.5` caps at `eslint ^9.7`. ESLint 10 removed `context.getFilename()`, which `eslint-plugin-react`'s `detectReactVersion` still calls → every `eslint` run crashed with `contextOrFilename.getFilename is not a function`. No published `eslint-plugin-react` supports ESLint 10 yet.

**Fix:** pin `eslint: "^9"` (9.39.5, the supported line); add flat-config ignores for non-source trees the config doesn't skip via `.gitignore` (nested `.claude/worktrees/*`, `.planning/**`, vendored `google-cloud-sdk/**`, generated `.content-collections/**`); scope `react-hooks/immutability` + `react-hooks/refs` **off** for `src/components/scene/stage/**` only (the imperative WebGL render layer where per-frame three.js mutation is the intended, eval-enforced D-08 architecture — React Compiler immutability rules model React state, not the scene graph); drop one unused import.

**Result:** `pnpm lint` exits 0.

## 2. D-11 production-LCP sign-off — ✅ SIGNED OFF

Real production traces (Chrome DevTools, `lsiem.de/de`), LCP element = the server-rendered `<h1>` (self-hosted preloaded Bricolage font):

| Condition | LCP | CLS | vs 2500 ms budget |
|---|---|---|---|
| Desktop, 1× CPU, no throttle, default | **815 ms** | 0.00 | ✅ 3.1× under |
| 4× CPU + Slow 4G, `?webgl=force` (3D active) | **768 ms** | 0.00 | ✅ 3.3× under |

**Conclusion:** LCP is comfortably within budget in production, even under mobile-class throttling with the 3D stage forced on — because the H1 LCP element paints on the critical path (HTML + inlined CSS + one preloaded font) while the WebGL chunk loads post-idle behind the gate and never blocks it. The historical LHCI ~2.7 s **warn** is a cold-`next start`-on-CI-runner lab artifact (no CDN, single-threaded runner under load), not the CDN-served production experience. The warn stays as a lab-only advisory; no production action required.

## 3. Two-theme per-formation contrast pass — ✅ PASS

WCAG contrast ratios sampled across every formation section's DOM text (hero, career, projects, skills, about, activity, contact, nav) on production, both themes:

- **Light** (`data-theme` default) and **Dark** (`data-theme="dark"`, body `rgb(10,10,10)`): **identical ratios** — the design tokens are engineered to the same contrast targets per theme.
- Headings + interactive: 8.75–16.91 (AAA). Muted body/labels: 5.79 (AA, above the 4.5 normal-text floor).
- **Zero sub-AA failures in either theme.**

The 3D canvas is `aria-hidden`, `pointer-events-none` decoration behind the DOM, so it does not participate in text contrast; the per-formation `--scene-alpha` token keeps shard density from reducing legibility.

## 4. Real-device mid-tier Android profile — ⏳ REQUIRES HARDWARE

Emulated 4× CPU + Slow 4G (item 2) is a proxy, not a real device. A genuine mid-tier Android GPU pass (e.g. a physical device or a BrowserStack/device-lab run) remains open — it needs hardware the agent can't drive. Recommended: one manual pass on a real Android mid-tier to confirm the frame-monitor degrade rung (dpr→1, skin off, LOD prism) engages acceptably. Non-blocking; the FALLBACK-tier path is already eval-covered under SwiftShader.
