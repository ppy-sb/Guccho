import { BanchoPyPrivilege } from '~/server/backend/bancho.py/enums'

const eAll = ExpandedBitwiseEnumArray.fromTSBitwiseEnum(BanchoPyPrivilege)
export const normal = eAll.and(BanchoPyPrivilege.Normal).and(BanchoPyPrivilege.Verified)
export const abnormal = eAll.not(normal)
