/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
/** @type {import('tailwindcss').Config} */
import convert from 'color-convert'
import { palette } from './src/palette'

const themes = require('daisyui/src/colors/themes')

const convertSingle = (colors, converter, transform) => Object.entries(colors).reduce((acc, [key, value]) => {
  acc[key] = transform(converter(value))
  return acc
}, {})

const cupcake = convertSingle(themes['[data-theme=cupcake]'], convert.hex.hsl, ([h, s, l]) => `hsl(${h} ${s}% ${l}%)`)
const dracula = convertSingle(themes['[data-theme=dracula]'], convert.hex.hsl, ([h, s, l]) => `hsl(${h} ${s}% ${l}%)`)

const guweb = [
  {
    'guweb-light': {
      ...cupcake,
      primary: palette.wewak[300],
      secondary: cupcake.primary,
      neutral: palette.kimberly[200],
      'base-100': palette.kimberly[100],
      'base-content': palette.kimberly[900],
      '--rounded-btn': '1.9rem',
      '--tab-border': '2px',
      '--tab-radius': '.5rem'
    }
  },
  {
    'guweb-dark': {
      ...dracula,
      primary: palette.wewak[500],
      neutral: palette.kimberly[500],
      'base-100': palette.kimberly[900],
      'base-content': palette.kimberly[100],
      '--rounded-btn': '1.9rem',
      '--tab-border': '2px',
      '--tab-radius': '.5rem'
    }
  }
]
console.log(guweb)

module.exports = {
  content: [
    './src/components/**/*.{vue,js}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './src/App.{js,ts,vue}',
    './src/app.{js,ts,vue}'
  ],
  safelist: [
    {
      pattern: /tab.+/
    },
    {
      pattern: /btn.+/
    },
    {
      pattern: /hljs+/
    }
  ],
  theme: {
    extend: {
      colors: palette
    },
    hljs: {
      theme: 'night-owl'
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
    require('tailwind-highlightjs')
  ],
  daisyui: {
    darkTheme: 'guweb-dark',
    themes: guweb
  }
}
