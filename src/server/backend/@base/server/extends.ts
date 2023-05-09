import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '~/server/backend/@base'

export abstract class idTransformable {
  static idToString: typeof idToString
  static stringToId: typeof stringToId
}

export abstract class scoreIdTransformable {
  static scoreIdToString: typeof scoreIdToString
  static stringToScoreId: typeof stringToScoreId
}

// export {
//   hasLeaderboardRankingSystem,
//   hasRankingSystem,
//   hasRuleset,
// } from './guards'
