import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'

/* ====== Types ====== */
interface TreeNode {
  id: string
  label: string
  sublabel?: string
  type: 'root' | 'decision' | 'action' | 'eliminate' | 'success' | 'domain' | 'rule' | 'subtree'
  children?: TreeNode[]
  expanded?: boolean
  domains?: string[]  // which domains this anti-pattern applies to
}

/* ====== Color Map ====== */
const nodeColors: Record<TreeNode['type'], { bg: string; border: string; text: string; ring: string }> = {
  root:      { bg: 'bg-indigo-600',  border: 'border-indigo-700',  text: 'text-white',       ring: 'ring-indigo-300' },
  decision:  { bg: 'bg-amber-50',    border: 'border-amber-400',   text: 'text-amber-900',   ring: 'ring-amber-200' },
  action:    { bg: 'bg-blue-50',     border: 'border-blue-300',    text: 'text-blue-900',    ring: 'ring-blue-200' },
  eliminate: { bg: 'bg-red-50',      border: 'border-red-400',     text: 'text-red-800',     ring: 'ring-red-200' },
  success:   { bg: 'bg-green-500',   border: 'border-green-600',   text: 'text-white',       ring: 'ring-green-300' },
  domain:    { bg: 'bg-violet-50',   border: 'border-violet-300',  text: 'text-violet-900',  ring: 'ring-violet-200' },
  rule:      { bg: 'bg-emerald-50',  border: 'border-emerald-400', text: 'text-emerald-900', ring: 'ring-emerald-200' },
  subtree:   { bg: 'bg-slate-50',    border: 'border-slate-300',   text: 'text-slate-800',   ring: 'ring-slate-200' },
}

