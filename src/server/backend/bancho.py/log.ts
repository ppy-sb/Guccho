import { Logger as BaseLogger } from '$base/logger'

export const Logger = BaseLogger.child({ label: 'bancho.py', backend: 'bancho.py' })
