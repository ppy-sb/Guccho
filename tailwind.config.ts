/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
import * as convert from 'color-convert'
import { convertSingle, palette } from './src/palette'

const themes = require('daisyui/src/colors/themes')

const cupcake = convertSingle(themes['[data-theme=cupcake]'], convert.hex.hsl, ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`) as Record<keyof typeof themes['[data-theme=cupcake]'], string>
const dracula = convertSingle(themes['[data-theme=dracula]'], convert.hex.hsl, ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`) as Record<keyof typeof themes['[data-theme=dracula]'], string>
const base = {
  '--rounded-btn': '1.9rem',
  '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2 !important',
}
const guweb = [
  {
    'guweb-light': {
      ...cupcake,
      'primary': palette.wewak[300],
      'secondary': cupcake.primary,
      'neutral': palette.kimberly[200],
      'base-100': palette.kimberly[100],
      'base-200': palette.kimberly[150],
      'base-300': palette.kimberly[200],
      'base-content': palette.kimberly[900],
      ...base,
    },
  },
  {
    'guweb-dark': {
      ...dracula,
      'primary': palette.wewak[500],
      'neutral': palette.kimberly[500],
      'base-100': palette.kimberly[900],
      'base-200': palette.kimberly[800],
      'base-300': palette.kimberly[700],
      'base-content': palette.kimberly[100],
      ...base,
    },
  },
]
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{vue,js}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './src/App.{js,ts,vue}',
    './src/app.{js,ts,vue}',
  ],
  safelist: [
    {
      pattern: /tab.+/,
    },
    {
      pattern: /btn.+/,
    },
    {
      pattern: /hljs+/,
    },
  ],
  theme: {
    extend: {
      colors: palette,
    },
    hljs: {
      theme: 'night-owl',
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
    require('tailwind-highlightjs'),
  ],
  daisyui: {
    darkTheme: 'guweb-dark',
    themes: guweb,
  },
}
