export function convertSingle<TI, TR>(colors: Record<string, any>,
  converter: (...any: any) => TI,
  transform: (input: TI) => TR) {
  return Object.entries(colors).reduce<Record<string, ReturnType<typeof transform>>>(
    (acc, [key, value]) => {
      acc[key] = transform(converter(value))
      return acc
    },
    {},
  )
}
