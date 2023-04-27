import type { Session } from '~/adapters/base/server/session'
import { SessionProvider as Base } from '~/adapters/base/server/session'

export class SessionProvider extends Base<string, Session> {
}
