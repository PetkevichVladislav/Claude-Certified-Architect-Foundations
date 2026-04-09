const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Compile questions.ts to JS (bundle to resolve helpers)
const result = esbuild.buildSync({
  stdin: {
    contents: `import { questions } from './src/data/questions'; console.log(JSON.stringify(questions));`,
    resolveDir: path.join(__dirname, '..'),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'node',
  globalName: '_q',
});

// Capture the JSON from stdout
const tmpFile = path.join(__dirname, '_tmp_q.js');
fs.writeFileSync(tmpFile, result.outputFiles[0].text);
const { execSync } = require('child_process');
const stdout = execSync(`node "${tmpFile}"`, { encoding: 'utf-8' });
fs.unlinkSync(tmpFile);
const questions = JSON.parse(stdout);

console.log(`Loaded ${questions.length} questions from questions.ts`);

// Split into banks
const official = questions.filter(q => q.isOfficial === true);
const claudeprepare = questions.filter(q => q.isOfficial !== true);

// Strip isOfficial and source fields (bank membership implies source)
function cleanQ(q) {
  const { isOfficial, source, ...rest } = q;
  return rest;
}

const banksDir = path.join(__dirname, '..', 'public', 'banks');
if (!fs.existsSync(banksDir)) fs.mkdirSync(banksDir, { recursive: true });

// Official bank
const officialBank = {
  id: 'official',
  name: 'Official Practice Test',
  description: '12 official sample questions from the Anthropic CCA-F exam guide',
  icon: '⭐',
  isDefault: false,
  questions: official.map(cleanQ),
};
fs.writeFileSync(path.join(banksDir, 'official.json'), JSON.stringify(officialBank, null, 2));
console.log(`  official.json: ${officialBank.questions.length} questions`);

// ClaudePrepareExam bank
const claudeBank = {
  id: 'claudeprepareexam',
  name: 'ClaudePrepareExam',
  description: '93 AI-generated practice questions covering all 5 domains',
  icon: '🧠',
  isDefault: false,
  questions: claudeprepare.map(cleanQ),
};
fs.writeFileSync(path.join(banksDir, 'claudeprepareexam.json'), JSON.stringify(claudeBank, null, 2));
console.log(`  claudeprepareexam.json: ${claudeBank.questions.length} questions`);

console.log('\nDone. Now create github.json manually (65 questions from questions.md).');
