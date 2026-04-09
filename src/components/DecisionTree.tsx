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
          children: [
            { id: 'ap1-y', label: '✗ ELIMINATE', sublabel: 'Fix: Use hooks / code guards', type: 'eliminate' },
            { id: 'ap1-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap2',
          label: 'AP2: NL parsing for control?',
          type: 'subtree',
          children: [
            { id: 'ap2-y', label: '✗ ELIMINATE', sublabel: 'Fix: Check stop_reason', type: 'eliminate' },
            { id: 'ap2-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap3',
          label: 'AP3: Same-session review?',
          type: 'subtree',
          children: [
            { id: 'ap3-y', label: '✗ ELIMINATE', sublabel: 'Fix: Independent instance', type: 'eliminate' },
            { id: 'ap3-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap4',
          label: 'AP4: >5 tools on one agent?',
          type: 'subtree',
          children: [
            { id: 'ap4-y', label: '✗ ELIMINATE', sublabel: 'Fix: 4-5 tools, hub-and-spoke', type: 'eliminate' },
            { id: 'ap4-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap5',
          label: 'AP5: Sentiment escalation?',
          type: 'subtree',
          children: [
            { id: 'ap5-y', label: '✗ ELIMINATE', sublabel: 'Fix: Explicit criteria', type: 'eliminate' },
            { id: 'ap5-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap6',
          label: 'AP6: Super-agent (all tools)?',
          type: 'subtree',
          children: [
            { id: 'ap6-y', label: '✗ ELIMINATE', sublabel: 'Fix: Hub-and-spoke', type: 'eliminate' },
            { id: 'ap6-n', label: '✓ Continue', type: 'action' },
          ],
        },
        {
          id: 'ap7',
          label: 'AP7: Sequential full dump?',
          type: 'subtree',
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

/* ====== Recursive Tree Node Component ====== */
function TreeNodeView({ node, depth = 0, parentExpanded = true }: { node: TreeNode; depth?: number; parentExpanded?: boolean }) {
  const hasChildren = node.children && node.children.length > 0
  const [expanded, setExpanded] = useState(depth < 2)
  const colors = nodeColors[node.type]

  const toggle = useCallback(() => {
    if (hasChildren) setExpanded(e => !e)
  }, [hasChildren])

  if (!parentExpanded) return null

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <button
        onClick={toggle}
        className={cn(
          'relative rounded-lg border-2 px-3 py-2 transition-all text-center max-w-[220px]',
          'hover:ring-2 hover:shadow-md',
          colors.bg, colors.border, colors.text, colors.ring,
          hasChildren && 'cursor-pointer',
          !hasChildren && 'cursor-default',
        )}
      >
        <div className="flex items-center justify-center gap-1">
          {hasChildren && (
            expanded
              ? <ChevronDown size={12} className="shrink-0 opacity-60" />
              : <ChevronRight size={12} className="shrink-0 opacity-60" />
          )}
          <span className={cn(
            'font-semibold leading-tight',
            depth === 0 ? 'text-sm' : 'text-xs',
          )}>
            {node.label}
          </span>
        </div>
        {node.sublabel && (
          <div className={cn(
            'text-[10px] leading-tight mt-0.5 opacity-75',
            node.type === 'eliminate' ? 'text-red-600' : '',
          )}>
            {node.sublabel}
          </div>
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <>
          {/* Vertical connector */}
          <div className="w-px h-4 bg-slate-300" />

          {/* Horizontal connector bar */}
          {node.children!.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-px bg-slate-300 absolute top-0"
                style={{
                  width: `${Math.min(95, node.children!.length * 18)}%`,
                }}
              />
            </div>
          )}

          {/* Children row */}
          <div className={cn(
            'flex gap-1 justify-center flex-wrap',
            depth < 1 ? 'gap-3' : 'gap-1.5',
          )}>
            {node.children!.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Connector down from horizontal bar */}
                {node.children!.length > 1 && <div className="w-px h-3 bg-slate-300" />}
                <TreeNodeView node={child} depth={depth + 1} parentExpanded={expanded} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ====== Main Component ====== */
export function DecisionTree() {
  const [zoom, setZoom] = useState(100)

  const resetView = useCallback(() => {
    setZoom(100)
  }, [])

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Decision Tree</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Click any node to expand/collapse subtrees</p>
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
            onClick={resetView}
            className="h-8 px-2 rounded-md bg-[var(--muted)] hover:bg-[var(--accent)] flex items-center justify-center gap-1 text-xs"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {[
          { type: 'root' as const, label: 'Start' },
          { type: 'decision' as const, label: 'Decision' },
          { type: 'domain' as const, label: 'Domain' },
          { type: 'subtree' as const, label: 'Anti-Pattern Check' },
          { type: 'rule' as const, label: 'Priority Rule' },
          { type: 'action' as const, label: 'Action' },
          { type: 'eliminate' as const, label: 'Eliminate' },
          { type: 'success' as const, label: 'Select / Pass' },
        ].map(l => (
          <div key={l.type} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded border', nodeColors[l.type].bg, nodeColors[l.type].border)} />
            <span className="text-[var(--muted-foreground)]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tree Container */}
      <div className="border border-[var(--border)] rounded-xl bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div
          className="p-6 min-w-[600px] flex justify-center"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <TreeNodeView node={masterTree} />
        </div>
      </div>
    </div>
  )
}
