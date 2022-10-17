(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

export * from '~/database-adapters/bancho.py/trpc'
// export * from '~/database-adapters/mock/trpc'
