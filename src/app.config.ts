import PackageJSON from '../package.json'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '~/def/common'
import { Mode, Rank, Ruleset } from '~/def'

interface AppConfigItemBase {
  name: string
  icon: string
}

const config: {
  baseUrl: string
  version: `${number}.${number}.${number}`
  title: string
  mode: Record<ActiveMode, AppConfigItemBase>
  ruleset: Record<ActiveRuleset, AppConfigItemBase>
  rankingSystem: Record<RankingSystem, { name: string }>
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
  title: 'Guccho',
  mode: {
    [Mode.Osu]: {
      name: 'Osu',
      icon: 'osu',
    },
    [Mode.Taiko]: {
      name: 'Taiko',
      icon: 'taiko',
    },
    [Mode.Fruits]: {
      name: 'CTB',
      icon: 'fruits',
    },
    [Mode.Mania]: {
      name: 'Mania',
      icon: 'mania',
    },
  },
  ruleset: {
    [Ruleset.Standard]: {
      name: 'Standard',
      icon: 'vn',
    },
    [Ruleset.Relax]: {
      name: 'Relax',
      icon: 'relax',
    },
    [Ruleset.Autopilot]: {
      name: 'Autopilot',
      icon: 'autopilot',
    },
  },
  leaderboardRankingSystem: {
    [Rank.PPv2]: {
      userpage: {
        show: 'tab',
      },
      name: 'Performance(v2)',
      icon: 'pp',
    },
    [Rank.PPv1]: {
      userpage: {
        show: 'dropdown',
      },
      name: 'Performance(v1)',
      icon: 'pp',
    },
    [Rank.RankedScore]: {
      userpage: {
        show: 'tab',
      },
      name: 'Ranked Score',
      icon: 'score',
    },
    [Rank.TotalScore]: {
      userpage: {
        show: 'tab',
      },
      name: 'Total Score',
      icon: 'score',
    },
  },
  rankingSystem: {
    [Rank.PPv2]: {
      name: 'Performance(v2)',
    },
    [Rank.PPv1]: {
      name: 'Performance(v1)',
    },
    [Rank.Score]: {
      name: 'Score',
    },
  },
}
export default defineAppConfig({
  ...config,
  appModalTeleportTargetId: 'app-modal-portal',
  needConfirmWebsite: false,
})
