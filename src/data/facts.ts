export interface TechnicalFact {
  concept: string
  fact: string
  domain: string
}

export interface CheatEntry {
  optionA: string
  optionB: string
  pick: string
  ruleId: number
}

export interface FabricatedFeature {
  name: string
  note: string
}

export interface TrapTrigger {
  pattern: string
  note: string
}

/**
 * Facts, cheat sheet, traps — quick-reference memorization material.
 *
 * WHY THIS EXISTS: Some exam questions test raw recall (e.g., "what does -p flag do?").
 * These facts are distilled from official documentation and need to be memorized.
 *
 * HOW TO USE: Review repeatedly before the exam. The cheat sheet is specifically
 * designed for the scenario where you've eliminated 2 answers and are stuck
 * between the remaining 2 — it tells you which to pick.
 *
 * CONNECTION: Facts support domain knowledge (domains.ts). The cheat sheet
 * encodes priority rules (rules.ts) as practical decision pairs. Fabricated
 * features and trap triggers help with anti-pattern elimination (antipatterns.ts).
 */

export const technicalFacts: TechnicalFact[] = [
  { concept: 'stop_reason', fact: 'Check programmatically. Never parse NL for loop control. Values: end_turn, tool_use, max_tokens, stop_sequence.', domain: 'D1' },
  { concept: 'Tool count', fact: '4-5 max per agent for reliable selection. Above 5, selection accuracy drops sharply.', domain: 'D2' },
  { concept: 'Batch API', fact: '50% cost savings, up to 24h processing window, no latency SLA, custom_id for result correlation.', domain: 'D4' },
  { concept: '-p flag', fact: 'Non-interactive mode for CI/CD pipelines. Claude Code reads from stdin, outputs to stdout, no interactive prompts.', domain: 'D3' },
  { concept: 'CLAUDE.md', fact: 'Hierarchy: ~/.claude/ (user) → project root (project) → subdirectory (local). Each level adds context, does not override.', domain: 'D3' },
  { concept: '.claude/rules/', fact: 'YAML frontmatter with path: glob patterns for conditional loading. Rules only activate when working on matching files.', domain: 'D3' },
  { concept: 'tool_choice', fact: 'auto = may return text or tool call. any = must call a tool (any). tool = must call a specific named tool.', domain: 'D2' },
  { concept: 'PostToolUse hooks', fact: 'Intercept tool results before returning to the model. Used for normalization, business rule enforcement, or human-in-the-loop gating.', domain: 'D1' },
  { concept: 'isError / isRetryable', fact: 'Structured error fields in MCP tool responses. isError signals failure, isRetryable tells the model whether to retry or give up.', domain: 'D2' },
  { concept: 'context: fork', fact: 'Skill frontmatter directive. Isolates verbose output from main conversation context. Output is not added back to the parent context.', domain: 'D3' },
  { concept: 'Scratchpad files', fact: 'Persist key findings outside the context window for long sessions. Written to disk, read back when needed. Prevents context loss.', domain: 'D5' },
  { concept: 'Case facts block', fact: 'Extract transactional details (IDs, amounts, dates) into a persistent structured block. Never summarized or paraphrased — exact values preserved.', domain: 'D5' },
  { concept: 'Messages API', fact: 'Stateless. Each request must include the full conversation (system + messages array). No server-side state between calls.', domain: 'D4' },
  { concept: 'tool_result', fact: 'After tool execution, send result back as a user message with role=user and tool_result content block. Includes tool_use_id for correlation.', domain: 'D2' },
  { concept: 'Extended thinking', fact: 'Allows Claude to reason step-by-step before responding. Visible in the response as thinking blocks. Budget controlled by caller.', domain: 'D4' },
]

