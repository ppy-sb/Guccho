import { useClient } from '#imports'

export default async () => {
  const client = await useClient()
  return {
    rankingSystems: await client.query('ranking-system-config')
  }
}
