import { resolve } from 'node:path'
import PackageJSON from './package.json'
import { Rank } from './src/def'
import { env, safeEnv } from './src/server/common/utils'
import type { GucchoConfig } from './src/def/config'

export default {
  use: {
    backend: 'ppy.sb@bancho.py',
  },
  ui: {
    baseUrl: 'dev.ppy.sb',
    version: PackageJSON.version,
    leaderboardRankingSystem: {
      [Rank.PPv2]: {
        userpage: {
          show: 'tab',
        },
      },
      [Rank.PPv1]: {
        userpage: {
          show: 'dropdown',
        },
      },
      [Rank.RankedScore]: {
        userpage: {
          show: 'tab',
        },
      },
      [Rank.TotalScore]: {
        userpage: {
          show: 'tab',
        },
      },
    },
  },

  backend: {
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

  },
} satisfies GucchoConfig
