import { defineStore } from 'pinia'
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
    async login () {
      this.loggedIn = true
      this.userId = 1001
      this._cachedBaseUser = await useClient().query('user.base', { handle: this.userId })
      return true
    }
  }
})
