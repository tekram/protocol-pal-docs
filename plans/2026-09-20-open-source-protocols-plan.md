# Implementation Plan: Open Source Protocol Layer

**Status:** ⏸️ PAUSED — session 1 ended, awaiting session 2  
**Design spec:** `specs/2026-09-20-open-source-protocols-design.md`  
**App repo (local):** `C:\Users\avrfa\huberman-protocol-pal`

---

## 🚨 OPEN DECISION — Decide This First

**One repo or two?**

| Option | Repos | Tradeoff |
|--------|-------|----------|
| **A (recommended)** | Use `tekram/protocol-pal-docs` for everything — add `protocols/` folder here | One public repo, slightly messy name |
| **B** | Keep `tekram/huberman-protocols` as separate npm package repo | Cleaner separation, two public repos to maintain |

If **A**: delete `tekram/huberman-protocols` (empty, safe to delete), add `protocols/` folder to `protocol-pal-docs`, publish npm as `@protocol-pal/protocols`.

If **B**: keep `huberman-protocols`, push scaffolding there (all files already written — see Phase 1 below).

---

## What Was Done in Session 1

- [x] Explored app codebase — all protocol data in `src/data/protocols.ts` (~2800 lines, ~30 protocols)
- [x] Decided architecture: npm package (build-time bundle), one JSON file per protocol
- [x] Wrote design spec → `specs/2026-09-20-open-source-protocols-design.md`
- [x] Created `tekram/huberman-protocols` repo (public, MIT, **currently empty**)
- [x] Wrote all scaffolding files (ready to push — see Phase 1 checklist)
- [ ] Scaffolding push **FAILED** — GitHub autoInit conflict with empty repo, needs retry

---

## Repos

| Repo | URL | Status |
|------|-----|--------|
| App (private) | local: `C:\Users\avrfa\huberman-protocol-pal` | Unchanged |
| Protocols/docs | `tekram/protocol-pal-docs` | Has spec + plan |
| New npm repo | `tekram/huberman-protocols` | Created, **empty** |

---

## Phase 1: Scaffold Protocol Repo — ❌ NOT DONE

All 9 files are written and ready. Push them to whichever repo is decided above.

### Files to push:

**`package.json`**
```json
{
  "name": "@protocol-pal/protocols",
  "version": "1.0.0",
  "description": "Open-source Huberman Lab protocol definitions — community-editable JSON consumed by Protocol Pal",
  "main": "dist/index.json",
  "scripts": {
    "validate": "node scripts/validate.js",
    "build": "node scripts/build.js"
  },
  "files": ["dist/", "schema/"],
  "keywords": ["huberman", "health", "protocols", "sleep", "fitness"],
  "license": "MIT",
  "repository": { "type": "git", "url": "https://github.com/tekram/huberman-protocols.git" },
  "devDependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1"
  }
}
```

**`schema/protocol.schema.json`** — full JSON Schema v7, derived from TypeScript interfaces. Key rules:
- Required: `id` (string), `title` (string), `frequency_type` (enum: daily/weekly/conditional)
- `oura_triggers[].metric` enum: sleep_score, readiness_score, hrv, resting_hr, activity_score, temperature_deviation
- `oura_triggers[].operator` enum: `<`, `>`, `<=`, `>=`
- `weekly_frequency.times_per_week` required when frequency_type=weekly
- `additionalProperties: false` on all objects

**`scripts/validate.js`** — reads `protocols/*.json`, validates each against schema using `ajv`, checks for duplicate IDs, exits 1 on any failure.

**`scripts/build.js`** — reads `protocols/*.json`, sorts by importance (foundation→high-impact→supplemental) then priority number, writes `dist/index.json`.

**`.github/workflows/validate.yml`** — runs `npm run validate` on PRs touching `protocols/**` or `schema/**`.

**`.github/workflows/publish.yml`** — on merge to main: validate → build → commit rebuilt dist → `npm publish`. Requires `NPM_TOKEN` secret.

**`README.md`** and **`CONTRIBUTING.md`** — full content written in session 1.

**`protocols/.gitkeep`** — placeholder until migration.

> If next session has this plan, all file contents are in the session 1 `mcp__github__push_files` call. To re-push, just retry that call against the correct repo/branch.

---

## Phase 2: Migrate Protocol Data — ❌ NOT STARTED

Source file: `C:\Users\avrfa\huberman-protocol-pal\src\data\protocols.ts`

Approach: write a Node.js migration script that reads the TypeScript file and outputs one JSON per protocol.

**Option A — manual extraction (safer):** Read the TS file, copy each protocol object to a `.json` file by hand (or with Claude). No AST parsing needed — each object is clean JSON-compatible syntax.

