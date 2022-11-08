import { defineAppConfig } from 'nuxt/app'

import { Mode, Ruleset } from '~/types/common'

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
    mode: Array<AppConfigItemBase & {
      mode: Mode
    }>,
    rulesets: Array<AppConfigItemBase & {
      ruleset: Ruleset
    }>,
    appModalTeleportTargetId: string
  } = {
    baseUrl: 'dev.ppy.sb',
    version: {
      api: '1.0.3',
      front: '1.0.3'
    },
    title: 'guweb@next',
    mode: [
      {
        name: 'Osu',
        icon: 'osu',
        mode: 'osu'
      },
      {
        name: 'Taiko',
        icon: 'taiko',
        mode: 'taiko'
      },
      {
        name: 'Fruits',
        icon: 'catch',
        mode: 'fruits'
      },
      {
        name: 'Mania',
        icon: 'mania',
        mode: 'mania'
      }
    ],
    rulesets: [
      {
        name: 'Standard',
        icon: 'vn',
        ruleset: 'standard'
      },
      {
        name: 'Relax',
        icon: 'relax',
        ruleset: 'relax'
      },
      {
        name: 'Autopilot',
        icon: 'autopilot',
        ruleset: 'autopilot'
      }
    ],
    appModalTeleportTargetId: 'app-modal-portal'
  }
export default defineAppConfig(config)

export type AppConfig = typeof config
