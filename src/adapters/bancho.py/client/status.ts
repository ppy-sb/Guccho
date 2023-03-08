import { prismaClient } from '.'
import { StatusProvider as Base } from '~/adapters/base'

export class StatusProvider extends Base implements Base {
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
