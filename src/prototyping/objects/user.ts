import type { User } from '../types/user'
import { ScoreRank, PPRank, UserModeRulesetStatistics } from '../types/user'

(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

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
      [createISODate(new Date('2022-01-01'))]: BigInt(1_000_000_000)
    }
  }
): ScoreRank => JSON.parse(
  JSON.stringify(initial)
)

export const createPPRank = (
  initial: PPRank = {
    rank: 1,
    rankHistory: { [createISODate(new Date('2023-01-01'))]: 1 },
    countryRank: 1,
    // countryRankHistory: {[createISODate(new Date('2023-01-01'))]:1},
    accuracy: 0.98,
    performance: 100,
    performanceHistory: { [createISODate(new Date('2022-01-01'))]: 0, [createISODate(new Date('2023-01-01'))]: 100 }
  }
): PPRank => JSON.parse(JSON.stringify(initial))

export const createRulesetData = (
  ppRankData: PPRank | undefined = undefined,
  scoreRankData: ScoreRank | undefined = undefined
): UserModeRulesetStatistics => ({
  ranking: {
    ppv2: createPPRank(ppRankData),
    ppv1: createPPRank(ppRankData),
    rankedScore: createScoreRank(scoreRankData),
    totalScore: createScoreRank(scoreRankData)
  },
  playCount: 1,
  playTime: 10000,
  totalHits: 1
})
export const sampleUserWithSecrets: User<string, true> = {
  id: '',
  ingameId: 9999,
  name: 'ppy.sb',
  safeName: 'demo-user',
  // avatarUrl: '',
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
      privateMessage: 'friends',
      email: 'public',
      oldNames: 'public'
    }
  },
  secrets: {
    password: '123456788',
    apiKey: 'aaaaa-bbbbb'
  },
  statistics: {
    osu: {
      standard: createRulesetData(),
      autopilot: createRulesetData(),
      relax: createRulesetData()
    },
    taiko: {
      standard: createRulesetData(),
      relax: createRulesetData()
    },
    fruits: {
      standard: createRulesetData(),
      relax: createRulesetData()
    },
    mania: {
      standard: createRulesetData()
    }
  },
  profile: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {
          textAlign: 'left',
          level: 4
        },
        content: [
          {
            type: 'text',
            text: 'python highlighting'
          }
        ]
      },
      {
        type: 'codeBlock',
        attrs: {
          language: 'python'
        },
        content: [
          {
            type: 'text',
            text: '# Python program to check if year is a leap year or not\n\nyear = 2000\n\n# To get year (integer input) from the user\n# year = int(input("Enter a year: "))\n\n# divided by 100 means century year (ending with 00)\n# century year divided by 400 is leap year\nif (year % 400 == 0) and (year % 100 == 0):\n    print("{0} is a leap year".format(year))\n\n# not divided by 100 means not a century year\n# year divided by 4 is a leap year\nelif (year % 4 ==0) and (year % 100 != 0):\n    print("{0} is a leap year".format(year))\n\n# if not divided by both 400 (century year) and 4 (not century year)\n# year is not leap year\nelse:\n    print("{0} is not a leap year".format(year))'
          }
        ]
      }
    ]
  }
}

export const scoped = {
  demoUser: sampleUserWithSecrets
}

export const demoUser = sampleUserWithSecrets
