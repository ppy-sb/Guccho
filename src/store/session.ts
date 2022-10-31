import { defineStore } from 'pinia'
import md5 from 'md5'
import type { BaseUser } from '~/prototyping/types/user'
import { useClient } from '#imports'

/** counterストア */
export const useSession = defineStore('session', {
  state: () => ({
    userId: undefined as any,
    loggedIn: false,
    _cachedBaseUser: null as BaseUser<unknown> | null
  }),
  getters: {
    user: async state => state.loggedIn ? state._cachedBaseUser || await useClient().query('user.base', { handle: state.userId }) : null
  },
  actions: {
    async login (handle: string, passwordText: string) {
      const user = await useClient().query('user.login', { handle, md5HashedPassword: md5(passwordText) })
      if (!user) { return false }

      this.loggedIn = true
      this.userId = user.id
      this._cachedBaseUser = user
      return true
    }
  }
})
