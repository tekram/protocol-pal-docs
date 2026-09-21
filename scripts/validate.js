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
  catch (e) { console.error(`❌ ${file}: invalid JSON — ${e.message}`); errors++; continue; }
  if (!validate(data)) {
    console.error(`❌ ${file}:`);
    for (const err of validate.errors) console.error(`   ${err.instancePath || '(root)'} ${err.message}`);
    errors++;
  } else if (ids.has(data.id)) {
    console.error(`❌ ${file}: duplicate id "${data.id}"`);
    errors++;
  } else {
    ids.add(data.id);
    console.log(`✅ ${file}`);
  }
}
if (errors > 0) { console.error(`\n${errors} file(s) failed.`); process.exit(1); }
else console.log(`\nAll ${files.length} protocols valid.`);
