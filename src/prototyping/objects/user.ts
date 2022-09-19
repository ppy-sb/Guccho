import type { User } from '../types/tree'
export const sampleUserWithSecrets: User<string, true> = {
  id: 'xxxxxyyyy',
  ingameId: 9999,
  name: 'testUser',
  safeName: 'testUser',
  oldNames: [],
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
    password: ''
  },
  statistics: {
    osu: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      },
      autopilot: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      }
    },
    taiko: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      }
    },
    fruits: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      },
      relax: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      }
    },
    mania: {
      standard: {
        ranking: {
          ppv2: {
            rank: 1,
            performance: 100
          },
          ppv1: {
            rank: 1,
            performance: 100
          },
          totalScores: {
            rank: 1,
            score: 1_000_000_000
          },
          rankedScores: {
            rank: 1,
            score: 10_000_000
          }
        }
      }
    }
  }
}

const demoUserList = new Map<string, User<string, true> | User<string, false>>([[sampleUserWithSecrets.id, sampleUserWithSecrets]])

export const getUserById = <HasSecret extends boolean = false>(id: string, secrets: HasSecret): User<typeof id, HasSecret> => {
  const result = demoUserList.get(id) // 它为什么不觉得undefined 也会出现
  if (secrets && 'secrets' in result) {
    return result
  } else if (!secrets && !('secrets' in result)) {
    return result
  } else { return null }
}

export const demoUser = sampleUserWithSecrets
