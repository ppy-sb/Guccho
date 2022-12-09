import type { BaseUser } from '~/types/user'

export function checkUserPrivilege(user: BaseUser<unknown>) {
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
