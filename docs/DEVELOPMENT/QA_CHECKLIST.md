# QA Checklist

- [x] Static export configuration and Netlify publish directory
- [x] Local fonts and source reference preservation
- [x] English/Bangla toggle persists in localStorage
- [x] Demo role selector updates identity and jurisdiction
- [x] Reset demo returns to canonical seed context
- [x] D01/D02 KPI, queue, quota, chart, indicators and advisory sections
- [x] Responsive sidebar drawer and stacked cards
- [ ] Full E-2 workflow and formal browser visual comparison (Phase 1+)

## Build repair verification — 2026-11-15
- [x] `npx tsc --noEmit` passes with `target: ES2022` and strict mode
- [x] `npm run lint` passes with ESLint 9 flat config
- [x] `npm run build` passes and generates static `out/`
- [x] `next.config.mjs` preserves static export, trailing slash routing, and unoptimized images
- [x] Existing Phase 0 dashboard, bilingual toggle, role context, fonts, and reference assets preserved
- [ ] Dependency tree re-materialized to Next.js 16.4.6 (blocked by npm registry access in this environment)
- [ ] `npm audit` advisory result (blocked by npm advisory endpoint access)

