# Implementation Plan: Open Source Protocol Layer

**Status:** ⏸️ PAUSED — session 2 complete through Phase 2, session 3 picks up at Phase 3 (npm publish)  
**Design spec:** `specs/2026-09-20-open-source-protocols-design.md`  
**App repo (local):** `C:\Users\avrfa\huberman-protocol-pal`

---

## ✅ FINAL DECISIONS

| Decision | Choice |
|----------|--------|
| Repo strategy | **One public repo: `tekram/protocol-pal-docs`** |
| Naming | **No "huberman" in any repo or package name** |
| npm package | `@protocol-pal/protocols` |
| Consumption | Build-time npm install (not runtime fetch) |
| Format | One JSON file per protocol in `protocols/` folder |
| Schema | JSON Schema v7 (`schema/protocol.schema.json`) |
| CI validation | `ajv` on PRs |
| App validation | Zod at startup |

### Cleanup needed
- ~~Delete `tekram/huberman-protocols`~~ — done, session 2.

---

## Session 1 Progress

| Task | Status |
|------|--------|
| Explored app codebase | ✅ done |
| Architecture decision made | ✅ done |
| Design spec written | ✅ `specs/2026-09-20-open-source-protocols-design.md` |
| `huberman-protocols` repo created (to delete) | ✅ created, now obsolete |
| All scaffolding files written | ✅ ready to push (see Phase 1) |
| Scaffolding pushed to `protocol-pal-docs` | ❌ failed — first task for session 2 |
| Protocol JSON migration | ❌ not started |
| npm publish | ❌ not started |
| App updated | ❌ not started |

## Session 2 Progress

| Task | Status |
|------|--------|
| Deleted `tekram/huberman-protocols` | ✅ done |
| Scaffolding (8 files) pushed to `protocol-pal-docs` main | ✅ commit `23a962a` |
| Protocol JSON migration | ✅ **40 protocols** migrated (grew from ~30 since plan was written — app added 10 more in the interim), commit `4161622` |
| `npm run validate` (ajv) | ✅ all 40 pass |
| `dist/index.json` built and committed | ✅ done |
| npm publish | ❌ not started — needs `NPM_TOKEN` repo secret (session 3) |
| App updated to consume `@protocol-pal/protocols` | ❌ not started (session 3, Phase 4) |

### Notes for session 3
- Migration script stripped two app-only fields not in the public schema: `completedBy`, `isCompleted` (present on most/all protocols), and one stray duplicate field `conditional_question` found only on `creatine_poor_sleep_001` (superseded by the correct `conditional` object already on that record).
- `learning_resources[].duration: null` values were dropped (field is optional in the schema; ajv rejects `null` for a `string` type).
- Full protocol id list now includes 10 new ones not in the original plan's ~30-id list: `foundational_fitness_001`, `neuroplasticity_super_001`, `sugar_craving_control_001`, `alcohol_harm_reduction_001`, `optic_flow_walking_001`, `red_light_photobiomodulation_001`, `stress_inoculation_001`, `creativity_enhancement_001`, `alpha_gpc_acetylcholine_001`, plus `worry_journal_protocol_001` (already implied but omitted from the plan's list).
- Next: Phase 3 (npm publish) and Phase 4 (update app to consume the package).

---

## Session 2 Entry Point

**Start here:** Push scaffolding to `tekram/protocol-pal-docs` main branch. All 8 files are written below — just push them.

---

## Phase 1: Push Scaffolding to `protocol-pal-docs` — ❌ TODO

Push these files to `tekram/protocol-pal-docs` in one commit using `mcp__github__push_files`.

**`package.json`**
```json
{
  "name": "@protocol-pal/protocols",
  "version": "1.0.0",
  "description": "Open-source health protocol definitions — community-editable JSON consumed by Protocol Pal",
  "main": "dist/index.json",
  "scripts": {
    "validate": "node scripts/validate.js",
    "build": "node scripts/build.js"
  },
  "files": ["dist/", "schema/"],
  "keywords": ["health", "protocols", "sleep", "fitness", "wellness"],
  "license": "MIT",
  "repository": { "type": "git", "url": "https://github.com/tekram/protocol-pal-docs.git" },
  "devDependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1"
  }
}
```

