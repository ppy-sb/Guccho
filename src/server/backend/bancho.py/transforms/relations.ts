import { RelationshipType } from 'prisma-client-bancho-py'
import { Relationship } from '~/def'

export function toBanchoPyRelationType(relation: Relationship): RelationshipType {
  switch (relation) {
    case Relationship.Friend: return 'friend'
    case Relationship.Blocked: return 'block'
    default: assertNotReachable(relation)
  }
}

export function fromBanchoPyRelationType(relation: RelationshipType): Relationship {
  switch (relation) {
    case 'friend': return Relationship.Friend
    case 'block': return Relationship.Blocked
    default: assertNotReachable(relation)
  }
}
