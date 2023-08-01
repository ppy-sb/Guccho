import { Lang, modes, rankingSystems, rulesets } from '../def'

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
  const { t } = useI18n({ locale: Lang.enGB })

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

  for (const mode of modes) {
    setVariable(`mode:${mode}`, {
      description: `name of mode ${mode}`,
      fallback: mode,
      value: t(localeKey.mode(mode)),
    })
  }

  for (const ruleset of rulesets) {
    setVariable(`ruleset:${ruleset}`, {
      description: `name of ruleset ${ruleset}`,
      fallback: ruleset,
      value: t(localeKey.ruleset(ruleset)),
    })
  }

  for (const rs of rankingSystems) {
    setVariable(`rank:${rs}`, {
      description: `name of ruleset ${rs}`,
      fallback: rs,
      value: t(localeKey.rankingSystem(rs)),
    })
  }
}
