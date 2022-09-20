<script>
export default {
  name: 'LogoutPage',
  mounted () {
    // this.$auth.logout()
    this.$router.push('/')
    this.$toast.show({
      type: 'success',
      message: 'You have been logged out!'
    })
  }
}
</script>
