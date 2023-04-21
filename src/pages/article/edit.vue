<script setup lang="ts">
import type Editor from '~/components/editor/index.client.vue'
import type { Access, ContentPrivilege, ReadAccess } from '$def/server/article'

definePageMeta({
  middleware: ['auth', 'admin'],
})

const slug = shallowRef<string>()
const app$ = useNuxtApp()
const importArticleFile = shallowRef<HTMLInputElement | null>(null)
const {
  data: content,
  refresh,
} = await useAsyncData(async () => slug.value ? app$.$client.article.get.query(slug.value) : undefined)
const editor = shallowRef<InstanceType<typeof Editor> | null>(null)
const editing = shallowRef({ ...content.value?.json })

const privilege = ref<NonNullable<ContentPrivilege['privilege']>>({
  read: ['public'],
  write: ['staff'],
})
async function update() {
  await refresh()
  if (!content.value) {
    return
  }
  editing.value = content.value.json || {}
  editor.value?.reload()

  privilege.value = content.value.privilege
}
function exportArticle() {
  const file = new File([JSON.stringify({
    privilege: privilege.value,
    json: editing.value,
  })], `${slug.value}.article`, { type: 'application/json' })
  const url = URL.createObjectURL(file)

  const a = document.createElement('a')
  a.href = url
  a.download = `${slug.value || 'unnamed'}.article`
  a.click()
}
async function importArticle() {
  const file = importArticleFile.value?.files?.[0]
  if (!file) {
    return
  }
  const data = new Uint8Array(await file.arrayBuffer())
  const decode = new TextDecoder('utf-8')
  const json = JSON.parse(decode.decode(data)) as {
    json: ContentPrivilege['json']
    privilege: NonNullable<ContentPrivilege['privilege']>
  }
  editing.value = json.json
  privilege.value = json.privilege

  editor.value?.reload()
}

const privileges: Partial<Record<Access, string>> = {
  staff: 'Admin',
  moderator: 'Moderator',
  beatmapNominator: 'BN',
}
const readPriv: Partial<Record<ReadAccess, string>> = Object.assign(privileges, { public: 'public' })

function options(priv: typeof privileges | typeof readPriv) {
  return Object.entries(priv).map(([value, label]) => ({ label, value }))
}

async function save() {
  if (!slug.value) {
    return
  }
  await app$.$client.article.save.mutate({
    slug: slug.value,
    content: editing.value,
    privilege: privilege.value,
  })
}
async function del() {
  if (!slug.value) {
    return
  }
  // eslint-disable-next-line no-alert
  const conf = confirm('are you sure? you cannot revert this process.')
  if (!conf) {
    return
  }
  await app$.$client.article.delete.mutate({
    slug: slug.value,
  })
}
</script>

<template>
  <section class="container pt-20 pb-8 mx-auto custom-container lg:px-2">
    <div class="flex gap-2 items-baseline">
      Editing: <input
        v-model="slug" type="text" class="input input-sm shadow-lg" :class="{
          'input-error': !slug,
        }"
      >
      <button class="btn btn-sm btn-info" @click="() => update()">
        Load
      </button>
      <template v-if="content?.access.write">
        <button class="btn btn-sm btn-success" @click="() => save()">
          Save
        </button>
        <div class="divider divider-horizontal" />
        <button class="btn btn-sm btn-error" @click="() => del()">
          Delete
        </button>
      </template>
      <div class="divider divider-horizontal" />
      <input ref="importArticleFile" type="file" hidden @change="importArticle">
      <button class="btn btn-sm btn-primary" @click="importArticleFile?.click">
        Import
      </button>
      <button class="btn btn-sm btn-secondary" @click="exportArticle">
        Export
      </button>
    </div>
    <div class="flex flex-col md:flex-row gap-3 flex-wrap mt-2">
      <div class="form-control flex-row items-baseline gap-2">
        <label class="label pl-0">Read</label>
        <t-multi-select v-model="privilege.read" size="sm" :options="options(readPriv)" />
      </div>
      <div class="form-control  flex-row items-baseline gap-2">
        <label class="label">Write</label>
        <t-multi-select v-model="privilege.write" size="sm" :options="options(privileges)" />
      </div>
    </div>
    <lazy-editor v-if="content?.json" ref="editor" v-model="editing" class="safari-performance-boost mt-2" />
  </section>
</template>
