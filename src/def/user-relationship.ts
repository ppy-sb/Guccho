import type { MutualRelationship, Relationship } from '.'

export interface UserRelationship {
  relationship: Relationship[]
  relationshipFromTarget: Relationship[]
  mutualRelationship: MutualRelationship[]
}
