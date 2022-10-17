import { UserPreferences, BaseUser, UserAPI, User } from './../prototyping/types/user'
import { createRulesetData, demoUser } from '~/prototyping/objects/user'
import { useClient } from '#imports'

export default () => {
  const client = useClient()

  const createMockUserAPI = (initial: BaseUser<string> & Partial<User<string, true>> = demoUser): UserAPI<string, true> => {
    const returnValue: Partial<User<string, true>> & UserAPI<string, true> = {
      ...initial || {},
      fetchStatistics () {
        if (returnValue.statistics) { return returnValue.statistics }
        const _r = {
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
        }
        returnValue.statistics = _r
        return _r
      },
      fetchReachable () {
        if (returnValue.reachable) { return returnValue.reachable }
        return false
      },
      fetchStatus () {
        returnValue.status = 'idle'
        return returnValue.status
      },
      fetchFriends () {
        returnValue.friends = []
        return returnValue.friends
      },
      fetchOldNames () {
        if (returnValue.oldNames) { return returnValue.oldNames }
        returnValue.oldNames = []
        return returnValue.oldNames
      },
      fetchPreferences () {
        if (returnValue.preferences) { return returnValue.preferences }
        const _r: UserPreferences = {
          allowPrivateMessage: true,
          visibility: {
            email: 'public',
            oldNames: 'public'
          }
        }
        returnValue.preferences = _r
        return _r
      },
      fetchSecrets () {
        if (returnValue.secrets) { return returnValue.secrets }
        const _r = {
          password: '123456788',
          apiKey: 'aaaaa-bbbbb'
        }
        returnValue.secrets = _r
        return _r
      },
      fetchProfile () {
        return {
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
    }
    return returnValue
  }

  const userAPI = async (handle: string | number) => {
    const baseUser = await client.query('getBaseUser', {
      handle
    })
    if (!baseUser) { return undefined }
    return createMockUserAPI(baseUser)
  }

  const getUsers = async (handle: string | number) => {
    const baseUsers = await client.query('getUsers', {
      handle
    })
    return baseUsers.map(user => createMockUserAPI(user))
  }

  return {
    client,
    getUsers,
    userAPI
  }
}
