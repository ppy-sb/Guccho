import { config } from '../../env'
import { RedisSessionStore } from './redis-session-store'
import type { Session } from '$base/server/session'
import { SessionProvider as Base, MemorySessionProvider } from '$base/server/session'
import { Monitored } from '$base/server/@extends'

const s = lazySingleton(<TSession extends Session>() => new RedisSessionStore<TSession>())

export class RedisSessionProvider extends Base<Session> implements Base<Session> {
  get [Monitored.status]() {
    return this.store[Monitored.status]
  }

  prepare() {
    return s<Session>()
  }
}

export const SessionProvider = config().sessionStore === 'redis' ? RedisSessionProvider : MemorySessionProvider
