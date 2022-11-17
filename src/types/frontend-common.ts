export type Maybe<Shape, OptionalRecordKey extends keyof Shape> = {
  [K in keyof Shape]: K extends OptionalRecordKey ? Partial<Shape[K]> : Shape[K]
}
