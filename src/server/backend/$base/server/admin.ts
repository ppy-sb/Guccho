import { IdTransformable } from './@extends'
import type { UserClan, UserCompact, UserOptional } from '~/def/user'

export abstract class AdminProvider<Id> extends IdTransformable {
  abstract userList(query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> & {
    page: number
    perPage: number
  }):
  Promise<Array<
  UserCompact<Id>
  & Pick<UserOptional, 'email' | 'status'>
  & {
    registeredAt: Date
    lastActivityAt: Date
    clan?: UserClan<Id>
  }
  >>
}
