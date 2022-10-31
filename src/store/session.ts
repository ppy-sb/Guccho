import { defineStore } from 'pinia'
import md5 from 'md5'
import { IdType } from '../adapters/bancho.py/config'
import type { User } from '~/prototyping/types/user'
import { useClient } from '#imports'

/** counterストア */
export const useSession = defineStore('session', {
  state: (): {
    loggedIn: boolean,
    userId?: IdType,
    md5HashedPassword?: string
    _data?: Omit<User<IdType, true>, 'statistics'> | null
  } => ({
    loggedIn: false
  }),
  getters: {
    user: async state => state.loggedIn
      ? state._data || (
        state.userId &&
        state.md5HashedPassword &&
        await useClient()
          .query('user.login', {
            handle: state.userId,
            md5HashedPassword: state.md5HashedPassword
          })
      )
      : null
  },
  actions: {
    async login (handle: string, passwordText: string) {
      const md5HashedPassword = md5(passwordText)
      const user = await useClient().query('user.login', { handle, md5HashedPassword })
      if (!user) { return false }

      this.loggedIn = true
      this.userId = user.id
      this.md5HashedPassword = md5HashedPassword
      this._data = user
      return true
    }
  }
})
