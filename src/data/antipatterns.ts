export interface AntiPattern {
  id: number
  name: string
  trap: string
  fix: string
  fixPattern: string
  scenarioIds: number[]
  relatedRuleIds: number[]
  domains: string[]
  whyItFools: string
}

/**
 * 7 Anti-Patterns — the core elimination tool for the exam.
 *
 * WHY THIS EXISTS: ~70% of exam questions contain at least one option that sounds
 * reasonable but encodes an anti-pattern. Recognizing these instantly lets you
 * eliminate 1-2 wrong answers before even applying priority rules.
 *
 * HOW TO USE: For each exam question, scan all 4 options against this list.
 * If an option matches any anti-pattern → eliminate it immediately.
 * Then use priority rules (rules.ts) on the survivors.
 *
 * CONNECTION: Each anti-pattern maps to specific scenarios (scenarios.ts) and
 * is tested by questions (questions.ts). The decision diagrams (DecisionGuide)
 * visualize the elimination flow.
 */
export const antiPatterns: AntiPattern[] = [
  {
    id: 1,
    name: 'Prompt instructions for business rules',
    trap: '"Add a system prompt rule: never process refunds over $10K"',
    fix: 'Use PostToolUse hooks or programmatic guards',
    fixPattern: 'PostToolUse hooks',
    scenarioIds: [1, 5],
    relatedRuleIds: [1], // CODE > PROMPTS
    domains: ['D1', 'D4'],
    whyItFools: 'System prompts feel natural for "rules" — but they are probabilistic. Business rules with financial impact need deterministic enforcement through code.',
  },
  {
    id: 2,
    name: 'NL parsing for control flow',
    trap: '"Parse Claude\'s response for \'I\'m done\' to exit the loop"',
    fix: 'Check stop_reason field programmatically',
    fixPattern: 'stop_reason',
    scenarioIds: [1, 3, 5],
    relatedRuleIds: [2], // EXPLICIT > IMPLICIT
    domains: ['D1', 'D5'],
    whyItFools: 'Parsing text output seems logical — but Claude has a structured stop_reason field specifically for loop control. The API already provides explicit signals.',
  },
  {
    id: 3,
    name: 'Same-session self-review',
    trap: '"Ask Claude to review its own code before committing"',
    fix: 'Use an independent review instance with fresh context',
    fixPattern: 'Independent reviewer',
    scenarioIds: [2, 5],
    relatedRuleIds: [3], // ISOLATED > SHARED
    domains: ['D1', 'D3', 'D5'],
    whyItFools: 'Self-review feels efficient — but the same context window contains the same assumptions and blind spots. An independent instance starts fresh.',
  },
  {
    id: 4,
    name: 'Agent with >5 tools',
    trap: '"Give the agent access to all 18 tools for maximum flexibility"',
    fix: 'Decompose into subagents with 3-5 focused tools each',
    fixPattern: 'Hub-and-spoke',
    scenarioIds: [1, 3, 4],
    relatedRuleIds: [3], // ISOLATED > SHARED
    domains: ['D1', 'D2'],
    whyItFools: 'More tools seems more capable — but tool selection accuracy drops sharply above 5 tools. The model gets confused about which tool to use.',
  },
  {
    id: 5,
    name: 'Sentiment-based escalation',
    trap: '"If the customer sounds angry, escalate to a human"',
    fix: 'Use explicit complexity criteria, not sentiment',
    fixPattern: 'Explicit criteria',
    scenarioIds: [1],
    relatedRuleIds: [2], // EXPLICIT > IMPLICIT
    domains: ['D1', 'D5'],
    whyItFools: 'Sentiment seems like a natural escalation signal — but it conflates customer emotion with case complexity. An angry customer might have a simple issue; a calm customer might have a complex one.',
  },
  {
    id: 6,
    name: 'Super-agent anti-pattern',
    trap: '"One powerful agent handles research, extraction, and code review"',
    fix: 'Hub-and-spoke coordinator with specialized subagents',
    fixPattern: 'Hub-and-spoke',
    scenarioIds: [3, 4],
    relatedRuleIds: [3, 4], // ISOLATED > SHARED, BUILT-IN > CUSTOM
    domains: ['D1'],
    whyItFools: 'A single agent seems simpler to build and maintain — but it leads to context overload, tool confusion, and unreliable behavior at scale.',
  },
  {
    id: 7,
    name: 'Sequential full-context pipeline',
    trap: '"Pass all output from step 1 as full input to step 2, then to step 3..."',
    fix: 'Coordinator passes only relevant summaries; parallel where possible',
    fixPattern: 'Relevant summaries',
    scenarioIds: [3, 6],
    relatedRuleIds: [5], // COST-AWARE > BRUTE-FORCE
    domains: ['D1', 'D5'],
    whyItFools: 'Passing full context seems thorough — but it wastes tokens, dilutes attention, and creates unnecessary sequential dependencies.',
  },
]
