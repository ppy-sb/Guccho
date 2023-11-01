import { createOptions } from '~/common/utils'
import { UserRole } from '~/def/user'

export const variant: Record<UserRole, { class: string }> = {
  [UserRole.Disabled]: { class: 'badge-ghost' },
  [UserRole.Restricted]: { class: 'badge-error' },
  [UserRole.Inactive]: { class: 'badge-ghost' },
  [UserRole.Normal]: { class: 'badge-neutral' },
  [UserRole.Supported]: { class: 'badge-neutral' },
  [UserRole.Supporter]: { class: 'badge-primary' },
  [UserRole.Verified]: { class: 'badge-outline' },
  [UserRole.Alumni]: { class: 'badge-primary' },
  [UserRole.TournamentStaff]: { class: 'badge-secondary' },
  [UserRole.ChannelModerator]: { class: 'badge-info' },
  [UserRole.Moderator]: { class: 'badge-info' },
  [UserRole.BeatmapNominator]: { class: 'badge-success' },
  [UserRole.Staff]: { class: 'badge-success' },
  [UserRole.Admin]: { class: 'badge-success' },
  [UserRole.Owner]: { class: 'badge-error' },
  [UserRole.Bot]: { class: 'badge-outline' },
}

export function options(t: (i: string) => string) {
  return createOptions(UserRole, (_, v) => t(localeKey.role(v))).map(v => ({ ...v, attrs: variant[v.value] }))
}
