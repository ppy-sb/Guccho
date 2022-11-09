// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}

export * from '~/adapters/bancho.py/trpc'
export * from '~/adapters/bancho.py/config'
