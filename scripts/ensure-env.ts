import assert from 'node:assert'
import { readdirSync } from 'node:fs'
import gucchoConfig from '../guccho.config'

const dataSources = readdirSync('./src/server/backend').filter(backend => backend !== 'base')

const LIST_AVAILABLE_ADAPTERS = `
Available dataSources: ${dataSources.join(', ')}`

assert(gucchoConfig.use.backend, 'please setup env BACKEND={backend}, see .env.example')
assert(gucchoConfig.use.backend !== 'base', `"base" backend is only meant for type definition, and cannot be used to handle traffics. ${LIST_AVAILABLE_ADAPTERS}`)
assert(dataSources.includes(gucchoConfig.use.backend), `"${gucchoConfig.use.backend}" is not a valid backend. ${LIST_AVAILABLE_ADAPTERS}`)
