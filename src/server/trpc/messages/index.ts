export enum GucchoError {
  UnknownError = 1,
  MissingServerAvatarConfig,

  ModeNotSupported = 1000,

  // user
  UserNotFound = 2000,
  UserExists,
  ConflictEmail,
  UpdateUserSettingsFailed,
  UpdateUserpageFailed,
  MimeNotImage,
  HackerTryingToDeleteAllAvatars,
  DeletingMoreThanOneAvatars,

  // auth
  PasswordMismatch = 3000,
  OldPasswordMismatch,

  RelationTypeNotFound = 4000,

  ConflictRelation,
  AtLeastOneUserNotExists,

  UnableToRetrieveSession = 5000,
  UnableToRefreshToken,
  YouNeedToLogin,
  SessionNotFound,

  RequireAdminPrivilege = 6000,
}
