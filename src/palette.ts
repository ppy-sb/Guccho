// follow the following rules will break the app

import convert from 'color-convert'

export const hex = {
  'alabaster': {
    DEFAULT: '#9D9595',
    50: '#F5F4F4',
    100: '#EBEAEA',
    200: '#D8D5D5',
    300: '#C4BFBF',
    400: '#B1AAAA',
    500: '#9D9595',
    600: '#827878',
    700: '#655D5D',
    800: '#484242',
    900: '#2A2727',
  },
  'pigeon-post': {
    DEFAULT: '#B3B2DC',
    50: '#F8F8FC',
    100: '#EAEAF5',
    200: '#CFCEE9',
    300: '#B3B2DC',
    400: '#8D8CCA',
    500: '#6765B8',
    600: '#4A489D',
    700: '#383677',
    800: '#262550',
    900: '#14132A',
  },
  'jaffa': {
    DEFAULT: '#F0763D',
    50: '#FDEEE7',
    100: '#FCE1D4',
    200: '#F9C6AE',
    300: '#F6AC88',
    400: '#F39162',
    500: '#F0763D',
    600: '#E45511',
    700: '#AF410D',
    800: '#7B2E09',
    900: '#471A05',
  },
  'wewak': {
    DEFAULT: '#EE9AB9',
    50: '#FDF2F6',
    100: '#FAE0EA',
    200: '#F4BDD1',
    300: '#EE9AB9',
    400: '#E66A97',
    500: '#DE3A76',
    600: '#C0205A',
    700: '#901844',
    800: '#60102D',
    900: '#300817',
  },
  'kimberly': {
    DEFAULT: '#7277A1',
    50: '#EEEFF4',
    100: '#E0E1EA',
    150: '#CED0DE',
    200: '#C5C7D8',
    300: '#A9ACC6',
    400: '#8E91B3',
    500: '#7277A1',
    600: '#585C83',
    700: '#414462',
    800: '#282B43',
    900: '#14151E',
  },
}
export const convertSingle = (colors: Record<string, any>, converter: (...any: any) => any, transform: (...any: any) => any) =>
  Object.entries(colors).reduce<Record<string, ReturnType<typeof transform>>>((acc, [key, value]) => {
    acc[key] = transform(converter(value))
    return acc
  }, {})

const to = (converter: (...any: any) => any, transform: (...any: any) => any = a => a) => {
  return Object.entries(hex)
    .reduce<Record<keyof typeof hex, Record<string, ReturnType<typeof transform>>>>((acc, [key, colors]: [string, Record<string, any>]) => {
      acc[key as keyof typeof hex] = convertSingle(colors, converter, transform)
      return acc
    }, {})
}
export const palette = to(convert.hex.hsl, ([h, s, l]) => `hsl(${h} ${s}% ${l}%)`) as unknown as typeof hex
export const hsvRaw = to(convert.hex.hsl) as unknown as Record<string, ReturnType<typeof convert['hex']['hsl']>>
