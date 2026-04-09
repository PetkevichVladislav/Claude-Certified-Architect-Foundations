import { useState } from 'react'
import { ChevronDown, ChevronRight, Star, BookOpen, ExternalLink, Clock, GraduationCap, Target, Layout, ShieldAlert, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { domains } from '@/data/domains'
import { resources, levelInfo, type Level } from '@/data/resources'

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
    <div className="border border-[var(--border)] rounded-lg overflow-hidden mb-4">
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
              {context}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

export function StudyGuide() {
  return (
    <div className="space-y-4">
      {/* About This Site — top of page */}
      <div className="border border-[var(--border)] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
            <Layout size={14} className="text-indigo-600" /> Why This Site &amp; How It&apos;s Organized
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            The CCA-F exam is unique: rote memorization won&apos;t pass it. You need a <strong>systematic elimination algorithm</strong> to consistently pick the best option from four plausible ones. This site teaches that algorithm and lets you practice it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="font-semibold text-indigo-700 mb-0.5">📖 Learn (this tab)</div>
              <div className="text-[var(--muted-foreground)]">Exam overview, 5 domains with weights, and a curated learning path from beginner to expert.</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="font-semibold text-indigo-700 mb-0.5">🧠 Exam Strategy</div>
              <div className="text-[var(--muted-foreground)]">The 3-step elimination algorithm, priority rules, anti-patterns to spot, and interactive walkthroughs on real questions.</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="font-semibold text-indigo-700 mb-0.5">🌲 Decision Tree</div>
              <div className="text-[var(--muted-foreground)]">Visual flowchart of the decision algorithm — trace any question through the tree to see which rules eliminate which options.</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="font-semibold text-indigo-700 mb-0.5">📝 Practice Test</div>
              <div className="text-[var(--muted-foreground)]">Multiple question banks (official samples, community, AI-generated). Filter by domain, shuffle, and review with full explanations.</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
          <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong>Disclaimer:</strong> This is a community study tool, not an official Anthropic product. Practice questions are retro-engineered from the published exam guide and may differ from the real exam in wording, difficulty, and scenario context. The real exam uses longer stems with richer context and may test nuances not covered here. Use this site to build your reasoning framework, then validate with Anthropic&apos;s official resources.
          </div>
        </div>
      </div>

      {/* Exam Overview Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-600" /> Exam Overview
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          The CCA-F tests your ability to choose the <strong>architecturally best</strong> answer among 4 plausible options.
          It's not about memorizing APIs — it's about knowing which patterns to apply in specific scenarios.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ['Questions', '60 scenario-based'],
            ['Duration', '120 minutes (2 min/question)'],
            ['Passing Score', '720 / 1,000 (~72%)'],
            ['Format', 'Proctored, no external resources'],
            ['Scenarios', '4 of 6 randomly selected'],
            ['Cost', 'Free (Anthropic Partner Network)'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/70 rounded-lg p-3">
              <div className="text-[var(--muted-foreground)] text-xs">{label}</div>
              <div className="font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>
        {/* What the Real Exam Looks Like */}
        <div className="mt-4 bg-white/80 rounded-lg border border-indigo-100 p-4">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
            <Target size={14} className="text-indigo-600" /> What the Real Exam Looks Like
          </h3>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-none">
            <li>• <strong>60 questions</strong> across <strong>6 scenarios</strong> — 4 scenarios randomly selected per exam sitting</li>
            <li>• Each scenario: ~15 questions sharing a real-world context (e.g., "a healthcare triage agent", "a CI/CD review pipeline")</li>
            <li>• Long question stems (5–8 sentences) describing system architecture, observed behavior, and constraints</li>
            <li>• <strong>All 4 options are valid approaches</strong> — you must pick the <em>architecturally best</em> one, not the only correct one</li>
            <li>• Explanations focus on why other options are <em>less optimal</em>, not why they're wrong</li>
            <li>• Well-documented exam traps: progressive summarization, <code className="bg-slate-100 px-1 rounded text-[11px]">tool_choice: "any"</code> vs <code className="bg-slate-100 px-1 rounded text-[11px]">tool_choice: &#123;"type": "tool"&#125;</code>, fabricated features, sentiment-based escalation, self-reported confidence scores</li>
          </ul>
        </div>
        {/* Official link */}
        <div className="mt-3">
          <a
            href="https://www.anthropic.com/certification"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ExternalLink size={14} /> Official Certification Page →
          </a>
        </div>
      </div>

      {/* Insight Banner — under exam overview */}
      <div className="bg-indigo-100 border border-indigo-300 rounded-xl p-4 flex gap-3 items-start">
        <AlertTriangle size={20} className="text-indigo-700 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800">
          This is a &ldquo;best answer&rdquo; exam — multiple options may be valid, but only one is architecturally correct. Learn the <strong>Exam Strategy</strong> tab to master the elimination algorithm.
        </p>
      </div>

      {/* 5 Domains */}
      <Section
        title="The 5 Domains"
        icon={<Star size={16} className="text-amber-500" />}
        defaultOpen
        context="Domains define WHAT the exam tests. Study time should be proportional to weights. Domains 1 + 3 = 47% of the exam — focus here first. Each domain maps to specific anti-patterns and priority rules covered in the Exam Strategy tab."
      >
        <div className="space-y-3">
          {domains.map(d => (
            <div key={d.id} className={cn('rounded-lg border overflow-hidden', d.color)}>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm">{d.id}</span>
                  <span className="font-medium text-sm">{d.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold">{d.weight}</span>
                  <span className="text-xs opacity-70">{d.questions} Qs</span>
                </div>
              </div>
              <div className="px-3 pb-3">
                <p className="text-xs opacity-80 mb-2">{d.description}</p>
                <div className="flex flex-wrap gap-1">
                  {d.topics.map((t, j) => (
                    <span key={j} className="text-[10px] bg-white/60 rounded px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Learning Path */}
      <Section
        title="Learning Path"
        icon={<GraduationCap size={16} className="text-indigo-500" />}
        defaultOpen
        context="Resources are organized into 3 levels. Start from your current experience level. Each level builds on the previous one. Time estimates assume focused study — not skimming. The key transition: Beginner = learn the tools, Advanced = learn the patterns, Expert = learn the traps."
      >
        <div className="space-y-5">
          {(['beginner', 'advanced', 'expert'] as Level[]).map(level => {
            const info = levelInfo[level]
            const levelResources = resources.filter(r => r.level === level)
            return (
              <div key={level} className={cn('rounded-xl border-2 overflow-hidden', info.color)}>
                {/* Level Header */}
                <div className="p-4 border-b border-inherit">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      {info.emoji} {info.label}
                    </h3>
                    <span className="text-xs font-medium flex items-center gap-1 opacity-70">
                      <Clock size={12} /> {info.timeRange}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{info.description}</p>
                </div>

                {/* Resources */}
                <div className="p-3 space-y-2">
                  {levelResources.map((r, i) => (
                    <div key={i} className="bg-white/70 rounded-lg p-3 border border-white/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {r.url === '#test' ? (
                            <span className="font-semibold text-sm text-indigo-600">{r.title}</span>
                          ) : (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-sm text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                            >
                              {r.title} <ExternalLink size={11} />
                            </a>
                          )}
                          <span className="text-[10px] text-[var(--muted-foreground)] ml-2">{r.source}</span>
                        </div>
                        <span className="text-[10px] font-medium text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-0.5">
                          <Clock size={10} /> {r.timeHours}h
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{r.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.topics.map((t, j) => (
                          <span key={j} className="text-[10px] bg-[var(--muted)] rounded px-1.5 py-0.5">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Time Estimate */}
        <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
          <div className="text-xs text-[var(--muted-foreground)]">Estimated total study time (all levels)</div>
          <div className="text-lg font-bold mt-0.5">70–110 hours</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            Experienced developers: skip to Advanced (~30-50h) | Already using Claude daily: start at Expert (~10-20h)
          </div>
        </div>
      </Section>
    </div>
  )
}
