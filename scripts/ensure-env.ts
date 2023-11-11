import assert from 'node:assert'
import { readdirSync } from 'node:fs'
import backend from '../guccho.backend.config'

const dataSources = readdirSync('./src/server/backend').filter(backend => backend !== 'base')

const LIST_AVAILABLE_ADAPTERS = `Available: ${dataSources.join(', ')}`

assert(backend.use, `please pick a backend.
${LIST_AVAILABLE_ADAPTERS}
loc: "use" in backend.config.`)
assert(backend.use !== 'base', `"base" backend is only meant for type definition, and cannot be used to handle traffics.
${LIST_AVAILABLE_ADAPTERS}`)
assert(dataSources.includes(backend.use), `"${backend.use}" is not a valid backend.
${LIST_AVAILABLE_ADAPTERS}`)
