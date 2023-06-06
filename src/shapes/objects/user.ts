import { Mode, Rank, Ruleset, Scope } from '~/types/defs'
import type { ActiveMode, LeaderboardRankingSystem } from '~/types/common'
import type { HitCount } from '~/types/score'
import type {
  PPRank,
  ScoreRank,
  UserModeRulesetStatistics,
} from '~/types/statistics'
import { UserFull, UserPrivilege, UserStatus } from '~/types/user'

export function createISODate(date: Date = new Date()) {
  return date.toUTCString()
}

export function createScoreRank(initial: ScoreRank = {
  rankHistory: { [createISODate(new Date('2023-01-01'))]: 1 },
  countryRank: 1,
  // countryRankHistory: {[createISODate(new Date('2023-01-01'))]:1},
  accuracy: 0.98,
  score: BigInt(1_000_000_000),
  scoreHistory: {
    [createISODate(new Date('2021-01-01'))]: BigInt(0),
    [createISODate(new Date('2021-02-01'))]: BigInt(200_000_000),
    [createISODate(new Date('2021-03-01'))]: BigInt(800_000_000),
    [createISODate(new Date('2022-01-01'))]: BigInt(1_000_000_000),
  },
}): ScoreRank {
  return JSON.parse(JSON.stringify(initial))
}
export function createBeatmapSet(initial = {
  id: 1234,
  source: 'bancho',
  foreignId: '1122',
  meta: {
    artist: '名無しアーティスト',
    title: '曲のタイトル',
    intl: {
      artist: 'unknown artist',
      title: 'song title',
    },
  },
}) {
  return JSON.parse(JSON.stringify(initial))
}

export function createBeatmap(initial = {
  id: 12345,
  foreignId: '11223',

  status: 'ranked',
  properties: {
    bpm: 120,
    circleSize: 9,
    approachRate: 9,
    accuracy: 8,
    hpDrain: 6,
    count: {
      circles: 200,
      sliders: 95,
      spinners: 2,
    },
  },
  md5: 'ed390d5c6d138c4f910035d054ccffc5',
  beatmapset: createBeatmapSet(),
}) {
  return JSON.parse(JSON.stringify(initial))
}

export function createHitObject<_Mode extends ActiveMode>(mode: _Mode) {
  return mode === Mode.Mania
    ? ({
        max: 0,
        300: 0,
        200: 0,
        100: 0,
        50: 0,
        miss: 0,
      } satisfies HitCount<Mode.Mania>)
    : ({
        300: 0,
        geki: 0,
        100: 0,
        katu: 0,
        50: 0,
        miss: 0,
      } satisfies HitCount<Exclude<ActiveMode, Mode.Mania>>)
}

export function createPPRank(initial: PPRank = {
  rank: 1,
  rankHistory: { [createISODate(new Date('2023-01-01'))]: 1 },
  countryRank: 1,
  // countryRankHistory: {[createISODate(new Date('2023-01-01'))]:1},
  accuracy: 0.98,
  performance: 100,
  performanceHistory: {
    [createISODate(new Date('2022-01-01'))]: 0,
    [createISODate(new Date('2023-01-01'))]: 100,
  },
}): PPRank {
  const copy = JSON.parse(JSON.stringify(initial))

  return copy
}

export function createRulesetData(mode: ActiveMode,
  ppRankData: PPRank | undefined = undefined,
  scoreRankData: ScoreRank | undefined = undefined): UserModeRulesetStatistics<LeaderboardRankingSystem> {
  return {
    [Rank.PPv2]: createPPRank(ppRankData),
    [Rank.PPv1]: createPPRank(ppRankData),
    [Rank.RankedScore]: createScoreRank(scoreRankData),
    [Rank.TotalScore]: createScoreRank(scoreRankData),
    playCount: 1,
    playTime: 10000,
    totalHits: 1,
    level: 0.0,
    maxCombo: 999,
    replayWatchedByOthers: 9,
    scoreRankComposition: {
      ssh: 0,
      ss: 0,
      sh: 0,
      s: 0,
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      f: 0,
    },
  }
}
export const sampleUserWithSecrets: Required<UserFull<unknown>> = {
  id: '',
  ingameId: 9999,
  name: 'ppy.sb',
  safeName: 'demo-user',
  avatarSrc: '/images/1.png',
  oldNames: [],
  flag: 'us',
  email: 'user@example.com',
  reachable: true,
  status: UserStatus.Idle,
  roles: [UserPrivilege.Normal, UserPrivilege.Supported, UserPrivilege.Supporter],
  relationships: [],
  settings: {
    accessControl: {
      reachable: { [Scope.Public]: true },
      status: { [Scope.Public]: true },
      privateMessage: { [Scope.Friends]: true },
      email: { [Scope.Public]: true },
      oldNames: { [Scope.Public]: true },
    },
  },
  secrets: {
    password: '123456788',
    apiKey: 'aaaaa-bbbbb',
  },
  statistics: {
    [Mode.Osu]: {
      [Ruleset.Standard]: createRulesetData(Mode.Osu),
      [Ruleset.Autopilot]: createRulesetData(Mode.Osu),
      [Ruleset.Relax]: createRulesetData(Mode.Osu),
    },
    [Mode.Taiko]: {
      [Ruleset.Standard]: createRulesetData(Mode.Taiko),
      [Ruleset.Relax]: createRulesetData(Mode.Taiko),
    },
    [Mode.Fruits]: {
      [Ruleset.Standard]: createRulesetData(Mode.Fruits),
      [Ruleset.Relax]: createRulesetData(Mode.Fruits),
    },
    [Mode.Mania]: {
      [Ruleset.Standard]: createRulesetData(Mode.Mania),
    },
  },
  profile: {
    html: '<h1>what</h1>',
  },
}

export const scoped = {
  demoUser: sampleUserWithSecrets,
}

export const demoUser = sampleUserWithSecrets
