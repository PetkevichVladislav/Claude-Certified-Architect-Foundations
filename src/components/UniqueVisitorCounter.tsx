import { useEffect, useState } from 'react'
import { loadFingerprint } from '@/data/fingerprint'
import { getCounterValue, incrementCounter } from '@/data/visitorCounter'

export function UniqueVisitorCounter() {
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadVisitorCount = async () => {
      try {
        const fingerprint = await loadFingerprint()
        const storedKey = `visitor_seen_${fingerprint}`
        const hasSeen = localStorage.getItem(storedKey) === 'true'

        if (!hasSeen) {
          await incrementCounter()
          try {
            localStorage.setItem(storedKey, 'true')
          } catch {
            // ignore storage failures
          }
        }

        const total = await getCounterValue()
        setTotalVisitors(total)
        setIsReady(true)
      } catch (error) {
        console.error('Error loading visitor count:', error)
        setIsReady(false)
      }
    }

    loadVisitorCount()
  }, [])

  if (!isReady || typeof totalVisitors !== 'number') {
    return null
  }

  return (
    <span className="relative inline-flex items-center group">
      <span className="text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full text-xs font-medium transition-colors hover:bg-[var(--border)]">
        Visitors
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)] shadow-sm group-hover:inline-block">
        {totalVisitors} unique
      </span>
    </span>
  )
}