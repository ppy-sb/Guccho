/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
/** @type {import('tailwindcss').Config} */
import { palette } from './src/palette'
const themes = require('daisyui/src/colors/themes')
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
    themes: [
      {
        'guweb-light': {
          ...themes['[data-theme=cupcake]'],
          primary: palette.wewak[300],
          secondary: themes['[data-theme=cupcake]'].primary,
          neutral: palette.kimberly[200],
          'base-100': palette.kimberly[100],
          'base-content': palette.kimberly[900]
        }
      },
      {
        'guweb-dark': {
          ...themes['[data-theme=dracula]'],
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
  }
}
