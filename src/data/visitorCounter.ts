const BASE_URL = '/api/counter'
const COUNTERAPI_TOKEN = 'ut_jIWz4rMgbFycP6X6zB2wb0d3QWQE8aBWXnAbSdFB'

function getAuthHeaders() {
  const token = import.meta.env.VITE_COUNTERAPI_TOKEN || COUNTERAPI_TOKEN
  if (!token) {
    throw new Error('CounterAPI token is required. Do not store production secrets in client-side code.')
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function parseErrorResponse(response: Response) {
  const text = await response.text()
  return `${response.status} ${response.statusText}${text ? `: ${text}` : ''}`
}

export async function getCounterValue(): Promise<number> {
  try {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const body = await parseErrorResponse(response)
      throw new Error(`Failed to get counter value (${body})`)
    }

    const result = await response.json()
    const count = result?.data?.up_count

    if (typeof count !== 'number') {
      throw new Error('Unexpected counter response format')
    }

    return count
  } catch (error) {
    console.error('Error getting counter value:', error)
    throw error
  }
}

export async function incrementCounter(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/up`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const body = await parseErrorResponse(response)
      throw new Error(`Failed to increment counter (${body})`)
    }
  } catch (error) {
    console.error('Error incrementing counter:', error)
    throw error
  }
}

