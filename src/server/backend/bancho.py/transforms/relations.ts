import { RelationshipType } from '.prisma/bancho.py'
import { Relationship } from '~/types/defs'

export function toBanchoPyRelationType(relation: Relationship): RelationshipType {
  switch (relation) {
    case Relationship.Friend: return 'friend'
    case Relationship.Blocked: return 'block'
  }
}

export function fromBanchoPyRelationType(relation: RelationshipType): Relationship {
  switch (relation) {
    case 'friend': return Relationship.Friend
    case 'block': return Relationship.Blocked
  }
}
