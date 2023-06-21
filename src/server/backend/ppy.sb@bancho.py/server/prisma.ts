import { PrismaClient } from 'prisma-client-ppy-sb'

let prismaClientInstance: PrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
