import { z } from 'zod'
import { router as log } from './log'
import { UserProvider } from '$active/server'
import { adminProcedure as pAdmin } from '~/server/trpc/middleware/admin'
import { router as _router } from '~/server/trpc/trpc'
import { UserRole } from '~/def/user'
import { admin } from '~/server/singleton/service'
import { CountryCode } from '~/def/country-code'


export const router = _router({
  log,
  serverStatus: pAdmin.query(() => {
    return {
      t: 1,
    }
  }),
  userManagement: _router({
    search: pAdmin.input(z.object({
      id: z.string().trim(),
      name: z.string().trim(),
      safeName: z.string().trim(),
      email: z.string().email(),
      flag: z.nativeEnum(CountryCode),
      registeredFrom: z.string().datetime(),
      registeredTo: z.string().datetime(),
      latestActivityFrom: z.string().datetime(),
      latestActivityTo: z.string().datetime(),
      roles: z.array(z.nativeEnum(UserRole)),
    }).partial().and(z.object({
      perPage: z.number().min(1).max(20).default(10),
      page: z.number().min(0).max(10).default(0),
    }))).query(({ ctx, input }) => {
      return admin.userList({
        ...input,
        flag: input.flag === CountryCode.Unknown ? undefined : input.flag,
        id: input.id ? UserProvider.stringToId(input.id) : undefined,
      })
    }),
    detail: pAdmin.input(z.string()).query(({ input }) => {
      return admin.userDetail({ id: UserProvider.stringToId(input) })
    }),
  }),
})
