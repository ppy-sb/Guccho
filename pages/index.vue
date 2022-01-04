<template>
  <div id="index">
    <HeaderHomepage />
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted () {
    this.doAnimation()
  },
  methods: {
    doAnimation () {
      const tl = this.$anime.timeline({
        easing: 'easeOutQuint'
      })

      tl.add({
        targets: '.title-section',
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 700
      }).add({
        targets: '.mascot',
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 775
      })
    }
  }
}
</script>
