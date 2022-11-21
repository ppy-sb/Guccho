<template>
  <div class="container mx-auto custom-container">
    <!-- <header-default class="!pb-2" title="components playground" /> -->
    <t-modal-root>
      <t-modal-wrapper ref="wrapper1" v-slot="{ closeModal }">
        <t-modal-container>
          <template #default>
            <t-modal>
              <div class="card-title">
                modal 1 menu
              </div>
              <t-button @click="openInner1">
                open inner
              </t-button>
              <t-button @click="closeModal">
                close modal
              </t-button>
            </t-modal>
          </template>
          <template #modal>
            <t-modal-wrapper ref="inner1" v-slot="{ closeModal: closeModal2 }">
              <div class="flex items-center justify-center h-screen">
                <div class="shadow-xl card glass">
                  <figure>
                    <img src="https://placeimg.com/400/225/arch" alt="Shoes">
                  </figure>
                  <div class="card-body">
                    <h2 class="card-title">
                      Inner Modal 1
                    </h2>
                    <p>hell yeah?</p>
                    <div class="justify-end card-actions">
                      <button class="btn btn-primary" @click="closeModal2">
                        close me
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </t-modal-wrapper>
          </template>
        </t-modal-container>
      </t-modal-wrapper>
      <t-modal-wrapper ref="wrapper2" v-slot="{ closeModal }">
        <t-modal-container>
          <template #default>
            <t-modal>
              <div class="card-title">
                modal 2 menu
              </div>
              <t-button @click="openInner2">
                open inner
              </t-button>
              <t-button @click="closeModal">
                close modal
              </t-button>
            </t-modal>
          </template>
          <template #modal>
            <t-modal-wrapper ref="inner2" v-slot="{ closeModal: closeModal2 }">
              <div class="container mx-auto">
                <div class="shadow-xl card bg-kimberly-200 dark:bg-kimberly-800">
                  <figure>
                    <img src="https://placeimg.com/400/225/arch" alt="Shoes">
                  </figure>
                  <div class="card-body">
                    <h2 class="card-title">
                      Inner Modal 2
                    </h2>
                    <p>hell yeah?</p>
                    <div class="justify-end card-actions">
                      <button class="btn btn-primary" @click="closeModal2">
                        close me
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </t-modal-wrapper>
          </template>
        </t-modal-container>
      </t-modal-wrapper>
    </t-modal-root>
    <section class="container mx-auto">
      <div class="flex gap-2">
        <t-button @click="nested1">
          nested modal 1
        </t-button>
        <t-button @click="nested2">
          nested modal 2
        </t-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const nested1 = ref()
const openInner1 = ref()
const nested2 = ref()
const openInner2 = ref()

const wrapper1 = ref()
const inner1 = ref()
const wrapper2 = ref()
const inner2 = ref()
// const wrapper2 = ref(null)
// const { openModal } = wrapper.value
onMounted(() => {
  nested1.value = () => {
    wrapper1.value.openModal()
  }
  openInner1.value = () => {
    inner1.value.openModal()
  }
  nested2.value = () => {
    wrapper2.value.openModal()
  }
  openInner2.value = () => {
    inner2.value.openModal()
  }
})
</script>

<style lang="scss" scoped></style>
