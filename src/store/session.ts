import { defineStore } from 'pinia'
import md5 from 'md5'
import { IdType } from '~/adapters/bancho.py/config'
import type { UserFull } from '~/prototyping/types/user'
import { useClient } from '#imports'

/** counterストア */
export const useSession = defineStore('session', {
  state: (): {
    loggedIn: boolean,
    userId?: IdType,
    md5HashedPassword?: string
    _data: Partial<Omit<UserFull<IdType>, 'statistics'>>,
    sessionId?: string
  } => ({
    loggedIn: false,
    _data: {}
  }),
  actions: {
    async login (handle: string, passwordText: string) {
      const md5HashedPassword = md5(passwordText)
      return await this.loginHashed(handle, md5HashedPassword)
    },
    async loginHashed (handle: string, md5HashedPassword: string) {
      const result = await useClient().query('user.login', { handle, md5HashedPassword })
      if (!result) { return false }

      this.$patch({
        loggedIn: true,
        userId: result.user.id,
        md5HashedPassword,
        _data: result.user,
        sessionId: result.sessionId
      })
      return true
    },
    async retrieve (sessionId: string) {
      const result = await useClient().query('user.retrieve-session', { sessionId })
      if (!result) { return }
      if (!result.user) { return }
      this.$patch({
        loggedIn: true,
        userId: result.user.id,
        _data: result.user,
        sessionId: result.sessionId
      })
      return true
    }
  }
})
