<script setup lang="ts">
// Importing necessary components
import { Editor } from '#components'
import type { ArticleProvider } from '$def/server/article'

// Define page middleware
definePageMeta({
  middleware: ['auth', 'admin'],
})
const app$ = useNuxtApp()

// Initializing shallow refs
const importArticleFile = shallowRef<HTMLInputElement | null>(null)
const editor = shallowRef<InstanceType<typeof Editor> | null>(null)

const article = reactive<{
  privilege: ArticleProvider.Meta['privilege']
  content?: ArticleProvider.Content['json']
  owner?: ArticleProvider.Meta['owner']
  dynamic: boolean
  slug: string
}>({
  privilege: {
    read: ['public'],
    write: ['staff'],
  },

  content: undefined,
  dynamic: false,
  slug: '',
})

// Fetching article data from server
const { data: content, refresh } = await useAsyncData(async () => {
  if (article.slug) {
    return app$.$client.article.get.query(article.slug)
  }
  return undefined
})

// Initializing default privileges for different access levels
const privileges: Record<ArticleProvider.WriteAccess, string> = {
  staff: 'Admin',
  moderator: 'Moderator',
  beatmapNominator: 'BN',
}
const readPrivileges: Record<ArticleProvider.ReadAccess, string> = {
  ...privileges,
  public: 'public',
}

// Helper function to convert privilege object to select options
function options(priv: typeof privileges | typeof readPrivileges) {
  return Object.entries(priv).map(([value, label]) => ({ label, value }))
}

// Export article data to a file
function exportArticle() {
  const file = new File(
    [JSON.stringify({ privilege: article.privilege, json: article.content })],
    `${article.slug || 'unnamed'}.article`,
    { type: 'application/json' }
  )

  const url = URL.createObjectURL(file)

  const a = document.createElement('a')
  a.href = url
  a.download = `${article.slug || 'unnamed'}.article`
  a.click()
}

// Import article data from a file
async function importArticle() {
  const file = importArticleFile.value?.files?.[0]
  if (!file) {
    return
  }

  const data = new Uint8Array(await file.arrayBuffer())
  const decode = new TextDecoder('utf-8')
  const content = JSON.parse(decode.decode(data)) as {
    json: ArticleProvider.Content['json']
    privilege: ArticleProvider.Meta['privilege']
  }

  article.content = content.json
  article.privilege = content.privilege

  editor.value?.reload()
}

// Create a new article
async function create() {
}

// Update article data from server
async function update() {
  await refresh()
  if (!content.value) {
    return
  }

  article.content = content.value.json || {}
  editor.value?.reload()

  article.privilege = content.value.privilege
}

// Save article data to server
async function save() {
  if (!article.slug) {
    return
  }
  if (!article.content) {
    return
  }

  await app$.$client.article.save.mutate(article as Required<typeof article>)
}

// Delete article from server
async function del() {
  if (!article.slug) {
    return
  }

  // eslint-disable-next-line no-alert
  const conf = confirm('Are you sure? You cannot revert this process.')
  if (!conf) {
    return
  }

  await app$.$client.article.delete.mutate({
    slug: article.slug,
  })
}
</script>

<template>
  <section class="container pb-8 mx-auto custom-container lg:px-2">
    <div class="flex gap-2 items-baseline">
      Editing: <input
        v-model="article.slug" type="text" class="input input-sm shadow-lg" :class="{
          'input-error': !article.slug,
        }"
      >
      <button class="btn btn-sm btn-info" @click="() => update()">
        Load
      </button>
      <button class="btn btn-sm btn-primary" @click="() => create()">
        New
      </button>
      <template v-if="content?.access.write && article.slug">
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
        <t-multi-select v-model="article.privilege.read" size="sm" :options="options(readPrivileges)" />
      </div>
      <div class="form-control  flex-row items-baseline gap-2">
        <label class="label">Write</label>
        <t-multi-select v-model="article.privilege.write" size="sm" :options="options(privileges)" />
      </div>
    </div>
    <lazy-editor v-if="article.content" ref="editor" v-model="article.content" class="safari-performance-boost mt-2" />
  </section>
</template>
