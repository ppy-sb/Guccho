import { config } from '../../env'
import { RedisSessionStore } from './redis-session-store'
import { Monitored } from '$base/server/@extends'
import { SessionProvider as Base, MemorySessionProvider, type Session } from '$base/server/session'

export class RedisSessionProvider extends Base<Session> implements Base<Session> {
  static redisStore = new RedisSessionStore<Session>()
  get [Monitored.status]() {
    return this.store[Monitored.status]
  }

  prepare() {
    return RedisSessionProvider.redisStore
  }
}
export type SessionProvider = RedisSessionProvider | MemorySessionProvider<Session>
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SessionProvider = (config().sessionStore === 'redis' ? RedisSessionProvider : MemorySessionProvider) as unknown as { new(): RedisSessionProvider }
