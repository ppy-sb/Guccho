import type { UserEssential } from '~/def/user'
import { UserPrivilege } from '~/def/user'

export function calcUserPrivilege(user: UserEssential<unknown>) {
  const admin = user.roles.includes(UserPrivilege.Admin)
  const owner = user.roles.includes(UserPrivilege.Owner)
  const staff = user.roles.includes(UserPrivilege.Staff)

  return {
    admin,
    owner,
    staff,
  }
}
