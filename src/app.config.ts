import PackageJSON from '../package.json'
import type {
  LeaderboardRankingSystem,
} from '~/def/common'
import { Rank } from '~/def'

interface AppConfigItemBase {
  icon: string
}

const config: {
  baseUrl: string
  version: `${number}.${number}.${number}`

  leaderboardRankingSystem: Record<
    LeaderboardRankingSystem,
    AppConfigItemBase & {
      userpage: {
        show: 'tab' | 'dropdown'
      }
    }
  >
} = {
  baseUrl: 'dev.ppy.sb',
  version: PackageJSON.version as `${number}.${number}.${number}`,
  leaderboardRankingSystem: {
    [Rank.PPv2]: {
      userpage: {
        show: 'tab',
      },
      icon: 'pp',
    },
    [Rank.PPv1]: {
      userpage: {
        show: 'dropdown',
      },
      icon: 'pp',
    },
    [Rank.RankedScore]: {
      userpage: {
        show: 'tab',
      },
      icon: 'score',
    },
    [Rank.TotalScore]: {
      userpage: {
        show: 'tab',
      },
      icon: 'score',
    },
  },
}
export default defineAppConfig({
  ...config,
  appModalTeleportTargetId: 'app-modal-portal',
  needConfirmWebsite: false,
})
