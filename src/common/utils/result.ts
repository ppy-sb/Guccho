export class ResultWithRaw<T, TData> {
  $raw: TData
  value: T

  constructor(data: T, $raw: TData) {
    this.value = data
    this.$raw = $raw
  }

  cast<TNext>(value: TNext) {
    const cast = this as unknown as ResultWithRaw<TNext, TData>
    cast.value = value
    return cast
  }

  derive<TNext>(val: TNext) {
    return new ResultWithRaw(this.$raw, val)
  }

  static curry<TData>($raw: TData) {
    return <T>(val: T) => new ResultWithRaw($raw, val)
  }
}
