import { type UserClan } from '~/def/user'

export function clanUserName(i: { name: string; clan?: UserClan<any> | null }): string {
  return i.clan ? `[${i.clan.name}] ${i.name}` : i.name
}
