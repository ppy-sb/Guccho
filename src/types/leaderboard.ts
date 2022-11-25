import { Maybe } from './frontend-common'
import { PPRankingSystem, RankingSystem, ScoreRankingSystem } from './common'

export interface LeaderboardItem<IdType, _RankingSystem extends RankingSystem = RankingSystem> {
  user: {
    id: IdType;
    name: string;
    safeName: string;
    flag: string;
    avatarUrl: string;
    inThisLeaderboard: {
      accuracy: number;
      playCount: number;
    }
    & Record<keyof _RankingSystem & PPRankingSystem, number>
    & Record<keyof _RankingSystem & ScoreRankingSystem, bigint>;
  };
  rank: bigint;
}

export interface ComponentLeaderboardItem<IdType, _RankingSystem extends RankingSystem = RankingSystem> {
  rank: bigint
  user: Maybe<LeaderboardItem<IdType, _RankingSystem>['user'], 'inThisLeaderboard'>
}
