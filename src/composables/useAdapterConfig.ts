import { settings } from '$active/dynamic-settings'
import {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  features as supportedFeatures,
  leaderboardRankingSystems as supportedLeaderboardRankingSystems,
  modes as supportedModes,
  rankingSystems as supportedRankingSystems,

  userRoles as supportedRoles,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'
import { LeaderboardScoreRank, PPRank, type Rank, ScoreRank } from '~/def'

const ppRanks = Object.values(PPRank) as Rank[]
const scoreRanks = Object.values(ScoreRank) as Rank[]
const leaderboardScoreRankingSystems = Object.values(LeaderboardScoreRank) as Rank[]

const supportedPPRankingSystems = Object.freeze(supportedRankingSystems.filter(
  rs => ppRanks.includes(rs),
))
const supportedScoreRankingSystems = Object.freeze(supportedRankingSystems.filter(
  rs => scoreRanks.includes(rs),
))
const supportedLeaderboardScoreRankingSystems
  = Object.freeze(supportedLeaderboardRankingSystems.filter(
    rs => leaderboardScoreRankingSystems.includes(rs),
  ))
export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedRankingSystems,
    supportedLeaderboardRankingSystems,
    supportedPPRankingSystems,
    supportedScoreRankingSystems,
    supportedLeaderboardPPRankingSystems: supportedPPRankingSystems,
    supportedLeaderboardScoreRankingSystems,
    settings,
    hasRuleset,
    hasLeaderboardRankingSystem,
    hasRankingSystem,
    supportedRoles,
    supportedFeatures,
  }
}
