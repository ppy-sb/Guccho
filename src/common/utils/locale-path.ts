export interface PathAccessibleObject {
  [key: string | number]: string | number | PathAccessibleObject
}

type RetrievablePath<T, Delimiter extends string, Path extends string = ''> =
  | { __path__: Path; toString(): `${Path}` }
  & (
    T extends PathAccessibleObject
      ? {
          [K in keyof T as K extends symbol ? never : K]: RetrievablePath<
        T[K],
        Delimiter,
        Path extends ''
          ? K
          : `${Path}${Delimiter}${K & (string | number)}`
      >
        }
      : unknown
  )

function getPathWithDelimiter<Shape extends PathAccessibleObject, Delimiter extends string>(delimiter: Delimiter, segments: string[] = []): RetrievablePath<Shape, Delimiter> {
  const recursiveHandler = {
    get(target: Shape, prop: string): unknown {
      if (prop === 'toString') {
        return () => segments.join(delimiter)
      }
      return getPathWithDelimiter<any, Delimiter>(delimiter, [...segments, prop])
    },
  }
  return new Proxy({} as any, recursiveHandler)
}

export function getPath<Shape extends PathAccessibleObject>() {
  return <Delimiter extends string = '.'>(delimiter = '.' as Delimiter) => getPathWithDelimiter<Shape, Delimiter>(delimiter)
}

// function $withDelimiter<Shape extends PathAccessibleObject, Delimiter extends string>(): RetrievablePath<Shape, Delimiter> { return void 0 }

// function $toKey<T extends RetrievablePath<any, any, any>>(input?: T): T['__path__'] {
//   return $$ts!($$typeToString!<T['__path__']>())
// }

// function $typeOnly<T>(input: T): T {
//   return void 0
// }

// interface i18n extends PathAccessibleObject {
//   get: 1
//   deep: {
//     access: {
//       is: 'here'
//     }
//   }
// }

// const _root = $withDelimiter!<i18n, '.'>()
// const _deep = $typeOnly!(_root.deep)
// const _access = $typeOnly!(_deep.access)

// const t = $toKey!(_access.is)
