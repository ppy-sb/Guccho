<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const emits = defineEmits<(t: 'confirm', data: { deleteDans: boolean }) => void>()
const { t } = useI18n()
const deleteDans = ref(false)
const modal = useTemplateRef('modal')

defineExpose({
  showModal() {
    return modal.value?.showModal()
  },
})
</script>

<i18n lang="yaml">
en-GB:
  search-text: Search dans...
  search: Search
  dan: Dan
  delete: Delete
  confirm-delete: Are you sure you want to delete this course?
  cancel: Cancel
  delete-dans: Delete dans in course

zh-CN:
  delete: 删除
  confirm-delete: 确定要删除这个段位池吗？
  delete-dans: 删除池中的段位
  cancel: 取消

  # TODO fr, DE
  </i18n>

<template>
  <!-- Delete Modal -->
  <TResponsiveModal ref="modal" v-slot="{ closeModal }" class="my-auto">
    <div class="shadow-lg card bg-base-100">
      <div class="card-body">
        <h3 class="text-lg font-bold">
          {{ t('delete') }}
        </h3>
        <p class="py-4">
          {{ t('confirm-delete') }}
        </p>
        <div class="form-control">
          <label for="" class="label">
            <input v-model="deleteDans" class="checkbox" type="checkbox">
            {{ t('delete-dans') }}
          </label>
        </div>
        <div class="flex gap-2 p-4">
          <button class="btn btn-sm btn-error btn-shadow grow" @click="closeModal(() => emits('confirm', { deleteDans }))">
            <Icon icon="ic:round-check" class="w-5 h-5" />
            {{ t('delete') }}
          </button>
          <button class="btn btn-sm btn-shadow grow" @click="() => closeModal()">
            <Icon icon="ic:round-clear" class="w-5 h-5" />
            {{ t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </TResponsiveModal>
</template>
