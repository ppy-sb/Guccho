/** @type {import('tailwindcss').Config} */
const palette = {
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
  'wine-berry': {
    DEFAULT: '#C35A71',
    50: '#F4E1E5',
    100: '#EFD2D8',
    200: '#E4B4BF',
    300: '#D996A5',
    400: '#CE788B',
    500: '#C35A71',
    600: '#A83D55',
    700: '#7F2E40',
    800: '#561F2B',
    900: '#2D1017'
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
    DEFAULT: '#C059A1',
    50: '#F3DEEC',
    100: '#EDCFE4',
    200: '#E2B2D3',
    300: '#D694C3',
    400: '#CB77B2',
    500: '#C059A1',
    600: '#A33E85',
    700: '#7A2E64',
    800: '#521F42',
    900: '#291021'
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

module.exports = {
  content: [
    './src/components/**/*.{vue,js}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './src/App.{js,ts,vue}',
    './src/app.{js,ts,vue}'
  ],
  theme: {
    extend: {
      colors: palette
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
  }
}
