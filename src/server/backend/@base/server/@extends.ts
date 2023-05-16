import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '$def'

export abstract class idTransformable {
  static idToString: typeof idToString
  static stringToId: typeof stringToId
}

export abstract class scoreIdTransformable {
  static scoreIdToString: typeof scoreIdToString
  static stringToScoreId: typeof stringToScoreId
}
