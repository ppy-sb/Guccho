<template>
  <tr class="bg-hsl-d3 rounded-md text-white font-medium">
    <td class="px-4 font-bold py-3">
      <p class="text-white">
        #{{ place }}
      </p>
    </td>
    <td>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img
            class="h-6 w-auto"
            :src="$getFlagURL(user.country)"
          >
        </div>
        <div class="ml-3">
          <p class="font-medium text-white">
            Varkaria
          </p>
        </div>
      </div>
    </td>
    <td class="text-center font-bold">
      <template v-if="sort.selected.icon === 'pp'">
        {{ $addCommas(user.pp) }}pp
      </template>
      <template v-else-if="sort.selected.icon === 'acc'">
        {{ user.acc }}%
      </template>
      <template v-else>
        {{ $scoreFormat(user[`${sort.selected.icon}`]) }}
      </template>
    </td>
    <td class="text-center opacity-80">
      {{ user.acc }}%
    </td>
    <td class="text-center opacity-80">
      {{ user.plays }}
    </td>
  </tr>
</template>

<script>
export default {
  name: 'LeaderboadUserTable',
  props: {
    user: {
      type: Object,
      required: true
    },
    place: {
      type: Number,
      required: true
    },
    sort: {
      type: Object,
      required: true
    }
  }
}
</script>
