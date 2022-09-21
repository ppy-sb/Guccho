/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
/** @type {import('tailwindcss').Config} */
import { palette } from './src/palette'
console.log(palette)
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
    }
  ],
  theme: {
    extend: {
      colors: palette
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        guweb: {
          ...require('daisyui/src/colors/themes')['[data-theme=dracula]'],
          primary: palette.mulberry[500],
          neutral: palette['ebony-clay'][500]
          // secondary: palette['wine-berry'][500]
          // secondary: palette['pigeon-post'][500]
        }
      }
    ]
  }
}
