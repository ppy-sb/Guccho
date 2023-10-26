<template>
  <nuxt-link-locale :to="{ name: 'index' }" class="btn btn-ghost normal-case text-xl gap-1">
    <icon name="ion:paw" />
    {{ useAppConfig().title }}
  </nuxt-link-locale>
</template>
