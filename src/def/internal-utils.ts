export type U2I<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

export type Tag<T, Tag extends string> = T & { __tag: Tag }

// eslint-disable-next-line @typescript-eslint/ban-types
export type Brand<T> = T & {}
