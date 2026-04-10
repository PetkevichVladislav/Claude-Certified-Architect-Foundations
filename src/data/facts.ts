import type { Evidence } from './antipatterns'

export interface TechnicalFact {
  concept: string
  fact: string
  domain: string
  evidence?: Evidence[]
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
  evidence?: Evidence[]
}

export interface TrapTrigger {
  pattern: string
  note: string
  evidence?: Evidence[]
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
  { concept: 'stop_reason', fact: 'Check programmatically. Never parse NL for loop control. Values: end_turn, tool_use, max_tokens, stop_sequence.', domain: 'D1', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: "while stop_reason == tool_use, execute the tools... exits on end_turn, max_tokens, stop_sequence, or refusal"' }] },
  { concept: 'Tool count', fact: '4-5 max per agent for reliable selection. Above 5, selection accuracy drops sharply.', domain: 'D2', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Consolidate related operations into fewer tools... reduce selection ambiguity"' }, { url: 'https://www.anthropic.com/engineering/writing-tools-for-agents', title: 'Anthropic Engineering: Writing Tools for Agents — tool count guidance' }] },
  { concept: 'Batch API', fact: '50% cost savings, up to 24h processing window, no latency SLA, custom_id for result correlation.', domain: 'D4', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing: "All usage is charged at 50% of the standard API prices" + "Batches expire if processing does not complete within 24 hours"' }] },
  { concept: '-p flag', fact: 'Non-interactive mode for CI/CD pipelines. Claude Code reads from stdin, outputs to stdout, no interactive prompts.', domain: 'D3', evidence: [{ url: 'https://code.claude.com/docs/en/overview', title: 'Claude Code Overview: "Pipe, script, and automate with the CLI"' }] },
  { concept: 'CLAUDE.md', fact: 'Hierarchy: ~/.claude/ (user) → project root (project) → subdirectory (local). Each level adds context, does not override.', domain: 'D3', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "All discovered files are concatenated into context rather than overriding each other"' }] },
  { concept: '.claude/rules/', fact: 'YAML frontmatter with path: glob patterns for conditional loading. Rules only activate when working on matching files.', domain: 'D3', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "Rules can be scoped to specific files using YAML frontmatter with the paths field"' }] },
  { concept: 'tool_choice', fact: 'auto = may return text or tool call. any = must call a tool (any). tool = must call a specific named tool.', domain: 'D2', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "auto allows Claude to decide... any tells Claude it must use one... tool forces Claude to always use a particular tool"' }] },
  { concept: 'PostToolUse hooks', fact: 'Intercept tool results before returning to the model. Used for normalization, business rule enforcement, or human-in-the-loop gating.', domain: 'D1', evidence: [{ url: 'https://code.claude.com/docs/en/hooks', title: 'Claude Code Hooks: deterministic code-level interceptors for PreToolUse and PostToolUse events' }] },
  { concept: 'isError / isRetryable', fact: 'Structured error fields in MCP tool responses. isError signals failure, isRetryable tells the model whether to retry or give up.', domain: 'D2', evidence: [{ url: 'https://modelcontextprotocol.io/specification/2025-03-26', title: 'MCP Specification: structured tool response format with error handling fields' }] },
  { concept: 'context: fork', fact: 'Skill frontmatter directive. Isolates verbose output from main conversation context. Output is not added back to the parent context.', domain: 'D3', evidence: [{ url: 'https://code.claude.com/docs/en/skills', title: 'Claude Code Skills: context isolation via fork directive in skill frontmatter' }] },
  { concept: 'Scratchpad files', fact: 'Persist key findings outside the context window for long sessions. Written to disk, read back when needed. Prevents context loss.', domain: 'D5', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: persistent storage outside the context window for long sessions' }] },
  { concept: 'Case facts block', fact: 'Extract transactional details (IDs, amounts, dates) into a persistent structured block. Never summarized or paraphrased — exact values preserved.', domain: 'D5', evidence: [{ url: 'https://www.anthropic.com/learn', title: 'Anthropic Academy: Building with Claude API — structured fact preservation pattern' }] },
  { concept: 'Messages API', fact: 'Stateless. Each request must include the full conversation (system + messages array). No server-side state between calls.', domain: 'D4', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: "Send a new request containing the original messages, the assistant\'s response, and tool_result blocks"' }] },
  { concept: 'tool_result', fact: 'After tool execution, send result back as a user message with role=user and tool_result content block. Includes tool_use_id for correlation.', domain: 'D2', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Tool Use: "sends the output back in a tool_result block on the next request"' }] },
  { concept: 'Extended thinking', fact: 'Allows Claude to reason step-by-step before responding. Visible in the response as thinking blocks. Budget controlled by caller.', domain: 'D4', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/extended-thinking', title: 'Extended Thinking: step-by-step reasoning with caller-controlled budget' }] },
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
  { name: 'CLAUDE_HEADLESS=true', note: 'Does not exist. The correct way is -p flag for non-interactive mode.', evidence: [{ url: 'https://code.claude.com/docs/en/overview', title: 'Claude Code docs list -p flag, not CLAUDE_HEADLESS' }] },
  { name: '--batch flag', note: 'Does not exist in Claude Code. Batch processing uses the Batch API endpoint, not a CLI flag.', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing uses POST /v1/messages/batches API endpoint' }] },
  { name: 'parallel_execution: true', note: 'Does not exist. Parallel execution is an architectural pattern, not a configuration option.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'No such config in official API — parallel execution is a design pattern' }] },
  { name: 'inherit_context: true', note: 'Does not exist. Subagents do not inherit parent context. The coordinator must explicitly pass relevant information.', evidence: [{ url: 'https://code.claude.com/docs/en/sub-agents', title: 'Sub-Agents docs: subagents run in isolated contexts' }] },
  { name: 'auto_escalate: sentiment', note: 'Does not exist. Escalation must use explicit, deterministic criteria.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'No such parameter in the Claude API specification' }] },
  { name: 'tool_priority: ordered', note: 'Does not exist. Tool selection is based on descriptions, not priority ordering.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: \"This is by far the most important factor in tool performance\" — descriptions, not priority' }] },
]

export const trapTriggers: TrapTrigger[] = [
  { pattern: 'Sentiment-based anything', note: 'Always wrong. LLMs cannot reliably assess emotional states for deterministic decisions.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Tool Use: decisions should be structured, not inferred from text' }] },
  { pattern: 'Self-reported confidence', note: 'Always unreliable. The model that made the error rates its own confidence using the same flawed reasoning.', evidence: [{ url: 'https://www.anthropic.com/learn', title: 'Anthropic Academy: self-evaluation shares the same context biases' }] },
  { pattern: '"Use a bigger model"', note: 'Almost never the answer. The exam tests architectural solutions, not resource scaling.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: tool design and descriptions are the lever, not model size' }] },
  { pattern: '"Single large prompt"', note: 'Attention dilution. Long prompts cause the model to lose focus on critical instructions.', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "target under 200 lines... Longer files consume more context and reduce adherence"' }] },
  { pattern: '"More examples in prompt"', note: 'Usually wrong when a code-based solution exists. Few-shot examples add tokens without guarantees.', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Prioritize descriptions, but consider using input_examples for complex tools"' }] },
  { pattern: '"Increase context window"', note: 'Wrong approach. Manage context through pruning, summarization, and scratchpad files instead.', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: use scratchpad files, rules, and structured CLAUDE.md for context management' }] },
]

/* ================================================
 * Per-Domain Decision Rules & Exam Traps
 * Source: claudecertificationguide.com/learn/quick-reference
 * ================================================ */

export interface DecisionRule {
  trigger: string
  answer: string
  evidence?: Evidence[]
}

export interface ExamTrap {
  trap: string
  why: string
  evidence?: Evidence[]
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
      { trigger: '"guaranteed", "must always", "enforce"', answer: 'Hooks (deterministic), not prompts', evidence: [{ url: 'https://code.claude.com/docs/en/hooks', title: 'Claude Code Hooks: deterministic code-level interceptors' }] },
      { trigger: '"flexibility", "adapt", "unexpected"', answer: 'Model-driven decision-making', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Tool Use Contract: "Claude decides when and how to call them"' }] },
      { trigger: '"independent subtasks"', answer: 'Parallel orchestration' },
      { trigger: '"each step needs previous output"', answer: 'Sequential orchestration' },
      { trigger: '"premature termination"', answer: 'Check stop_reason, not iteration caps', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: loop keyed on stop_reason, not iteration count' }] },
      { trigger: '"runaway agent"', answer: 'Iteration cap as safety net' },
      { trigger: '"share context between agents"', answer: 'Explicit passing (subagents have no shared memory)', evidence: [{ url: 'https://code.claude.com/docs/en/sub-agents', title: 'Sub-Agents: each subagent runs in its own isolated context' }] },
      { trigger: '"complex task, unknown structure"', answer: 'Dynamic adaptive orchestration' },
      { trigger: '"compliance", "regulatory", "audit"', answer: 'Programmatic enforcement (hooks), not model judgment', evidence: [{ url: 'https://code.claude.com/docs/en/hooks', title: 'Hooks: code-level enforcement that cannot be bypassed by the model' }] },
    ],
    examTraps: [
      { trap: 'Increase iteration cap to fix premature termination', why: 'Fix the stop_reason check instead', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: stop_reason is the primary loop control mechanism' }] },
      { trap: 'Subagents can read the coordinator\'s context', why: 'All context must be passed explicitly', evidence: [{ url: 'https://code.claude.com/docs/en/sub-agents', title: 'Sub-Agents: isolated contexts, no shared state' }] },
      { trap: 'System prompt rules guarantee compliance', why: 'Prompts are probabilistic; hooks guarantee', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "CLAUDE.md instructions shape behavior but are not a hard enforcement layer"' }] },
      { trap: 'Use one agent with many tools for simplicity', why: 'Scope to 4-5 tools per agent', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Consolidate related operations into fewer tools"' }] },
      { trap: 'Iteration caps are the primary loop control', why: 'stop_reason is primary; caps are safety nets', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', title: 'Agentic Loop: keyed on stop_reason, not iteration count' }] },
      { trap: 'Text content in response means agent is done', why: 'Text can appear alongside tool_use blocks', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Model Responses: "Claude might respond with text AND tool_use blocks together"' }] },
    ],
  },
  {
    domain: 'D2 — Tool Design & MCP Integration',
    weight: '18%',
    decisionRules: [
      { trigger: '"Claude keeps picking the wrong tool"', answer: 'Improve tool descriptions first', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Provide extremely detailed descriptions. This is by far the most important factor in tool performance"' }] },
      { trigger: '"guaranteed structured output"', answer: 'Forced tool_choice with specific tool name', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: tool_choice: {type: "tool", name: "..."} forces a specific tool' }] },
      { trigger: '"model should decide which tool"', answer: 'tool_choice: auto', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "auto allows Claude to decide whether to call any provided tools"' }] },
      { trigger: '"must call a tool but can choose which"', answer: 'tool_choice: any', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "any tells Claude that it must use one of the provided tools"' }] },
      { trigger: '"search returned no results"', answer: 'Valid empty result — accept it' },
      { trigger: '"API returned 401/timeout"', answer: 'Access failure — retry or escalate' },
      { trigger: '"too many tools, selection errors"', answer: 'Scope to 4-5 per agent, improve descriptions', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Fewer, more capable tools reduce selection ambiguity"' }] },
      { trigger: '"need a custom MCP server"', answer: 'Check community servers first', evidence: [{ url: 'https://modelcontextprotocol.io/specification/2025-03-26', title: 'MCP: ecosystem of community servers before building custom' }] },
      { trigger: '"project-wide MCP config"', answer: '.mcp.json in project root' },
      { trigger: '"personal MCP config"', answer: '~/.claude.json' },
    ],
    examTraps: [
      { trap: 'Reduce tools to fix misselection', why: 'Improve descriptions first — that is always step one', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: descriptions are "by far the most important factor"' }] },
      { trap: 'tool_choice: any guarantees a specific tool', why: '"any" forces a tool call, not a specific one', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "any tells Claude it must use one of the provided tools, but doesn\'t force a particular tool"' }] },
      { trap: 'MCP servers connect directly to each other', why: 'All communication goes through the client/host', evidence: [{ url: 'https://modelcontextprotocol.io/specification/2025-03-26', title: 'MCP Spec: "Hosts: LLM applications... Clients: connectors within host... Servers: provide context"' }] },
      { trap: 'Empty search results mean the tool failed', why: 'Absence of data is a valid result' },
      { trap: 'Return generic error string from tools', why: 'Return structured metadata (category, retryable, suggestion)', evidence: [{ url: 'https://modelcontextprotocol.io/specification/2025-03-26', title: 'MCP Spec: structured error handling in tool responses' }] },
      { trap: 'Build a custom MCP server for common integrations', why: 'Check community servers first' },
      { trap: 'Tool name is the primary selection signal', why: 'Tool description is the primary signal', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Provide extremely detailed descriptions. This is by far the most important factor"' }] },
    ],
  },
  {
    domain: 'D3 — Claude Code Configuration & Workflows',
    weight: '20%',
    decisionRules: [
      { trigger: '"guaranteed enforcement", "cannot be bypassed"', answer: 'Hooks (PreToolUse/PostToolUse)', evidence: [{ url: 'https://code.claude.com/docs/en/hooks', title: 'Hooks: deterministic code-level interceptors that cannot be bypassed' }] },
      { trigger: '"style guidance", "preferred approach"', answer: 'Prompt instructions in CLAUDE.md', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: CLAUDE.md for "coding standards, workflows, project architecture"' }] },
      { trigger: '"applies only to specific file paths"', answer: '.claude/rules/ with paths frontmatter', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "Rules can be scoped to specific files using YAML frontmatter with the paths field"' }] },
      { trigger: '"reusable workflow with restricted tools"', answer: 'Skills (.claude/skills/)', evidence: [{ url: 'https://code.claude.com/docs/en/skills', title: 'Skills: packaged workflows with tool restrictions and context isolation' }] },
      { trigger: '"prompt template with arguments"', answer: 'Commands (.claude/commands/)' },
      { trigger: '"CI/CD pipeline", "automated", "non-interactive"', answer: '-p flag', evidence: [{ url: 'https://code.claude.com/docs/en/overview', title: 'Claude Code: "Pipe, script, and automate with the CLI"' }] },
      { trigger: '"review quality of generated code"', answer: 'Independent session (not the writing session)', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "Model retains reasoning bias; use independent session"' }] },
      { trigger: '"multiple approaches, complex task"', answer: 'Plan mode first' },
      { trigger: '"personal preference, not shared"', answer: '~/.claude/ (user-level config)', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "User instructions: ~/.claude/CLAUDE.md — Personal preferences for all projects"' }] },
    ],
    examTraps: [
      { trap: 'Put all rules in the project CLAUDE.md', why: 'Use .claude/rules/ for path-specific rules', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: ".claude/rules/ for path-specific rules that only load when matching files are opened"' }] },
      { trap: 'Hooks are prompt-based guardrails', why: 'Hooks are deterministic code, not prompt instructions', evidence: [{ url: 'https://code.claude.com/docs/en/hooks', title: 'Hooks: code-level interceptors, not prompt instructions' }] },
      { trap: 'Review code in the same session that wrote it', why: 'Model retains reasoning bias; use independent session' },
      { trap: 'Skills and commands are the same thing', why: 'Skills have tool restrictions and forked context; commands are prompt templates', evidence: [{ url: 'https://code.claude.com/docs/en/skills', title: 'Skills vs commands: skills have tool restrictions and context isolation' }] },
      { trap: 'User CLAUDE.md overrides project CLAUDE.md', why: 'Project is higher priority than user-global', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "User-level rules are loaded before project rules, giving project rules higher priority"' }] },
      { trap: '-p flag enables plan mode', why: '-p enables non-interactive (piped) mode for CI/CD', evidence: [{ url: 'https://code.claude.com/docs/en/overview', title: '-p flag is for non-interactive piped mode, not plan mode' }] },
    ],
  },
  {
    domain: 'D4 — Prompt Engineering & Structured Output',
    weight: '20%',
    decisionRules: [
      { trigger: '"guaranteed schema compliance"', answer: 'Forced tool_choice with specific tool', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: tool_choice: {type: "tool", name: "..."} forces a specific schema' }] },
      { trigger: '"output sometimes has wrong format"', answer: 'Add few-shot examples (2-4)', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "Prioritize descriptions, but consider using input_examples for complex tools"' }] },
      { trigger: '"model fabricates missing data"', answer: 'Make schema fields optional/nullable' },
      { trigger: '"validation failed, need to fix"', answer: 'Retry-with-error-feedback (original + failed + error)' },
      { trigger: '"50% cost reduction", "bulk processing"', answer: 'Batch API', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing: "All usage is charged at 50% of the standard API prices"' }] },
      { trigger: '"real-time", "user-facing"', answer: 'NOT Batch API — use synchronous', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing: "tasks that do not require immediate responses"' }] },
      { trigger: '"inconsistent output quality"', answer: 'Few-shot examples or prompt chaining' },
      { trigger: '"review its own output"', answer: 'Separate instance (not same session)' },
      { trigger: '"large document, missing details"', answer: 'Per-file passes + cross-file integration' },
      { trigger: '"instructions alone aren\'t working"', answer: 'Add few-shot examples' },
    ],
    examTraps: [
      { trap: 'Use prompt-based JSON for production', why: 'Use forced tool_choice for guaranteed schema', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: forced tool_choice guarantees schema compliance' }] },
      { trap: 'Just say "try again" on validation failure', why: 'Include original + failed output + specific error' },
      { trap: 'Batch API for faster responses', why: 'Batch API trades latency for cost savings', evidence: [{ url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', title: 'Batch Processing: asynchronous, up to 24h, not for real-time' }] },
      { trap: 'Review output in the same conversation', why: 'Same-session review is biased; use separate instance' },
      { trap: 'Add 10+ few-shot examples for best results', why: '2-4 is the sweet spot; diminishing returns after that', evidence: [{ url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools', title: 'Define Tools: "~20-50 tokens for simple examples, ~100-200 tokens for complex" — keep examples lean' }] },
      { trap: 'Required fields prevent fabrication', why: 'Required fields CAUSE fabrication when data is missing' },
      { trap: 'One big prompt handles everything', why: 'Chain prompts when task has distinct phases' },
    ],
  },
  {
    domain: 'D5 — Context Management & Reliability',
    weight: '15%',
    decisionRules: [
      { trigger: '"details lost over long conversation"', answer: 'Persistent fact blocks, not progressive summarisation', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: structured persistent fact preservation, not progressive summarization' }] },
      { trigger: '"findings need to survive context reset"', answer: 'Scratchpad files (external persistence)', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: auto memory and scratchpad files persist across sessions' }] },
      { trigger: '"tool returned nothing"', answer: 'Distinguish: valid empty (accept) vs access failure (retry)' },
      { trigger: '"high overall accuracy, users report errors"', answer: 'Stratified validation — check per-type accuracy' },
      { trigger: '"sources disagree"', answer: 'Annotate both with provenance and dates' },
      { trigger: '"generic error message"', answer: 'Replace with structured error context', evidence: [{ url: 'https://modelcontextprotocol.io/specification/2025-03-26', title: 'MCP Spec: structured error handling in tool responses' }] },
      { trigger: '"model contradicts itself"', answer: 'Fresh start + summary injection' },
      { trigger: '"inline citations lost after processing"', answer: 'Switch to structured claim-source mappings' },
      { trigger: '"monitoring shows stable metrics but quality complaints"', answer: 'Per-type error rates instead of aggregate' },
      { trigger: '"long task exceeds context window"', answer: 'Scratchpad files + context boundary management', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: "first 200 lines of MEMORY.md loaded at start" + topic files on demand' }] },
    ],
    examTraps: [
      { trap: 'Summarise the conversation to save context', why: 'Summarisation loses details; use persistent fact blocks', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: structured fact preservation, not lossy summarization' }] },
      { trap: 'Overall 95% accuracy means reliable', why: 'Check per-type accuracy; aggregate masks category issues' },
      { trap: 'Pick the more recent source when they conflict', why: 'Annotate both with provenance; let consumer decide' },
      { trap: 'Return "No results found — please try again"', why: 'If search legitimately found nothing, accept the empty result' },
      { trap: 'Inline citations in the text are sufficient', why: 'Lost during synthesis; use structured mappings for production' },
      { trap: 'Monitor overall error rate for quality', why: 'Monitor per-type error rates to catch category-specific degradation' },
      { trap: 'Keep all context in the conversation history', why: 'Use scratchpad files for external persistence across boundaries', evidence: [{ url: 'https://code.claude.com/docs/en/memory', title: 'Memory docs: external persistence via scratchpad and auto memory files' }] },
    ],
  },
]
