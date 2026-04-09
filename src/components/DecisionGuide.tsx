import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Brain, Target, BookOpenCheck, Lightbulb, ShieldAlert, ArrowDown,
  Zap, Search, Filter, GitBranch, HelpCircle
} from 'lucide-react'
import { antiPatterns } from '@/data/antipatterns'
import { priorityRules } from '@/data/rules'
import { scenarios } from '@/data/scenarios'
import {
  technicalFacts, cheatSheet, fabricatedFeatures, trapTriggers,
  domainQuickRefs
} from '@/data/facts'

/* ====== Collapsible Section ====== */
interface SectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  context?: string
}

function Section({ title, icon, children, defaultOpen = false, context }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors text-left font-semibold"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {icon}
        {title}
      </button>
      {open && (
        <div className="px-4 py-4">
          {context && (
            <div className="text-xs text-[var(--muted-foreground)] italic mb-3 flex items-start gap-1.5 bg-slate-50 rounded-md p-2 border border-slate-200">
              <span className="text-indigo-500 mt-0.5 shrink-0">ℹ</span>
              <span>{context}</span>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

/* ====== Flow Connector ====== */
type FlowPhase = 'overview' | 'eliminate' | 'rules' | 'domain' | 'practice' | 'memorize' | 'challenge'

const phaseStyles: Record<FlowPhase, { line: string; bg: string; border: string; icon: string; text: string; step: string }> = {
  overview:  { line: 'from-transparent via-violet-400 to-transparent',  bg: 'bg-violet-50',   border: 'border-violet-300',  icon: 'text-violet-500',  text: 'text-violet-800',  step: '1' },
  eliminate: { line: 'from-transparent via-red-400 to-transparent',     bg: 'bg-red-50',      border: 'border-red-300',     icon: 'text-red-500',     text: 'text-red-800',     step: '2' },
  rules:     { line: 'from-transparent via-emerald-400 to-transparent', bg: 'bg-emerald-50',  border: 'border-emerald-300', icon: 'text-emerald-500', text: 'text-emerald-800', step: '3' },
  domain:    { line: 'from-transparent via-indigo-400 to-transparent',  bg: 'bg-indigo-50',   border: 'border-indigo-300',  icon: 'text-indigo-500',  text: 'text-indigo-800',  step: '4' },
  practice:  { line: 'from-transparent via-sky-400 to-transparent',     bg: 'bg-sky-50',      border: 'border-sky-300',     icon: 'text-sky-500',     text: 'text-sky-800',     step: '5' },
  memorize:  { line: 'from-transparent via-amber-400 to-transparent',   bg: 'bg-amber-50',    border: 'border-amber-300',   icon: 'text-amber-500',   text: 'text-amber-800',   step: '6' },
  challenge: { line: 'from-transparent via-purple-400 to-transparent',  bg: 'bg-purple-50',   border: 'border-purple-300',  icon: 'text-purple-500',  text: 'text-purple-800',  step: '7' },
}

function FlowConnector({ text, phase = 'overview' }: { text: string; phase?: FlowPhase }) {
  const s = phaseStyles[phase]
  return (
    <div className="flex flex-col items-center py-2">
      <div className={cn('w-0.5 h-5 bg-gradient-to-b', s.line)} />
      <div className={cn('flex items-center gap-2 rounded-full px-4 py-1.5 border shadow-sm', s.bg, s.border)}>
        <span className={cn('flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white',
          phase === 'overview' ? 'bg-violet-500' :
          phase === 'eliminate' ? 'bg-red-500' :
          phase === 'rules' ? 'bg-emerald-500' :
          phase === 'domain' ? 'bg-indigo-500' :
          phase === 'practice' ? 'bg-sky-500' :
          phase === 'memorize' ? 'bg-amber-500' :
          'bg-purple-500'
        )}>{s.step}</span>
        <span className={cn('text-[11px] font-medium', s.text)}>{text}</span>
        <ArrowDown size={12} className={s.icon} />
      </div>
      <div className={cn('w-0.5 h-5 bg-gradient-to-b', s.line)} />
    </div>
  )
}

/* ====== Hard Walkthrough Data & Component ====== */
interface WalkthroughStep {
  step: string
  action: string
  result: string
  color: string
}

interface Walkthrough {
  question: string
  domain: string
  options: { label: string; text: string; eliminated?: boolean; correct?: boolean }[]
  steps: WalkthroughStep[]
  answer: string
  keyLesson: string
}

const hardWalkthroughs: Walkthrough[] = [
  {
    question: 'An e-commerce agent must enforce a return policy: returns are only accepted within 30 days and the item must be unused. The team has two proposals: (A) a PreToolUse hook that checks the date and item condition before calling process_return, or (B) a Rules block in the system prompt defining the return policy with clear conditions. Which approach is better?',
    domain: 'D1',
    options: [
      { label: 'A', text: 'Use a PreToolUse hook that validates the return date and item condition before allowing the process_return tool to execute' },
      { label: 'B', text: 'Define the return policy in a Rules block in the system prompt with explicit conditions for date and item status' },
      { label: 'C', text: 'Use both: Rules block for the policy definition AND a PreToolUse hook for enforcement', correct: true },
      { label: 'D', text: 'Use a PostToolUse hook to reverse the return if the policy was violated', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "agent", "policy enforcement", "hook" → D1 Agentic Architecture', result: 'Domain: D1 (27%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option D: PostToolUse to "reverse" a completed return is reactive, not preventive — a return already processed may have triggered refunds. This is the wrong hook timing → ELIMINATE. Options A, B, and C all survive — they are all reasonable approaches.', result: '1 eliminated, 3 survive — elimination alone is NOT enough', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Rule 1 (CODE > PROMPT): The hook (A) is deterministic enforcement, better than prompt-only (B). But the Rules block tells Claude WHEN to attempt returns — without it, Claude may try returning items that clearly violate policy, wasting a tool call just for the hook to block it. The Rules block guides behavior; the hook guarantees enforcement. C combines both layers: guidance + guarantee.', result: 'C is the layered defense answer ✓', color: 'green' },
    ],
    answer: 'C',
    keyLesson: 'This is why elimination alone fails here — A and B are both partially correct. The real CCA-F pattern: Rules guide Claude\'s decisions (reducing unnecessary tool calls), hooks enforce constraints deterministically. CODE > PROMPT means hooks are the enforcement layer, but Rules are still the guidance layer. Layered defense is the best answer.',
  },
  {
    question: 'A coding assistant has 12 tools. The team notices Claude sometimes calls search_files when it should call grep_codebase, and vice versa. They want to fix this. What is the best approach?',
    domain: 'D2',
    options: [
      { label: 'A', text: 'Consolidate search_files and grep_codebase into a single unified_search tool that handles both use cases' },
      { label: 'B', text: 'Improve the descriptions of both tools to clearly state when each should be used, including boundary conditions and example queries', correct: true },
      { label: 'C', text: 'Remove grep_codebase entirely and update search_files to handle all search scenarios', eliminated: true },
      { label: 'D', text: 'Add a system prompt instruction: "Use search_files for filename lookups and grep_codebase for content searches"', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "tools", "wrong tool selection", "tool confusion" → D2 Tool Design & MCP', result: 'Domain: D2 (18%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: "Remove a tool entirely" reduces capability, not just confusion — destructive approach → ELIMINATE. Option D: Prompt instruction for tool routing = AP1 (prompt for business rules), tool behavior should be self-describing → ELIMINATE. Options A and B both survive — consolidation AND better descriptions are both valid D2 strategies.', result: '2 eliminated, A and B both survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'D2 decision rule: "Claude picks wrong tool" → First improve descriptions. The optimization sequence matters: (1) improve descriptions → (2) add examples → (3) consolidate tools. A jumps to step 3 (consolidation) without trying step 1 first. Also, 12 tools is above the recommended 4-5 but consolidation is a LATER step, not the first one. B is the correct FIRST action.', result: 'B confirmed — sequence matters ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'The trap: Option A (consolidate) is a VALID technique but not the FIRST step. CCA-F tests whether you know the optimization ORDER: improve descriptions → add examples → then consolidate. If the question asked "What if improved descriptions didn\'t help?" then A would be correct. Read the question\'s implied sequence.',
  },
  {
    question: 'A financial analysis system needs Claude to output a risk assessment in a strict JSON schema with nested objects. The team debates: use a forced tool call with the schema defined in the tool parameters, or use a detailed system prompt with the schema and prefilled assistant turn starting with `{`. Which is better?',
    domain: 'D4',
    options: [
      { label: 'A', text: 'Use tool_choice with a specific tool whose input_schema matches the required JSON structure', correct: true },
      { label: 'B', text: 'Use a system prompt with the JSON schema and prefill the assistant response with `{` to force JSON mode' },
      { label: 'C', text: 'Use tool_choice: any to force the model into tool-calling mode', eliminated: true },
      { label: 'D', text: 'Define the schema in a Rules block and add 3 few-shot examples of correct output', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "strict JSON schema", "structured output", "nested objects" → D4 Prompt Engineering & Structured Output', result: 'Domain: D4 (20%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: tool_choice: any forces SOME tool call but doesn\'t guarantee the SPECIFIC schema tool is called → ELIMINATE. Option D: Rules + few-shot = still probabilistic — no schema guarantee for nested objects → ELIMINATE. Options A and B both survive — both can produce structured JSON.', result: '2 eliminated, A and B both survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Both A and B can produce JSON. But the question says "strict" and "guaranteed". D4 decision rule: "guaranteed schema compliance" → forced tool_choice with specific tool. Prefill + prompt (B) encourages JSON but doesn\'t VALIDATE against a schema — a nested field could be missing or wrong-typed. Tool input_schema is validated by the API. Rule 1 (CODE > PROMPT) also applies: tool schema = code-level enforcement.', result: 'A confirmed — schema validation is deterministic ✓', color: 'green' },
    ],
    answer: 'A',
    keyLesson: 'Prefill with `{` is a real technique that works well for simple JSON, but it does NOT validate against a schema. For strict/guaranteed compliance with complex nested structures, forced tool_choice wins because the input_schema is enforced at the API level. This is CODE > PROMPT in the structured output domain.',
  },
  {
    question: 'A multi-step research agent uses a coordinator that spawns specialist subagents. The coordinator needs to give each subagent its findings so far. The team proposes two approaches: (A) pass a summary of prior findings in each subagent\'s initial prompt, or (B) give all subagents access to a shared scratchpad tool that reads/writes to a common document. Which is better?',
    domain: 'D1',
    options: [
      { label: 'A', text: 'Pass a structured summary of relevant prior findings in each subagent\'s system prompt when spawning it', correct: true },
      { label: 'B', text: 'Provide all subagents with a shared scratchpad tool (read_scratchpad / write_scratchpad) so they can coordinate in real-time' },
      { label: 'C', text: 'Have the coordinator call each subagent sequentially, appending all prior subagent outputs to the conversation', eliminated: true },
      { label: 'D', text: 'Use extended thinking so each subagent can reason about what other agents might have found', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "multi-agent", "coordinator", "subagents", "shared state" → D1 Agentic Architecture', result: 'Domain: D1 (27%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: Appending ALL prior outputs → context bloat, doesn\'t scale with 3+ agents (AP7 token waste) → ELIMINATE. Option D: Extended thinking doesn\'t give access to other agents\' outputs — fabricated capability → ELIMINATE. Options A and B both survive — both provide information sharing.', result: '2 eliminated, A and B both survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Rule 3: ISOLATED > SHARED. D1 fundamental principle: subagents do NOT share memory or tools. A shared scratchpad (B) creates coupling — race conditions, context pollution, and violates isolation. Option A has the coordinator explicitly pass only relevant context, maintaining isolation. D1 decision rule: "share context between agents" → Explicit passing by coordinator.', result: 'A confirmed — explicit passing preserves isolation ✓', color: 'green' },
    ],
    answer: 'A',
    keyLesson: 'Option B is the biggest trap here — a shared scratchpad sounds practical and is how humans collaborate, but it violates the ISOLATED > SHARED rule. In Claude\'s multi-agent architecture, subagents have isolated contexts. The coordinator is the ONLY entity that passes context between them, explicitly and selectively. Shared state = shared bugs.',
  },
  {
    question: 'A customer support chatbot conversation regularly exceeds 80 messages. The team notices Claude starts "forgetting" the customer\'s account number and issue category mentioned early in the conversation. Two proposals: (A) implement a sliding window that keeps the last 40 messages plus a summary of earlier ones, or (B) extract key facts (account number, issue type, resolution status) into a structured block that is injected at the top of every new request. Which approach is best?',
    domain: 'D5',
    options: [
      { label: 'A', text: 'Sliding window: keep the last 40 messages and prepend a progressive summary of older messages' },
      { label: 'B', text: 'Fact extraction: maintain a structured block with key facts (account #, issue type, status) injected at the start of each turn, with older messages trimmed', correct: true },
      { label: 'C', text: 'Use both: structured fact block for critical data AND sliding window with summaries for conversation flow', eliminated: true },
      { label: 'D', text: 'Cache the full conversation using prompt caching and increase max_tokens to handle the longer context', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "long conversation", "forgetting details", "context management" → D5 Context Management & Reliability', result: 'Domain: D5 (15%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: Sounds comprehensive but "progressive summary" is the D5 exam trap — summarization loses specific values. The sliding window component reintroduces the same problem → ELIMINATE. Option D: Prompt caching reduces COST, not context loss. Increasing max_tokens controls output length, not input handling — conflated concepts → ELIMINATE. Options A and B both survive.', result: '2 eliminated, A and B both survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Both keep recent context. But the problem is specifically "forgetting account number and issue category" — these are CONCRETE FACTS, not conversational flow. D5 decision rule: "details lost over long conversation" → Persistent fact blocks. A\'s summary will eventually paraphrase "Account #38291" into "the customer\'s account" — lossy. Rule 2 (EXPLICIT > IMPLICIT) also applies: B explicitly preserves facts, A implicitly hopes the summary retains them.', result: 'B confirmed — facts need explicit preservation ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'Option A is the classic trap — sliding window + summary is a REAL technique used in production, but summarization is LOSSY for specific values. CCA-F specifically tests whether you know that concrete facts (IDs, numbers, dates) must be preserved verbatim in structured blocks, never summarized. Option C is a double-trap: it sounds like the "best of both worlds" but still includes the lossy summary component.',
  },
  // === GITHUB BANK WALKTHROUGHS: Tricky questions that test the guide ===
  {
    question: '[Q42] Your monorepo\'s root CLAUDE.md has grown to over 400 lines, covering Python conventions, TypeScript conventions, infrastructure rules, and testing standards. Developers report that Claude sometimes applies the wrong conventions to the wrong files. What is the best approach?',
    domain: 'D3',
    options: [
      { label: 'A', text: 'Split the content into multiple files in .claude/rules/, with each file covering a focused topic, and use path-scoped YAML frontmatter to activate rules only for relevant files', correct: true },
      { label: 'B', text: 'Create a separate CLAUDE.md in each top-level package directory and delete the root file entirely' },
      { label: 'C', text: 'Add inline section headers to the monolithic file and use the /memory command to tell Claude which section to prioritize', eliminated: true },
      { label: 'D', text: 'Break the root CLAUDE.md into topic files and use @import directives to pull them all in unconditionally', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "CLAUDE.md", "monorepo", "configuration" → D3 Claude Code Configuration', result: 'Domain: D3 (20%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: "/memory command to tell Claude which section to prioritize" — this is a fabricated command usage; requires manual intervention each session → ELIMINATE. Option D: @import unconditionally loads ALL rules regardless of file type — this is the exact problem (wrong conventions applied to wrong files) → ELIMINATE. Options A and B both survive.', result: '2 eliminated, A and B survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Both reduce the monolithic file. But B deletes the root CLAUDE.md entirely — what about shared conventions across packages? You\'d need to duplicate them. Option A uses .claude/rules/ with path: glob scoping so Python rules only load for .py files, TS rules only for .ts — it solves the "wrong conventions on wrong files" problem directly. Rule 2 (EXPLICIT > IMPLICIT): A\'s path scoping is explicit targeting; B relies on directory-based implicit scoping. Rule 4 (BUILT-IN > CUSTOM): .claude/rules/ is the built-in mechanism for this exact use case.', result: 'A confirmed — path-scoped rules is the built-in solution ✓', color: 'green' },
    ],
    answer: 'A',
    keyLesson: 'The trap here is Option D — @import is a REAL feature, but unconditional import still loads everything, which doesn\'t fix the core problem. Option B works but forces duplication of shared rules. The exam tests whether you know .claude/rules/ with YAML frontmatter path: globs is the PURPOSE-BUILT feature for conditional convention loading. When the built-in mechanism exactly matches the problem → use it.',
  },
  {
    question: '[Q9] The synthesis agent frequently needs to verify specific claims while combining findings. This creates 2-3 round trips per task, increasing latency by 40%. 85% of verifications are simple fact-checks; 15% require deeper investigation. What\'s the most effective approach?',
    domain: 'D2',
    options: [
      { label: 'A', text: 'Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator', correct: true },
      { label: 'B', text: 'Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass' },
      { label: 'C', text: 'Give the synthesis agent access to all web search tools so it can handle any verification need directly', eliminated: true },
      { label: 'D', text: 'Have the web search agent proactively cache extra context around each source during initial research', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "synthesis agent", "tools", "round trips", "verify" → D2 Tool Design (tool distribution across agents)', result: 'Domain: D2 (18%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option C: Giving the synthesis agent ALL web search tools → AP4 (>5 tools per agent), violates least privilege, synthesis agent would misuse search tools instead of synthesizing → ELIMINATE. Option D: Speculative caching is wasteful and unreliable — you can\'t predict what the synthesis agent will need to verify → ELIMINATE. Options A and B both survive.', result: '2 eliminated, A and B survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'The key data point: 85% simple, 15% complex. Option B batches all verifications to the end — this creates a blocking dependency and delays the report. Option A gives a scoped tool for the 85% common case while preserving the coordinator pattern for the 15% complex case. This is surgical tool distribution — the synthesis agent gets JUST what it needs. Rule 3 (ISOLATED > SHARED): A maintains agent isolation while selectively providing the minimal tool needed.', result: 'A confirmed — scoped tool for 85% + delegation for 15% ✓', color: 'green' },
    ],
    answer: 'A',
    keyLesson: 'This question tests whether you fall for the "all or nothing" trap. Option C gives too many tools. Option B gives no tools. The right answer is SCOPED access — a single verify_fact tool for the common case, preserving the full coordinator pattern for edge cases. The 85%/15% split in the question is a deliberate hint: design for the common path, delegate the exception.',
  },
  {
    question: '[Q66] A developer generates a 300-line module using Claude Code in one session, then asks the same session to review the code for bugs. The review returns "looks good" with minor style suggestions but misses two logic errors that a colleague catches in manual review. Most likely cause and fix?',
    domain: 'D5',
    options: [
      { label: 'A', text: 'The context window was too large; limit code generation to smaller chunks', eliminated: true },
      { label: 'B', text: 'The reviewing instance retains reasoning context from generation, making it less likely to question its own decisions. Use a second independent Claude instance without the generation context for review', correct: true },
      { label: 'C', text: 'The review prompt was too vague; adding more explicit review criteria to the same session would catch the errors' },
      { label: 'D', text: 'The model tier used for generation is more capable than review; switch both to the same tier', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "same session", "review", "missed logic errors", "self-review" → D5 + AP3 (same-session self-review)', result: 'Domain: D5 (reliability) — AP3 detected!', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: Context window size has nothing to do with self-review quality — the module is 300 lines, well within limits → ELIMINATE. Option D: "Model tier" difference is a fabricated premise — the question uses the same session → ELIMINATE. Options B and C survive. But wait — the AP3 anti-pattern (same-session self-review) should trigger immediately on reading this question.', result: '2 eliminated, but AP3 should have flagged this instantly', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Option C suggests improving the review prompt IN THE SAME SESSION. But the root cause is self-review bias — the model retains its generation reasoning and won\'t challenge its own logic. No amount of better prompting within the same session fixes this structural problem. Option B uses an independent instance — a fresh context without the generator\'s assumptions. Rule 3 (ISOLATED > SHARED): Independent review instances beat same-session self-review, always.', result: 'B confirmed — isolated review beats same-session ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'Option C is the subtle trap — "add more explicit criteria" sounds like EXPLICIT > IMPLICIT, which would normally be correct! But here, the structural problem (same-session bias) overrides the prompt improvement. This is where knowing Anti-Pattern 3 saves you: same-session self-review is ALWAYS wrong on this exam, regardless of how good the review prompt is. AP3 detection should be instant and override other reasoning.',
  },
  {
    question: '[Q29] You\'ve completed an initial analysis of a competitor\'s public API documentation and want to explore two divergent architectural approaches: one focused on feature parity, one focused on differentiation. You want both explorations to start from the same analysis baseline. Which session management approach?',
    domain: 'D3',
    options: [
      { label: 'A', text: 'Run two separate new sessions, each with a copy of the analysis findings injected as context in the initial prompt' },
      { label: 'B', text: 'Use --resume to resume the current session twice in parallel, once for each exploration direction', eliminated: true },
      { label: 'C', text: 'Use fork_session to create two independent branches from the current session, then explore each approach in its respective branch', correct: true },
      { label: 'D', text: 'Continue in the same session, exploring one approach, then using /compact to clear context before the second approach', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "session management", "divergent approaches", "shared baseline" → D3 Claude Code (Task 1.7: session state, forking)', result: 'Domain: D3 via D1 session management', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option B: --resume continues a single session sequentially, it cannot create parallel branches — this is a fabricated usage → ELIMINATE. Option D: /compact destructively summarizes context — you\'d lose the baseline analysis details before the second exploration → ELIMINATE. Options A and C both survive.', result: '2 eliminated, A and C survive', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Both create independent exploration paths from a baseline. But Option A requires MANUALLY duplicating the analysis context into new sessions — lossy (you\'d need to summarize or copy), error-prone, and doesn\'t preserve live session state (tool results, reasoning trace). Option C uses fork_session which is specifically designed for this: it creates branches that inherit the FULL session state automatically. Rule 4 (BUILT-IN > CUSTOM): fork_session is the built-in mechanism for exactly this use case.', result: 'C confirmed — fork_session preserves full state ✓', color: 'green' },
    ],
    answer: 'C',
    keyLesson: 'This question tests precise knowledge of session management semantics. Option A "works" but is the manual workaround — you\'d lose live session state (tool results, reasoning traces). Option B sounds plausible but --resume doesn\'t support parallel branching. fork_session exists specifically for "explore divergent approaches from a shared baseline" — it\'s the textbook use case. When the built-in tool exactly matches the scenario, always pick it.',
  },
  {
    question: '[Q54] You maintain a monorepo with five packages: a Python backend, a TypeScript frontend, a Go service, shared infrastructure Terraform, and a documentation site. Each package has different conventions. The root CLAUDE.md has grown to 600 lines and rules bleed between packages. What is the most modular and maintainable solution?',
    domain: 'D3',
    options: [
      { label: 'A', text: 'Create a CLAUDE.md in each package directory with that package\'s rules, and use @import in the root CLAUDE.md to include shared conventions that apply to all packages', correct: true },
      { label: 'B', text: 'Keep the 600-line root file but add explicit section headers and instruct developers to tell Claude which section applies at the start of each session', eliminated: true },
      { label: 'C', text: 'Delete the root CLAUDE.md and rely entirely on package-level files, accepting that shared conventions must be duplicated', eliminated: true },
      { label: 'D', text: 'Move all rules into .claude/rules/ files and tag each with a projects: key in their frontmatter specifying which subdirectory applies' },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "monorepo", "CLAUDE.md", "600 lines", "rules bleed" → D3 Claude Code Configuration (Task 3.1: CLAUDE.md hierarchy)', result: 'Domain: D3 (20%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option B: "Instruct developers to tell Claude which section applies" — requires human intervention every session, doesn\'t scale, relies on developers remembering → ELIMINATE. Option C: "Delete root file, accept duplication" — duplication means maintenance drift; shared standards diverge across 5 packages → ELIMINATE. Options A and D both survive — and they look very similar!', result: '2 eliminated, A and D survive — this is the hard part', color: 'red' },
      { step: 'Step 3: Apply Priority Rules', action: 'Option D uses .claude/rules/ with a "projects:" key — but that frontmatter key doesn\'t exist! The actual frontmatter uses "path:" globs, not "projects:". This is a FABRICATED FEATURE trap. Option A uses the real @import mechanism in CLAUDE.md to include shared conventions, with package-level CLAUDE.md files for package-specific rules. The @import keeps shared rules DRY; package files keep specific rules isolated. This matches the documented CLAUDE.md hierarchy exactly.', result: 'A confirmed — @import for shared + package CLAUDE.md ✓', color: 'green' },
    ],
    answer: 'A',
    keyLesson: 'This is one of the hardest D3 questions because Option D is nearly correct — .claude/rules/ with path scoping IS a real feature — but the "projects:" key is fabricated. The real frontmatter uses "path:" with glob patterns, not named project selectors. Distinguishing Q42 (where .claude/rules/ IS the right answer) from Q54 (where @import IS the right answer) requires knowing WHEN to use each: Q42 = wrong conventions applied to wrong FILE TYPES → path-scoped rules. Q54 = shared vs package CONVENTIONS in a monorepo → @import + per-package CLAUDE.md hierarchy.',
  },
]

function HardQuestionWalkthrough({ walkthrough: w, index: wi }: { walkthrough: Walkthrough; index: number }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="border border-purple-200 rounded-lg overflow-hidden bg-purple-50/20">
      {/* Question */}
      <div className="p-3 bg-purple-50 border-b border-purple-200">
        <div className="flex items-start gap-2">
          <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
            {wi + 1}
          </span>
          <div>
            <span className="text-[10px] font-mono text-purple-600 bg-purple-100 rounded px-1.5 py-0.5">{w.domain}</span>
            <p className="text-xs text-[var(--foreground)] mt-1 leading-relaxed">{w.question}</p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-3 space-y-1.5">
        {w.options.map(o => (
          <div
            key={o.label}
            className={cn(
              'rounded-md border p-2 text-xs flex items-start gap-2',
              revealed && o.eliminated && 'bg-red-50 border-red-200 line-through opacity-60',
              revealed && o.correct && 'bg-green-50 border-green-300 ring-2 ring-green-400',
              !revealed && 'border-[var(--border)] bg-white'
            )}
          >
            <span className={cn(
              'font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
              revealed && o.eliminated && 'bg-red-200 text-red-700',
              revealed && o.correct && 'bg-green-600 text-white',
              !revealed && 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            )}>
              {o.label}
            </span>
            <span className={cn(revealed && o.correct && 'font-semibold text-green-900')}>
              {o.text}
            </span>
          </div>
        ))}
      </div>

      {/* Reveal Button / Walkthrough */}
      {!revealed ? (
        <div className="px-3 pb-3">
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Show Step-by-Step Solution
          </button>
        </div>
      ) : (
        <div className="px-3 pb-3 space-y-2">
          <div className="border-t border-purple-200 pt-3">
            <div className="text-xs font-bold text-purple-800 mb-2">Decision Walkthrough:</div>
            {w.steps.map((s, si) => (
              <div key={si} className="flex gap-2 mb-2">
                <div className={cn(
                  'w-1 rounded-full shrink-0',
                  s.color === 'indigo' && 'bg-indigo-400',
                  s.color === 'red' && 'bg-red-400',
                  s.color === 'green' && 'bg-green-400'
                )} />
                <div>
                  <div className="text-[10px] font-bold text-[var(--foreground)]">{s.step}</div>
                  <div className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{s.action}</div>
                  <div className={cn(
                    'text-[10px] font-semibold mt-0.5',
                    s.color === 'indigo' && 'text-indigo-700',
                    s.color === 'red' && 'text-red-700',
                    s.color === 'green' && 'text-green-700'
                  )}>
                    → {s.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
            <div className="text-[10px] font-bold text-amber-800 mb-0.5">Key Lesson:</div>
            <div className="text-[11px] text-amber-900 leading-relaxed">{w.keyLesson}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ====== Main Component ====== */
export function DecisionGuide() {
  const [activeDomain, setActiveDomain] = useState(0)

  return (
    <div className="space-y-0">

      {/* ═══════════════ INTRO: THE 3-STEP ALGORITHM ═══════════════ */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-1">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Brain size={20} className="text-amber-600" /> Decision Engine
        </h2>
        <p className="text-xs text-amber-900 leading-relaxed mb-4">
          Every exam question follows the same decision process. Learn the three steps below,
          then use the per-domain traps to avoid the most common mistakes.
        </p>

        {/* Visual 3-step flow */}
        <div className="flex flex-col items-stretch gap-0">
          {/* Step 1 */}
          <div className="bg-white rounded-lg border-2 border-red-200 p-3 relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">1</span>
              <span className="font-bold text-sm text-red-800">Eliminate Anti-Patterns</span>
              <Filter size={14} className="text-red-400 ml-auto" />
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">
              ~70% of questions have at least one option containing an anti-pattern.
              Scan every option for: prompt-based business rules, NL parsing for control flow,
              same-session review, &gt;5 tools, sentiment-based escalation, single super-agent.
              <strong> If you spot one → cross it out immediately.</strong>
            </p>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-red-200" />
            <ArrowDown size={14} className="text-amber-500 -my-1" />
            <div className="w-px h-3 bg-amber-200" />
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg border-2 border-amber-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">2</span>
              <span className="font-bold text-sm text-amber-800">Apply Priority Rules</span>
              <Search size={14} className="text-amber-400 ml-auto" />
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Usually 2 options survive. Apply rules in order:
              <strong> CODE &gt; PROMPT → EXPLICIT &gt; IMPLICIT → ISOLATED &gt; SHARED → BUILT-IN &gt; CUSTOM.</strong>
              {' '}The first rule that distinguishes between remaining options gives you the answer.
            </p>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-amber-200" />
            <ArrowDown size={14} className="text-green-500 -my-1" />
            <div className="w-px h-3 bg-green-200" />
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg border-2 border-green-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">3</span>
              <span className="font-bold text-sm text-green-800">Verify with Domain Rules</span>
              <Zap size={14} className="text-green-400 ml-auto" />
            </div>
            <p className="text-[11px] text-green-700 leading-relaxed">
              Check your answer against the domain-specific decision rules below.
              Match the question's keywords to the trigger phrases — each maps to exactly one correct pattern.
              If your answer doesn't match → reconsider.
            </p>
          </div>
        </div>
      </div>

      <FlowConnector text="See the full decision tree below" phase="overview" />

      {/* ═══════════════ DECISION SCHEMA TREE ═══════════════ */}
      <Section
        title="Decision Schema Tree"
        icon={<GitBranch size={16} className="text-violet-500" />}
        defaultOpen
        context="This is the complete decision algorithm as a tree. Read top-to-bottom: identify domain → eliminate anti-patterns → apply priority rules → select answer."
      >
        <div className="space-y-0">
          {/* ROOT */}
          <div className="bg-indigo-600 text-white rounded-lg p-3 text-center font-bold text-sm">
            Read the Question
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-indigo-400" /></div>

          {/* STEP 1: IDENTIFY DOMAIN */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-3">
            <div className="text-xs font-bold text-indigo-800 text-center mb-2">Step 1: Identify Domain</div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { d: 'D1', w: '27%', label: 'Agents' },
                { d: 'D3', w: '20%', label: 'Claude Code' },
                { d: 'D4', w: '20%', label: 'Prompting' },
                { d: 'D2', w: '18%', label: 'Tools/MCP' },
                { d: 'D5', w: '15%', label: 'Context' },
              ].map(x => (
                <div key={x.d} className="rounded-md border p-1.5 text-center bg-indigo-50 border-indigo-200 text-indigo-800">
                  <div className="text-[10px] font-bold">{x.d}</div>
                  <div className="text-[9px]">{x.label}</div>
                  <div className="text-[9px] opacity-70">{x.w}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-indigo-200" /></div>

          {/* STEP 2: ELIMINATE ANTI-PATTERNS */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
            <div className="text-xs font-bold text-red-800 text-center mb-2">Step 2: Eliminate Anti-Patterns</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { ap: 'AP1', label: 'Prompt for biz rules?', fix: '→ Hooks' },
                { ap: 'AP2', label: 'NL parsing?', fix: '→ stop_reason' },
                { ap: 'AP3', label: 'Same-session review?', fix: '→ Independent' },
                { ap: 'AP4', label: '>5 tools?', fix: '→ 4-5 max' },
                { ap: 'AP5', label: 'Sentiment escalation?', fix: '→ Explicit criteria' },
                { ap: 'AP6', label: 'Super-agent?', fix: '→ Hub-and-spoke' },
                { ap: 'AP7', label: 'Sequential dump?', fix: '→ Summaries' },
              ].map(x => (
                <div key={x.ap} className="bg-white rounded border border-red-200 p-1.5">
                  <div className="text-[10px] font-bold text-red-700">{x.ap}: {x.label}</div>
                  <div className="text-[9px] text-slate-600 font-medium">{x.fix}</div>
                </div>
              ))}
              <div className="bg-green-50 rounded border border-green-200 p-1.5 flex items-center justify-center">
                <div className="text-[10px] font-bold text-green-700">✓ SURVIVES</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-red-200" /></div>

          {/* STEP 3: PRIORITY RULES */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <div className="text-xs font-bold text-green-800 text-center mb-2">Step 3: Apply Priority Rules (in order)</div>
            <div className="flex flex-col gap-1">
              {[
                { id: 'R1', left: 'Code solution?', right: 'Prompt solution?', pick: 'Pick CODE', color: 'border-green-200' },
                { id: 'R2', left: 'Explicit check?', right: 'Implicit/NL?', pick: 'Pick EXPLICIT', color: 'border-green-200' },
                { id: 'R3', left: 'Isolated context?', right: 'Shared state?', pick: 'Pick ISOLATED', color: 'border-green-200' },
                { id: 'R4', left: 'Built-in/existing?', right: 'Custom-built?', pick: 'Pick BUILT-IN', color: 'border-green-200' },
                { id: 'R5', left: '3AM test', right: 'Needs human?', pick: 'Pick AUTONOMOUS', color: 'border-green-200' },
              ].map((r, i) => (
                <div key={r.id} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-green-800 w-6 shrink-0">{r.id}</span>
                  <div className={cn('flex-1 grid grid-cols-3 gap-1 bg-white rounded border p-1.5', r.color)}>
                    <div className="text-[10px] text-center text-slate-600">{r.left}</div>
                    <div className="text-[10px] text-center font-bold text-green-700">{r.pick}</div>
                    <div className="text-[10px] text-center text-slate-600">{r.right}</div>
                  </div>
                  {i < 4 && <ArrowDown size={10} className="text-slate-300 shrink-0 hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-green-200" /></div>

          {/* RESULT */}
          <div className="bg-green-600 text-white rounded-lg p-3 text-center font-bold text-sm">
            ✓ Select Best Answer
          </div>
        </div>
      </Section>

      <FlowConnector text="Now learn the patterns — anti-patterns show what to eliminate" phase="eliminate" />

      {/* ═══════════════ 7 ANTI-PATTERNS ═══════════════ */}
      <Section
        title="7 Anti-Patterns: Always Eliminate"
        icon={<XCircle size={16} className="text-red-500" />}
        defaultOpen
        context="These are the ELIMINATION tool. If you spot any of these patterns in an answer option → eliminate it immediately. Each card shows: the trap wording, the correct replacement, and why students fall for it."
      >
        <div className="space-y-3">
          {antiPatterns.map(ap => {
            const relatedScenarios = scenarios.filter(s => ap.scenarioIds.includes(s.id))
            const relatedRules = priorityRules.filter(r => ap.relatedRuleIds.includes(r.id))
            return (
              <div key={ap.id} className="border border-red-200 rounded-lg overflow-hidden bg-red-50/30">
                <div className="p-3">
                  <div className="font-semibold text-sm text-red-800 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {ap.id}. {ap.name}
                  </div>
                  <div className="mt-1.5 text-xs text-slate-700"><strong>Trap:</strong> {ap.trap}</div>
                  <div className="mt-1 text-xs text-slate-600"><strong>Fix:</strong> {ap.fix}</div>
                  <div className="mt-1 text-xs text-slate-500"><strong>Why it fools you:</strong> {ap.whyItFools}</div>
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {ap.domains.map(d => (
                    <span key={d} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                  ))}
                  {relatedScenarios.map(s => (
                    <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">Scenario {s.id}: {s.name}</span>
                  ))}
                  {relatedRules.map(r => (
                    <span key={r.id} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">Rule: {r.rule}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <FlowConnector text="After eliminating, use priority rules to pick between survivors" phase="rules" />

      {/* ═══════════════ 5 PRIORITY RULES ═══════════════ */}
      <Section
        title="5 Priority Rules: Choose the Best Survivor"
        icon={<CheckCircle size={16} className="text-green-500" />}
        context="After eliminating anti-pattern options, you often have 2 survivors. Apply rules in order (1→5) — the first rule that distinguishes between options gives you the answer."
      >
        <div className="space-y-3">
          {priorityRules.map((r, idx) => {
            const relatedScenarios = scenarios.filter(s => r.scenarioIds.includes(s.id))
            return (
              <div key={r.id}>
                <div key={r.id} className="border border-green-200 rounded-lg overflow-hidden bg-green-50/30">
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-green-800 font-mono font-bold text-sm whitespace-nowrap">Rule {r.id}:</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-green-900">{r.rule}</div>
                        <div className="text-xs text-green-700 mt-0.5">{r.short}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1"><strong>Example:</strong> {r.example}</div>
                        <div className="text-xs text-slate-500 mt-1"><strong>When to apply:</strong> {r.whenToApply}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {r.domains.map(d => (
                      <span key={d} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                    ))}
                    {relatedScenarios.map(s => (
                      <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">Scenario {s.id}: {s.name}</span>
                    ))}
                  </div>
                </div>
                {idx < priorityRules.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown size={12} className="text-green-300" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <FlowConnector text="Next, verify your answer against domain-specific decision rules" phase="domain" />

      {/* ═══════════════ PER-DOMAIN DECISION RULES + TRAPS ═══════════════ */}
      <Section
        title="Domain Decision Rules & Exam Traps"
        icon={<Target size={16} className="text-indigo-500" />}
        defaultOpen
        context="Each domain has specific trigger phrases that map to exactly one correct answer. The exam traps show common wrong answers that sound plausible. Source: claudecertificationguide.com"
      >
        {/* Domain Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-[var(--border)]">
          {domainQuickRefs.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDomain(i)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                activeDomain === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              )}
            >
              {d.domain.split(' — ')[0]}
              <span className="ml-1 opacity-70">{d.weight}</span>
            </button>
          ))}
        </div>

        {/* Active Domain Content */}
        {(() => {
          const d = domainQuickRefs[activeDomain]
          return (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[var(--foreground)]">{d.domain}</h3>

              {/* Decision Rules Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Search size={12} /> When you see this in the question...
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-2 border border-slate-200 text-xs text-slate-700">If the question mentions...</th>
                        <th className="text-left p-2 border border-slate-200 text-xs text-slate-700">The answer is...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.decisionRules.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                          <td className="p-2 border border-slate-100 text-xs font-medium text-slate-900">{r.trigger}</td>
                          <td className="p-2 border border-slate-100 text-xs text-[var(--foreground)]">{r.answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exam Traps */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={12} /> Common exam traps for this domain
                </h4>
                <div className="space-y-2">
                  {d.examTraps.map((t, i) => (
                    <div key={i} className="flex gap-2 bg-red-50 rounded-lg p-2.5 border border-red-200">
                      <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{t.trap}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Why it's wrong: {t.why}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </Section>

      <FlowConnector text="Use scenarios to practice applying the full algorithm" phase="practice" />

      {/* ═══════════════ 6 SCENARIOS ═══════════════ */}
      <Section
        title="6 Exam Scenarios (4 randomly selected)"
        icon={<BookOpenCheck size={16} className="text-blue-500" />}
        context="The exam randomly picks 4 of these 6 scenarios. Each provides a real-world context with ~15 questions. Cross-references show which anti-patterns appear as wrong answers and which rules decide the correct answer."
      >
        <div className="space-y-3">
          {scenarios.map(s => {
            const sAntiPatterns = antiPatterns.filter(ap => s.antiPatternIds.includes(ap.id))
            const sRules = priorityRules.filter(r => s.ruleIds.includes(r.id))
            return (
              <div key={s.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="p-3">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{s.id}</span>
                    {s.name}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5">{s.description}</p>
                  <p className="text-xs text-slate-600 mt-1"><strong>What to expect:</strong> {s.whatToExpect}</p>
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {s.domains.map(d => (
                    <span key={d} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                  ))}
                  {s.keyPatterns.map(k => (
                    <span key={k} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{k}</span>
                  ))}
                </div>
                <div className="px-3 pb-3 space-y-1">
                  {sAntiPatterns.length > 0 && (
                    <div className="text-[10px] text-slate-500 flex items-start gap-1">
                      <span className="font-semibold shrink-0">⚠ Common traps:</span>
                      <span>{sAntiPatterns.map(ap => `AP${ap.id}: ${ap.name}`).join(' · ')}</span>
                    </div>
                  )}
                  {sRules.length > 0 && (
                    <div className="text-[10px] text-slate-500 flex items-start gap-1">
                      <span className="font-semibold shrink-0">✓ Deciding rules:</span>
                      <span>{sRules.map(r => r.rule).join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <FlowConnector text="Finally, memorize these facts and quick-reference tables" phase="memorize" />

      {/* ═══════════════ KEY FACTS ═══════════════ */}
      <Section
        title="Key Technical Facts"
        icon={<Lightbulb size={16} className="text-yellow-500" />}
        context="Some exam questions test raw recall. These facts appear most frequently."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--muted)]">
                <th className="text-left p-2 border border-[var(--border)]">Concept</th>
                <th className="text-left p-2 border border-[var(--border)]">Key Fact</th>
                <th className="text-left p-2 border border-[var(--border)] w-12">Domain</th>
              </tr>
            </thead>
            <tbody>
              {technicalFacts.map(f => (
                <tr key={f.concept}>
                  <td className="p-2 border border-[var(--border)] font-mono text-xs font-semibold whitespace-nowrap">{f.concept}</td>
                  <td className="p-2 border border-[var(--border)] text-xs">{f.fact}</td>
                  <td className="p-2 border border-[var(--border)] text-xs font-mono text-center">{f.domain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ═══════════════ CHEAT SHEET ═══════════════ */}
      <div className="mt-4">
        <Section
          title="Cheat Sheet: When Stuck Between 2 Answers"
          context="When you've eliminated 2 answers and are stuck between the remaining 2, scan this table."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--muted)]">
                  <th className="text-left p-2 border border-[var(--border)]">If one uses...</th>
                  <th className="text-left p-2 border border-[var(--border)]">And the other uses...</th>
                  <th className="text-left p-2 border border-[var(--border)]">Pick</th>
                  <th className="text-left p-2 border border-[var(--border)]">Rule</th>
                </tr>
              </thead>
              <tbody>
                {cheatSheet.map((c, i) => {
                  const rule = priorityRules.find(r => r.id === c.ruleId)
                  return (
                    <tr key={i}>
                      <td className="p-2 border border-[var(--border)] text-xs">{c.optionA}</td>
                      <td className="p-2 border border-[var(--border)] text-xs">{c.optionB}</td>
                      <td className="p-2 border border-[var(--border)] text-xs font-semibold text-green-700">{c.pick}</td>
                      <td className="p-2 border border-[var(--border)] text-[10px] font-mono text-slate-500">{rule?.rule}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* ═══════════════ TRAP PATTERNS ═══════════════ */}
      <div className="mt-4">
        <Section
          title="Trap Answer Patterns"
          icon={<ShieldAlert size={16} className="text-red-500" />}
          context="Fabricated features (options that don't exist) and always-wrong triggers. Memorize for instant elimination."
        >
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <h4 className="text-xs font-semibold text-red-800 mb-2">Fabricated Features (don't exist)</h4>
              <div className="space-y-1.5">
                {fabricatedFeatures.map((f, i) => (
                  <div key={i} className="text-xs">
                    <code className="text-red-700 font-semibold">{f.name}</code>
                    <div className="text-red-600 mt-0.5">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <h4 className="text-xs font-semibold text-red-800 mb-2">Always-Wrong Triggers</h4>
              <div className="space-y-1.5">
                {trapTriggers.map((t, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-red-700 font-semibold">{t.pattern}</span>
                    <div className="text-red-600 mt-0.5">{t.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <FlowConnector text="See the algorithm in action on tricky questions" phase="challenge" />

      {/* ═══════════════ HARD WALKTHROUGH QUESTIONS ═══════════════ */}
      <div className="mt-0">
        <Section
          title="Decision Walkthroughs: When Elimination Isn't Enough"
          icon={<HelpCircle size={16} className="text-purple-500" />}
          defaultOpen
          context="These are the trickiest question types where multiple answers look correct. Each walkthrough shows exactly how to apply the 3-step algorithm to arrive at the right answer."
        >
          <div className="space-y-5">
            {hardWalkthroughs.map((w, wi) => (
              <HardQuestionWalkthrough key={wi} walkthrough={w} index={wi} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
