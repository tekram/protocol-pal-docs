# Contributing to Protocol Pal Protocols

Thanks for helping improve this open, community-editable set of health protocol definitions.

## Adding or editing a protocol

- One JSON file per protocol, in `protocols/`.
- Filename: kebab-case, ending with a sequence suffix, e.g. `cold-exposure-001.json`.
- Required fields: `id`, `title`, `frequency_type`.
- `frequency_type: "weekly"` requires `weekly_frequency.times_per_week`.
- `frequency_type: "conditional"` requires either `oura_triggers` or `conditional.question`.
- All claims (benefits, science, estimated impact) must cite a source episode or paper in `source`.

## Validation

Before opening a PR, run:

```bash
npm install
npm run validate
```

This checks every file in `protocols/` against `schema/protocol.schema.json` with `ajv`, and CI re-runs it on every PR.

## Sourcing requirements

Content must cite Huberman Lab podcast episodes or the underlying peer-reviewed papers referenced in those episodes. Do not add unsourced claims.

## Schema changes

Changes to `schema/protocol.schema.json` should be proposed separately from protocol content changes, since they affect the TypeScript types consumed by the app.
