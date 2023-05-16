import { uneval } from 'devalue'
import superjson from 'superjson'

export const transformer = {
  input: superjson,
  output: {
    serialize: (object: any) => uneval(object),
    // This `eval` only ever happens on the **client**
    // eslint-disable-next-line no-eval
    deserialize: (object: any) => eval(`(${object})`),
  },
}
