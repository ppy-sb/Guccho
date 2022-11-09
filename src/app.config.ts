import { defineAppConfig } from 'nuxt/app'

import { Mode, RankingSystem, Ruleset } from '~/types/common'

type AppConfigItemBase = {
  name: string,
  icon: string,
}

const config: {
  baseUrl: string,
  version: {
    api: string,
    front: string,
  }
  title: string,
  mode: Record<
    Mode,
    AppConfigItemBase
  >,
  ruleset: Record<
    Ruleset,
    AppConfigItemBase
  >,
  rankingSystem: Record<
    RankingSystem,
    AppConfigItemBase
  >
  appModalTeleportTargetId: string
} = {
  baseUrl: 'dev.ppy.sb',
  version: {
    api: '1.0.3',
    front: '1.0.3'
  },
  title: 'guweb@next',
  mode: {
    osu: {
      name: 'Osu',
      icon: 'osu'
    },
    taiko: {
      name: 'Taiko',
      icon: 'taiko'
    },
    fruits: {
      name: 'CTB',
      icon: 'catch'
    },
    mania: {
      name: 'Mania',
      icon: 'mania'
    }
  },
  ruleset: {
    standard: {
      name: 'Standard',
      icon: 'vn'
    },
    relax: {
      name: 'Relax',
      icon: 'relax'
    },
    autopilot: {
      name: 'Autopilot',
      icon: 'autopilot'
    }
  },
  rankingSystem: {
    ppv2: {
      name: 'Performance(v2)',
      icon: 'pp'
    },
    ppv1: {
      name: 'Performance(v1)',
      icon: 'pp'
    },
    totalScore: {
      name: 'Total Score',
      icon: 'tscore'
    },
    rankedScore: {
      name: 'Ranked score',
      icon: 'rscore'
    }
  },
  appModalTeleportTargetId: 'app-modal-portal'
}
export default defineAppConfig(config)

export type AppConfig = typeof config
