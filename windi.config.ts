import { defineConfig } from '@windicss/plugin-utils'

export default defineConfig({
  extract: {
    include: [
      "./node_modules/tv-*/dist/tv-*.umd.min.js",
      "./client/components/**/*.{js,vue,ts}",
      "./client/layouts/**/*.vue",
      "./client/pages/**/*.vue",
      "./client/plugins/**/*.{js,ts}",
      "./nuxt.config.{js,ts}",
    ]
  },
  theme: {
    extend: {
      colors: {
        hsl: {
          p1: 'hsl(var(--base-h),100%,50%)',
          h1: 'hsl(var(--base-h),100%,70%)',
          h2: 'hsl(var(--base-h),50%,45%)',
          h3: 'hsl(var(--base-h),50%,30%)',
          c1: 'hsl(var(--base-h),40%,100%)',
          c2: 'hsl(var(--base-h),40%,90%)',
          l1: 'hsl(var(--base-h),40%,80%)',
          l2: 'hsl(var(--base-h),40%,75%)',
          l3: 'hsl(var(--base-h),40%,70%)',
          l4: 'hsl(var(--base-h),40%,50%)',
          d1: 'hsl(var(--base-h),20%,35%)',
          d2: 'hsl(var(--base-h),20%,30%)',
          d3: 'hsl(var(--base-h),20%,25%)',
          d4: 'hsl(var(--base-h),20%,20%)',
          d5: 'hsl(var(--base-h),20%,15%)',
          d6: 'hsl(var(--base-h),20%,10%)',
          f1: 'hsl(var(--base-h),10%,60%)',
          b1: 'hsl(var(--base-h),10%,40%)',
          b2: 'hsl(var(--base-h),10%,30%)',
          b3: 'hsl(var(--base-h),10%,25%)',
          b4: 'hsl(var(--base-h),10%,20%)',
          b5: 'hsl(var(--base-h),10%,15%)',
          b6: 'hsl(var(--base-h),10%,10%)'
        }
      }
    }
  }
})
