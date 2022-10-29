(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

export * from '~/adapters/bancho.py/trpc'
// export * from '~/database-adapters/mock/trpc'
