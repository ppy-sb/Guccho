import { RankingSystem } from '~/prototyping/types/shared'
export const rankingSystem: Record<RankingSystem, {
  show: 'tab' | 'dropdown' | false
  name: string
}> = {
  ppv2: {
    show: 'tab',
    name: 'Performance(v2)'
  },
  ppv1: {
    show: 'dropdown',
    name: 'Performance(v1)'
  },
  rankedScores: {
    show: 'tab',
    name: 'Ranked Scores'
  },
  totalScores: {
    show: 'tab',
    name: 'Total Scores'
  }
}
