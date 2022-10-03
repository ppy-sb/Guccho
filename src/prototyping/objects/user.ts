import type { User } from '../types/tree'
import { UserAPI } from '../types/user'
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
  },
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

export const scoped = {
  demoUser: sampleUserWithSecrets
}

export const demoUser = sampleUserWithSecrets