**Option B — script:** Write `scripts/migrate.js` that uses `ts-node` or strips TS syntax and evals the array. Risky with eval; ts-node is cleaner.

Recommend: have Claude read `protocols.ts` and emit each protocol as a JSON file directly using the Write tool. No script needed — Claude can parse the array and output 30 files.

Output: `protocols/` directory with ~30 files named `{protocol.id}.json`

Known protocols (30 total):
- morning_sunlight_exposure_001, caffeine_delay_001, huberman-breathing-daily
- winddown_activities_protocol_001, evening_light_minimization_001
- ultradian_work_cycles_001, hydration_electrolytes_001
- huberman-cardio-exercise, huberman-strength-training
- nsdr_for_poor_sleep_001, hrv_improvement_protocol_001
- vision_breaks_001, cold_exposure_001, dopamine_management_001
- time_restricted_eating_001, afternoon_sunlight_001
- focus_meditation_001, omega3_epa_001, gratitude_story_001
- hiit_after_poor_sleep_001, creatine_poor_sleep_001, creatine_daily_001
- huberman-heat-daily, huberman-journaling-mental-health
- sleep_supplements_protocol_001, worry_journal_protocol_001
- distance_viewing_outdoors_001, self_testing_learning_001
- gut_microbiome_fermented_001, nasal_breathing_001
- testosterone_optimization_001

---

## Phase 3: Publish npm Package — ❌ NOT STARTED

- Need `NPM_TOKEN` secret added to the GitHub repo
- Run `npm publish --access public` manually first time
- Or trigger by pushing to main after Phase 2
- Verify: `npm info @protocol-pal/protocols`

---

## Phase 4: Update App — ❌ NOT STARTED

In `C:\Users\avrfa\huberman-protocol-pal`:

1. `npm install @protocol-pal/protocols`
2. Move interfaces from `src/data/protocols.ts` → `src/types/protocol.ts`
3. Replace `protocols.ts` data with:
   ```typescript
   import protocolsJson from '@protocol-pal/protocols';
   import type { Protocol } from '../types/protocol';
   export const protocols = protocolsJson as Protocol[];
   ```
4. Add Zod validation in `src/utils/protocolValidation.ts`
5. Run app, smoke test all screens (Today, My Stack, protocol detail, scheduling, Oura triggers)
6. Commit + push

---

## Key Context for Session 2

### Architecture decisions (FINAL)
- npm package build-time bundle, not runtime fetch
- One JSON file per protocol, named by protocol `id`
- JSON Schema v7 + ajv in CI
- Zod validation in app at startup
- Version: major=schema break, minor=new protocols, patch=edits

### TypeScript interfaces (source of truth)
```typescript
export type ProtocolImportance = 'foundation' | 'high-impact' | 'supplemental';

export interface OuraTrigger {
  metric: 'sleep_score'|'readiness_score'|'hrv'|'resting_hr'|'activity_score'|'temperature_deviation';
  operator: '<'|'>'|'<='|'>=';
  threshold: number;
  label?: string;
}

export interface Protocol {
  id: string;              // REQUIRED
  title: string;           // REQUIRED
  frequency_type: 'daily'|'weekly'|'conditional'; // REQUIRED
  description?: string;
  category?: string;
  duration?: string;
  difficulty?: 'beginner'|'intermediate'|'advanced';
  priority?: number;
  importance?: ProtocolImportance;
  source?: string;
  last_updated?: string;
  oura_triggers?: OuraTrigger[];
  weekly_frequency?: { times_per_week: number; preferred_days?: string[]; min_rest_days?: number; };
  conditional?: { question: string; yesLabel?: string; noLabel?: string; };
  actions?: { action: string; duration: string; frequency: string; timing: string; details: string; }[];
  benefits?: string[];
  science?: string;
  contraindications?: string[];
  estimated_impact?: Record<string, string>;
  learning_resources?: { title: string; type: 'video'|'webpage'|'article'; url: string; duration?: string; }[];
}
```

### App file map
```
C:\Users\avrfa\huberman-protocol-pal\src\
  data/protocols.ts         ← ~2800 lines, ALL protocol data (source for migration)
  utils/protocolImportance.ts  ← ProtocolImportance type, getStarterStack()
  utils/protocolSorting.ts     ← sortProtocols()
  utils/protocolScheduler.ts   ← daily/weekly/conditional scheduling
  services/oura/ouraConfig.ts  ← Oura OAuth
```

### Session 2 entry point
1. Decide: one repo (`protocol-pal-docs`) or two (`huberman-protocols` separate)?
2. Push scaffolding to chosen repo
3. Have Claude read `protocols.ts` and emit 30 JSON files
4. Run validate
5. Publish npm
6. Update app
