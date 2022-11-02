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
    _data: Partial<Omit<UserFull<IdType>, 'statistics'>>
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
      const user = await useClient().query('user.login', { handle, md5HashedPassword })
      if (!user) { return false }

      this.$patch({
        loggedIn: true,
        userId: user.id,
        md5HashedPassword,
        _data: user
      })
      return true
    }
  }
})
