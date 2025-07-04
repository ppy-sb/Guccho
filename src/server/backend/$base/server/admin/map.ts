import { IdTransformable } from '../@extends'
import { type Mode } from '~/def'
import { type BeatmapSource, type Beatmapset, type RankingStatus } from '~/def/beatmap'
import { type PaginatedResult } from '~/def/pagination'

export namespace AdminMapProvider {
  export interface SearchOpt {
    keyword: string
    mode?: Mode
    requested: boolean
    page: number
    perPage: number
  }
  export type SearchResultData<Id, ForeignId> = Beatmapset<Id, ForeignId> & {
    maps: VeryCompactBeatmap<Id, ForeignId>[]
  }

  export interface VeryCompactBeatmap<Id, ForeignId> {
    id: Id
    version: string
    md5: string
    status: RankingStatus
    source?: BeatmapSource
    foreignId?: ForeignId
    vote?: number
  }

  export interface UpdateParam<LocalId, ForeignId> extends Partial<AdminMapProvider.VeryCompactBeatmap<LocalId, ForeignId>> {
    id: LocalId
  }

  export interface MetricsParam {
    active: 'daily' | 'weekly' | 'monthly'
  }
  export interface Metrics {
    count: {
      total: number
      new: number
      ranked: number
      custom: number
    }
  }
}

export abstract class AdminMapProvider<Id, ForeignId> extends IdTransformable {
  abstract search(opt: AdminMapProvider.SearchOpt): Promise<PaginatedResult<AdminMapProvider.SearchResultData<Id, ForeignId>>>
  abstract update(map: AdminMapProvider.UpdateParam<Id, ForeignId>): Promise<AdminMapProvider.VeryCompactBeatmap<Id, ForeignId>>
  abstract metrics(input: AdminMapProvider.MetricsParam): Promise<AdminMapProvider.Metrics>
}
