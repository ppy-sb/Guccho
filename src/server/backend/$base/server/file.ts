import type { H3Event } from 'h3'

export abstract class FileProvider<Id, ScoreId> {
  abstract replay(id: ScoreId, ev: H3Event): Promise<void>
}
