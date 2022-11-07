export const userpageLineChartOptions = {
  animations: {
    y: {
      easing: 'easeInOutElastic',
      from: (ctx: { type: string; mode: string; dropped: boolean }) => {
        if (ctx.type === 'data') {
          if (ctx.mode === 'default' && !ctx.dropped) {
            ctx.dropped = true
            return 0
          }
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: {
      display: false
    },
    x: {
      display: false
    }
  },
  radius: 0
}
