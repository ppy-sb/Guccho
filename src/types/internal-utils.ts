export type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

// export type APIfy<
//   T extends Record<string, any>,
//   Keys extends keyof T | '_noProp' = '_noProp',
// > = {
//   [K in keyof T as K extends Keys
//     ? `fetch${Capitalize<string & K>}`
//     : Keys extends '_noProp'
//       ? K | `fetch${Capitalize<string & K>}`
//       : K]: K extends Keys ? () => Awaitable<T[Uncapitalize<string & K>]> : T[K];
// }

export type Brand<T> = T & {}
