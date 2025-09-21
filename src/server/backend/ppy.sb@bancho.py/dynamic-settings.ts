// export * from '../bancho.py/dynamic-settings'

import { settings as bpy } from '../bancho.py/dynamic-settings'

const excludeApiKey = Object.fromEntries(
  Object.entries(bpy).filter(([key]) => key !== 'apiKey')
)
export const settings = {
  ...excludeApiKey,
}
