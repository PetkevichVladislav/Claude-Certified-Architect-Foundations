import { useState, useCallback, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/data/questions'
import { loadBankIndex, loadBank, type BankIndex } from '@/data/questionBanks'
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCcw,
  Timer, Star, Filter, Trophy, BarChart3, Shuffle, Square, Library, Info, ExternalLink
} from 'lucide-react'

type QuizMode = 'setup' | 'active' | 'review' | 'results'
type DomainFilter = 'all' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5'

interface AnswerRecord {
  questionId: number
  selectedLabel: string | null
  isCorrect: boolean
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Quiz() {
  const [bankIndex, setBankIndex] = useState<BankIndex[]>([])
  const [isBankLoading, setIsBankLoading] = useState(true)
  const [bankLoadError, setBankLoadError] = useState<string | null>(null)
  const [mode, setMode] = useState<QuizMode>('setup')
  const [selectedBankId, setSelectedBankId] = useState<string>('')
  const [bankQuestions, setBankQuestions] = useState<QuizQuestion[]>([])
  const [bankSourceUrl, setBankSourceUrl] = useState('')
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all')
  const [shuffled, setShuffled] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    setIsBankLoading(true)
    setBankLoadError(null)

    loadBankIndex().then(idx => {
      setBankIndex(idx)
      const def = idx.find(b => b.isDefault) ?? idx[0]
      if (def) setSelectedBankId(def.id)
    }).catch(err => {
      console.error('Failed to load bank index:', err)
      setBankLoadError('Unable to load question banks. Please refresh or check your network connection.')
    }).finally(() => setIsBankLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedBankId) return
    loadBank(selectedBankId).then(data => {
      setBankQuestions(data.questions)
      setBankSourceUrl(data.sourceUrl || '')
    }).catch(err => console.error('Failed to load bank:', selectedBankId, err))
  }, [selectedBankId])

  const selectedBank = useMemo(() =>
    bankIndex.find(b => b.id === selectedBankId) ?? bankIndex[0]
  , [bankIndex, selectedBankId])

  const filteredQuestions = useMemo(() => {
    let filtered = bankQuestions
    if (domainFilter !== 'all') {
      filtered = filtered.filter(q => q.domainShort === domainFilter)
    }
    return filtered
  }, [bankQuestions, domainFilter])

  const startQuiz = useCallback(() => {
    const qs = shuffled ? shuffleArray(filteredQuestions) : filteredQuestions
    setQuizQuestions(qs)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswered(false)
    setAnswers([])
    setStartTime(Date.now())
    setElapsedTime(0)
    setMode('active')
  }, [filteredQuestions, shuffled])

  const submitAnswer = useCallback(() => {
    if (!selectedAnswer) return
    const currentQ = quizQuestions[currentIndex]
    const correct = currentQ.options.find(o => o.label === selectedAnswer)?.isCorrect ?? false
    setAnswers(prev => [...prev, { questionId: currentQ.id, selectedLabel: selectedAnswer, isCorrect: correct }])
    setAnswered(true)
  }, [selectedAnswer, quizQuestions, currentIndex])

  const nextQuestion = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setElapsedTime(Date.now() - startTime)
      setMode('results')
    }
  }, [currentIndex, quizQuestions.length, startTime])

  const stopQuiz = useCallback(() => {
    if (answers.length === 0) {
      setMode('setup')
      return
    }
    setElapsedTime(Date.now() - startTime)
    setMode('results')
  }, [answers.length, startTime])

  const goToReview = useCallback((index: number) => {
    setCurrentIndex(index)
    setMode('review')
  }, [])

  const currentQuestion = quizQuestions[currentIndex]

  // === SETUP SCREEN ===
  if (mode === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Practice Test</h2>
          <p className="text-[var(--muted-foreground)] mt-1">Configure your quiz settings</p>
        </div>

        {/* Question Bank Selector */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Library size={16} /> Question Bank
          </h3>
          {isBankLoading ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
              Loading question banks…
            </div>
          ) : bankLoadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {bankLoadError}
            </div>
          ) : bankIndex.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
              No question banks are available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bankIndex.map(bank => (
                <div key={bank.id} className="relative group/bank">
                  <button
                    onClick={() => setSelectedBankId(bank.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedBankId === bank.id
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-[var(--border)] hover:border-indigo-300 hover:bg-indigo-50/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bank.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{bank.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {bank.count} questions{bank.isDefault ? ' • Default' : ''}
                        </div>
                      </div>
                      {bank.disclaimer && (
                        <Info size={12} className="ml-auto flex-shrink-0 text-[var(--muted-foreground)] opacity-40" />
                      )}
                    </div>
                  </button>

                  {/* Hover popover with clickable links */}
                  {bank.disclaimer && (
                    <div className="absolute left-0 right-0 top-full z-50 pt-1 hidden group-hover/bank:block">
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs text-slate-600 space-y-1.5">
                        <div>{bank.disclaimer}</div>
                        {bank.sourceUrl && (
                          <a
                            href={bank.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            {bank.sourceUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Domain Filter */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Filter size={16} /> Domain Filter
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'D1', 'D2', 'D3', 'D4', 'D5'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  domainFilter === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--muted)] hover:bg-[var(--accent)]'
                )}
              >
                {d === 'all' ? 'All Domains' : d === 'D1' ? 'D1: Agentic (27%)' : d === 'D2' ? 'D2: Tools/MCP (18%)' : d === 'D3' ? 'D3: Claude Code (20%)' : d === 'D4' ? 'D4: Prompts (20%)' : 'D5: Context (15%)'}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="border border-[var(--border)] rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={shuffled} onChange={e => setShuffled(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <div className="text-sm font-medium flex items-center gap-1"><Shuffle size={14} /> Shuffle Questions</div>
              <div className="text-xs text-[var(--muted-foreground)]">Randomize question order</div>
            </div>
          </label>
        </div>

        {/* Start */}
        <div className="text-center space-y-3">
          <div className="text-sm text-[var(--muted-foreground)]">
            {filteredQuestions.length} questions selected
          </div>
          <button
            onClick={startQuiz}
            disabled={filteredQuestions.length === 0}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  // === RESULTS SCREEN ===
  if (mode === 'results') {
    const correct = answers.filter(a => a.isCorrect).length
    const total = answers.length
    const pct = Math.round((correct / total) * 100)
    const scaled = Math.round((correct / total) * 1000)
    const passed = scaled >= 720
    const minutes = Math.floor(elapsedTime / 60000)
    const seconds = Math.floor((elapsedTime % 60000) / 1000)

    // Domain breakdown
    const domainStats: Record<string, { correct: number; total: number }> = {}
    answers.forEach(a => {
      const q = bankQuestions.find(q => q.id === a.questionId)!
      if (!q) return
      const ds = q.domainShort
      if (!domainStats[ds]) domainStats[ds] = { correct: 0, total: 0 }
      domainStats[ds].total++
      if (a.isCorrect) domainStats[ds].correct++
    })

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score Card */}
        <div className={cn(
          'rounded-xl p-8 text-center',
          passed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
        )}>
          <Trophy size={48} className={cn('mx-auto mb-4', passed ? 'text-green-600' : 'text-red-500')} />
          <div className="text-4xl font-bold">{scaled} / 1,000</div>
          <div className={cn('text-lg font-semibold mt-1', passed ? 'text-green-700' : 'text-red-700')}>
            {passed ? 'PASSED' : 'NOT YET PASSING'}
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mt-2">
            {correct}/{total} correct ({pct}%) • {minutes}m {seconds}s
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            Passing: 720/1,000 (~72% correct)
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 size={16} /> Domain Breakdown
          </h3>
          <div className="space-y-2">
            {Object.entries(domainStats).sort(([a], [b]) => a.localeCompare(b)).map(([domain, stats]) => {
              const domPct = Math.round((stats.correct / stats.total) * 100)
              const domainNames: Record<string, string> = {
                D1: 'Agentic Architecture',
                D2: 'Tool Design & MCP',
                D3: 'Claude Code',
                D4: 'Prompt Engineering',
                D5: 'Context & Reliability'
              }
              return (
                <div key={domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{domain}: {domainNames[domain]}</span>
                    <span className={cn('font-semibold', domPct >= 72 ? 'text-green-600' : 'text-red-500')}>
                      {stats.correct}/{stats.total} ({domPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all', domPct >= 72 ? 'bg-green-500' : 'bg-red-400')}
                      style={{ width: `${domPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Question Review List */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Review Questions</h3>
          <div className="grid grid-cols-10 gap-1">
            {answers.map((a, i) => (
              <button
                key={i}
                onClick={() => goToReview(i)}
                className={cn(
                  'w-full aspect-square rounded text-xs font-medium flex items-center justify-center transition-colors',
                  a.isCorrect
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setMode('setup')}
            className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--accent)] flex items-center gap-2"
          >
            <RotateCcw size={14} /> New Quiz
          </button>
        </div>
      </div>
    )
  }

  // === REVIEW MODE ===
  if (mode === 'review') {
    const q = quizQuestions[currentIndex]
    const record = answers[currentIndex]
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => setMode('results')}
          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Back to Results
        </button>

        <QuestionCard
          question={q}
          selectedAnswer={record?.selectedLabel ?? null}
          answered={true}
          onSelect={() => {}}
          sourceUrl={bankSourceUrl}
        />

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 text-sm rounded-md bg-[var(--muted)] disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(quizQuestions.length - 1, currentIndex + 1))}
            disabled={currentIndex === quizQuestions.length - 1}
            className="px-3 py-1.5 text-sm rounded-md bg-[var(--muted)] disabled:opacity-30 flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    )
  }

  // === ACTIVE QUIZ ===
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Question {currentIndex + 1} / {quizQuestions.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-[var(--muted-foreground)] flex items-center gap-1">
            <Timer size={14} />
            {answers.filter(a => a.isCorrect).length} correct
          </span>
          <button
            onClick={stopQuiz}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-medium hover:bg-red-100 transition-colors"
          >
            <Square size={12} /> Stop
          </button>
        </div>
      </div>
      <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex + (answered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        answered={answered}
        onSelect={setSelectedAnswer}
        sourceUrl={bankSourceUrl}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!answered ? (
          <button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            {currentIndex < quizQuestions.length - 1 ? <>Next <ChevronRight size={16} /></> : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  selectedAnswer,
  answered,
  onSelect,
  sourceUrl,
}: {
  question: QuizQuestion
  selectedAnswer: string | null
  answered: boolean
  onSelect: (label: string) => void
  sourceUrl?: string
}) {
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--muted)] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{question.domainShort}</span>
          <span className="text-[var(--muted-foreground)]">{question.domain}</span>
        </div>
        <div className="flex items-center gap-2">
          {question.source && (
            sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
              >
                {question.source} <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {question.source}
              </span>
            )
          )}
          {question.isOfficial && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
              <Star size={12} fill="currentColor" /> Official
            </span>
          )}
        </div>
      </div>

      {/* Scenario */}
      {question.scenario && (
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-800">
          <strong>Scenario:</strong> {question.scenario}
        </div>
      )}

      {/* Question Text */}
      <div className="px-4 py-4">
        <p className="text-sm leading-relaxed font-medium">{question.question}</p>
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {question.options.map((opt) => {
          const isSelected = selectedAnswer === opt.label
          const showResult = answered
          const isCorrectOption = opt.isCorrect

          let optionStyle = 'border-[var(--border)] hover:border-indigo-300 hover:bg-indigo-50/50'
          if (isSelected && !showResult) {
            optionStyle = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
          }
          if (showResult && isCorrectOption) {
            optionStyle = 'border-green-500 bg-green-50'
          }
          if (showResult && isSelected && !isCorrectOption) {
            optionStyle = 'border-red-500 bg-red-50'
          }

          return (
            <div key={opt.label}>
              <button
                onClick={() => !answered && onSelect(opt.label)}
                disabled={answered}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  optionStyle,
                  !answered && 'cursor-pointer'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                    showResult && isCorrectOption ? 'bg-green-500 text-white border-green-500' :
                    showResult && isSelected && !isCorrectOption ? 'bg-red-500 text-white border-red-500' :
                    isSelected ? 'bg-indigo-500 text-white border-indigo-500' :
                    'bg-white border-[var(--border)]'
                  )}>
                    {showResult && isCorrectOption ? <CheckCircle size={14} /> :
                     showResult && isSelected && !isCorrectOption ? <XCircle size={14} /> :
                     opt.label}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </div>
              </button>

              {/* Explanation (shown after answering) */}
              {showResult && (
                <div className={cn(
                  'ml-10 mt-1 px-3 py-2 rounded-md text-xs leading-relaxed',
                  isCorrectOption
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                )}>
                  {isCorrectOption && <span className="font-semibold text-green-700">✓ CORRECT — </span>}
                  {!isCorrectOption && isSelected && <span className="font-semibold text-red-700">✗ YOUR ANSWER — </span>}
                  {opt.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Algorithm Trace */}
      {answered && question.algorithmTrace && (
        <div className="px-4 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-amber-800 mb-1">Algorithm Trace</div>
            <div className="text-xs text-amber-700">{question.algorithmTrace}</div>
          </div>
        </div>
      )}
    </div>
  )
}
