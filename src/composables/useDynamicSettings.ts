import { useClientDynamicSettings } from '~/store/dynamic-settings'
import type { ExtractSettingType } from '$base/@define-setting'
import type { settings } from '$active/dynamic-settings'

export default async function () {
  const client = useClientDynamicSettings()

  const app = useNuxtApp()

  const { data: serverData } = await app.$client.me.dynamicSettings.get.useQuery()

  const _data = { ...client.$state.data, ...serverData.value }
  const data = ref(_data)

  const unchanged = ref(_data)

  async function save(v: ExtractSettingType<typeof settings>) {
    client.save(v)
    serverData.value = await app.$client.me.dynamicSettings.update.mutate(v)
  }

  return {
    data,
    unchanged,
    save() {
      return save(data.value)
    },
  }
}
