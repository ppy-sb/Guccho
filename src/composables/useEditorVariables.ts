import { Rank } from '~/def'

const ranks = [Rank.PPv1, Rank.PPv2, Rank.Score, Rank.RankedScore, Rank.TotalScore]

interface VariableBase {
  description: string | number
}

type VariableTemplate = VariableBase & {
  fallback?: string | number
  value?: string | number
  t?: boolean
}

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

function addAppConfigVariables(_i: { i18n: { t: (str: string) => string } }) {
  const config = useRuntimeConfig()
  const { supportedModes: modes, supportedRulesets: rulesets } = useAdapterConfig()

  setVariable('domain', {
    description: 'domain',
    fallback: 'domain',
    value: config.public.baseUrl,
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
