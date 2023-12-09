/* eslint-env node */
// import * as convert from 'color-convert'
import { hex, hsl } from 'color-convert'
import themes from 'daisyui/src/theming/themes'
import tw from 'tailwindcss/colors'
import { hex as colors } from './src/palette'
import { convertSingle } from './src/utils/color'

const cupcake = themes['[data-theme=cupcake]']
const dracula = themes['[data-theme=dracula]']
const garden = themes['[data-theme=garden]']
const base = {
  '--rounded-btn': '1rem',
  // '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2',
}

const baseColor = {
  50: '#f5f7f9',
  100: '#e8ebf1',
  200: '#d7dde6',
  300: '#bbc5d5',
  400: '#9aa8c0',
  500: '#818fb0',
  600: '#6f7ba1',
  700: '#636b92',
  800: '#4f5471',
  900: '#464b62',
  950: '#2e303d',
}

// const gbaseHSLValue = convertSingle(baseColor, hex.hsl, ([h, s, l]) => ([h, Math.round(s * 0.8), Math.round(l * 0.9)]))
const gbaseHSLValue = convertSingle(baseColor, hex.hsl, a => a)
const gbaseHSL = convertSingle(gbaseHSLValue, a => a, ([h, s, l]) => `${h} ${s}% ${l}%`)
const convertBack = convertSingle(gbaseHSLValue, hsl.hex, a => `#${a}`)

const gSlate = {
  '--color-gbase-50': gbaseHSL[50],
  '--color-gbase-100': gbaseHSL[100],
  '--color-gbase-200': gbaseHSL[200],
  '--color-gbase-300': gbaseHSL[300],
  '--color-gbase-400': gbaseHSL[400],
  '--color-gbase-500': gbaseHSL[500],
  '--color-gbase-600': gbaseHSL[600],
  '--color-gbase-700': gbaseHSL[700],
  '--color-gbase-800': gbaseHSL[800],
  '--color-gbase-900': gbaseHSL[900],
  '--color-gbase-950': gbaseHSL[950],
}

export const guccho = [
  // {
  //   'guccho-light': {
  //     ...cupcake,
  //     ...base,
  //     'primary': cupcake.secondary,
  //     'secondary': cupcake.primary,
  //     'neutral': baseColor[200],
  //     'base-50': baseColor[50],
  //     'base-100': baseColor[100],
  //     'base-200': baseColor[200],
  //     'base-300': baseColor[300],
  //     'base-content': baseColor[900],
  //     ...gSlate,
  //   },
  // },
  {
    'guccho-dark': {
      ...dracula,
      ...base,

      'primary': '#f54d4d',

      'secondary': tw.emerald[400],

      'accent': '#ead708',

      'info': '#89e0eb',

      'success': '#addfad',

      'warning': '#f1c891',

      'error': '#ffbbbd',
      // ...base,
      // 'primary': colors.wewak[500],
      'neutral': convertBack[500],
      'base-50': convertBack[950],
      'base-100': convertBack[900],
      'base-200': convertBack[800],
      'base-300': convertBack[700],
      'base-content': convertBack[100],
      ...gSlate,
    },
  },
]
