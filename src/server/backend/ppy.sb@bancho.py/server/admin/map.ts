import { type Id } from '../..'
import { clearCache } from '../../api-client'
import { config } from '../../env'
import type { AdminMapProvider as Base } from '$base/server'
import {
  AdminMapProvider as BAdminMapProvider,
} from '~/server/backend/bancho.py/server'

export class AdminMapProvider extends BAdminMapProvider {
  config = config()
  async update(map: Base.UpdateParam<Id, Id>): Promise<Base.VeryCompactBeatmap<Id, Id>> {
    const gen = this.updateReturnOldThenNew(map)
    const oldMap = await gen.next() // skip the first value, which is the old map
    const returnValue = await gen.next()
    if (!returnValue.done) {
      throw new Error('Expected the generator to finish after yielding the new map')
    }
    await clearCache(this.config, {
      type: 'beatmap',
      hash: oldMap.value.md5,
    })
      .catch((error) => {
        console.error('Failed to clear cache:', error)
      })
    return returnValue.value
  }
}
