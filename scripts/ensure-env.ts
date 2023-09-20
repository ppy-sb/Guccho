import assert from 'node:assert'
import { env } from 'node:process'

import { readdirSync } from 'node:fs'

const dataSources = readdirSync('./src/server/backend').filter(backend => backend !== 'base')

const LIST_AVAILABLE_ADAPTERS = `
Available dataSources: ${dataSources.join(', ')}`

assert(env.BACKEND, 'please setup env BACKEND={backend}, see .env.example')
assert(env.BACKEND !== 'base', `"base" backend is only meant for type definition, and cannot be used to handle traffics. ${LIST_AVAILABLE_ADAPTERS}`)
assert(dataSources.includes(env.BACKEND), `"${env.BACKEND}" is not a valid backend. ${LIST_AVAILABLE_ADAPTERS}`)

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND: string
    }
  }
}
