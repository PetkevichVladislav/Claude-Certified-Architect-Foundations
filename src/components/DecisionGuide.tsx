import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import {
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Brain, Target, BookOpenCheck, Lightbulb, ShieldAlert, ArrowDown,
  Zap, Search, Filter, GitBranch, HelpCircle, ExternalLink
} from 'lucide-react'
import { antiPatterns } from '@/data/antipatterns'
import type { Evidence } from '@/data/antipatterns'
import { priorityRules } from '@/data/rules'
import { scenarios } from '@/data/scenarios'
import {
  technicalFacts, cheatSheet, fabricatedFeatures, trapTriggers,
  domainQuickRefs
} from '@/data/facts'

/* ====== Evidence Tooltip ====== */
function EvidenceLink({ evidence }: { evidence?: Evidence[] }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  if (!evidence || evidence.length === 0) return null

  // Position the popup above the button
  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.top, left: r.left })
  }, [])

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return
    updatePos()
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    const handleScroll = () => setOpen(false)
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, updatePos])

  return (
    <span className="inline-block ml-1 align-middle">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="inline-flex items-center gap-0.5 text-[0.625rem] text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 py-0 hover:bg-blue-100 transition-colors cursor-pointer font-medium"
        aria-label="View evidence source"
      >
        <ExternalLink size={9} />
        <span>src</span>
      </button>
      {open && createPortal(
        <div
          ref={popupRef}
          className="w-72 bg-white border border-blue-200 rounded-lg shadow-lg p-2 space-y-1.5"
          style={{
            position: 'fixed',
            zIndex: 99999,
            top: pos.top,
            left: pos.left,
            transform: 'translateY(calc(-100% - 6px))',
          }}
        >
          <div className="text-[0.625rem] font-bold text-blue-800 mb-1">Evidence Sources:</div>
          {evidence.map((e, i) => (
            <a
              key={i}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 text-[0.625rem] text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded p-1 transition-colors"
              onClick={(ev) => ev.stopPropagation()}
            >
              <ExternalLink size={10} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{e.title}</span>
            </a>
          ))}
        </div>,
        document.body
      )}
    </span>
  )
}

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
function FlowConnector({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-px h-4 bg-gradient-to-b from-transparent to-indigo-300" />
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5">
        <ArrowDown size={12} className="text-indigo-500" />
        <span className="text-[0.6875rem] text-indigo-700 font-medium">{text}</span>
      </div>
      <div className="w-px h-4 bg-gradient-to-b from-indigo-300 to-transparent" />
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
    question: 'A customer service agent sometimes processes refunds for amounts over $10,000 without human approval. The system uses a prompt instruction: "Always escalate refunds over $10,000 to a human." What is the best fix?',
    domain: 'D1',
    options: [
      { label: 'A', text: 'Add "CRITICAL:" prefix to the prompt instruction for emphasis', eliminated: true },
      { label: 'B', text: 'Implement a PostToolUse hook that blocks refund execution when amount > $10,000 and routes to human queue', correct: true },
      { label: 'C', text: 'Add few-shot examples showing correct escalation behavior', eliminated: true },
      { label: 'D', text: 'Increase the model temperature to make it follow instructions more carefully', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "agent", "escalation", "human approval" → D1 Agentic Architecture', result: 'Domain: D1 (27%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: Still a prompt instruction (probabilistic) — AP1 Prompt for biz rules → ELIMINATE. Option C: Few-shot examples are training, not enforcement — AP1 → ELIMINATE. Option D: Temperature doesn\'t affect instruction compliance — fabricated concept → ELIMINATE.', result: '3 eliminated, B and... only B survives', color: 'red' },
      { step: 'Step 3: Verify', action: 'D1 decision rule: "guaranteed / must always / enforce" → Hooks. PostToolUse hook is deterministic enforcement — cannot be bypassed by prompt injection.', result: 'B confirmed ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'When the question says "must always" or "guaranteed" — the answer is ALWAYS hooks (deterministic code), never prompt instructions (probabilistic). This is Rule 1: CODE > PROMPT.',
  },
  {
    question: 'A document extraction pipeline produces JSON output that occasionally has malformed fields. The team wants guaranteed schema compliance. Which approach is best?',
    domain: 'D4',
    options: [
      { label: 'A', text: 'Add a system prompt: "Always output valid JSON matching this schema: {...}"', eliminated: true },
      { label: 'B', text: 'Use tool_choice: any to force the model to call a tool', eliminated: true },
      { label: 'C', text: 'Define an extract_data tool with the required schema and use tool_choice: { type: "tool", name: "extract_data" }', correct: true },
      { label: 'D', text: 'Add 10 few-shot examples showing the correct JSON format', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "schema compliance", "JSON output", "structured output" → D4 Prompt Engineering & Structured Output', result: 'Domain: D4 (20%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: Prompt-based JSON = no schema enforcement (AP1 variant) → ELIMINATE. Option B: tool_choice: any forces A tool, not a SPECIFIC tool — no schema guarantee → ELIMINATE. Option D: "10+ examples" — exam trap, 2-4 is sweet spot, and examples still don\'t guarantee schema → ELIMINATE.', result: '3 eliminated, C survives', color: 'red' },
      { step: 'Step 3: Verify', action: 'D4 decision rule: "guaranteed schema compliance" → Forced tool_choice with specific tool. Option C matches exactly. D4 trap confirms: "Use prompt-based JSON for production" = WRONG.', result: 'C confirmed ✓', color: 'green' },
    ],
    answer: 'C',
    keyLesson: 'tool_choice: any ≠ tool_choice: tool. "any" forces some tool call, but "tool" with a specific name guarantees the exact schema. Also: don\'t confuse "add more examples" with actual enforcement.',
  },
  {
    question: 'A multi-agent system has a coordinator that delegates research tasks to 3 specialist agents. The specialists are returning redundant, overlapping information because they can see each other\'s previous findings. How should this be fixed?',
    domain: 'D1',
    options: [
      { label: 'A', text: 'Add a prompt instruction telling each specialist to avoid repeating what others found', eliminated: true },
      { label: 'B', text: 'Ensure each specialist runs in its own isolated context with only the coordinator passing relevant task descriptions', correct: true },
      { label: 'C', text: 'Reduce the number of specialists to 1 agent with all research tools', eliminated: true },
      { label: 'D', text: 'Use a shared memory store so specialists can check what\'s already been found', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "multi-agent", "coordinator", "specialists", "context" → D1 Agentic Architecture', result: 'Domain: D1 (27%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: Prompt instruction for coordination = probabilistic (AP1) → ELIMINATE. Option C: 1 agent with all tools = super-agent anti-pattern (AP6), also violates 4-5 tool limit (AP4) → ELIMINATE. Option D: Shared memory store = shared state, and D1 explicitly says "subagents do not share memory" → ELIMINATE.', result: '3 eliminated, B survives', color: 'red' },
      { step: 'Step 3: Verify', action: 'D1 decision rule: "share context between agents" → Explicit passing. D1 trap confirms: "Subagents can read the coordinator\'s context" = WRONG. Rule 3 (ISOLATED > SHARED) applies — isolated context per specialist is correct.', result: 'B confirmed ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'Option D is the hardest to eliminate — "shared memory" sounds efficient but violates ISOLATED > SHARED (Rule 3) and the fundamental constraint that subagents have no shared memory.',
  },
  {
    question: 'Claude Code keeps selecting the wrong tool when given 8 available tools. Developers want to fix this. What should they try first?',
    domain: 'D2',
    options: [
      { label: 'A', text: 'Remove 4 tools to get down to 4 total', eliminated: true },
      { label: 'B', text: 'Rewrite tool descriptions to clearly state what each tool does, its expected inputs, return shape, and boundary conditions', correct: true },
      { label: 'C', text: 'Set tool_priority: ordered to control selection sequence', eliminated: true },
      { label: 'D', text: 'Add tool_choice: auto to every request', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "wrong tool", "tool selection", "available tools" → D2 Tool Design & MCP', result: 'Domain: D2 (18%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: "Reduce tools to fix misselection" is an explicit D2 exam trap — wrong FIRST step → ELIMINATE. Option C: tool_priority: ordered is a fabricated feature (doesn\'t exist) → ELIMINATE. Option D: tool_choice: auto is the default — adding it changes nothing → ELIMINATE.', result: '3 eliminated, B survives', color: 'red' },
      { step: 'Step 3: Verify', action: 'D2 decision rule: "Claude keeps picking the wrong tool" → Improve tool descriptions first. D2 schema rules: include what it does, inputs, outputs, boundaries, example queries. Option B matches exactly.', result: 'B confirmed ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'Option A is the trap — reducing tools DOES help, but it\'s not the FIRST step. The optimization sequence is: improve descriptions → add examples → THEN consolidate tools. Also, tool_priority: ordered doesn\'t exist.',
  },
  {
    question: 'A long-running customer support conversation (50+ messages) starts losing important details like customer IDs and order numbers. The team suggested having Claude progressively summarize earlier parts of the conversation. Is this the right approach?',
    domain: 'D5',
    options: [
      { label: 'A', text: 'Yes, progressive summarization is the standard approach for long conversations', eliminated: true },
      { label: 'B', text: 'No — extract critical facts (IDs, amounts, dates) into a persistent structured block that is carried forward verbatim, never summarized', correct: true },
      { label: 'C', text: 'Increase the context window size to fit the entire conversation', eliminated: true },
      { label: 'D', text: 'No — start a fresh conversation every 20 messages and tell the user to repeat their issue', eliminated: true },
    ],
    steps: [
      { step: 'Step 1: Identify Domain', action: 'Keywords: "long conversation", "losing details", "context" → D5 Context Management & Reliability', result: 'Domain: D5 (15%)', color: 'indigo' },
      { step: 'Step 2: Eliminate', action: 'Option A: "Summarise to save context" is explicit D5 exam trap — summarization LOSEES specifics → ELIMINATE. Option C: "Increase context window" is an always-wrong trigger → ELIMINATE. Option D: Restarting and asking user to repeat = terrible UX and no data preservation → ELIMINATE.', result: '3 eliminated, B survives', color: 'red' },
      { step: 'Step 3: Verify', action: 'D5 decision rule: "details lost over long conversation" → Persistent fact blocks, not progressive summarisation. B describes exactly this pattern — extract concrete facts, carry forward verbatim.', result: 'B confirmed ✓', color: 'green' },
    ],
    answer: 'B',
    keyLesson: 'Progressive summarization is the #1 D5 trap. It sounds like best practice but LOSES specific details. The correct pattern is persistent structured fact blocks — exact values preserved, never paraphrased.',
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
            <span className="text-[0.625rem] font-mono text-purple-600 bg-purple-100 rounded px-1.5 py-0.5">{w.domain}</span>
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
              'font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[0.625rem]',
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
                  <div className="text-[0.625rem] font-bold text-[var(--foreground)]">{s.step}</div>
                  <div className="text-[0.6875rem] text-[var(--muted-foreground)] leading-relaxed">{s.action}</div>
                  <div className={cn(
                    'text-[0.625rem] font-semibold mt-0.5',
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
            <div className="text-[0.625rem] font-bold text-amber-800 mb-0.5">Key Lesson:</div>
            <div className="text-[0.6875rem] text-amber-900 leading-relaxed">{w.keyLesson}</div>
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
            <p className="text-[0.6875rem] text-red-700 leading-relaxed">
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
            <p className="text-[0.6875rem] text-amber-700 leading-relaxed">
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
            <p className="text-[0.6875rem] text-green-700 leading-relaxed">
              Check your answer against the domain-specific decision rules below.
              Match the question's keywords to the trigger phrases — each maps to exactly one correct pattern.
              If your answer doesn't match → reconsider.
            </p>
          </div>
        </div>
      </div>

      <FlowConnector text="See the full decision tree below" />

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
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-3">
            <div className="text-xs font-bold text-indigo-800 text-center mb-2">Step 1: Identify Domain</div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { d: 'D1', w: '27%', label: 'Agents', color: 'bg-violet-100 border-violet-300 text-violet-800' },
                { d: 'D3', w: '20%', label: 'Claude Code', color: 'bg-sky-100 border-sky-300 text-sky-800' },
                { d: 'D4', w: '20%', label: 'Prompting', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                { d: 'D2', w: '18%', label: 'Tools/MCP', color: 'bg-amber-100 border-amber-300 text-amber-800' },
                { d: 'D5', w: '15%', label: 'Context', color: 'bg-rose-100 border-rose-300 text-rose-800' },
              ].map(x => (
                <div key={x.d} className={cn('rounded-md border p-1.5 text-center', x.color)}>
                  <div className="text-[0.625rem] font-bold">{x.d}</div>
                  <div className="text-[0.5625rem]">{x.label}</div>
                  <div className="text-[0.5625rem] opacity-70">{x.w}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-indigo-300" /></div>

          {/* STEP 2: ELIMINATE ANTI-PATTERNS */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
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
                  <div className="text-[0.625rem] font-bold text-red-700">{x.ap}: {x.label}</div>
                  <div className="text-[0.5625rem] text-green-700 font-medium">{x.fix}</div>
                </div>
              ))}
              <div className="bg-green-100 rounded border border-green-300 p-1.5 flex items-center justify-center">
                <div className="text-[0.625rem] font-bold text-green-700">✓ SURVIVES</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-red-300" /></div>

          {/* STEP 3: PRIORITY RULES */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
            <div className="text-xs font-bold text-green-800 text-center mb-2">Step 3: Apply Priority Rules (in order)</div>
            <div className="flex flex-col gap-1">
              {[
                { id: 'R1', left: 'Code solution?', right: 'Prompt solution?', pick: 'Pick CODE', color: 'border-green-400' },
                { id: 'R2', left: 'Explicit check?', right: 'Implicit/NL?', pick: 'Pick EXPLICIT', color: 'border-green-300' },
                { id: 'R3', left: 'Isolated context?', right: 'Shared state?', pick: 'Pick ISOLATED', color: 'border-green-300' },
                { id: 'R4', left: 'Built-in/existing?', right: 'Custom-built?', pick: 'Pick BUILT-IN', color: 'border-green-200' },
                { id: 'R5', left: '3AM test', right: 'Needs human?', pick: 'Pick AUTONOMOUS', color: 'border-green-200' },
              ].map((r, i) => (
                <div key={r.id} className="flex items-center gap-1.5">
                  <span className="text-[0.625rem] font-mono font-bold text-green-800 w-6 shrink-0">{r.id}</span>
                  <div className={cn('flex-1 grid grid-cols-3 gap-1 bg-white rounded border p-1.5', r.color)}>
                    <div className="text-[0.625rem] text-center text-red-600">{r.left}</div>
                    <div className="text-[0.625rem] text-center font-bold text-green-700">{r.pick}</div>
                    <div className="text-[0.625rem] text-center text-red-600">{r.right}</div>
                  </div>
                  {i < 4 && <ArrowDown size={10} className="text-green-300 shrink-0 hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center"><div className="w-px h-4 bg-green-300" /></div>

          {/* RESULT */}
          <div className="bg-green-600 text-white rounded-lg p-3 text-center font-bold text-sm">
            ✓ Select Best Answer
          </div>
        </div>
      </Section>

      <FlowConnector text="Now learn the patterns — anti-patterns show what to eliminate" />

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
                    <EvidenceLink evidence={ap.evidence} />
                  </div>
                  <div className="mt-1.5 text-xs text-red-700"><strong>Trap:</strong> {ap.trap}</div>
                  <div className="mt-1 text-xs text-green-700"><strong>Fix:</strong> {ap.fix}</div>
                  <div className="mt-1 text-xs text-amber-700"><strong>Why it fools you:</strong> {ap.whyItFools}</div>
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {ap.domains.map(d => (
                    <span key={d} className="text-[0.625rem] bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                  ))}
                  {relatedScenarios.map(s => (
                    <span key={s.id} className="text-[0.625rem] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">Scenario {s.id}: {s.name}</span>
                  ))}
                  {relatedRules.map(r => (
                    <span key={r.id} className="text-[0.625rem] bg-green-100 text-green-700 rounded px-1.5 py-0.5">Rule: {r.rule}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <FlowConnector text="After eliminating, use priority rules to pick between survivors" />

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
                <div className="border border-green-200 rounded-lg overflow-hidden bg-green-50/30">
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-green-800 font-mono font-bold text-sm whitespace-nowrap">Rule {r.id}:</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-green-900">{r.rule}</div>
                        <div className="text-xs text-green-700 mt-0.5">{r.short} <EvidenceLink evidence={r.evidence} /></div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1"><strong>Example:</strong> {r.example}</div>
                        <div className="text-xs text-amber-700 mt-1"><strong>When to apply:</strong> {r.whenToApply}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {r.domains.map(d => (
                      <span key={d} className="text-[0.625rem] bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                    ))}
                    {relatedScenarios.map(s => (
                      <span key={s.id} className="text-[0.625rem] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">Scenario {s.id}: {s.name}</span>
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

      <FlowConnector text="Next, verify your answer against domain-specific decision rules" />

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
                <h4 className="text-xs font-semibold text-indigo-800 mb-2 flex items-center gap-1.5">
                  <Search size={12} /> When you see this in the question...
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="text-left p-2 border border-indigo-200 text-xs text-indigo-700">If the question mentions...</th>
                        <th className="text-left p-2 border border-indigo-200 text-xs text-indigo-700">The answer is...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.decisionRules.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}>
                          <td className="p-2 border border-indigo-100 text-xs font-medium text-indigo-900">{r.trigger}</td>
                          <td className="p-2 border border-indigo-100 text-xs text-[var(--foreground)]">
                            {r.answer}
                            <EvidenceLink evidence={r.evidence} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exam Traps */}
              <div>
                <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={12} /> Common exam traps for this domain
                </h4>
                <div className="space-y-2">
                  {d.examTraps.map((t, i) => (
                    <div key={i} className="flex gap-2 bg-red-50 rounded-lg p-2.5 border border-red-200">
                      <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-red-800">
                          {t.trap}
                          <EvidenceLink evidence={t.evidence} />
                        </div>
                        <div className="text-[0.6875rem] text-red-600 mt-0.5">Why it's wrong: {t.why}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </Section>

      <FlowConnector text="Use scenarios to practice applying the full algorithm" />

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
                  <p className="text-xs text-amber-700 mt-1"><strong>What to expect:</strong> {s.whatToExpect}</p>
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {s.domains.map(d => (
                    <span key={d} className="text-[0.625rem] bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 font-mono font-semibold">{d}</span>
                  ))}
                  {s.keyPatterns.map(k => (
                    <span key={k} className="text-[0.625rem] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{k}</span>
                  ))}
                </div>
                <div className="px-3 pb-3 space-y-1">
                  {sAntiPatterns.length > 0 && (
                    <div className="text-[0.625rem] text-red-700 flex items-start gap-1">
                      <span className="font-semibold shrink-0">⚠ Common traps:</span>
                      <span>{sAntiPatterns.map(ap => `AP${ap.id}: ${ap.name}`).join(' · ')}</span>
                    </div>
                  )}
                  {sRules.length > 0 && (
                    <div className="text-[0.625rem] text-green-700 flex items-start gap-1">
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

      <FlowConnector text="Finally, memorize these facts and quick-reference tables" />

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
                  <td className="p-2 border border-[var(--border)] text-xs">
                    {f.fact}
                    <EvidenceLink evidence={f.evidence} />
                  </td>
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
                      <td className="p-2 border border-[var(--border)] text-[0.625rem] font-mono text-indigo-600">{rule?.rule}</td>
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
                    <EvidenceLink evidence={f.evidence} />
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
                    <EvidenceLink evidence={t.evidence} />
                    <div className="text-red-600 mt-0.5">{t.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <FlowConnector text="See the algorithm in action on hard questions" />

      {/* ═══════════════ HARD WALKTHROUGH QUESTIONS ═══════════════ */}
      <div className="mt-0">
        <Section
          title="Hard Questions: Step-by-Step Walkthroughs"
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
