<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute('chat')
const chat = useTemplateRef('chat')

if (route.query.id) {
  onMounted(() => {
    chat.value?.selectIdx(route.query.id?.toString() ?? '')
  })
}
</script>

<template>
  <div class="container max-w-screen-xl mx-auto custom-container">
    <app-chat ref="chat" class="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-25rem)] relative lg:rounded-lg border auto-border-color shadow-md" />
  </div>
</template>
