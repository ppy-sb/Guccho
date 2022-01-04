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
        easing: 'easeOutQuint',
        duration: 665
      })

      tl.add({
        targets: '.content',
        opacity: [0, 1],
        translateY: [25, 0]
      }).add({
        targets: '.mascot',
        opacity: [0, 1],
        translateY: [25, 0]
      }, '-=300')
    }
  }
}
</script>
