<script setup>
import { navigateTo, useRoute } from '#app'
const currentRoute = useRoute()
const root = currentRoute.matched[0]

const children = root.children

definePageMeta({
  // you can also pass a string or a computed property
  key: route => route.slug,
  keepalive: {
    exclude: ['modal'],
  },
})
</script>

<template>
  <div>
    <section class="container pt-20 pb-8 mx-auto custom-container lg:px-2">
      <!-- <t-nuxt-link-button v-for="route in children" :key="route.name" :to="route">
        {{ route.name }}
      </t-nuxt-link-button> -->
      <t-tabs variant="bordered">
        <!-- <t-tab
          class="tab-lg"
          :class="{
            'tab-active': currentRoute.path === root.path
          }"
          :value="currentRoute"
          @click="navigateTo(root)"
        >
          Index
        </t-tab> -->
        <t-tab
          v-for="route in children"
          :key="route.name"
          :class="{
            'tab-active': $route.name === route.name,
          }"
          class="tab-lg"
          @click="navigateTo(route)"
        >
          {{ route.name.split('-').slice(1).join('-') }}
        </t-tab>
      </t-tabs>
    </section>
    <nuxt-page />
  </div>
</template>

<style lang="postcss" scoped>
</style>
