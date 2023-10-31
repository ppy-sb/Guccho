/* eslint-env node */
// import * as convert from 'color-convert'
import themes from 'daisyui/src/theming/themes'
import { hex as colors } from './src/palette'

const cupcake = themes['[data-theme=cupcake]']
const dracula = themes['[data-theme=dracula]']
const base = {
  '--rounded-btn': '1rem',
  '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2',
}
export const guccho = [
  {
    'guccho-light': {
      ...cupcake,
      ...base,
      'primary': cupcake.secondary,
      'secondary': cupcake.primary,
      'neutral': colors.gbase[200],
      'base-50': colors.gbase[50],
      'base-100': colors.gbase[100],
      'base-200': colors.gbase[200],
      'base-300': colors.gbase[300],
      'base-content': colors.gbase[900],
    },
  },
  {
    'guccho-dark': {
      ...dracula,
      ...base,
      'primary': colors.wewak[500],
      'neutral': colors.gbase[500],
      'base-50': colors.gbase[950],
      'base-100': colors.gbase[900],
      'base-200': colors.gbase[800],
      'base-300': colors.gbase[700],
      'base-content': colors.gbase[100],
    },
  },
]
