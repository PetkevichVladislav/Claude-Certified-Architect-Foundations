import { useState } from 'react'
import { BookOpen, GitBranch, ClipboardCheck, Network } from 'lucide-react'
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

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('guide')

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">CCA-F Exam Prep</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Claude Certified Architect — Foundations</p>
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
