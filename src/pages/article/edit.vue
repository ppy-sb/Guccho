<script setup lang="ts">
import { useSession } from '~/store/session'
import type Editor from '~/components/editor/index.vue'
import type { AccessPrivilege, Content } from '$def/server/article'
definePageMeta({
  middleware: ['auth', 'admin'],
})
const session = useSession()
const slug = ref('')
const app$ = useNuxtApp()
const importArticleFile = ref<HTMLInputElement | null>(null)
const { data: content, refresh } = await useAsyncData(async () => slug.value ? app$.$client.article.get.query(slug.value) : undefined)
const editor = ref<InstanceType<typeof Editor> | null>(null)
const editing = ref({ ...content.value?.json })
const save = async () => {
  await app$.$client.article.save.mutate({
    slug: slug.value,
    content: editing.value,
  })
}
const privilege = ref<NonNullable<Content['privilege']>>({
  write: ['self', 'staff'],
  delete: ['self', 'staff'],
})
const update = async () => {
  await refresh()
  editing.value = content.value?.json || {}
  editor.value?.context.editor.value?.commands.setContent(editing.value)
}
const exportArticle = () => {
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
const importArticle = async () => {
  const file = importArticleFile.value?.files?.[0]
  if (!file) {
    return
  }
  const data = new Uint8Array(await file.arrayBuffer())
  const decode = new TextDecoder('utf-8')
  const json = JSON.parse(decode.decode(data)) as {
    json: Content['json']
    privilege: NonNullable<Content['privilege']>
  }
  editing.value = json.json
  privilege.value = json.privilege
}

const privileges: Partial<Record<AccessPrivilege, string>> = {
  self: `me ${session.user && `(@${session.user.safeName})`}`,
  staff: 'Admin',
  moderator: 'Moderator',
  beatmapNominator: 'BN',
}
const options = Object.entries(privileges).map(([value, label]) => ({ label, value, disabled: value === 'self' }))

const resetRead = (e: Event) => {
  // @ts-expect-error checkbox event
  if (!e.target?.checked) {
    privilege.value.read = undefined
  }
}
</script>

<template>
  <section class="container pt-20 pb-8 mx-auto custom-container lg:px-2">
    <div class="flex gap-4 items-baseline">
      Editing: <input v-model="slug" type="text" class="input input-sm shadow-lg">
      <button class="btn btn-sm btn-info" @click="() => update()">
        Load
      </button>
      <button class="btn btn-sm btn-success" @click="() => save()">
        Save
      </button>
      <div class="divider divider-horizontal" />
      <button class="btn btn-sm btn-secondary" @click="exportArticle">
        Export
      </button>
      <input ref="importArticleFile" type="file" hidden @change="importArticle">
      <button class="btn btn-sm btn-primary" @click="importArticleFile?.click">
        Import
      </button>
    </div>
    <label class="label text-lg px-0">privileges</label>
    <form class="flex flex-col md:flex-row gap-3 flex-wrap">
      <div class="form-control">
        <div class="flex gap-1 items-center">
          <input
            :model-value="!!privilege.read"
            type="checkbox"
            class="checkbox checkbox-sm"
            @change="resetRead"
          >
          <label class="label">limit read</label>
        </div>
        <t-multi-select size="sm" :options="options" :model-value="privilege.read" />
      </div>
      <div class="form-control">
        <label class="label">write*</label>
        <t-multi-select size="sm" :options="options" :model-value="privilege.write" />
      </div>
      <div class="form-control">
        <label class="label">delete*</label>
        <t-multi-select size="sm" :options="options" :model-value="privilege.delete" />
      </div>
    </form>
    <lazy-editor ref="editor" v-model="editing" class="safari-performance-boost mt-2" />
  </section>
</template>
