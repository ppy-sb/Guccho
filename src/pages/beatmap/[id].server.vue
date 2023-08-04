<script setup lang="ts" async>
// TODO https://github.com/victorgarciaesgi/nuxt-typed-router/issues/110
const { id } = useRoute().params as { id: string | string[] }
const { t } = useI18n()
if (!id || Array.isArray(id)) {
  createError(t('err-id-invalid'))
}
const client = useNuxtApp()
const bm = await client.$client.map.beatmap.query(id as string)
navigateTo({
  name: 'beatmapset-id',
  params: {
    id: bm.beatmapset.id,
  },
  query: {
    beatmap: bm.md5,
    mode: bm.mode,
  },
})

definePageMeta({
  alias: ['/b/:id', '/beatmaps/:id'],
})
</script>

<i18n lang="yaml">
en-GB:
  err-id-invalid: please provide valid id.
</i18n>

<script lang="ts">
export default {
  template: '',
}
</script>
