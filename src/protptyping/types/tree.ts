import type { User } from './user'

import type { Beatmap, LocalSource, ForeignSource, RankingStatusEnum, BeatmapSource } from './beatmap'

export type { User } from './user'
export type { Beatmap } from './beatmap'

export interface BusinessModel<Id> {
  getUserById(id: Id, secrets: boolean): User<Id, typeof secrets extends true ? true : false> | null
  searchUsers(query: Partial<User<Id, true>>, secrets?: boolean): User<Id, typeof secrets extends true ? true : false>[]

  getBeatmapById<ForeignId>
  (id: Id): Beatmap<LocalSource | ForeignSource, RankingStatusEnum, Id, ForeignId> | null
  searchBeatmaps<Source extends BeatmapSource, Status extends RankingStatusEnum, Id, ForeignId>
  (query: Partial<Beatmap<Source, Status, Id, ForeignId>>): Beatmap<Source, Status, Id, ForeignId>[]
}
