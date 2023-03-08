export function assertNotReachable(..._any: never[]): never {
  throw new Error('boom! this line should not be reached!!')
}
