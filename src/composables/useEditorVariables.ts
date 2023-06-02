import { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

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

  for (const mode in config.mode) {
    setVariable(`mode:${mode}`, {
      description: `name of mode ${mode}`,
      fallback: mode,
      value: config.mode[mode as Mode].name,
    })
  }

  for (const ruleset in config.ruleset) {
    setVariable(`ruleset:${ruleset}`, {
      description: `name of ruleset ${ruleset}`,
      fallback: ruleset,
      value: config.ruleset[ruleset as Ruleset].name,
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