export const cheatSheet: CheatEntry[] = [
  { optionA: 'Programmatic hooks', optionB: 'Prompt instructions', pick: 'Hooks', ruleId: 1 },
  { optionA: 'stop_reason check', optionB: 'NL output parsing', pick: 'stop_reason', ruleId: 2 },
  { optionA: 'Independent reviewer', optionB: 'Same-session review', pick: 'Independent', ruleId: 3 },
  { optionA: '4 focused tools', optionB: '12+ comprehensive tools', pick: '4 focused', ruleId: 3 },
  { optionA: 'Batch API', optionB: 'Standard API (no latency need)', pick: 'Batch', ruleId: 5 },
  { optionA: 'CLAUDE.md + rules/', optionB: 'System prompt variable', pick: 'CLAUDE.md', ruleId: 4 },
  { optionA: 'Hub-and-spoke agents', optionB: 'Single super-agent', pick: 'Hub-and-spoke', ruleId: 3 },
  { optionA: '-p flag (non-interactive)', optionB: 'Interactive mode in CI/CD', pick: '-p flag', ruleId: 4 },
  { optionA: 'Validation-retry loop', optionB: 'Better prompt examples', pick: 'Validation loop', ruleId: 1 },
  { optionA: 'tool_use + schema', optionB: 'Trust output format', pick: 'tool_use', ruleId: 2 },
]

export const fabricatedFeatures: FabricatedFeature[] = [
  { name: 'CLAUDE_HEADLESS=true', note: 'Does not exist. The correct way is -p flag for non-interactive mode.' },
  { name: '--batch flag', note: 'Does not exist in Claude Code. Batch processing uses the Batch API endpoint, not a CLI flag.' },
  { name: 'parallel_execution: true', note: 'Does not exist. Parallel execution is an architectural pattern, not a configuration option.' },
  { name: 'inherit_context: true', note: 'Does not exist. Subagents do not inherit parent context. The coordinator must explicitly pass relevant information.' },
  { name: 'auto_escalate: sentiment', note: 'Does not exist. Escalation must use explicit, deterministic criteria.' },
  { name: 'tool_priority: ordered', note: 'Does not exist. Tool selection is based on descriptions, not priority ordering.' },
]

export const trapTriggers: TrapTrigger[] = [
  { pattern: 'Sentiment-based anything', note: 'Always wrong. LLMs cannot reliably assess emotional states for deterministic decisions.' },
  { pattern: 'Self-reported confidence', note: 'Always unreliable. The model that made the error rates its own confidence using the same flawed reasoning.' },
  { pattern: '"Use a bigger model"', note: 'Almost never the answer. The exam tests architectural solutions, not resource scaling.' },
  { pattern: '"Single large prompt"', note: 'Attention dilution. Long prompts cause the model to lose focus on critical instructions.' },
  { pattern: '"More examples in prompt"', note: 'Usually wrong when a code-based solution exists. Few-shot examples add tokens without guarantees.' },
  { pattern: '"Increase context window"', note: 'Wrong approach. Manage context through pruning, summarization, and scratchpad files instead.' },
]

/* ================================================
 * Per-Domain Decision Rules & Exam Traps
 * Source: claudecertificationguide.com/learn/quick-reference
 * ================================================ */

export interface DecisionRule {
  trigger: string
  answer: string
}

export interface ExamTrap {
  trap: string
  why: string
}

export interface DomainQuickRef {
  domain: string
  weight: string
  decisionRules: DecisionRule[]
  examTraps: ExamTrap[]
}

