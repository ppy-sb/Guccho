import type { User } from '../types/tree'
import { UserAPI } from '../types/user'
import { MockUser } from './user'
export const sampleUserWithSecrets: User<string, true> = {
  id: 'xxxxxyyyy',
  ingameId: 9999,
  name: 'ppy.sb',
  safeName: 'ppy-sb',
  oldNames: [],
  flag: 'us',
  email: 'user@example.com',
  reachable: true,
  status: 'idle',
  friends: [],
  preferences: {
    allowPrivateMessage: true,
    visibility: {
      email: 'public',
      oldNamesDefault: 'public'
    }
  },
  secrets: {
    password: '123456788',
    apiKey: 'aaaaa-bbbbb'
  },
  bio: { type: 'doc', content: [{ type: 'paragraph', attrs: { textAlign: 'left' }, content: [{ type: 'text', text: 'fasdfasdasd' }] }, { type: 'paragraph', attrs: { textAlign: 'left' } }, { type: 'codeBlock', attrs: { language: 'javascript' }, content: [{ type: 'text', text: 'const a = sb()' }] }] },
  statistics: {
    osu: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1000,
            rankGraph: [1],
            countryRank: 10,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      },
      autopilot: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      }
    },
    taiko: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      }
    },
    fruits: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      }
    },
    mania: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          ppv1: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            performance: 100,
            performanceGraph: [0, 100]
          },
          totalScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          },
          rankedScores: {
            rank: 1,
            rankGraph: [1],
            countryRank: 1,
            // countryRankGraph: [1],
            score: 1_000_000_000,
            scoreGraph: [0, 200_000_000, 800_000_000, 1_000_000_000]
          }
        }
      }
    }
  }
}

// class MockUser implements UserAPI<string> {
//   _data: Partial<User<string>>
//   _danger: boolean
//   _fetchable: Array<keyof User<string, typeof _danger extends true ? true : false>>
//   constructor (data: Partial<User<string, true>>, secrets: boolean = false, fetchable: Array<keyof typeof data> = ['preferences', 'secrets']) {
//     this._danger = secrets
//     this._data = data
//     this._fetchable = fetchable
//   }
// }

// export class MockAPI {
//   static getById<HasSecret extends boolean = false> (id: string, secrets: HasSecret): User<typeof id, HasSecret> | void {
//   // const result = demoUserList.get(id)
//     const result = sampleUserWithSecrets
//     if (!result) { return undefined }
//     if ('secrets' in result) {
//       if (secrets) { return result } else {
//         return undefined
//       }
//     } else if (!secrets) { return result } else {
//       const _result = {
//         ...result,
//         secret: undefined
//       }
//       return _result
//     }
//   }
// }

export const scoped = {
  demoUser: sampleUserWithSecrets
}

export const demoUser = sampleUserWithSecrets
