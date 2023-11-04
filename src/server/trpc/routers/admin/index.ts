import { array, nativeEnum, number, object, string, tuple } from 'zod'
import { zodHandle } from '../../shapes'
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
    search: pAdmin.input(object({
      id: string().trim(),
      name: string().trim(),
      safeName: string().trim(),
      email: string().email(),
      flag: nativeEnum(CountryCode),
      registeredFrom: string().datetime(),
      registeredTo: string().datetime(),
      latestActivityFrom: string().datetime(),
      latestActivityTo: string().datetime(),
      roles: array(nativeEnum(UserRole)),
    }).partial().and(object({
      perPage: number().default(10),
      page: number().default(0),
    }))).query(({ input }) => {
      return admin.userList({
        ...input,
        flag: input.flag === CountryCode.Unknown ? undefined : input.flag,
        id: input.id ? UserProvider.stringToId(input.id) : undefined,
      })
    }),
    detail: pAdmin.input(string()).query(({ input }) => {
      return admin.userDetail({ id: UserProvider.stringToId(input) }).then(detail => mapId(detail, UserProvider.idToString))
    }),
    saveDetail: pAdmin.input(tuple([
      string(),
      object({
        id: string(),
        name: zodHandle,
        safeName: zodHandle,
        email: string().email(),
        flag: nativeEnum(CountryCode),
        roles: array(nativeEnum(UserRole)),
      }).partial()])).mutation(async ({ input }) => {
      const [id, newVal] = input
      const res = await admin.updateUserDetail(
        {
          id: UserProvider.stringToId(id),
        },
        {
          ...newVal,
          id: newVal.id ? UserProvider.stringToId(newVal.id) : undefined,
        })

      return mapId(res, UserProvider.idToString)
    }),
  }),
})
