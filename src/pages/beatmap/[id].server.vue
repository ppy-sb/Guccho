<script setup lang="ts" async>
const { id } = useRoute().params
if (!id || Array.isArray(id)) {
  createError('please provide valid id.')
}
const client = useNuxtApp()
const bm = await client.$client.map.beatmap.query({ id: id as string, md5: id as string })
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

<script lang="ts">
export default {
  template: '',
}
</script>
