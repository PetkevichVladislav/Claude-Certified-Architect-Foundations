/**
 * Build script: compiles questions.ts and generates bank JSON files.
 * Run: node scripts/buildBanks.cjs
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const questionsPath = path.join(root, 'src', 'data', 'questions.ts');
const tempPath = path.join(root, 'temp_questions.cjs');
const banksDir = path.join(root, 'public', 'banks');

if (!fs.existsSync(banksDir)) fs.mkdirSync(banksDir, { recursive: true });

// Compile TS to CJS via esbuild
execSync(
  `npx esbuild "${questionsPath}" --bundle --platform=node --format=cjs --outfile="${tempPath}"`,
  { cwd: root, stdio: 'pipe' }
);

const { questions } = require(tempPath);
console.log(`Loaded ${questions.length} questions from questions.ts`);

// --- Official bank: isOfficial === true (IDs 1-12) ---
const officialQs = questions.filter(q => q.isOfficial === true);
const officialBank = {
  id: 'official',
  name: 'Official Anthropic Samples',
  description: '12 official questions from the Anthropic CCA-F exam guide',
  icon: '\u2B50',
  questions: officialQs
};
fs.writeFileSync(path.join(banksDir, 'official.json'), JSON.stringify(officialBank, null, 2));
console.log(`official.json: ${officialQs.length} questions`);

// --- ClaudePrepareExam bank: IDs 13-105 (AI-generated practice) ---
const practiceQs = questions.filter(q => !q.isOfficial);
const practiceBank = {
  id: 'claudeprepareexam',
  name: 'ClaudePrepareExam',
  description: `${practiceQs.length} AI-generated practice questions across all 5 domains`,
  icon: '\uD83E\uDDE0',
  questions: practiceQs
};
fs.writeFileSync(path.join(banksDir, 'claudeprepareexam.json'), JSON.stringify(practiceBank, null, 2));
console.log(`claudeprepareexam.json: ${practiceQs.length} questions`);

// Clean up
fs.unlinkSync(tempPath);
console.log('Done! Now create github.json separately.');
