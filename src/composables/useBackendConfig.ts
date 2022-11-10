
import { serverRankingSystemConfig } from '~/server/trpc/config'
export default () => {
  // const client = await useClient()
  return {
    // rankingSystems: await client.query('ranking-system-config')
    rankingSystem: serverRankingSystemConfig
  }
}
