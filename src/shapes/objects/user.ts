import type { RulesetScore } from '~/types/score'
import type { Mode, RankingSystem, Ruleset } from '~/types/common'
import type { UserFull } from '~/types/user'
import type { PPRank, ScoreRank, UserModeRulesetStatistics } from '~~/src/types/statistics'

export const createISODate = (date: Date = new Date()) => date.toUTCString()

export const createScoreRank = (
  initial: ScoreRank<unknown, Mode, Ruleset, RankingSystem> = {
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
  },
): ScoreRank<unknown, Mode, Ruleset, RankingSystem> => JSON.parse(
  JSON.stringify(initial),
)
export const createBeatmapSet = (initial = {
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
}) => JSON.parse(JSON.stringify(initial))

export const createBeatmap = (initial = {
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
}) => JSON.parse(JSON.stringify(initial))

export const createHitObject = <_Mode extends Mode>(mode: _Mode) => (mode === 'mania'
  ? {
      max: 0,
      300: 0,
      200: 0,
      100: 0,
      50: 0,
      miss: 0,
    }
  : {
      300: 0,
      geki: 0,
      100: 0,
      katu: 0,
      50: 0,
      miss: 0,
    }) as unknown as RulesetScore<unknown, unknown, _Mode, Ruleset, RankingSystem>['hit']

export const createPPRank = <_Mode extends Mode>(
  initial: PPRank<unknown, _Mode, Ruleset, RankingSystem> = {
    rank: 1,
    rankHistory: { [createISODate(new Date('2023-01-01'))]: 1 },
    countryRank: 1,
    // countryRankHistory: {[createISODate(new Date('2023-01-01'))]:1},
    accuracy: 0.98,
    performance: 100,
    performanceHistory: { [createISODate(new Date('2022-01-01'))]: 0, [createISODate(new Date('2023-01-01'))]: 100 },
  },
  mode: _Mode,
): PPRank<unknown, _Mode, Ruleset, RankingSystem> => {
  const copy = JSON.parse(JSON.stringify(initial)) as PPRank<unknown, _Mode, Ruleset, RankingSystem>

  copy.bests = [{
    id: 13n,
    mods: [],
    score: 999_999_999_999n,
    scoreRank: 0,
    grade: 'ssh',
    ppv2: {
      pp: 0,
      rank: 0,
    },
    ppv1: {
      pp: 0,
      rank: 0,
    },
    playedAt: new Date(0),
    maxCombo: 0,
    hit: createHitObject(mode),
    beatmap: createBeatmap(),
    accuracy: 98,
  }]

  return copy
}

export const createRulesetData = <M extends Mode, Rs extends Ruleset, R extends RankingSystem>(
  mode: M,
  ppRankData: PPRank<unknown, M, Rs, RankingSystem> | undefined = undefined,
  scoreRankData: ScoreRank<unknown, M, Rs, RankingSystem> | undefined = undefined,
) => ({
    ppv2: createPPRank(ppRankData, mode),
    ppv1: createPPRank(ppRankData, mode),
    rankedScore: createScoreRank(scoreRankData),
    totalScore: createScoreRank(scoreRankData),
    playCount: 1,
    playTime: 10000,
    totalHits: 1,
    level: 0.0,
  }) as UserModeRulesetStatistics<unknown, M, Rs, R>
export const sampleUserWithSecrets: Required<UserFull<unknown>> = {
  id: '',
  ingameId: 9999,
  name: 'ppy.sb',
  safeName: 'demo-user',
  avatarUrl: '/images/1.png',
  oldNames: [],
  flag: 'us',
  email: 'user@example.com',
  reachable: true,
  status: 'idle',
  roles: ['normal', 'supported', 'supporter'],
  relationships: [],
  preferences: {
    scope: {
      reachable: 'public',
      status: 'public',
      privateMessage: 'friends',
      email: 'public',
      oldNames: 'public',
    },
  },
  secrets: {
    password: '123456788',
    apiKey: 'aaaaa-bbbbb',
  },
  statistics: {
    osu: {
      standard: createRulesetData('osu'),
      autopilot: createRulesetData('osu'),
      relax: createRulesetData('osu'),
    },
    taiko: {
      standard: createRulesetData('taiko'),
      relax: createRulesetData('taiko'),
    },
    fruits: {
      standard: createRulesetData('fruits'),
      relax: createRulesetData('fruits'),
    },
    mania: {
      standard: createRulesetData('mania'),
    },
  },
  profile: '<h1>what</h1>',
  profileJSON: {},
}

export const scoped = {
  demoUser: sampleUserWithSecrets,
}

export const demoUser = sampleUserWithSecrets
