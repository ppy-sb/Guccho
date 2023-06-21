import assert from 'node:assert'

import { readdirSync } from 'node:fs'

const dataSources = readdirSync('./src/server/backend').filter(backend => backend !== 'base')

const LIST_AVAILABLE_ADAPTERS = `
Available dataSources: ${dataSources.join(', ')}`

assert(process.env.BACKEND, 'please setup env BACKEND={backend}, see .env.example')
assert(process.env.BACKEND !== 'base', `"base" backend is only meant for type definition, and cannot be used to handle traffics. ${LIST_AVAILABLE_ADAPTERS}`)
assert(dataSources.includes(process.env.BACKEND), `"${process.env.BACKEND}" is not a valid backend. ${LIST_AVAILABLE_ADAPTERS}`)

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND: string
    }
  }
}
