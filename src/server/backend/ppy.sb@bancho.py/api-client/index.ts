import { createFetch } from '../../bancho.py/api-client'

type ClearCacheInput =
| {
  type: 'beatmap'
  hash: string
}
| {
  type: 'beatmap'
  bid: string
}

export async function clearCache(config: { api: { sb: string } }, input: ClearCacheInput) {
  const fetch = createFetch(config.api.sb)
  const url = '/cache'
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      params: input,
    })
    if (!response.ok) {
      throw new Error(`Failed to clear cache: ${response.statusText}`)
    }
    return await response.json()
  }
  catch (error) {
    console.error('Error clearing cache:', error)
    throw error
  }
}
