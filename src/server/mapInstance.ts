// import { MapProvider } from '../adapters/bancho.py/server'

// type Methods<T extends Record<string | number | symbol, any>> = {
//   [Key in keyof T as T[Key] extends CallableFunction ? Key : never]: T[Key]
// }

type Merge<T1 extends Record<any, any>, T2 extends Record<any, any>> = {
  [Key1 in keyof T1 as Key1 extends keyof T2 ? never : Key1]: T1[Key1];
} & {
  [Key2 in keyof T2]: T2[Key2]
}

export const mapId = <T, M extends Record<any, any>, F extends (id: T) => any>(f1: M & { id: T }, f2: F): Merge<M, { id: ReturnType<F> }> => {
  return Object.assign(f1, {
    id: f2(f1.id),
  })
}

export const wrapMapId = <T extends (...p: any[]) => any, K extends (id: ReturnType<T>['id']) => any>
  (f1: T, f2: K) =>
    (...p: Parameters<T>) => {
      const r1 = f1(...p)
      return mapId(r1, f2) as Merge<ReturnType<T>, { id: ReturnType<K> }>
    }
