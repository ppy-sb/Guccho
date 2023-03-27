import type { TRPCError } from '@trpc/server'
import md5 from 'md5'
import { defineStore } from 'pinia'
import { calcUserPrivilege } from '../utils/checkUserPrivilege'
import type { UserFull } from '~/types/user'

export const useSession = defineStore('session', {
  state: (): {
    loggedIn: boolean
    userId?: string
    user?: Omit<UserFull<string>, 'statistics'>
    privilege: {
      staff: boolean
    }
  } => ({
    loggedIn: false,
    user: undefined,
    privilege: {
      staff: false,
    },
  }),
  actions: {
    async gotSession() {
      if (!this.user) {
        return
      }
      const privilege = calcUserPrivilege(this.user)
      this.privilege = privilege
    },
    async login(handle: string, passwordText: string) {
      const md5HashedPassword = md5(passwordText)
      const result = await this.loginHashed(handle, md5HashedPassword)
      await this.gotSession()
      return result
    },
    async loginHashed(handle: string, md5HashedPassword: string) {
      const app$ = useNuxtApp()
      const result = await app$.$client.session.login.query({
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
      this.setAvatarTimestamp()
      return true
    },
    async destroy() {
      this.$reset()
      const cookie = useCookie('session')
      cookie.value = ''
    },
    async retrieve() {
      try {
        const app$ = useNuxtApp()
        const result = await app$.$client.session.retrieve.query()
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
        this.setAvatarTimestamp()
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

    setAvatarTimestamp() {
      if (!this.user) {
        return
      }

      this.user.avatarSrc = `${this.user.avatarSrc}?${Date.now()}`
    },
  },
})
