let fingerprintCache: string | null = null

export async function loadFingerprint(): Promise<string> {
  if (fingerprintCache) return fingerprintCache

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs')
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    fingerprintCache = result.visitorId
    return fingerprintCache
  } catch (error) {
    console.error('Failed to load fingerprint:', error)
    throw error
  }
}