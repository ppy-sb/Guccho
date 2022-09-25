<template>
  <tr class="bg-wewak-300 dark:bg-wewak-800 rounded-md text-kimberly-900 dark:text-kimberly-100 font-medium">
    <td class="px-4 font-bold py-3">
      <p class="text-kimberly-900 dark:text-kimberly-100">
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
          <p class="font-medium text-kimberly-900 dark:text-kimberly-100">
            <user-card :user="user" :href="'/user/' + user.player_id" />
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
  name: 'UserTable',
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
