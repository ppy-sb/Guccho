/* eslint-env node */
import * as convert from 'color-convert'

// @ts-expect-error got nothing
import themes from 'daisyui/src/theming/themes'
import type { HSL } from 'color-convert/conversions'
import { convertSingle, palette } from './src/palette'

const cupcake = convertSingle(
  themes['[data-theme=cupcake]'],
  convert.hex.hsl,
  ([h, s, l]: HSL) => `hsl(${h} ${s}% ${l}%)` as const
)
// const valentine = convertSingle(themes['[data-theme=valentine]'], convert.hex.hsl, ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`) as Record<keyof typeof themes['[data-theme=cupcake]'], string>
const dracula = convertSingle(
  themes['[data-theme=dracula]'],
  convert.hex.hsl,
  ([h, s, l]: HSL) => `hsl(${h} ${s}% ${l}%)` as const
)
const base = {
  '--rounded-btn': '1rem',
  '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2',
}
export const guweb = [
  {
    'guweb-light': {
      ...cupcake,
      ...base,
      'primary': cupcake.secondary,
      'secondary': cupcake.primary,
      'neutral': palette.gbase[200],
      'base-50': palette.gbase[50],
      'base-100': palette.gbase[100],
      'base-200': palette.gbase[200],
      'base-300': palette.gbase[300],
      'base-content': palette.gbase[900],
    },
  },
  {
    'guweb-dark': {
      ...dracula,
      ...base,
      'primary': palette.wewak[500],
      'neutral': palette.gbase[500],
      'base-50': palette.gbase[950],
      'base-100': palette.gbase[900],
      'base-200': palette.gbase[800],
      'base-300': palette.gbase[700],
      'base-content': palette.gbase[100],
    },
  },
]
