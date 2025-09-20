interface Props<T> {
  value: T
}

interface Slot<T> {
  slots: {
    default: (props: Props<T>) => any
  }
}

export default function<T>(props: Props<T>, ctx: Slot<T>): { __ctx: Slot<T> } {
  return ctx.slots.default({ value: props.value })
}
