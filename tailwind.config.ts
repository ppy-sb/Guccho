/* eslint-disable antfu/no-cjs-exports */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-env node */
import defaultTheme from 'tailwindcss/defaultTheme'
import { guccho } from './daisyui.themes'
import { hex as colors } from './src/palette'

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './src/components/**/*.{vue,ts,js}',
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
      pattern: /hljs.+/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Kodchasan',
          'Hannotate SC',
          // 'LXGW WenKai',
          // 'ヒラギノ丸ゴ Pro W4', 'ヒラギノ丸ゴ Pro', 'Hiragino Maru Gothic Pro', 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'HG丸ｺﾞｼｯｸM-PRO', 'HGMaruGothicMPRO',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      colors,
      animation: {
        'role-text': 'text 7s ease infinite',
      },
      keyframes: {
        'role-text': {
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
    require('@tailwindcss/container-queries'),
  ],
  daisyui: {
    darkTheme: 'guccho-dark',
    themes: guccho,
    base: false,
  },
}
