import { type UserCompact, UserRole } from '~/def/user'

export function computeUserRoles(user: UserCompact<unknown>) {
  const admin = user.roles.includes(UserRole.Admin)
  const owner = user.roles.includes(UserRole.Owner)
  const staff = user.roles.includes(UserRole.Staff)

  return {
    admin,
    owner,
    staff,
  }
}
