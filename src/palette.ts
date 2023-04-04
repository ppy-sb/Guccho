import convert from 'color-convert'

export const hex = {
  'pigeon-post': {
    50: '#EEEEF6',
    100: '#D7D7EA',
    200: '#C3C3E0',
    300: '#A8A8D2',
    400: '#8786C0',
    500: '#5756A6',
    600: '#4E4D94',
    700: '#454483',
    800: '#3A396F',
    900: '#2C2C54',
    950: '#17172C',
  },
  'jaffa': {
    50: '#FDEEE7',
    100: '#FBDACB',
    200: '#F9C3A9',
    300: '#F6A883',
    400: '#F38654',
    500: '#EB5511',
    600: '#D64E0F',
    700: '#BE460E',
    800: '#9D390B',
    900: '#6D2808',
    950: '#301103',
  },
  'wewak': {
    50: '#FEF6F9',
    100: '#F7CFDE',
    200: '#EFA3BF',
    300: '#E878A1',
    400: '#E15186',
    500: '#DA2567',
    600: '#B31E55',
    700: '#871740',
    800: '#60102D',
    900: '#340919',
    950: '#0D0206',
  },
  'kimberly': {
    50: '#F0F0F5',
    100: '#E0E1EB',
    200: '#C1C4D7',
    300: '#A3A6C2',
    400: '#8488AE',
    500: '#656A9A',
    600: '#51557B',
    700: '#3D405C',
    800: '#282B3E',
    900: '#14151F',
    950: '#0A0B0F',
  },
}
export const convertSingle = (
  colors: Record<string, any>,
  converter: (...any: any) => any,
  transform: (...any: any) => any,
) =>
  Object.entries(colors).reduce<Record<string, ReturnType<typeof transform>>>(
    (acc, [key, value]) => {
      acc[key] = transform(converter(value))
      return acc
    },
    {},
  )

const to = <ConverterReturn extends Return, Return = ConverterReturn>(
  converter: (...any: any) => ConverterReturn,
  transform: (input: ConverterReturn) => Return = a => a,
) => {
  return Object.entries(hex).reduce<
    Record<keyof typeof hex, Record<string, ReturnType<typeof transform>>>
  >((acc, [key, colors]: [string, Record<string, any>]) => {
    acc[key as keyof typeof hex] = convertSingle(colors, converter, transform)
    return acc
  }, {} as any)
}
export const palette = to(
  convert.hex.hsl,
  ([h, s, l]) => `hsl(${h} ${s}% ${l}%)`,
) as unknown as typeof hex
export const hsvRaw = to(convert.hex.hsl)
