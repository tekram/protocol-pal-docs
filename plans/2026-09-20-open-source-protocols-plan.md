# Implementation Plan: Open Source Protocol Layer

**Status:** 🔴 NOT STARTED  
**Session started:** 2026-09-20  
**Design spec:** `specs/2026-09-20-open-source-protocols-design.md`

## Repos

| Repo | URL | Notes |
|------|-----|-------|
| App (private) | local: `C:\Users\avrfa\huberman-protocol-pal` | TypeScript/React Native/Capacitor |
| New protocols repo | `tekram/huberman-protocols` (to be created) | Public, MIT |
| Docs | `tekram/protocol-pal-docs` | This file lives here |

---

## Phase 1: Create Protocol Repo

- [ ] Create GitHub repo `tekram/huberman-protocols` (public, MIT license)
- [ ] Initialize with `package.json` (name: `@protocol-pal/protocols`, scripts: `build`, `validate`)
- [ ] Create `schema/protocol.schema.json` — JSON Schema v7 derived from TypeScript interfaces in spec
- [ ] Create `scripts/build.js` — reads `protocols/*.json`, validates each against schema, outputs `dist/index.json`
- [ ] Add `ajv` + `ajv-formats` as devDependencies for schema validation
- [ ] Write `README.md` (what this is, how to use, how to contribute)
- [ ] Write `CONTRIBUTING.md` (one file per protocol, naming convention `{slug}.json`, sourcing requirement: Huberman Lab citations)
- [ ] Set up GitHub Actions CI:
  - On PR: run `npm run validate` (validate all JSON against schema)
  - On merge to main: run `npm run build` then `npm publish`

**Key files to create:**
- `package.json`
- `schema/protocol.schema.json`
- `scripts/build.js`
- `.github/workflows/validate.yml`
- `.github/workflows/publish.yml`
- `README.md`
- `CONTRIBUTING.md`

---

## Phase 2: Migrate Protocol Data

- [ ] Write migration script `scripts/migrate.js` in app repo:
  - Input: `src/data/protocols.ts` (parse the array literal)
  - Output: one `.json` file per protocol in a temp `output/` dir
  - File name: `{id}.json` (use the protocol's `id` field)
- [ ] Run migration script, review output (~30 files)
- [ ] Copy output JSON files into `protocols/` in the new repo
- [ ] Run `npm run validate` — fix any schema mismatches
- [ ] Commit all protocol JSON to `tekram/huberman-protocols`
- [ ] Verify `dist/index.json` builds correctly

**Key files:**
- `C:\Users\avrfa\huberman-protocol-pal\src\data\protocols.ts` (source, ~2800 lines)
- Output: `protocols/*.json` in new repo (~30 files)

---

## Phase 3: Publish npm Package

- [ ] Set npm registry auth (`npm login` or `NPM_TOKEN` secret in GitHub)
- [ ] Publish `@protocol-pal/protocols@1.0.0` manually: `npm publish --access public`
- [ ] Verify package appears on npmjs.com
- [ ] Test import in scratch: `const protocols = require('@protocol-pal/protocols')` — check array length

---

## Phase 4: Update App

- [ ] `npm install @protocol-pal/protocols` in app repo
- [ ] Move TypeScript interfaces from `src/data/protocols.ts` to `src/types/protocol.ts`
- [ ] Replace data in `src/data/protocols.ts` with:
  ```typescript
  import protocolsJson from '@protocol-pal/protocols';
  import { Protocol } from '../types/protocol';
  export const protocols = protocolsJson as Protocol[];
  ```
- [ ] Add Zod schema at `src/utils/protocolValidation.ts` — validate on first load, warn in dev
- [ ] Run `npm run build` — fix any TypeScript errors
- [ ] Start dev server, smoke test all screens:
  - [ ] Home / Today view renders protocols
  - [ ] My Stack shows all protocols
  - [ ] Protocol detail pages load
  - [ ] Oura triggers fire correctly
  - [ ] Scheduling (daily/weekly/conditional) works
- [ ] Commit + push app changes

---

## Context for Next Session

### Key Decisions Made
- **Consumption:** npm package (build-time bundle), NOT runtime fetch — mobile offline safety
- **Format:** One JSON file per protocol, named by protocol `id`
- **Schema:** JSON Schema v7 in new repo; Zod in app for runtime validation
- **CI:** `ajv` validates PRs; `npm publish` on merge to main
- **Version strategy:** major=breaking schema, minor=new protocols, patch=edits

### App Structure to Know
```
C:\Users\avrfa\huberman-protocol-pal\
├── src/
│   ├── data/
│   │   └── protocols.ts       ← ~2800 lines, ALL protocol data lives here
│   ├── utils/
│   │   ├── protocolImportance.ts   ← ProtocolImportance type, getStarterStack()
│   │   ├── protocolSorting.ts      ← sort by priority/alpha/difficulty/category
│   │   └── protocolScheduler.ts   ← daily/weekly/conditional scheduling logic
│   └── services/
│       └── oura/
│           └── ouraConfig.ts       ← Oura OAuth config
```

### Protocol Interface (required fields only)
```typescript
{ id: string; title: string; frequency_type: 'daily' | 'weekly' | 'conditional' }
```

### Current Protocol Count
~30 protocols across: foundation (7), high-impact (14+), supplemental (9+)

### Oura Triggers Used
- `sleep_score < 75` → NSDR, HIIT-after-poor-sleep, creatine-poor-sleep
- `hrv < 40` → HRV improvement protocol

### What's NOT Started Yet
Everything. Phase 1 is the entry point. Start by creating `tekram/huberman-protocols` on GitHub.
