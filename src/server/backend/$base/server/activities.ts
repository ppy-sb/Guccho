import { type Beatmapset } from '~/def/beatmap'
import { type Paginated } from '~/def/pagination'
import { type ScoreCompact } from '~/def/score'

enum ActivityType {
  Login,
  Logout,
  Match,
  LeaveScoresOnBeatmap,
}

interface HaveClientData {
  client: string
}

interface LoginData extends HaveClientData {
}
interface logoutData extends HaveClientData {
}

interface GroupedScores<BS extends Beatmapset<any, any>, Score extends ScoreCompact<any, any>> {
  beatmap: BS
  scores: Score[]
}

// interface MatchData<IdType> {
//   match: {
//     id: IdType
//   }
// }

type Activity<BS extends Beatmapset<any, any>, Score extends ScoreCompact<any, any>> =
| [ActivityType.Login, LoginData]
| [ActivityType.Logout, logoutData]
| [ActivityType.LeaveScoresOnBeatmap, GroupedScores<BS, Score>]

export namespace ActivityProvider {
  export interface GetUserRecentActivityParam<Id> {
    id: Id
  }
  export interface getUserRecentActivityReturnType<BS extends Beatmapset<any, any>, Score extends ScoreCompact<any, any>> {
    [Paginated.Count]: number
    [Paginated.Data]: Activity<BS, Score>[]
  }
}
export abstract class ActivityProvider<Id, BS extends Beatmapset<any, any>, Score extends ScoreCompact<any, any>> {
  abstract getUserRecentActivity(input: ActivityProvider.GetUserRecentActivityParam<Id>): ActivityProvider.getUserRecentActivityReturnType<BS, Score>
}