/* ====== The Full Decision Tree Data ====== */
const masterTree: TreeNode = {
  id: 'start',
  label: 'Read the Question',
  type: 'root',
  children: [
    {
      id: 'step1',
      label: 'STEP 1: Identify Domain',
      type: 'decision',
      children: [
        {
          id: 'd1',
          label: 'D1 — Agents (27%)',
          sublabel: 'orchestration, loops, multi-agent, hooks',
          type: 'domain',
          children: [
            { id: 'd1-kw1', label: 'agentic loop → stop_reason', type: 'action' },
            { id: 'd1-kw2', label: 'multi-agent → hub-and-spoke', type: 'action' },
            { id: 'd1-kw3', label: 'guaranteed → hooks', type: 'action' },
            { id: 'd1-kw4', label: 'escalation → explicit criteria', type: 'action' },
            { id: 'd1-kw5', label: 'subagent context → explicit passing', type: 'action' },
          ],
        },
        {
          id: 'd2',
          label: 'D2 — Tools/MCP (18%)',
          sublabel: 'descriptions, schema, tool_choice, MCP',
          type: 'domain',
          children: [
            { id: 'd2-kw1', label: 'wrong tool → improve descriptions', type: 'action' },
            { id: 'd2-kw2', label: 'guaranteed output → forced tool_choice', type: 'action' },
            { id: 'd2-kw3', label: 'empty results → valid (accept)', type: 'action' },
            { id: 'd2-kw4', label: 'custom MCP → community first', type: 'action' },
            { id: 'd2-kw5', label: 'too many tools → 4-5 per agent', type: 'action' },
          ],
        },
        {
          id: 'd3',
          label: 'D3 — Claude Code (20%)',
          sublabel: 'CLAUDE.md, rules/, skills, hooks, -p flag',
          type: 'domain',
          children: [
            { id: 'd3-kw1', label: 'cannot bypass → hooks', type: 'action' },
            { id: 'd3-kw2', label: 'file-specific → .claude/rules/', type: 'action' },
            { id: 'd3-kw3', label: 'CI/CD → -p flag', type: 'action' },
            { id: 'd3-kw4', label: 'reusable workflow → skills', type: 'action' },
            { id: 'd3-kw5', label: 'code review → independent session', type: 'action' },
          ],
        },
        {
          id: 'd4',
          label: 'D4 — Prompting (20%)',
          sublabel: 'few-shot, chaining, tool_use, batch API',
          type: 'domain',
          children: [
            { id: 'd4-kw1', label: 'schema compliance → forced tool_choice', type: 'action' },
            { id: 'd4-kw2', label: 'fabrication → nullable fields', type: 'action' },
            { id: 'd4-kw3', label: 'validation fail → retry + error feedback', type: 'action' },
            { id: 'd4-kw4', label: '50% cost → Batch API', type: 'action' },
            { id: 'd4-kw5', label: 'self-review → separate instance', type: 'action' },
          ],
        },
        {
          id: 'd5',
          label: 'D5 — Context (15%)',
          sublabel: 'fact blocks, scratchpad, validation, errors',
          type: 'domain',
          children: [
            { id: 'd5-kw1', label: 'lost details → persistent fact blocks', type: 'action' },
            { id: 'd5-kw2', label: 'context reset → scratchpad files', type: 'action' },
            { id: 'd5-kw3', label: 'sources disagree → annotate both', type: 'action' },
            { id: 'd5-kw4', label: '95% accuracy → stratified validation', type: 'action' },
            { id: 'd5-kw5', label: 'contradicts self → fresh start', type: 'action' },
          ],
        },
      ],
    },
    {
      id: 'step2',
      label: 'STEP 2: Eliminate Anti-Patterns',
      type: 'decision',
      children: [
        {
          id: 'ap1',
          label: 'AP1: Prompt for biz rules?',
          type: 'subtree',
          domains: ['D1', 'D4'],
          children: [
            { id: 'ap1-y', label: '✗ ELIMINATE', sublabel: 'Fix: Use hooks / code guards', type: 'eliminate' },
            { id: 'ap1-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap2',
          label: 'AP2: NL parsing for control?',
          type: 'subtree',
          domains: ['D1', 'D5'],
          children: [
            { id: 'ap2-y', label: '✗ ELIMINATE', sublabel: 'Fix: Check stop_reason', type: 'eliminate' },
            { id: 'ap2-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap3',
          label: 'AP3: Same-session review?',
          type: 'subtree',
          domains: ['D1', 'D3', 'D5'],
          children: [
            { id: 'ap3-y', label: '✗ ELIMINATE', sublabel: 'Fix: Independent instance', type: 'eliminate' },
            { id: 'ap3-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap4',
          label: 'AP4: >5 tools on one agent?',
          type: 'subtree',
          domains: ['D1', 'D2'],
          children: [
            { id: 'ap4-y', label: '✗ ELIMINATE', sublabel: 'Fix: 4-5 tools, hub-and-spoke', type: 'eliminate' },
            { id: 'ap4-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap5',
          label: 'AP5: Sentiment escalation?',
          type: 'subtree',
          domains: ['D1', 'D5'],
          children: [
            { id: 'ap5-y', label: '✗ ELIMINATE', sublabel: 'Fix: Explicit criteria', type: 'eliminate' },
            { id: 'ap5-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap6',
          label: 'AP6: Super-agent (all tools)?',
          type: 'subtree',
          domains: ['D1'],
          children: [
            { id: 'ap6-y', label: '✗ ELIMINATE', sublabel: 'Fix: Hub-and-spoke', type: 'eliminate' },
            { id: 'ap6-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap7',
          label: 'AP7: Sequential full dump?',
          type: 'subtree',
          domains: ['D1', 'D5'],
          children: [
            { id: 'ap7-y', label: '✗ ELIMINATE', sublabel: 'Fix: Relevant summaries', type: 'eliminate' },
            { id: 'ap7-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap-pass',
          label: 'Option survives →',
          type: 'success',
        },
      ],
    },
    {
      id: 'step3',
      label: 'STEP 3: Priority Rules (in order)',
      type: 'decision',
      children: [
        {
          id: 'r1',
          label: 'R1: CODE > PROMPT',
          sublabel: 'Code solution available?',
          type: 'rule',
          children: [
            { id: 'r1-yes', label: '→ Pick CODE option', type: 'success' },
            { id: 'r1-no', label: '→ Next rule ↓', type: 'action' },
          ],
        },
        {
          id: 'r2',
          label: 'R2: EXPLICIT > IMPLICIT',
          sublabel: 'Structured vs. interpreted?',
          type: 'rule',
          children: [
            { id: 'r2-yes', label: '→ Pick EXPLICIT option', type: 'success' },
            { id: 'r2-no', label: '→ Next rule ↓', type: 'action' },
          ],
        },
        {
          id: 'r3',
          label: 'R3: ISOLATED > SHARED',
          sublabel: 'Separate vs. shared context?',
          type: 'rule',
          children: [
            { id: 'r3-yes', label: '→ Pick ISOLATED option', type: 'success' },
            { id: 'r3-no', label: '→ Next rule ↓', type: 'action' },
          ],
        },
        {
          id: 'r4',
          label: 'R4: BUILT-IN > CUSTOM',
          sublabel: 'Existing feature vs. built from scratch?',
          type: 'rule',
          children: [
            { id: 'r4-yes', label: '→ Pick BUILT-IN option', type: 'success' },
            { id: 'r4-no', label: '→ Next rule ↓', type: 'action' },
          ],
        },
        {
          id: 'r5',
          label: 'R5: 3AM TEST',
          sublabel: 'Which works autonomously at 3AM?',
          type: 'rule',
          children: [
            { id: 'r5-yes', label: '→ Pick AUTONOMOUS option', type: 'success' },
          ],
        },
      ],
    },
    {
      id: 'final',
      label: '✓ SELECT BEST ANSWER',
      type: 'success',
    },
  ],
}

/* ====== Connector Primitives ====== */
const DROP = 18 // px – vertical connector height

function VLine({ h = DROP }: { h?: number }) {
  return <div className="w-0.5 bg-slate-300 shrink-0" style={{ height: h }} />
}

function DownArrow({ h = 14 }: { h?: number }) {
  return (
    <div className="flex flex-col items-center">
      <VLine h={h} />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-400" />
    </div>
  )
}

/* ====== Node Box ====== */
function NodeBox({
  node,
  onClick,
  expandable,
  expanded,
  size = 'md',
  className,
}: {
  node: TreeNode
  onClick?: () => void
  expandable?: boolean
  expanded?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const colors = nodeColors[node.type]
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 text-center transition-all shrink-0',
        expandable ? 'cursor-pointer hover:ring-2 hover:shadow-md' : onClick ? 'cursor-pointer' : 'cursor-default',
        size === 'sm' && 'px-2.5 py-1.5',
        size === 'md' && 'px-3.5 py-2',
        size === 'lg' && 'px-5 py-3',
        colors.bg, colors.border, colors.text, colors.ring,
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1.5">
        {expandable && (
          expanded
            ? <ChevronDown size={13} className="shrink-0 opacity-60" />
            : <ChevronRight size={13} className="shrink-0 opacity-60" />
        )}
        <span className={cn(
          'font-semibold leading-tight',
          size === 'sm' ? 'text-[0.6875rem]' : size === 'lg' ? 'text-sm' : 'text-xs',
        )}>
          {node.label}
        </span>
      </div>
      {node.sublabel && (
        <div className={cn(
          'leading-tight mt-0.5 opacity-75',
          size === 'sm' ? 'text-[0.5625rem]' : 'text-[0.625rem]',
          node.type === 'eliminate' && 'text-red-600 font-medium',
        )}>
          {node.sublabel}
        </div>
      )}
    </button>
  )
}

/* ====== Domain Fan-Out (Step 1) ====== */
function DomainCard({ node }: { node: TreeNode }) {
  const [open, setOpen] = useState(false)
  const hasKids = node.children && node.children.length > 0
  return (
    <div className="flex flex-col items-center">
      <NodeBox
        node={node}
        size="sm"
        expandable={hasKids}
        expanded={open}
        onClick={hasKids ? () => setOpen(e => !e) : undefined}
      />
      {open && hasKids && (
        <>
          <VLine h={8} />
          <div className="flex flex-col items-center gap-0.5">
            {node.children!.map(kw => (
              <div key={kw.id} className={cn(
                'text-[0.625rem] px-2 py-0.5 rounded border whitespace-nowrap',
                nodeColors[kw.type].bg, nodeColors[kw.type].border, nodeColors[kw.type].text,
              )}>
                {kw.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DomainFanOut({ domains }: { domains: TreeNode[] }) {
  const n = domains.length
  return (
    <div className="flex flex-col items-center w-full">
      <VLine h={14} />
      {/* Row of domains with per-child horizontal bar segments */}
      <div className="flex">
        {domains.map((d, i) => (
          <div key={d.id} className="flex flex-col items-center relative px-3" style={{ paddingTop: DROP }}>
            {/* Horizontal bar segment */}
            <div
              className="absolute top-0 h-0.5 bg-slate-300"
              style={{
                left:  i === 0     ? '50%' : 0,
                right: i === n - 1 ? '50%' : 0,
              }}
            />
            {/* Vertical drop to card */}
            <div className="absolute top-0 left-1/2 w-0.5 -translate-x-1/2 bg-slate-300" style={{ height: DROP }} />
            <DomainCard node={d} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ====== Domain Badge Colors ====== */
const domainBadge: Record<string, { bg: string; text: string }> = {
  D1: { bg: 'bg-violet-200',  text: 'text-violet-800' },
  D2: { bg: 'bg-sky-200',     text: 'text-sky-800' },
  D3: { bg: 'bg-orange-200',  text: 'text-orange-800' },
  D4: { bg: 'bg-pink-200',    text: 'text-pink-800' },
  D5: { bg: 'bg-teal-200',    text: 'text-teal-800' },
}

function DomainTags({ domains }: { domains?: string[] }) {
  if (!domains?.length) return null
  return (
    <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
      {domains.map(d => (
        <span
          key={d}
          className={cn(
            'text-[0.5rem] font-bold px-1.5 py-px rounded-full leading-tight',
            domainBadge[d]?.bg ?? 'bg-slate-200',
            domainBadge[d]?.text ?? 'text-slate-700',
          )}
        >
          {d}
        </span>
      ))}
    </div>
  )
}

/* ====== Domain → Anti-Pattern Connection Bridge ====== */
const domainAPMap: Record<string, string[]> = {
  D1: ['AP1','AP2','AP3','AP4','AP5','AP6','AP7'],
  D2: ['AP4'],
  D3: ['AP3'],
  D4: ['AP1'],
  D5: ['AP2','AP3','AP5','AP7'],
}

function ConnectionBridge() {
  const domains = ['D1','D2','D3','D4','D5']
  const allAPs = ['AP1','AP2','AP3','AP4','AP5','AP6','AP7']
  const [hover, setHover] = useState<string | null>(null)

  // When hovering a domain, which APs light up; when hovering an AP, which domains light up
  const activeAPs = hover && domains.includes(hover) ? new Set(domainAPMap[hover] ?? []) : null
  const activeDomains = hover && hover.startsWith('AP')
    ? new Set(domains.filter(d => domainAPMap[d]?.includes(hover)))
    : null

  return (
    <div className="flex flex-col items-center w-full py-3">
      <div className="text-[0.5625rem] text-slate-400 font-medium mb-2 tracking-wide uppercase">Domain → Anti-Pattern Mapping (hover to highlight)</div>

      <div className="flex gap-3 items-start">
        {/* Domain column (with empty top-left cell for alignment) */}
        <div className="flex flex-col gap-1 items-end">
          {/* Spacer to align with AP header row */}
          <div className="h-[26px]" />
          {domains.map(d => {
            const isActive = hover === d || activeDomains?.has(d)
            return (
              <div
                key={d}
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  'text-[0.625rem] font-bold px-2 py-1 rounded-md border cursor-default transition-all',
                  isActive
                    ? cn(domainBadge[d].bg, domainBadge[d].text, 'border-current shadow-sm scale-105')
                    : hover ? 'bg-slate-50 text-slate-300 border-slate-200' : cn(domainBadge[d].bg, domainBadge[d].text, 'border-transparent'),
                )}
              >
                {d}
              </div>
            )
          })}
        </div>

        {/* Matrix with AP headers on top */}
        <div className="flex flex-col gap-1">
          {/* AP header row */}
          <div className="flex gap-1 h-[26px] items-end justify-center">
            {allAPs.map(ap => {
              const isActive = hover === ap || activeAPs?.has(ap)
              return (
                <div
                  key={ap}
                  onMouseEnter={() => setHover(ap)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    'w-7 text-center text-[0.5rem] font-bold cursor-default transition-all leading-none pb-0.5',
                    isActive
                      ? 'text-red-600 scale-105'
                      : hover ? 'text-slate-300' : 'text-slate-500',
                  )}
                >
                  {ap.replace('AP','')}
                </div>
              )
            })}
          </div>

          {/* Grid rows */}
          {domains.map(d => (
            <div key={d} className="flex gap-1 h-[26px] items-center">
              {allAPs.map(ap => {
                const connected = domainAPMap[d]?.includes(ap)
                const isActive =
                  (hover === d && connected) ||
                  (hover === ap && connected) ||
                  (activeAPs?.has(ap) && d === hover) ||
                  (activeDomains?.has(d) && ap === hover)
                return (
                  <div
                    key={`${d}-${ap}`}
                    className={cn(
                      'w-7 h-5 rounded-sm flex items-center justify-center text-[0.5rem] font-bold transition-all',
                      connected
                        ? isActive
                          ? 'bg-red-500 text-white scale-110 shadow'
                          : hover ? 'bg-red-100 text-red-300' : 'bg-red-200 text-red-600'
                        : 'bg-slate-50',
                    )}
                  >
                    {connected ? '●' : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== Sequential Chain (Anti-Patterns / Rules) ====== */
function ChainSection({
  items,
  sideLabel,
  downLabel,
}: {
  items: TreeNode[]
  sideLabel: string
  downLabel: string
}) {
  const chainItems = items.filter(n => n.type === 'subtree' || n.type === 'rule')
  const terminal = items.find(n => n.type === 'success')

  return (
    <div className="flex flex-col items-center">
      {chainItems.map((item, i) => {
        const sideChild = item.children?.find(c => c.type === 'eliminate' || c.type === 'success')
        const isLast = i === chainItems.length - 1

        return (
          <div key={item.id} className="flex flex-col items-center">
            <VLine h={10} />

            {/* Row: [Domain tags + Decision node] —label→ [Side result] */}
            <div className="flex items-center">
              {/* Domain badges on the left */}
              {item.domains && item.domains.length > 0 && (
                <div className="flex flex-col gap-0.5 mr-2 items-end">
                  {item.domains.map(d => (
                    <span
                      key={d}
                      className={cn(
                        'text-[0.5rem] font-bold px-1.5 py-px rounded-full leading-tight',
                        domainBadge[d]?.bg ?? 'bg-slate-200',
                        domainBadge[d]?.text ?? 'text-slate-700',
                      )}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}

              <NodeBox node={item} size="sm" />

              {sideChild && (
                <div className="flex items-center shrink-0">
                  <div className="flex flex-col items-center mx-1.5">
                    <span className={cn(
                      'text-[0.5625rem] font-semibold leading-none mb-0.5',
                      sideChild.type === 'eliminate' ? 'text-red-500' : 'text-green-600',
                    )}>
                      {sideLabel}
                    </span>
                    <div className={cn(
                      'h-0.5 w-10',
                      sideChild.type === 'eliminate' ? 'bg-red-300' : 'bg-green-300',
                    )} />
                  </div>
                  <div className={cn(
                    'w-0 h-0 border-t-[4px] border-b-[4px] border-l-[5px] border-t-transparent border-b-transparent mr-1.5',
                    sideChild.type === 'eliminate' ? 'border-l-red-400' : 'border-l-green-400',
                  )} />
                  <NodeBox node={sideChild} size="sm" />
                </div>
              )}
            </div>

            {!isLast && (
              <span className="text-[0.5625rem] text-slate-400 font-medium mt-1">{downLabel}</span>
            )}
          </div>
        )
      })}

      {terminal && (
        <>
          <VLine h={10} />
          <NodeBox node={terminal} size="sm" />
        </>
      )}
    </div>
  )
}

/* ====== Main Component ====== */
export function DecisionTree() {
  const [zoom, setZoom] = useState(100)
  const [sections, setSections] = useState({ step1: true, step2: true, step3: true })

  const toggle = useCallback((key: 'step1' | 'step2' | 'step3') => {
    setSections(s => ({ ...s, [key]: !s[key] }))
  }, [])

  const step1 = masterTree.children![0]
  const step2 = masterTree.children![1]
  const step3 = masterTree.children![2]
  const final = masterTree.children![3]

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Decision Tree</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Click steps or domains to expand/collapse</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="w-8 h-8 rounded-md bg-[var(--muted)] hover:bg-[var(--accent)] flex items-center justify-center text-sm font-bold"
          >
            −
          </button>
          <span className="text-xs text-[var(--muted-foreground)] w-10 text-center font-mono">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(150, z + 10))}
            className="w-8 h-8 rounded-md bg-[var(--muted)] hover:bg-[var(--accent)] flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoom(100)}
            className="h-8 px-2 rounded-md bg-[var(--muted)] hover:bg-[var(--accent)] flex items-center justify-center gap-1 text-xs"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[0.625rem]">
        {[
          { type: 'root' as const, label: 'Start' },
          { type: 'decision' as const, label: 'Step' },
          { type: 'domain' as const, label: 'Domain' },
          { type: 'subtree' as const, label: 'Anti-Pattern Check' },
          { type: 'rule' as const, label: 'Priority Rule' },
          { type: 'action' as const, label: 'Keyword / Action' },
          { type: 'eliminate' as const, label: 'Eliminate' },
          { type: 'success' as const, label: 'Select / Pass' },
        ].map(l => (
          <div key={l.type} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded border', nodeColors[l.type].bg, nodeColors[l.type].border)} />
            <span className="text-[var(--muted-foreground)]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Flowchart */}
      <div className="border border-[var(--border)] rounded-xl bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div
          className="p-8 flex flex-col items-center"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {/* ── START ── */}
          <NodeBox node={masterTree} size="lg" />

          <DownArrow />

          {/* ── STEP 1: Identify Domain ── */}
          <NodeBox
            node={step1}
            expandable
            expanded={sections.step1}
            onClick={() => toggle('step1')}
          />
          {sections.step1 && <DomainFanOut domains={step1.children!} />}

          <DownArrow />

          {/* ── Domain → AP Connection Bridge ── */}
          <ConnectionBridge />

          <DownArrow />

          {/* ── STEP 2: Eliminate Anti-Patterns ── */}
          <NodeBox
            node={step2}
            expandable
            expanded={sections.step2}
            onClick={() => toggle('step2')}
          />
          {sections.step2 && (
            <ChainSection items={step2.children!} sideLabel="Yes" downLabel="No" />
          )}

          <DownArrow />

          {/* ── STEP 3: Priority Rules ── */}
          <NodeBox
            node={step3}
            expandable
            expanded={sections.step3}
            onClick={() => toggle('step3')}
          />
          {sections.step3 && (
            <ChainSection items={step3.children!} sideLabel="Yes" downLabel="Neither" />
          )}

          <DownArrow />

          {/* ── FINAL ── */}
          <NodeBox node={final} size="lg" />
        </div>
      </div>
    </div>
  )
}