**`schema/protocol.schema.json`** — JSON Schema v7
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://raw.githubusercontent.com/tekram/protocol-pal-docs/main/schema/protocol.schema.json",
  "title": "Protocol",
  "type": "object",
  "required": ["id", "title", "frequency_type"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "category": { "type": "string" },
    "duration": { "type": "string" },
    "difficulty": { "type": "string", "enum": ["beginner", "intermediate", "advanced"] },
    "priority": { "type": "number" },
    "importance": { "type": "string", "enum": ["foundation", "high-impact", "supplemental"] },
    "frequency_type": { "type": "string", "enum": ["daily", "weekly", "conditional"] },
    "source": { "type": "string" },
    "last_updated": { "type": "string" },
    "oura_triggers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["metric", "operator", "threshold"],
        "additionalProperties": false,
        "properties": {
          "metric": { "type": "string", "enum": ["sleep_score", "readiness_score", "hrv", "resting_hr", "activity_score", "temperature_deviation"] },
          "operator": { "type": "string", "enum": ["<", ">", "<=", ">="] },
          "threshold": { "type": "number" },
          "label": { "type": "string" }
        }
      }
    },
    "weekly_frequency": {
      "type": "object",
      "required": ["times_per_week"],
      "additionalProperties": false,
      "properties": {
        "times_per_week": { "type": "number", "minimum": 1, "maximum": 7 },
        "preferred_days": { "type": "array", "items": { "type": "string", "enum": ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] } },
        "min_rest_days": { "type": "number", "minimum": 0 }
      }
    },
    "conditional": {
      "type": "object",
      "required": ["question"],
      "additionalProperties": false,
      "properties": {
        "question": { "type": "string" },
        "yesLabel": { "type": "string" },
        "noLabel": { "type": "string" }
      }
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["action", "duration", "frequency", "timing", "details"],
        "additionalProperties": false,
        "properties": {
          "action": { "type": "string" },
          "duration": { "type": "string" },
          "frequency": { "type": "string" },
          "timing": { "type": "string" },
          "details": { "type": "string" }
        }
      }
    },
    "benefits": { "type": "array", "items": { "type": "string" } },
    "science": { "type": "string" },
    "contraindications": { "type": "array", "items": { "type": "string" } },
    "estimated_impact": { "type": "object", "additionalProperties": { "type": "string" } },
    "learning_resources": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["title", "type", "url"],
        "additionalProperties": false,
        "properties": {
          "title": { "type": "string" },
          "type": { "type": "string", "enum": ["video", "webpage", "article"] },
          "url": { "type": "string" },
          "duration": { "type": "string" }
        }
      }
    }
  }
}
```

**`scripts/validate.js`**
```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/protocol.schema.json'), 'utf8'));
const validate = ajv.compile(schema);
const protocolsDir = path.join(__dirname, '../protocols');

if (!fs.existsSync(protocolsDir)) { console.log('No protocols/ dir.'); process.exit(0); }
const files = fs.readdirSync(protocolsDir).filter(f => f.endsWith('.json'));
if (!files.length) { console.log('No protocols found.'); process.exit(0); }

