<template>
  <div
    class="h-full flex items-center"
  >
    <div
      class="container mx-auto w-max text-left text-white my-auto flex items-center justify-between"
    >
      <div class="content">
        <div class="mb-6">
          <h1 class="text-4xl text-center sm:text-left mb-2 font-bold">
            {{ $config.title.toUpperCase() }}
          </h1>
          <h2 class="h-sub font-semibold text-md text-center sm:text-left">
            We are an osu! private server built from the ground up with many
            unique features not seen elsewhere - for more information, check out
            gulag and {{ $config.title }} on GitHub - we're fully open source!
          </h2>
        </div>

        <div class="gap-2 flex">
          <t-nuxt-link-button
            :to="{name: 'auth-login'}"
            variant="primary"
          >
            Login
          </t-nuxt-link-button>

          <t-nuxt-link-button
            :to="{name: 'auth-register'}"
            variant="secondary"
          >
            Register
          </t-nuxt-link-button>
        </div>
      </div>
      <div class="mascot hidden lg:block">
        <img src="~/assets/mascot/pippi.png" alt="Pippi Mascot" m="l-auto">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index'
}
</script>

<style lang="postcss">
.h-sub {
  max-width: 32rem;
}

/* a.btn {
  @apply inline-flex justify-center w-full px-6 py-2 text-base font-medium
  text-white border border-transparent rounded-md shadow-md
  focus:outline-none w-auto
} */
</style>
