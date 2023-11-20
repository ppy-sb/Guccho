import { resolve } from 'node:path'
import { type UserBackendConfig } from './src/def/config'
import { env, safeEnv } from './src/server/common/utils'

export default {
  use: 'ppy.sb@bancho.py',
  article: {
    location: resolve('articles'), // must be a resolved path. Put absolute path or use 'resolve()' here.
  },

  sessionStore: 'redis',
  leaderboardSource: 'redis',

  redisURL: safeEnv('REDIS_URL') ?? 'redis://localhost',
  dsn: env('DB_DSN'),

  avatar: {
    // must be a resolved path. Put absolute path or use 'resolve()' here.
    location: resolve('.dump/ppy.sb/avatar'),
    domain: 'a.ppy.sb',
  },

  api: {
    v1: 'http://api.dev.ppy.sb/v1',
  },

} satisfies UserBackendConfig
