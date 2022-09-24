import { defineAppConfig } from '#app'

import { rankingSystem } from '~/prototyping/objects/ranking-system-names'
export default defineAppConfig({
  baseUrl: 'dev.ppy.sb',
  version: {
    api: '1.0.3',
    front: '1.0.3'
  },
  title: 'guweb@next',
  mode: [
    {
      name: 'Osu',
      icon: 'osu'
    },
    {
      name: 'Taiko',
      icon: 'taiko'
    },
    {
      name: 'Catch',
      icon: 'catch'
    },
    {
      name: 'Mania',
      icon: 'mania'
    }
  ],
  mods: [
    {
      name: 'Standard(Vanilla)',
      icon: 'vn'
    },
    {
      name: 'Relax',
      icon: 'rx'
    },
    {
      name: 'Autopilot',
      icon: 'ap'
    }
  ],
  rankingSystem,
  appModalTeleportTargetId: 'app-modal-portal'
})
