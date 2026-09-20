import { sql } from 'drizzle-orm'
import * as schema from '../drizzle/schema'

/**
 * Builds a safe MySQL boolean full-text predicate from free-form user input.
 *
 * Punctuation is treated as a term separator rather than as boolean-query
 * syntax, so input such as map filenames cannot alter the search expression.
 */
export function createBeatmapKeywordSearch(keyword: string, mapsetOnly = false) {
  const terms = keyword.normalize('NFKC').match(/[\p{L}\p{N}_]+/gu) ?? []
  const query = terms.map(term => `${term}*`).join(' ')
  if (!query) {
    return undefined
  }

  return mapsetOnly
    ? sql<boolean>`MATCH(${schema.beatmaps.artist}, ${schema.beatmaps.title}) AGAINST(${query} IN BOOLEAN MODE)`
    : sql<boolean>`MATCH(${schema.beatmaps.artist}, ${schema.beatmaps.title}, ${schema.beatmaps.version}) AGAINST(${query} IN BOOLEAN MODE)`
}
