/* eslint-env node */
import * as convert from 'color-convert'
// @ts-expect-error got nothing
import themes from 'daisyui/src/colors/themes'
import { convertSingle, palette } from './src/palette'

// const themes = require('daisyui/src/colors/themes')

const cupcake = convertSingle(
  themes['[data-theme=cupcake]'],
  convert.hex.hsl,
  ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`,
) as Record<keyof typeof themes['[data-theme=cupcake]'], string>
// const valentine = convertSingle(themes['[data-theme=valentine]'], convert.hex.hsl, ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`) as Record<keyof typeof themes['[data-theme=cupcake]'], string>
const dracula = convertSingle(
  themes['[data-theme=dracula]'],
  convert.hex.hsl,
  ([h, s, l]: [string, string, string]) => `hsl(${h} ${s}% ${l}%)`,
) as Record<keyof typeof themes['[data-theme=dracula]'], string>
const base = {
  '--rounded-btn': '1rem',
  '--btn-text-case': 'normal',
  '--tab-border': '2px',
  '--tab-radius': '.5rem',
  '--tw-border-opacity': '0.2 !important',
}
const guweb = [
  {
    'guweb-light': {
      ...cupcake,
      ...base,
      // 'primary': palette.wewak[300],
      // 'secondary': cupcake.primary,
      'neutral': palette.kimberly[200],
      'base-50': palette.kimberly[50],
      'base-100': palette.kimberly[100],
      'base-200': palette.kimberly[200],
      'base-300': palette.kimberly[300],
      'base-content': palette.kimberly[900],
    },
  },
  {
    'guweb-dark': {
      ...dracula,
      ...base,
      'primary': palette.wewak[500],
      'neutral': palette.kimberly[500],
      'base-50': palette.kimberly[950],
      'base-100': palette.kimberly[900],
      'base-200': palette.kimberly[800],
      'base-300': palette.kimberly[700],
      'base-content': palette.kimberly[100],
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
    {
      pattern: /select+/,
    },
  ],
  theme: {
    extend: {
      colors: palette,
      animation: {
        text: 'text 7s ease infinite',
      },
      keyframes: {
        text: {
          '0%, 100%': {
            'background-size': '100% 120%',
            'background-position': 'top center',
          },
          '50%': {
            'background-size': '100% 120%',
            'background-position': 'bottom center',
          },
        },
      },
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
