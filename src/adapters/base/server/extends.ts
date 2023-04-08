import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '$def'

export interface idTransformable {
  idToString: typeof idToString
  stringToId: typeof stringToId
}

export interface scoreIdTransformable {
  scoreIdToString: typeof scoreIdToString
  stringToScoreId: typeof stringToScoreId
}

// export {
//   hasLeaderboardRankingSystem,
//   hasRankingSystem,
//   hasRuleset,
// } from './guards'
