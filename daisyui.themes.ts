/* eslint-env node */
// import * as convert from 'color-convert'
import { hex } from 'color-convert'
import themes from 'daisyui/src/theming/themes'
import tw from 'tailwindcss/colors'
import { hex as colors } from './src/palette'
import { convertSingle } from './src/utils/color'

const cupcake = themes['[data-theme=cupcake]']
const dracula = themes['[data-theme=dracula]']
const base = {
  '--rounded-btn': '1rem',
  '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2',
}

const slateHSL = convertSingle(tw.slate, hex.hsl, ([h, s, l]) => `${h} ${s}% ${l}%`)
const gSlate = {
  '--color-gbase-50': slateHSL[50],
  '--color-gbase-100': slateHSL[100],
  '--color-gbase-200': slateHSL[200],
  '--color-gbase-300': slateHSL[300],
  '--color-gbase-400': slateHSL[400],
  '--color-gbase-500': slateHSL[500],
  '--color-gbase-600': slateHSL[600],
  '--color-gbase-700': slateHSL[700],
  '--color-gbase-800': slateHSL[800],
  '--color-gbase-900': slateHSL[900],
  '--color-gbase-950': slateHSL[950],
}

export const guccho = [
  {
    'guccho-light': {
      ...cupcake,
      ...base,
      'primary': cupcake.secondary,
      'secondary': cupcake.primary,
      'neutral': tw.slate[200],
      'base-50': tw.slate[50],
      'base-100': tw.slate[100],
      'base-200': tw.slate[200],
      'base-300': tw.slate[300],
      'base-content': tw.slate[900],
      ...gSlate,
    },
  },
  {
    'guccho-dark': {
      ...dracula,
      ...base,
      'primary': colors.wewak[500],
      'neutral': tw.slate[500],
      'base-50': tw.slate[950],
      'base-100': tw.slate[900],
      'base-200': tw.slate[800],
      'base-300': tw.slate[700],
      'base-content': tw.slate[100],
      ...gSlate,
    },
  },
]
