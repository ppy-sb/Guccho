import type { User } from '../types/user'
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
    allowPrivateMessage: true
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

// const sampleUserWithoutSecrets: User= sampleUserWithSecrets
