<template>
  <div>
    <header-default class="!pb-2" title="components playground" />
    <client-only>
      <teleport to="#app-modal-portal">
        <t-modal-container ref="inner">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <dv-button @click="openModal2">
                open modal 2
              </dv-button>
              <dv-button @click="closeModal">
                close modal
              </dv-button>
            </div>
          </div>
          <template #modal>
            <div class="card bg-base-100 shadow-xl">
              <figure><img src="https://placeimg.com/400/225/arch" alt="Shoes"></figure>
              <div class="card-body">
                <h2 class="card-title">
                  Modal
                </h2>
                <p>hell yeah?</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary" @click="closeModal2">
                    close me
                  </button>
                </div>
              </div>
            </div>
          </template>
        </t-modal-container>
      </teleport>
    </client-only>
    <dv-button @click="openModal">
      modal 1
    </dv-button>
  </div>
</template>

<script setup>
const openModal = inject('openModal')
const closeModal = inject('closeModal')

const inner = ref()
const openModal2 = () => inner.value.openModal()
const closeModal2 = () => inner.value.closeModal()
</script>

<style lang="scss" scoped>

</style>
