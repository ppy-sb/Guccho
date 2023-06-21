import type { MutualRelationship, Relationship } from './defs'

export interface UserRelationship {
  relationship: Relationship[]
  relationshipFromTarget: Relationship[]
  mutualRelationship: MutualRelationship[]
}
