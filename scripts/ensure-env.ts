import assert from 'node:assert'

import { readdirSync } from 'node:fs'

const adapters = readdirSync('./src/adapters').filter(adapter => adapter !== 'base')

const LIST_AVAILABLE_ADAPTERS = `
Available adapters: ${adapters.join(', ')}`

assert(process.env.EXTERNAL, 'please setup env EXTERNAL={adapter}, see .env.example')
assert(process.env.EXTERNAL !== 'base', `"base" adapter is only meant for type definition, and cannot be used to handle traffics. ${LIST_AVAILABLE_ADAPTERS}`)
assert(adapters.includes(process.env.EXTERNAL), `"${process.env.EXTERNAL}" is not a valid adapter. ${LIST_AVAILABLE_ADAPTERS}`)
