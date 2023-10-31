import { config } from '../../env'
import { RedisSessionStore } from './redis-session-store'
import { Monitored } from '$base/server/@extends'
import { SessionProvider as Base, MemorySessionProvider, type Session } from '$base/server/session'

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
