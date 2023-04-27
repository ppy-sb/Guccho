import { getPrismaClient } from './source/prisma'
import { ServiceStatusProvider as Base } from '~/adapters/base/server'

export class ServiceStatusProvider extends Base implements Base {
  prismaState = false
  async ready() {
    try {
      if (!this.prismaState) {
        await getPrismaClient().$connect()
      }
      this.prismaState = true
    }
    catch (e) {
      this.prismaState = false
    }
    return this.prismaState
  }
}
