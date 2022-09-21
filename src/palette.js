import convert from 'color-convert'

const hex = {
  alabaster: {
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
    900: '#2A2727'
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
    900: '#14132A'
  },
  jaffa: {
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
    900: '#471A05'
  },
  mulberry: {
    DEFAULT: '#CF4483',
    50: '#F5D6E4',
    100: '#F0C6D9',
    200: '#E8A6C4',
    300: '#E085AE',
    400: '#D76598',
    500: '#CF4483',
    600: '#AE2D67',
    700: '#82214D',
    800: '#551632',
    900: '#290A18'
  },
  'ebony-clay': {
    DEFAULT: '#202231',
    50: '#CECFDF',
    100: '#C1C4D7',
    200: '#A9ACC6',
    300: '#9094B6',
    400: '#777CA6',
    500: '#616694',
    600: '#51557B',
    700: '#414463',
    800: '#30334A',
    900: '#202231'
  }
}

const to = (converter, transform = a => a) => {
  const convertSingle = colors => Object.entries(colors).reduce((acc, [key, value]) => {
    acc[key] = transform(converter(value))
    return acc
  }, {})

  return Object.entries(hex).reduce((acc, [key, colors]) => {
    acc[key] = convertSingle(colors)
    return acc
  }, {})
}

export const palette = to(convert.hex.hsl, ([h, s, l]) => `hsl(${h} ${s}% ${l}%)`)
export const hsvRaw = to(convert.hex.hsl)