export const domainQuickRefs: DomainQuickRef[] = [
  {
    domain: 'D1 — Agentic Architecture & Orchestration',
    weight: '27%',
    decisionRules: [
      { trigger: '"guaranteed", "must always", "enforce"', answer: 'Hooks (deterministic), not prompts' },
      { trigger: '"flexibility", "adapt", "unexpected"', answer: 'Model-driven decision-making' },
      { trigger: '"independent subtasks"', answer: 'Parallel orchestration' },
      { trigger: '"each step needs previous output"', answer: 'Sequential orchestration' },
      { trigger: '"premature termination"', answer: 'Check stop_reason, not iteration caps' },
      { trigger: '"runaway agent"', answer: 'Iteration cap as safety net' },
      { trigger: '"share context between agents"', answer: 'Explicit passing (subagents have no shared memory)' },
      { trigger: '"complex task, unknown structure"', answer: 'Dynamic adaptive orchestration' },
      { trigger: '"compliance", "regulatory", "audit"', answer: 'Programmatic enforcement (hooks), not model judgment' },
    ],
    examTraps: [
      { trap: 'Increase iteration cap to fix premature termination', why: 'Fix the stop_reason check instead' },
      { trap: 'Subagents can read the coordinator\'s context', why: 'All context must be passed explicitly' },
      { trap: 'System prompt rules guarantee compliance', why: 'Prompts are probabilistic; hooks guarantee' },
      { trap: 'Use one agent with many tools for simplicity', why: 'Scope to 4-5 tools per agent' },
      { trap: 'Iteration caps are the primary loop control', why: 'stop_reason is primary; caps are safety nets' },
      { trap: 'Text content in response means agent is done', why: 'Text can appear alongside tool_use blocks' },
    ],
  },
  {
    domain: 'D2 — Tool Design & MCP Integration',
    weight: '18%',
    decisionRules: [
      { trigger: '"Claude keeps picking the wrong tool"', answer: 'Improve tool descriptions first' },
      { trigger: '"guaranteed structured output"', answer: 'Forced tool_choice with specific tool name' },
      { trigger: '"model should decide which tool"', answer: 'tool_choice: auto' },
      { trigger: '"must call a tool but can choose which"', answer: 'tool_choice: any' },
      { trigger: '"search returned no results"', answer: 'Valid empty result — accept it' },
      { trigger: '"API returned 401/timeout"', answer: 'Access failure — retry or escalate' },
      { trigger: '"too many tools, selection errors"', answer: 'Scope to 4-5 per agent, improve descriptions' },
      { trigger: '"need a custom MCP server"', answer: 'Check community servers first' },
      { trigger: '"project-wide MCP config"', answer: '.mcp.json in project root' },
      { trigger: '"personal MCP config"', answer: '~/.claude.json' },
    ],
    examTraps: [
      { trap: 'Reduce tools to fix misselection', why: 'Improve descriptions first — that is always step one' },
      { trap: 'tool_choice: any guarantees a specific tool', why: '"any" forces a tool call, not a specific one' },
      { trap: 'MCP servers connect directly to each other', why: 'All communication goes through the client/host' },
      { trap: 'Empty search results mean the tool failed', why: 'Absence of data is a valid result' },
      { trap: 'Return generic error string from tools', why: 'Return structured metadata (category, retryable, suggestion)' },
      { trap: 'Build a custom MCP server for common integrations', why: 'Check community servers first' },
      { trap: 'Tool name is the primary selection signal', why: 'Tool description is the primary signal' },
    ],
  },
  {
    domain: 'D3 — Claude Code Configuration & Workflows',
    weight: '20%',
    decisionRules: [
      { trigger: '"guaranteed enforcement", "cannot be bypassed"', answer: 'Hooks (PreToolUse/PostToolUse)' },
      { trigger: '"style guidance", "preferred approach"', answer: 'Prompt instructions in CLAUDE.md' },
      { trigger: '"applies only to specific file paths"', answer: '.claude/rules/ with paths frontmatter' },
      { trigger: '"reusable workflow with restricted tools"', answer: 'Skills (.claude/skills/)' },
      { trigger: '"prompt template with arguments"', answer: 'Commands (.claude/commands/)' },
      { trigger: '"CI/CD pipeline", "automated", "non-interactive"', answer: '-p flag' },
      { trigger: '"review quality of generated code"', answer: 'Independent session (not the writing session)' },
      { trigger: '"multiple approaches, complex task"', answer: 'Plan mode first' },
      { trigger: '"personal preference, not shared"', answer: '~/.claude/ (user-level config)' },
    ],
    examTraps: [
      { trap: 'Put all rules in the project CLAUDE.md', why: 'Use .claude/rules/ for path-specific rules' },
      { trap: 'Hooks are prompt-based guardrails', why: 'Hooks are deterministic code, not prompt instructions' },
      { trap: 'Review code in the same session that wrote it', why: 'Model retains reasoning bias; use independent session' },
      { trap: 'Skills and commands are the same thing', why: 'Skills have tool restrictions and forked context; commands are prompt templates' },
      { trap: 'User CLAUDE.md overrides project CLAUDE.md', why: 'Project is higher priority than user-global' },
      { trap: '-p flag enables plan mode', why: '-p enables non-interactive (piped) mode for CI/CD' },
    ],
  },
  {
    domain: 'D4 — Prompt Engineering & Structured Output',
    weight: '20%',
    decisionRules: [
      { trigger: '"guaranteed schema compliance"', answer: 'Forced tool_choice with specific tool' },
      { trigger: '"output sometimes has wrong format"', answer: 'Add few-shot examples (2-4)' },
      { trigger: '"model fabricates missing data"', answer: 'Make schema fields optional/nullable' },
      { trigger: '"validation failed, need to fix"', answer: 'Retry-with-error-feedback (original + failed + error)' },
      { trigger: '"50% cost reduction", "bulk processing"', answer: 'Batch API' },
      { trigger: '"real-time", "user-facing"', answer: 'NOT Batch API — use synchronous' },
      { trigger: '"inconsistent output quality"', answer: 'Few-shot examples or prompt chaining' },
      { trigger: '"review its own output"', answer: 'Separate instance (not same session)' },
      { trigger: '"large document, missing details"', answer: 'Per-file passes + cross-file integration' },
      { trigger: '"instructions alone aren\'t working"', answer: 'Add few-shot examples' },
    ],
    examTraps: [
      { trap: 'Use prompt-based JSON for production', why: 'Use forced tool_choice for guaranteed schema' },
      { trap: 'Just say "try again" on validation failure', why: 'Include original + failed output + specific error' },
      { trap: 'Batch API for faster responses', why: 'Batch API trades latency for cost savings' },
      { trap: 'Review output in the same conversation', why: 'Same-session review is biased; use separate instance' },
      { trap: 'Add 10+ few-shot examples for best results', why: '2-4 is the sweet spot; diminishing returns after that' },
      { trap: 'Required fields prevent fabrication', why: 'Required fields CAUSE fabrication when data is missing' },
      { trap: 'One big prompt handles everything', why: 'Chain prompts when task has distinct phases' },
    ],
  },
  {
    domain: 'D5 — Context Management & Reliability',
    weight: '15%',
    decisionRules: [
      { trigger: '"details lost over long conversation"', answer: 'Persistent fact blocks, not progressive summarisation' },
      { trigger: '"findings need to survive context reset"', answer: 'Scratchpad files (external persistence)' },
      { trigger: '"tool returned nothing"', answer: 'Distinguish: valid empty (accept) vs access failure (retry)' },
      { trigger: '"high overall accuracy, users report errors"', answer: 'Stratified validation — check per-type accuracy' },
      { trigger: '"sources disagree"', answer: 'Annotate both with provenance and dates' },
      { trigger: '"generic error message"', answer: 'Replace with structured error context' },
      { trigger: '"model contradicts itself"', answer: 'Fresh start + summary injection' },
      { trigger: '"inline citations lost after processing"', answer: 'Switch to structured claim-source mappings' },
      { trigger: '"monitoring shows stable metrics but quality complaints"', answer: 'Per-type error rates instead of aggregate' },
      { trigger: '"long task exceeds context window"', answer: 'Scratchpad files + context boundary management' },
    ],
    examTraps: [
      { trap: 'Summarise the conversation to save context', why: 'Summarisation loses details; use persistent fact blocks' },
      { trap: 'Overall 95% accuracy means reliable', why: 'Check per-type accuracy; aggregate masks category issues' },
      { trap: 'Pick the more recent source when they conflict', why: 'Annotate both with provenance; let consumer decide' },
      { trap: 'Return "No results found — please try again"', why: 'If search legitimately found nothing, accept the empty result' },
      { trap: 'Inline citations in the text are sufficient', why: 'Lost during synthesis; use structured mappings for production' },
      { trap: 'Monitor overall error rate for quality', why: 'Monitor per-type error rates to catch category-specific degradation' },
      { trap: 'Keep all context in the conversation history', why: 'Use scratchpad files for external persistence across boundaries' },
    ],
  },
]
