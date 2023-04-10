type Merge<T1 extends Record<any, any>, T2 extends Record<any, any>> = {
  [Key1 in keyof T1 as Key1 extends keyof T2 ? never : Key1]: T1[Key1];
} & {
  [Key2 in keyof T2]: T2[Key2]
}

export function mapId<M extends Record<any, any>, F extends (id: M['id']) => any >(obj: M & { id: M['id'] }, f: F): Merge<M, { id: ReturnType<F> }>
export function mapId<M extends Record<any, any>, Key extends keyof M, F extends (id: M[Key]) => any>(obj: M & Record<Key, M[Key]>, f: F, keys: Key[]): Merge<M, Record<Key, ReturnType<F>>>
export function mapId<M extends Record<any, any>, Key extends keyof M, F extends (id: M[Key]) => any>(obj: M & Record<Key, M[Key]>, f: F, keys?: Key[]) {
  if (!keys) {
    return Object.assign(obj, { id: f(obj.id) })
  }
  return Object.assign(obj, keys.reduce((acc, cur) => {
    acc[cur] = f(obj[cur])
    return acc
  }, {} as Record<Key, ReturnType<F>>))
}
