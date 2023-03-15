import { prismaClient } from './prisma'
import { ServiceStatusProvider as Base } from '~/adapters/base/server'

export class ServiceStatusProvider extends Base implements Base {
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
