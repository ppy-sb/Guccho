// eslint-disable-next-line import/default
import ChartJs from 'chart.js'

// Workaround because chart.js doesn't provide an default export
const { Chart, registerables } = ChartJs

export default defineNuxtPlugin(() => {
  Chart.register(...registerables)
})
