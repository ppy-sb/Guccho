import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '$base'

export abstract class IdTransformable {
  static idToString: typeof idToString
  static stringToId: typeof stringToId
}

export abstract class ScoreIdTransformable {
  static scoreIdToString: typeof scoreIdToString
  static stringToScoreId: typeof stringToScoreId
}

export enum ServiceStatus {
  Unknown,
  Down,
  Degraded,
  Up,
}
export const status = Symbol('status')

export abstract class Status {
  [status]: [ServiceStatus] | [ServiceStatus, string] = [ServiceStatus.Unknown, 'No metrics']
}
