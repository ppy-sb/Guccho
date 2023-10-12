import type { Mode, Rank, Ruleset } from '~/def'
import type { Scope, UserRole } from '~/def/user'

export function role(priv: UserRole) {
  return `role.${priv}`
}

export function scope(scope: Scope) {
  return `scope.${scope}`
}

export function mode(mode: Mode) {
  return `mode.${mode}`
}
export function ruleset(ruleset: Ruleset) {
  return `ruleset.${ruleset}`
}

export function rankingSystem(rs: Rank) {
  return `rank.${rs}`
}

export function service(srv: string) {
  return `service.${srv}`
}
