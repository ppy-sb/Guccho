/* eslint-disable antfu/no-cjs-exports */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-env node */

import { guweb } from './daisyui.themes'
import { palette } from './src/palette'

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './src/components/**/*.{vue,js}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
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
