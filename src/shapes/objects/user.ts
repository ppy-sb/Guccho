import type { LeaderboardRankingSystem, Mode } from '~/types/common'
import type { HitCount } from '~/types/score'
import type {
  PPRank,
  ScoreRank,
  UserModeRulesetStatistics,
} from '~/types/statistics'
import type { UserFull } from '~/types/user'

export const createISODate = (date: Date = new Date()) => date.toUTCString()

export const createScoreRank = (
  initial: ScoreRank = {
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
): ScoreRank => JSON.parse(JSON.stringify(initial))
export const createBeatmapSet = (
  initial = {
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
  },
) => JSON.parse(JSON.stringify(initial))

export const createBeatmap = (
  initial = {
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
  },
) => JSON.parse(JSON.stringify(initial))

export const createHitObject = <_Mode extends Mode>(mode: _Mode) =>
  mode === 'mania'
    ? ({
        max: 0,
        300: 0,
        200: 0,
        100: 0,
        50: 0,
        miss: 0,
      } satisfies HitCount<'mania'>)
    : ({
        300: 0,
        geki: 0,
        100: 0,
        katu: 0,
        50: 0,
        miss: 0,
      } satisfies HitCount<Exclude<Mode, 'mania'>>)

export const createPPRank = (
  initial: PPRank = {
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
  },
): PPRank => {
  const copy = JSON.parse(JSON.stringify(initial))

  return copy
}

export const createRulesetData = (
  mode: Mode,
  ppRankData: PPRank | undefined = undefined,
  scoreRankData: ScoreRank | undefined = undefined,
): UserModeRulesetStatistics<LeaderboardRankingSystem> => ({
  ppv2: createPPRank(ppRankData),
  ppv1: createPPRank(ppRankData),
  rankedScore: createScoreRank(scoreRankData),
  totalScore: createScoreRank(scoreRankData),
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
})
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
  status: 'idle',
  roles: ['normal', 'supported', 'supporter'],
  relationships: [],
  settings: {
    visibility: {
      reachable: { public: true },
      status: { public: true },
      privateMessage: { friends: true },
      email: { public: true },
      oldNames: { public: true },
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
  profile: {
    html: '<h1>what</h1>',
    raw: {},
  },
}

export const scoped = {
  demoUser: sampleUserWithSecrets,
}

export const demoUser = sampleUserWithSecrets
