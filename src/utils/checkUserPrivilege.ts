import type { UserEssential } from '~/types/user'

export function checkUserPrivilege(user: UserEssential<unknown>) {
  const admin = user.roles.includes('admin')
  const owner = user.roles.includes('owner')
  const staff = user.roles.includes('staff')

  const hasAdminAccess = admin || owner || staff
  return {
    admin,
    owner,
    staff,
    hasAdminAccess,
  }
}
