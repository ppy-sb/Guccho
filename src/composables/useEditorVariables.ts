import { Rank, modes, rulesets } from '../def'

const ranks = [Rank.PPv1, Rank.PPv2, Rank.Score, Rank.RankedScore, Rank.TotalScore]

interface VariableBase {
  description: string | number
}

type VariableTemplate = VariableBase & ({
  t: true
} | {
  fallback?: string | number
  value?: string | number
  t?: false
})

const variables = new Map<string, VariableTemplate>()

function setVariable(key: string, value: VariableTemplate) {
  if (!variables.has(key)) {
    variables.set(key, value)
  }
}

export default function useEditorVariables(i: { i18n: { t: (str: string) => string } }) {
  addAppConfigVariables(i)
  return {
    variables,
  }
}

function addAppConfigVariables(i: { i18n: { t: (str: string) => string } }) {
  const config = useAppConfig()

  setVariable('domain', {
    description: 'domain',
    fallback: 'domain',
    value: config.baseUrl,
  })

  setVariable('guccho.version', {
    description: 'current guccho version',
    fallback: 'some version',
    value: config.version,
  })

  setVariable('server.name', {
    description: 'name of the server',
    t: true,
  })

  for (const mode of modes) {
    setVariable(localeKey.mode(mode), {
      description: `name of mode ${mode}`,
      t: true,
    })
  }

  for (const ruleset of rulesets) {
    setVariable(localeKey.ruleset(ruleset), {
      description: `name of ruleset ${ruleset}`,
      t: true,
    })
  }

  for (const rs of ranks) {
    setVariable(localeKey.rankingSystem(rs), {
      description: `name of ranking system ${rs}`,
      t: true,
    })
  }
}
