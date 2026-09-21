# @protocol-pal/protocols

Open-source, community-editable health protocol definitions consumed by [Protocol Pal](https://github.com/tekram/protocol-pal).

## Structure

```
protocols/       one JSON file per protocol (~30 total)
schema/           JSON Schema v7 definition (protocol.schema.json)
dist/index.json   generated build artifact — do not edit by hand
scripts/          build.js (concatenates protocols → dist/index.json) and validate.js (ajv validation)
```

## Usage

```bash
npm install @protocol-pal/protocols
```

```typescript
import protocols from '@protocol-pal/protocols';
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Workflow

1. Fork this repo.
2. Add or edit protocol JSON in `protocols/`.
3. Open a PR — CI validates against `schema/protocol.schema.json`.
4. On merge to `main`, CI rebuilds `dist/index.json` and publishes a new npm version.
