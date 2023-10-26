import { uneval } from 'devalue'
import superjson from 'superjson'

// eslint-disable-next-line no-eval
const eval2 = eval

export const transformer = {
  input: superjson,
  output: {
    serialize: (object: any) => uneval(object),
    // This `eval` only ever happens on the **client**

    deserialize: (object: any) => eval2(`(${object})`),
  },
}
