// Generates docs/PROTOCOLS.md: a plain-language catalog of every protocol, straight from the JSON,
// so it can never drift from what the app ships. Runs as part of `npm run build`.
const fs = require('fs');
const path = require('path');

const protocolsDir = path.join(__dirname, '../protocols');
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const protocols = fs
  .readdirSync(protocolsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(protocolsDir, f), 'utf8')));

const rank = { foundation: 0, 'high-impact': 1, supplemental: 2 };
protocols.sort((a, b) => {
  const ri = (rank[a.importance] ?? 3) - (rank[b.importance] ?? 3);
  return ri !== 0 ? ri : (a.priority ?? 999) - (b.priority ?? 999) || a.title.localeCompare(b.title);
});

const OPS = { '<': 'below', '<=': 'at or below', '>': 'above', '>=': 'at or above' };
const METRICS = {
  sleep_score: 'sleep score', readiness_score: 'readiness score', hrv: 'HRV', resting_hr: 'resting heart rate',
  activity_score: 'activity score', temperature_deviation: 'skin temperature change', sleep_latency: 'time to fall asleep',
  sleep_efficiency: 'sleep efficiency', respiratory_rate: 'breathing rate', restless_periods: 'restless periods',
  sleep_duration: 'sleep duration', daytime_stress_minutes: 'daytime stress minutes',
  daytime_recovery_minutes: 'daytime calm minutes', training_load: 'training load today',
  training_load_prev_day: "yesterday's training load",
};
const EVIDENCE = {
  direct_evidence: 'Direct evidence',
  evidence_informed: 'Evidence-informed',
  product_heuristic: 'Product heuristic',
  experimental: 'Experimental (thresholds are first guesses)',
};

const condText = (c) =>
  c.label ||
  `${METRICS[c.metric] || c.metric} ${OPS[c.operator]} ${c.threshold}${c.mode === 'baseline_pct' ? '% of your baseline' : ''}`;

function triggerText(p) {
  const t = p.oura_triggers;
  if (!t) return null;
  const groups = Array.isArray(t) ? [{ all: t }] : t.groups;
  const text = groups.map((g, i) => (i ? '- **or** ' : '- ') + g.all.map(condText).join(' **and** ')).join('\n');
  const evidence = Array.isArray(t) ? 'Product heuristic' : EVIDENCE[t.evidence_level] || t.evidence_level;
  return { text, evidence };
}

const byCategory = new Map();
for (const p of protocols) {
  const k = p.category || 'other';
  byCategory.set(k, [...(byCategory.get(k) || []), p]);
}
const anchor = (s) => s.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/ +/g, '-');

let md = `# Protocol guide

A plain-language guide to every protocol in this repository (${protocols.length} total), generated from the JSON files in \`protocols/\`. **Do not edit by hand** — change the protocol JSON and run \`npm run build\`.

Protocols come in three kinds:

- **Daily** and **weekly** protocols are on your list on the scheduled days.
- **Conditional** protocols only appear when your ring data says they are relevant (for example, a poor night of recovery or a stressful day). The "When it appears" line says exactly what has to be true.

Signals marked *(phone-estimated)* are computed on your phone from your ring's heartbeats and movement. They are estimates, not medical measurements, and protocols that depend on them are marked **Experimental**.

## Contents

`;
for (const [cat, list] of byCategory) {
  md += `- **${cat[0].toUpperCase() + cat.slice(1)}**\n`;
  for (const p of list) md += `  - [${p.title}](#${anchor(p.title)})\n`;
}

for (const [cat, list] of byCategory) {
  md += `\n---\n\n## ${cat[0].toUpperCase() + cat.slice(1)}\n`;
  for (const p of list) {
    md += `\n### ${p.title}\n\n`;
    const meta = [p.frequency_type, p.importance, p.duration, p.difficulty].filter(Boolean).join(' · ');
    md += `*${meta}*\n\n${p.description || ''}\n\n`;
    const trig = triggerText(p);
    if (trig) {
      md += `**When it appears** (${trig.evidence}):\n\n${trig.text}\n\n`;
    } else if (p.frequency_type === 'weekly' && p.weekly_frequency) {
      md += `**How often:** ${p.weekly_frequency.times_per_week}× per week\n\n`;
    }
    if (p.actions && p.actions.length) {
      md += `**What to do:**\n\n`;
      for (const a of p.actions) md += `- **${a.action}**${a.duration ? ` — ${a.duration}` : ''}${a.timing ? `, ${a.timing}` : ''}\n`;
      md += '\n';
    }
    if (p.benefits && p.benefits.length) md += `**Why:** ${p.benefits.slice(0, 3).join('; ')}.\n\n`;
    if (p.contraindications && p.contraindications.length) {
      md += `**Be careful if:**\n\n${p.contraindications.map((c) => `- ${c}`).join('\n')}\n\n`;
    }
    if (p.learning_resources && p.learning_resources.length) {
      md += `**Learn more:** ${p.learning_resources.map((r) => `[${r.title}](${r.url})`).join(' · ')}\n`;
    }
  }
}

fs.writeFileSync(path.join(docsDir, 'PROTOCOLS.md'), md);
console.log(`Wrote docs/PROTOCOLS.md (${protocols.length} protocols).`);
