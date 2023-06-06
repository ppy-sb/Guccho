import type { MutualRelationship, Relationship } from './defs'
import type { UserEssential } from './user'

export interface UserRelationship<Id> extends UserEssential<Id> {
  relationship: Relationship[]
  relationshipFromTarget: Relationship[]
  mutualRelationship: MutualRelationship[]
}
