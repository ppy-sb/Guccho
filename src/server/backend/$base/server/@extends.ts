import type { idToString, scoreIdToString, stringToId, stringToScoreId } from '$base'

export abstract class IdTransformable {
  static idToString: typeof idToString
  static stringToId: typeof stringToId
}

export abstract class ScoreIdTransformable {
  static scoreIdToString: typeof scoreIdToString
  static stringToScoreId: typeof stringToScoreId
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
