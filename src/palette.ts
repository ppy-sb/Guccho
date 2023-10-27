import convert from 'color-convert'
import colors from 'tailwindcss/colors'
import { convertSingle } from './utils/color'

const customColors = {
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
  'dark-horizon': {
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
  'china': {
    // 50: '#FBF9F9',
    // 100: '#F0E5E5',
    // 200: '#E0C2C2',
    // 300: '#D39797',
    // 400: '#C96E6E',
    // 500: '#C53A3A',
    // 600: '#AF1D1D',
    // 700: '#4b3131',
    // 800: '#5E0808',
    // 900: '#310202',
    // 950: '#190000',
    // https://tints.dev/china/C23D3D
    50: '#F7F2F2',
    100: '#F1E4E4',
    200: '#E7CBCB',
    300: '#DDACAC',
    400: '#D18585',
    500: '#C23D3D',
    600: '#864646',
    700: '#643535',
    800: '#432323',
    900: '#211212',
    950: '#110909',
  },
} as const

export const hex = {
  ...customColors,
  gbase: customColors.china,
}

export const palette = to(
  convert.hex.hsl,
  ([h, s, l]) => `hsl(${h} ${s}% ${l}%)` as const,
)
export const hsvRaw = to(convert.hex.hsl)

export function to<TConverterReturn extends TReturn, TReturn = TConverterReturn>(converter: (...any: any) => TConverterReturn,
  transform: (input: TConverterReturn) => TReturn = a => a) {
  return Object.entries(hex).reduce((acc, [key, colors]: [string, Record<string, unknown>]) => {
    acc[key as keyof typeof hex] = convertSingle(colors, converter, transform)
    return acc
  }, {} as Record<any, any>) as Record<keyof typeof hex, Record<keyof (typeof hex)[keyof typeof hex], TReturn>>
}
