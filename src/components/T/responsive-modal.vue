<template>
  <div
    class="flex w-full h-screen grow justify-center modal-bottom md:modal-middle mx-auto max-w-3xl"
    response-modal
  >
    <slot name="root">
      <div class="bg-gbase-50 rounded-t-2xl md:rounded-2xl shadow-md">
        <slot name="body">
          <div class="flex flex-col gap-2 p-8">
            <slot />
          </div>
        </slot>
      </div>
    </slot>
  </div>
</template>
