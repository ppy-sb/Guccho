import { LeaderboardRankingSystem } from '~/types/common'

const variables = new Map<string, Template>()

interface Template {
  description: string | number
  fallback?: string | number
  value?: string | number
}

function setVariable(key: string, value: Template) {
  if (!variables.has(key)) {
    variables.set(key, value)
  }
}

export default function useEditorVariables() {
  addAppConfigVariables()
  return {
    variables,
  }
}

function addAppConfigVariables() {
  const config = useAppConfig()

  setVariable('domain', {
    description: 'domain',
    fallback: 'domain',
    value: config.baseUrl,
  })

  setVariable('guccho:version', {
    description: 'current guccho version',
    fallback: 'some version',
    value: config.version,
  })

  setVariable('server.name', {
    description: 'name of the server',
    fallback: 'Guccho',
    value: config.title,
  })

  for (const [mode, item] of Object.entries(config.mode)) {
    setVariable(`mode:${mode}`, {
      description: `name of mode ${mode}`,
      fallback: mode,
      value: item.name,
    })
  }

  for (const [ruleset, item] of Object.entries(config.ruleset)) {
    setVariable(`ruleset:${ruleset}`, {
      description: `name of ruleset ${ruleset}`,
      fallback: ruleset,
      value: item.name,
    })
  }

  for (const rs in config.leaderboardRankingSystem) {
    setVariable(`rank:${rs}`, {
      description: `name of ruleset ${rs}`,
      fallback: rs,
      value: config.leaderboardRankingSystem[rs as LeaderboardRankingSystem].name,
    })
  }
}
