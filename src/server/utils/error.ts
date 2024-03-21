import { TRPCError } from '@trpc/server'
import { GucchoError } from '../trpc/messages'

export function throwGucchoError(code: GucchoError): never {
  throw createGucchoError(code)
}

function mergeGucchoMsg<C extends GucchoError, T extends object>(code: C, merge: T) {
  return {
    message: fromGucchoErrorCode(code),
    ...merge,
  }
}
export function createGucchoError(code: GucchoError): TRPCError {
  const merge = mergeGucchoMsg.bind(null, code) as <T extends object>(merge: T) => T & { message: `G:${typeof code}` }
  switch (code) {
    case GucchoError.YouNeedToLogin:
    case GucchoError.RequireAdminPrivilege:
    case GucchoError.OldPasswordMismatch:
    case GucchoError.PasswordMismatch: {
      return new TRPCError(merge({ code: 'UNAUTHORIZED' }))
    }

    case GucchoError.MissingServerAvatarConfig: {
      return new TRPCError(merge({ code: 'NOT_IMPLEMENTED' }))
    }

    case GucchoError.MimeNotImage: {
      return new TRPCError({ code: 'UNPROCESSABLE_CONTENT' })
    }

    case GucchoError.DeletingMoreThanOneAvatars:
    case GucchoError.HackerTryingToDeleteAllAvatars: {
      return new TRPCError(merge({ code: 'BAD_REQUEST' }))
    }

    case GucchoError.ConflictRelation:
    case GucchoError.ConflictEmail:
    case GucchoError.UserExists: {
      return new TRPCError(merge({ code: 'CONFLICT' }))
    }

    case GucchoError.RelationTypeNotFound:
    case GucchoError.SessionNotFound:
    case GucchoError.UserNotFound:
    case GucchoError.AtLeastOneUserNotExists: {
      return new TRPCError(merge({ code: 'NOT_FOUND' }))
    }
    case GucchoError.ModeNotSupported:
    case GucchoError.UnableToRefreshToken:
    case GucchoError.UnableToRetrieveSession:
    case GucchoError.UnknownError:
    case GucchoError.UpdateUserSettingsFailed:
    case GucchoError.UpdateUserpageFailed:
    default: {
      return new TRPCError(merge({ code: 'INTERNAL_SERVER_ERROR' }))
    }
  }
}
