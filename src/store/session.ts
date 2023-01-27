import type { TRPCError } from '@trpc/server'
import { defineStore } from 'pinia'
import md5 from 'md5'
import { checkUserPrivilege } from '../utils/checkUserPrivilege'
import type { UserFull } from '~/types/user'

export const useSession = defineStore('session', {
  state: (): {
    loggedIn: boolean
    userId?: string
    user?: Omit<UserFull<string>, 'statistics'>
    privilege: {
      hasAdminAccess: boolean
    }
  } => ({
    loggedIn: false,
    user: undefined,
    privilege: {
      hasAdminAccess: false,
    },
  }),
  actions: {
    async gotSession() {
      if (!this.user) {
        return
      }
      const privilege = checkUserPrivilege(this.user)
      this.privilege = privilege
    },
    async login(handle: string, passwordText: string) {
      const md5HashedPassword = md5(passwordText)
      const result = await this.loginHashed(handle, md5HashedPassword)
      await this.gotSession()
      return result
    },
    async loginHashed(handle: string, md5HashedPassword: string) {
      const { $client } = useNuxtApp()
      const result = await $client.session.login.query({
        handle,
        md5HashedPassword,
      })
      if (!result) {
        return false
      }

      this.$patch({
        loggedIn: true,
        userId: result.user.id,
        user: result.user,
      })
      return true
    },
    async destroy() {
      this.$reset()
      const cookie = useCookie('session')
      cookie.value = ''
    },
    async retrieve() {
      try {
        const { $client } = useNuxtApp()
        const result = await $client.session.retrieve.query()
        if (!result) {
          return
        }
        if (!result.user) {
          return
        }
        this.$patch({
          loggedIn: true,
          userId: result.user.id,
          user: result.user,
        })
        await this.gotSession()
        return true
      }
      catch (err) {
        if ((err as TRPCError)?.code === 'NOT_FOUND') {
          this.$reset()
        }

        return false
      }
    },
  },
})
