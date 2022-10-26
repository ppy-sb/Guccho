import { useClient } from '#imports'

export default async () => {
  const client = useClient()
  return {
    rankingSystems: await client.query('getRankingSystems')
  }
}
