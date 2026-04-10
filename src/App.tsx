import { useState, useEffect, useRef } from 'react'
import { BookOpen, GitBranch, ClipboardCheck, Network, Type } from 'lucide-react'
import { StudyGuide } from './components/StudyGuide'
import { DecisionGuide } from './components/DecisionGuide'
import { DecisionTree } from './components/DecisionTree'
import { Quiz } from './components/Quiz'
import { cn } from './lib/utils'

type Tab = 'guide' | 'decision' | 'tree' | 'test'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'guide', label: 'Learn', icon: <BookOpen size={18} /> },
  { id: 'decision', label: 'Decision Engine', icon: <GitBranch size={18} /> },
  { id: 'tree', label: 'Tree View', icon: <Network size={18} /> },
  { id: 'test', label: 'Practice Test', icon: <ClipboardCheck size={18} /> },
]

const SCALE_KEY = 'cca-f-font-scale'
const SCALE_MIN = 0.75
const SCALE_MAX = 1.5
const SCALE_STEP = 0.05
const SCALE_DEFAULT = 1

function getInitialScale(): number {
  try {
    const stored = localStorage.getItem(SCALE_KEY)
    if (stored) {
      const v = parseFloat(stored)
      if (!isNaN(v) && v >= SCALE_MIN && v <= SCALE_MAX) return v
    }
  } catch { /* ignore */ }
  return SCALE_DEFAULT
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('guide')
  const [fontScale, setFontScale] = useState(getInitialScale)
  const [showScale, setShowScale] = useState(false)
  const scaleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`
    try { localStorage.setItem(SCALE_KEY, String(fontScale)) } catch { /* ignore */ }
  }, [fontScale])

  // Close popup on outside click
  useEffect(() => {
    if (!showScale) return
    const handler = (e: MouseEvent) => {
      if (scaleRef.current && !scaleRef.current.contains(e.target as Node)) setShowScale(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showScale])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header — pinned to 16px so it never jumps when font scale changes */}
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-50" style={{ fontSize: '16px' }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-[var(--foreground)]">CCA-F Exam Prep</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Claude Certified Architect — Foundations</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Font scale button + popup */}
              <div className="relative" ref={scaleRef} style={{ fontSize: '14px' }}>
                <button
                  onClick={() => setShowScale((v) => !v)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  style={{ fontSize: '13px' }}
                  title="Font size"
                >
                  <Type size={15} />
                  <span className="font-mono tabular-nums" style={{ fontSize: '11px' }}>{Math.round(fontScale * 100)}%</span>
                </button>
                {showScale && (
                  <div
                    className="absolute right-0 top-full mt-2 bg-white border border-[var(--border)] rounded-lg shadow-lg z-[60]"
                    style={{ padding: '12px 16px', minWidth: '200px', fontSize: '12px' }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <span className="font-medium text-[var(--foreground)]">Font Size</span>
                      <button
                        onClick={() => setFontScale(SCALE_DEFAULT)}
                        className="text-[var(--primary)] hover:underline"
                        style={{ fontSize: '11px' }}
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span className="text-[var(--muted-foreground)]" style={{ fontSize: '11px' }}>A</span>
                      <input
                        type="range"
                        min={SCALE_MIN}
                        max={SCALE_MAX}
                        step={SCALE_STEP}
                        value={fontScale}
                        onChange={(e) => setFontScale(parseFloat(e.target.value))}
                        className="flex-1 accent-[var(--primary)] cursor-pointer"
                        style={{ height: '4px' }}
                      />
                      <span className="text-[var(--muted-foreground)] font-bold" style={{ fontSize: '15px' }}>A</span>
                    </div>
                    <div className="text-center text-[var(--muted-foreground)] font-mono tabular-nums" style={{ marginTop: '6px', fontSize: '11px' }}>
                      {Math.round(fontScale * 100)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 bg-[var(--muted)] rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-white text-[var(--foreground)] shadow-sm'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'guide' && <StudyGuide />}
        {activeTab === 'decision' && <DecisionGuide />}
        {activeTab === 'tree' && <DecisionTree />}
        {activeTab === 'test' && <Quiz />}
      </main>
    </div>
  )
}
