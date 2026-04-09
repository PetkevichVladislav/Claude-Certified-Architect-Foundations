export interface Scenario {
  id: number
  name: string
  domains: string[]
  keyPatterns: string[]
  antiPatternIds: number[]
  ruleIds: number[]
  description: string
  whatToExpect: string
}

/**
 * 6 Exam Scenarios — the contextual frameworks the exam uses.
 *
 * WHY THIS EXISTS: The CCA-F exam randomly selects 4 of these 6 scenarios.
 * Each scenario provides a real-world context (customer support, CI/CD, etc.)
 * and asks 15 questions across multiple domains. Understanding the scenario
 * types helps you anticipate which anti-patterns and rules will be tested.
 *
 * HOW TO USE: Before the exam, review each scenario's key patterns and common
 * anti-patterns. During the exam, identify the scenario type from the context
 * and use that to predict likely traps.
 *
 * CONNECTION: Scenarios cross-reference anti-patterns (antipatterns.ts) that
 * commonly appear as wrong answers, and priority rules (rules.ts) that commonly
 * decide between remaining correct-looking options. The Mermaid diagrams in
 * DecisionGuide visualize these connections.
 */
export const scenarios: Scenario[] = [
  {
    id: 1,
    name: 'Customer Support Resolution Agent',
    domains: ['D1', 'D2', 'D5'],
    keyPatterns: ['Escalation criteria', 'Tool sequencing', 'Error handling', 'PostToolUse hooks'],
    antiPatternIds: [1, 2, 4, 5],
    ruleIds: [1, 2],
    description: 'A production support agent that handles customer queries, looks up accounts, processes refunds, and decides when to escalate to humans.',
    whatToExpect: 'Questions about tool call ordering (get_customer before lookup_order), escalation logic (explicit criteria, not sentiment), and business rule enforcement (hooks, not prompts). Anti-patterns 1 and 5 are the most common traps here.',
  },
  {
    id: 2,
    name: 'Code Generation with Claude Code',
    domains: ['D3', 'D5'],
    keyPatterns: ['CLAUDE.md hierarchy', 'Plan mode', 'Commands', 'Rules with globs'],
    antiPatternIds: [3],
    ruleIds: [3, 4],
    description: 'A team using Claude Code for development workflows — code generation, review, and project configuration.',
    whatToExpect: 'Questions about CLAUDE.md configuration hierarchy, .claude/rules/ with path: glob patterns, and independent code review (not same-session self-review). Rule 4 (BUILT-IN > CUSTOM) is the primary tiebreaker.',
  },
  {
    id: 3,
    name: 'Multi-Agent Research System',
    domains: ['D1', 'D2', 'D5'],
    keyPatterns: ['Hub-and-spoke', 'Subagent context isolation', 'Provenance tracking', 'Parallel execution'],
    antiPatternIds: [4, 6, 7],
    ruleIds: [3],
    description: 'A research system where multiple specialized agents gather, analyze, and synthesize information from different sources.',
    whatToExpect: 'Heavy D1 questions. The super-agent anti-pattern (one agent with all tools) and sequential pipeline anti-pattern (passing full context) are the main traps. Correct answer is always hub-and-spoke with context isolation.',
  },
  {
    id: 4,
    name: 'Developer Productivity with Claude',
    domains: ['D2', 'D3', 'D1'],
    keyPatterns: ['Built-in tools', 'MCP servers', 'Codebase exploration', 'Tool descriptions'],
    antiPatternIds: [4, 6],
    ruleIds: [4],
    description: 'A development team integrating Claude into their toolchain via MCP servers and custom tool configurations.',
    whatToExpect: 'Questions about tool design (detailed descriptions for selection), MCP integration patterns, and when to use built-in tools vs custom wrappers. Rule 4 (BUILT-IN > CUSTOM) dominates this scenario.',
  },
  {
    id: 5,
    name: 'Claude Code for CI/CD',
    domains: ['D3', 'D4'],
    keyPatterns: ['-p flag', 'JSON output', 'Batch API', 'Independent review'],
    antiPatternIds: [1, 2, 3],
    ruleIds: [1, 3, 4],
    description: 'Integrating Claude Code into continuous integration and deployment pipelines for automated code review and generation.',
    whatToExpect: 'The -p flag for non-interactive mode is central. Questions about parsing output (use JSON, not NL), enforcing quality gates (code, not prompts), and code review independence. Multiple anti-patterns appear here.',
  },
  {
    id: 6,
    name: 'Structured Data Extraction',
    domains: ['D4', 'D5'],
    keyPatterns: ['tool_use schemas', 'Validation-retry loops', 'Nullable fields', 'Batch API'],
    antiPatternIds: [7],
    ruleIds: [2, 5],
    description: 'Extracting structured data from unstructured documents using Claude — contracts, invoices, research papers.',
    whatToExpect: 'Questions about forcing structured output (tool_use + schema, not just prompting for JSON), handling optional fields (nullable, not omitted), and cost optimization for batch processing. Rule 2 (EXPLICIT > IMPLICIT) is the main tiebreaker.',
  },
]
