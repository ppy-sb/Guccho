export class ExpandedBitwiseEnumArray<T extends number> extends Array<T> {
  merge() {
    return this.reduce((acc, cur) => acc | cur, 0)
  }

  and(expandedArr: ExpandedBitwiseEnumArray<T>): ExpandedBitwiseEnumArray<T>
  and(bits: T): ExpandedBitwiseEnumArray<T>
  and(input: T | ExpandedBitwiseEnumArray<T>) {
    if (Array.isArray(input)) {
      return this.filter(v => input.includes(v))
    }
    return this.filter(v => v & input)
  }

  not(expandedArr: ExpandedBitwiseEnumArray<T>): ExpandedBitwiseEnumArray<T>
  not(bits: T): ExpandedBitwiseEnumArray<T>
  not(input: T | ExpandedBitwiseEnumArray<T>) {
    if (Array.isArray(input)) {
      return this.filter(v => !input.includes(v))
    }
    return this.filter(v => ~v & input) as ExpandedBitwiseEnumArray<T>
  }

  or(expandedArr: ExpandedBitwiseEnumArray<T>): ExpandedBitwiseEnumArray<T>
  or(bits: T): ExpandedBitwiseEnumArray<T>
  or(bits: T | ExpandedBitwiseEnumArray<T>) {
    if (Array.isArray(bits)) {
      return ExpandedBitwiseEnumArray.from(new Set(this.concat(bits)))
    }
    return this.filter(v => v | bits) as ExpandedBitwiseEnumArray<T>
  }

  static fromTSBitwiseEnum<T extends number>(enumType: Record<any, T | string>) {
    const enumValues = Object.values(enumType).filter((value): value is T => typeof value === 'number')
    const combinations = new Set<T>()

    for (let i = 1; i < 2 ** enumValues.length; i++) {
      let combination = 0
      for (let j = 0; j < enumValues.length; j++) {
        if ((i & (1 << j)) !== 0) {
          combination |= enumValues[j]
        }
      }
      combinations.add(combination as T)
    }

    return ExpandedBitwiseEnumArray.from(combinations.values()) as ExpandedBitwiseEnumArray<T>
  }
}
