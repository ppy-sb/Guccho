import type { User } from '../types/tree'
export const sampleUserWithSecrets: User<string, true> = {
  _includeSecrets: true,
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

const getUserById = <IncludeSecrets extends boolean = false>(id: string, secrets: IncludeSecrets): User<typeof id, typeof secrets extends true ? true : false> => {
  const result = demoUserList.get(id)
  if (secrets && result._includeSecrets === true) {
    return result
  } else if (!secrets && !result._includeSecrets) {
    return result
  } else { return null }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const user = getUserById('1', false)