let errors = 0;
const ids = new Set();
for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(protocolsDir, file), 'utf8')); }
  catch (e) { console.error(`\u274c ${file}: invalid JSON — ${e.message}`); errors++; continue; }
  if (!validate(data)) {
    console.error(`\u274c ${file}:`);
    for (const err of validate.errors) console.error(`   ${err.instancePath || '(root)'} ${err.message}`);
    errors++;
  } else if (ids.has(data.id)) {
    console.error(`\u274c ${file}: duplicate id "${data.id}"`);
    errors++;
  } else {
    ids.add(data.id);
    console.log(`\u2705 ${file}`);
  }
}
if (errors > 0) { console.error(`\n${errors} file(s) failed.`); process.exit(1); }
else console.log(`\nAll ${files.length} protocols valid.`);
```

**`scripts/build.js`**
```javascript
const fs = require('fs');
const path = require('path');
const protocolsDir = path.join(__dirname, '../protocols');
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
const files = fs.readdirSync(protocolsDir).filter(f => f.endsWith('.json'));
const protocols = files.map(f => JSON.parse(fs.readFileSync(path.join(protocolsDir, f), 'utf8')));
const rank = { foundation: 0, 'high-impact': 1, supplemental: 2 };
protocols.sort((a, b) => {
  const ri = (rank[a.importance] ?? 3) - (rank[b.importance] ?? 3);
  if (ri !== 0) return ri;
  return (a.priority ?? 999) - (b.priority ?? 999);
});
fs.writeFileSync(path.join(distDir, 'index.json'), JSON.stringify(protocols, null, 2));
console.log(`Built dist/index.json with ${protocols.length} protocols.`);
```

**`.github/workflows/validate.yml`**
```yaml
name: Validate Protocols
on:
  pull_request:
    paths: ['protocols/**', 'schema/**', 'scripts/**']
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate
```

**`.github/workflows/publish.yml`**
```yaml
name: Build & Publish
on:
  push:
    branches: [main]
    paths: ['protocols/**', 'schema/**', 'scripts/**', 'package.json']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: actions/checkout@v4
        with: { token: '${{ secrets.GITHUB_TOKEN }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '20', registry-url: 'https://registry.npmjs.org', cache: 'npm' }
      - run: npm ci
      - run: npm run validate
      - run: npm run build
      - name: Commit rebuilt dist
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add dist/index.json
          git diff --staged --quiet || git commit -m "chore: rebuild dist/index.json [skip ci]"
          git push
      - run: npm publish --access public
        env: { NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}' }
```

**`CONTRIBUTING.md`** — see `specs/2026-09-20-open-source-protocols-design.md` for full content. Key rules:
- One JSON per protocol, kebab-case filename, ends with `-001`
- Required: `id`, `title`, `frequency_type`
- All content must cite source episodes/papers
- `frequency_type: weekly` needs `weekly_frequency.times_per_week`
- `frequency_type: conditional` needs `oura_triggers` or `conditional.question`

---

## Phase 2: Migrate Protocol Data — ❌ NOT STARTED

Source: `C:\Users\avrfa\huberman-protocol-pal\src\data\protocols.ts` (~2800 lines)

**Approach:** Have Claude read the file and emit each protocol object as a `.json` file directly (no script needed — Claude can parse the TS array and output 30 files to `protocols/` in `protocol-pal-docs`).

**30 protocols to migrate** (by id field in protocols.ts):
```
morning_sunlight_exposure_001, caffeine_delay_001, huberman-breathing-daily,
winddown_activities_protocol_001, evening_light_minimization_001,
ultradian_work_cycles_001, hydration_electrolytes_001,
huberman-cardio-exercise, huberman-strength-training,
nsdr_for_poor_sleep_001, hrv_improvement_protocol_001,
vision_breaks_001, cold_exposure_001, dopamine_management_001,
time_restricted_eating_001, afternoon_sunlight_001,
focus_meditation_001, omega3_epa_001, gratitude_story_001,
hiit_after_poor_sleep_001, creatine_poor_sleep_001, creatine_daily_001,
huberman-heat-daily, huberman-journaling-mental-health,
sleep_supplements_protocol_001, worry_journal_protocol_001,
distance_viewing_outdoors_001, self_testing_learning_001,
gut_microbiome_fermented_001, nasal_breathing_001,
testosterone_optimization_001
```

Output files go to `protocols/` in `tekram/protocol-pal-docs`. After pushing, run `npm run validate`.

---

## Phase 3: Publish npm Package — ❌ NOT STARTED

- Add `NPM_TOKEN` secret to `tekram/protocol-pal-docs` GitHub repo settings
- Run manually: `npm publish --access public` from cloned repo
- Verify: `npm info @protocol-pal/protocols`

---

## Phase 4: Update App — ❌ NOT STARTED

In `C:\Users\avrfa\huberman-protocol-pal`:

1. `npm install @protocol-pal/protocols`
2. Create `src/types/protocol.ts` with interfaces (move from `protocols.ts`)
3. Replace `src/data/protocols.ts` data section with:
   ```typescript
   import protocolsJson from '@protocol-pal/protocols';
   import type { Protocol } from '../types/protocol';
   export const protocols = protocolsJson as Protocol[];
   ```
4. Add `src/utils/protocolValidation.ts` with Zod schema
5. Run app, test all screens
6. Commit + push

---

## TypeScript Interfaces (copy into `src/types/protocol.ts`)

```typescript
export type ProtocolImportance = 'foundation' | 'high-impact' | 'supplemental';

export interface OuraTrigger {
  metric: 'sleep_score'|'readiness_score'|'hrv'|'resting_hr'|'activity_score'|'temperature_deviation';
  operator: '<'|'>'|'<='|'>=';
  threshold: number;
  label?: string;
}

export interface Protocol {
  id: string;
  title: string;
  frequency_type: 'daily'|'weekly'|'conditional';
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
