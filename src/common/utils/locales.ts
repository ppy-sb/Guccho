import type { Mode, Rank, Ruleset } from '~/def'
import type { Scope, UserPrivilege } from '~/def/user'

export function priv(priv: UserPrivilege) {
  return `priv.${priv}`
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
