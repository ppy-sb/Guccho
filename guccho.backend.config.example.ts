import { resolve } from 'node:path'
import { type ActiveBackendConfig } from './src/server/env'
import { env, safeEnv } from './src/server/common/utils'

export default {
  article: {
    location: resolve('articles'), // must be a resolved path. Put absolute path or use 'resolve()' here.
  },

  sessionStore: 'redis',
  leaderboardSource: 'redis',

  redisURL: safeEnv('REDIS_URL') ?? 'redis://localhost',
  dsn: env('DB_DSN'),

  avatar: {
    // must be a resolved path. Put absolute path or use 'resolve()' here.
    location: '/path/to/avatars/folder',
    domain: 'a.dev.ppy.sb',
  },

  api: {
    v1: 'http://api.dev.ppy.sb/v1',
  },

} satisfies ActiveBackendConfig
