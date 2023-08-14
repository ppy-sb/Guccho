import { defineBackendConfig, env, safeEnv } from './src/server/env'

/**
 * recommend: edit this config with typescript supported editor, you will get immediate type check.
 * if you don't have the editor, you can run command `yarn check-backend-config` instead.
 *
 * you can use env('key') to read from environment variables. It will raise error if env not found.
 *
 * you can also use safeEnv('key'). it will not raise any error, but instead returns undefined.
 * for a required field this will raise an compiler error.
 * you can write safeEnv('key') || fallbackValue to provide a fallback config.
 *
 */
export default defineBackendConfig({

  article: {
    location: 'article',
  },

  sessionStore: 'redis',
  leaderboardSource: 'redis',

  redisURL: safeEnv('REDIS_URL') || 'redis://localhost',
  dsn: env('DB_DSN'),

  avatar: {
    location: '/path/to/avatars/folder',
    domain: '//a.dev.ppy.sb',
  },

  api: {
    v1: 'http://api.dev.ppy.sb/v1',
  },

})
