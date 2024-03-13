import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '$base'

export abstract class IdTransformable {
  static readonly idToString: typeof idToString
  static readonly stringToId: typeof stringToId
}

export abstract class ScoreIdTransformable {
  static readonly scoreIdToString: typeof scoreIdToString
  static readonly stringToScoreId: typeof stringToScoreId
}

export namespace Monitored {
  export enum Status {
    Unknown,
    Down,
    Degraded,
    Up,
  }
  export const status = Symbol('status')
  export type Report = [Monitored.Status] | [Monitored.Status, string]
}

export interface Monitored {
  [Monitored.status]: Monitored.Report
}
