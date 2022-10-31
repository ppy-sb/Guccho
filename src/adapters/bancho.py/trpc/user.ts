// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getBaseUser, getFullUser } from '../backend-clients'

import { ServerRulesetConfig } from '../config'

export const router = trpc.router()
  .query('user.full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, false)
      return user
    }
  })
  .query('user.full-secret', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, true)
      return user
    }
  })
  .query('user.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })
  .query('user.login', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      md5HashedPassword: z.string()
    }),
    async resolve ({ input: { handle, md5HashedPassword } }) {
      /** python implementation for reference
       * # check credentials (password) against db
       * # intentionally slow, will cache to speed up
       * if pw_bcrypt in bcrypt_cache:
       *     if pw_md5 != bcrypt_cache[pw_bcrypt]:  # ~0.1ms
       *         if glob.config.debug:
       *             log(f"{username}'s login failed - pw incorrect.", Ansi.LYELLOW)
       *         return await flash("error", t("login.password-incorrect"), "login")
       * else:  # ~200ms
       *     if not bcrypt.checkpw(pw_md5, pw_bcrypt):
       *         if glob.config.debug:
       *             log(f"{username}'s login failed - pw incorrect.", Ansi.LYELLOW)
       *         return await flash("error", t("login.password-incorrect"), "login")

       *     # login successful; cache password for next login
       *     bcrypt_cache[pw_bcrypt] = pw_md5
       */

      try {
        const user = await getBaseUser(handle, true)
        if (!user) { return false }
        const result = await bcrypt.compare(md5HashedPassword, user.secrets.password)
        if (!result) { return false } else {
          return {
            ...user,
            secrets: undefined
          }
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  })

  .query('users.base', {
    input: z.object({
      role: z.array(z.string())
    }),
    resolve ({ input }) {
      return []
    }
  })

  .query('ranking-system-config', {
    resolve () {
      return ServerRulesetConfig
    }
  })

  .query('server-has-owner', {
    resolve () {
      return false
    }
  })
