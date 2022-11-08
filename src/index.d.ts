import { Mode, Ruleset } from '~/types/common'

type AppConfigItemBase = {
  name: string,
  icon: string,
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    baseUrl: string,
    version: {
      api: string,
      front: string,
    }
    title: string,
    mode: Array<AppConfigItemBase & {
      mode: Mode
    }>,
    rulesets: Array<AppConfigItemBase & {
      ruleset: Ruleset
    }>,
    appModalTeleportTargetId: string
  }
}
// It is always important to ensure you import/export something when augmenting a type
export { }
