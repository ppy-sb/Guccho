import { defineAppConfig } from 'nuxt/app'
const config = {
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
  rankingSystem: {
    ppv2: {
      show: 'tab',
      name: 'Performance(v2)'
    },
    ppv1: {
      show: 'dropdown',
      name: 'Performance(v1)'
    },
    rankedScore: {
      show: 'tab',
      name: 'Ranked Score'
    },
    totalScore: {
      show: 'tab',
      name: 'Total Score'
    }
  },
  appModalTeleportTargetId: 'app-modal-portal'
}
export default defineAppConfig(config)
