import type { GlobalI18n } from '../../locales/@types'
import type { Mode, Rank, Ruleset } from '~/def'
import { type CountryCode } from '~/def/country-code'
import type { Scope, UserRole } from '~/def/user'
import type { Mail } from '~/def/mail'

export const root = getPath<GlobalI18n>()()

const _role = root.role
const _scope = root.scope
const _mode = root.mode
const _ruleset = root.ruleset
const _rank = root.rank
const _service = root.service
const _country = root.country
const _mail = root.mail

export function role<T extends UserRole>(priv: T) {
  // return `role.${priv}`
  return _role[priv].toString()
}

export function scope<T extends Scope>(scope: T) {
  // return `scope.${scope}`
  return _scope[scope].toString()
}

export function mode<T extends Mode>(mode: T) {
  // return `mode.${mode}`
  return _mode[mode].toString()
}
export function ruleset<T extends Ruleset>(ruleset: T) {
  // return `ruleset.${ruleset}`
  return _ruleset[ruleset].toString()
}

export function rankingSystem<T extends Rank>(rs: T) {
  // return `rank.${rs}`
  return _rank[rs].toString()
}

export function service<T extends keyof GlobalI18n['service']>(srv: T) {
  // return `service.${srv}`
  return _service[srv].toString()
}

export function country(cd: CountryCode) {
  // return `country.${cd}`
  return _country[cd].toString()
}

export function mail(variant: Mail.Variant) {
  // return `mail.${variant}`
  return _mail[variant].toString()
}
