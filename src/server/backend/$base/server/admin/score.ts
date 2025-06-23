import { IdTransformable } from '../@extends'

export namespace AdminScoreProvider {
  export interface MetricsParam {
    active: 'daily' | 'weekly' | 'monthly'
  }
  export interface Metrics {
    count: {
      total: number
      new: number
    }
  }
}

export abstract class AdminScoreProvider<Id> extends IdTransformable {
  abstract metrics(input: AdminScoreProvider.MetricsParam): Promise<AdminScoreProvider.Metrics>
}
