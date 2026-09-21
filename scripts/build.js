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
