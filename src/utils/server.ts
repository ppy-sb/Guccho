import { createRequire as _createRequire } from 'module'
export const createCursedRequire: (path: string | URL) => <TShape>(id: string) => TShape = _createRequire
