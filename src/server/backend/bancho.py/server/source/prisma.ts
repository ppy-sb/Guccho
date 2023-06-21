import { PrismaClient } from 'prisma-client-bancho-py'

let prismaClientInstance: PrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
