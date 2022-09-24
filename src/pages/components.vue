<template>
  <div>
    <header-default class="!pb-2" title="components playground" />
    <teleport to="#app-modal-portal">
      <t-modal-wrapper ref="wrapper1" v-slot="{ closeModal }">
        <t-modal-container>
          <template #default>
            <t-modal>
              modal 1 menu
              <dv-button @click="openInner1">
                open inner
              </dv-button>
              <dv-button @click="closeModal">
                close modal
              </dv-button>
            </t-modal>
          </template>
          <template #modal>
            <t-modal-wrapper ref="inner1" v-slot="{ closeModal: closeModal2 }">
              <div class="card glass bg-ebony-clay-800 shadow-xl">
                <figure>
                  <img src="https://placeimg.com/400/225/arch" alt="Shoes">
                </figure>
                <div class="card-body">
                  <h2 class="card-title">
                    Inner Modal 1
                  </h2>
                  <p>hell yeah?</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary" @click="closeModal2">
                      close me
                    </button>
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
              modal 2 menu
              <dv-button @click="openInner2">
                open inner
              </dv-button>
              <dv-button @click="closeModal">
                close modal
              </dv-button>
            </t-modal>
          </template>
          <template #modal>
            <t-modal-wrapper ref="inner2" v-slot="{ closeModal: closeModal2 }">
              <div class="card glass bg-ebony-clay-800 shadow-xl">
                <figure>
                  <img src="https://placeimg.com/400/225/arch" alt="Shoes">
                </figure>
                <div class="card-body">
                  <h2 class="card-title">
                    Inner Modal 2
                  </h2>
                  <p>hell yeah?</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary" @click="closeModal2">
                      close me
                    </button>
                  </div>
                </div>
              </div>
            </t-modal-wrapper>
          </template>
        </t-modal-container>
      </t-modal-wrapper>
    </teleport>
    <dv-button @click="nested1">
      modal 1
    </dv-button>
    <dv-button @click="nested2">
      modal 3
    </dv-button>
  </div>
</template>

<script setup>
const nested1 = ref(undefined)
const openInner1 = ref(undefined)
const nested2 = ref(undefined)
const openInner2 = ref(undefined)

const wrapper1 = ref(null)
const inner1 = ref(null)
const wrapper2 = ref(null)
const inner2 = ref(null)
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
