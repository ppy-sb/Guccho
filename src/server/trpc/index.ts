(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

export * from '~/adapters/bancho.py/trpc'
export * from '~/adapters/bancho.py/config'
// export * from '~/database-adapters/mock/trpc'
