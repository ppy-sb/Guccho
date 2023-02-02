import { prismaClient } from '.'
import { StatusProvider as PSP } from '~/adapters/base/client/status'

export class StatusProvider extends PSP implements PSP {
  prismaState = false
  async ready() {
    try {
      if (!this.prismaState) {
        await prismaClient.$connect()
      }
      this.prismaState = true
    }
    catch (e) {
      this.prismaState = false
    }
    return this.prismaState
  }
}
