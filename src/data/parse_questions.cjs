// Script to parse questions.md and generate TypeScript quiz entries for Q13-Q77
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', '..', 'docs', 'questions.md');
const md = fs.readFileSync(mdPath, 'utf8');

// Domain mapping from questions.md header table
const domainMap = {
  'Agentic Architecture & Orchestration': 'D1',
  'Tool Design & MCP Integration': 'D2',
  'Claude Code Configuration & Workflows': 'D3',
  'Prompt Engineering & Structured Output': 'D4',
  'Context Management & Reliability': 'D5',
};

// Parse questions
const qRegex = /\*\*Q(\d+)\.\*\*\s+([\s\S]*?)(?=\*\*Q\d+\.\*\*|## Answer Key)/g;
const questions = [];
let match;

while ((match = qRegex.exec(md)) !== null) {
  const qNum = parseInt(match[1]);
  if (qNum < 13 || qNum > 77) continue; // Skip Q1-Q12 (already in app)
  
  const block = match[2].trim();
  
  // Extract question text (before options)
  const qTextMatch = block.match(/^([\s\S]*?)(?=\n\s*A\))/);
  if (!qTextMatch) { console.error(`Failed to parse question text for Q${qNum}`); continue; }
  const questionText = qTextMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
  
  // Extract options A-D
  const optRegex = /([A-D])\)\s+([\s\S]*?)(?=\n[A-D]\)|(?:\n\n\*\*Correct Answer))/g;
  const options = [];
  let optMatch;
  while ((optMatch = optRegex.exec(block)) !== null) {
    options.push({
      label: optMatch[1],
      text: optMatch[2].trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
    });
  }
  
  // Extract correct answer
  const ansMatch = block.match(/\*\*Correct Answer:\s*([A-D])\*\*/);
  if (!ansMatch) { console.error(`Failed to parse answer for Q${qNum}`); continue; }
  const correctAnswer = ansMatch[1];
  
  // Extract explanation (everything after **Correct Answer: X**)
  const explMatch = block.match(/\*\*Correct Answer:\s*[A-D]\*\*\s*\n([\s\S]*?)$/);
  const explanation = explMatch ? explMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/---\s*$/, '').trim() : '';
  
  // Determine domain from position in file
  let domain = '';
  let domainShort = '';
  
  // Find what domain section this question is under
  const qPos = md.indexOf(`**Q${qNum}.**`);
  const domainHeaders = [
    { pattern: '## Domain 1:', domain: 'Agentic Architecture & Orchestration', short: 'D1' },
    { pattern: '## Domain 2:', domain: 'Tool Design & MCP Integration', short: 'D2' },
    { pattern: '## Domain 3:', domain: 'Claude Code Configuration & Workflows', short: 'D3' },
    { pattern: '## Domain 4:', domain: 'Prompt Engineering & Structured Output', short: 'D4' },
    { pattern: '## Domain 5:', domain: 'Context Management & Reliability', short: 'D5' },
  ];
  
  let bestPos = -1;
  for (const dh of domainHeaders) {
    const pos = md.lastIndexOf(dh.pattern, qPos);
    if (pos > bestPos) {
      bestPos = pos;
      domain = dh.domain;
      domainShort = dh.short;
    }
  }
  
  if (options.length !== 4) {
    console.error(`Q${qNum}: Expected 4 options, got ${options.length}`);
    continue;
  }
  
  const id = qNum + 93; // Q13 → 106, Q77 → 170
  
  questions.push({
    id,
    qNum,
    domain,
    domainShort,
    questionText,
    options: options.map(o => ({
      ...o,
      isCorrect: o.label === correctAnswer,
    })),
    correctAnswer,
    explanation,
  });
}

console.log(`Parsed ${questions.length} questions (expected 65)`);

// Check for issues
for (const q of questions) {
  const correctCount = q.options.filter(o => o.isCorrect).length;
  if (correctCount !== 1) {
    console.error(`Q${q.qNum} (id:${q.id}): ${correctCount} correct options!`);
  }
}

// Generate TypeScript
let ts = '\n  // === SECTION D: GitHub Practice Exam (Q13-Q77 from questions.md) ===\n';

for (const q of questions) {
  const escQ = q.questionText.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const escExpl = q.explanation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  ts += `  {\n`;
  ts += `    id: ${q.id},\n`;
  ts += `    domain: "${q.domain}",\n`;
  ts += `    domainShort: "${q.domainShort}",\n`;
  ts += `    isOfficial: false,\n`;
  ts += `    source: 'community' as const,\n`;
  ts += `    question: "${escQ}",\n`;
  ts += `    options: [\n`;
  for (const o of q.options) {
    const escText = o.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    ts += `      { label: "${o.label}", text: "${escText}", isCorrect: ${o.isCorrect}, explanation: "${o.isCorrect ? escExpl : ''}" },\n`;
  }
  ts += `    ]\n`;
  ts += `  },\n`;
}

fs.writeFileSync(path.join(__dirname, 'github_questions_generated.ts'), ts, 'utf8');
console.log('Written to github_questions_generated.ts');

// Also output the ID mapping for reference
console.log('\nID Mapping:');
for (const q of questions) {
  console.log(`  Q${q.qNum} → id:${q.id} (${q.domainShort})`);
}
