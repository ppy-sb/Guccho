export type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

export type U2I<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

export type Brand<T> = T & {}
