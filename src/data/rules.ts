import type { Evidence } from './antipatterns'

export interface PriorityRule {
  id: number
  rule: string
  short: string
  example: string
  relatedAntiPatternIds: number[]
  scenarioIds: number[]
  domains: string[]
  whenToApply: string
  evidence: Evidence[]
}

/**
 * 5 Priority Rules — the tiebreaker when multiple options survive elimination.
 *
 * WHY THIS EXISTS: After eliminating anti-pattern options, you often have 2
 * remaining options that both look correct. Priority rules determine which is
 * the "best" answer — because this exam tests architectural judgment, not just
 * knowledge.
 *
 * HOW TO USE: Apply rules in order (1→5). The first rule that distinguishes
 * between the remaining options gives you the answer.
 *
 * CONNECTION: Priority rules are the "Step 3" of the Master Decision Algorithm
 * (after domain identification and anti-pattern elimination). Each rule
 * counters specific anti-patterns (antipatterns.ts) and appears in specific
 * exam scenarios (scenarios.ts).
 */
export const priorityRules: PriorityRule[] = [
  {
    id: 1,
    rule: 'CODE > PROMPTS',
    short: 'Programmatic enforcement beats prompt instructions',
    example: 'PostToolUse hooks / validation code > System prompt rules',
    relatedAntiPatternIds: [1],
    scenarioIds: [1, 5],
    domains: ['D1', 'D4'],
    whenToApply: 'When one option uses code (hooks, validators, guards) and the other uses prompt text to enforce the same behavior. The code option is deterministic; the prompt option is probabilistic.',
    evidence: [
      { url: 'https://code.claude.com/docs/en/hooks', title: 'Claude Code Hooks: deterministic code-level interceptors for PreToolUse/PostToolUse' },
      { url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "CLAUDE.md instructions shape behavior but are not a hard enforcement layer"' },
    ],
  },
  {
    id: 2,
    rule: 'EXPLICIT > IMPLICIT',
    short: 'Clear criteria beat vague guidance',
    example: 'JSON schema / stop_reason field > NL parsing / inference',
    relatedAntiPatternIds: [2, 5],
    scenarioIds: [1, 6],
    domains: ['D1', 'D4', 'D5'],
    whenToApply: 'When one option uses structured, well-defined signals (stop_reason, schema validation, explicit thresholds) and the other relies on interpretation (NL parsing, sentiment, self-reported confidence).',
    evidence: [
      { url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Tool Use: "if you\'re writing a regex to extract a decision from model output, that decision should have been a tool call"' },
      { url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: tool_choice modes provide explicit structured control over tool selection' },
    ],
  },
  {
    id: 3,
    rule: 'ISOLATED > SHARED',
    short: 'Separate contexts beat shared sessions',
    example: 'Independent review instance > Same-session self-review',
    relatedAntiPatternIds: [3, 4, 6],
    scenarioIds: [2, 3, 5],
    domains: ['D1', 'D3', 'D5'],
    whenToApply: 'When one option keeps agents/tasks in separate contexts and the other shares a single context. Isolation prevents cross-contamination of assumptions and improves reliability.',
    evidence: [
      { url: 'https://code.claude.com/docs/en/sub-agents', title: 'Claude Code Sub-Agents: each subagent runs in its own isolated context' },
      { url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: each API request includes full conversation — stateless, no shared state' },
    ],
  },
  {
    id: 4,
    rule: 'BUILT-IN > CUSTOM',
    short: 'Use existing mechanisms before building custom ones',
    example: '-p flag / CLAUDE.md / Batch API > Custom wrappers',
    relatedAntiPatternIds: [6],
    scenarioIds: [2, 4, 5],
    domains: ['D2', 'D3'],
    whenToApply: 'When one option leverages existing Claude/MCP features (CLAUDE.md, -p flag, tool_choice, Batch API) and the other builds a custom solution for the same purpose. Built-in features are maintained, tested, and documented.',
    evidence: [
      { url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Anthropic-schema tools: "Claude has been optimized on thousands of successful trajectories... calls them more reliably"' },
      { url: 'https://code.claude.com/docs/en/overview', title: 'Claude Code Overview: built-in skills, hooks, commands, and MCP integration' },
    ],
  },
  {
    id: 5,
    rule: 'COST-AWARE > BRUTE-FORCE',
    short: 'Right-sizing beats throwing resources at it',
    example: 'Batch API for overnight jobs / Context pruning > Bigger model / More tokens',
    relatedAntiPatternIds: [7],
    scenarioIds: [6],
    domains: ['D4', 'D5'],
    whenToApply: 'When one option optimizes for cost/efficiency (Batch API, pruning, smaller focused contexts) and the other uses brute force (bigger model, more tokens, no concern for cost). Production systems need cost awareness.',
    evidence: [
      { url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing: "All usage is charged at 50% of the standard API prices"' },
      { url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence"' },
    ],
  },
]
