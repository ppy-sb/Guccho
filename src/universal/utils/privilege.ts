import { UserEssential, UserPrivilege } from '~/types/user'

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
