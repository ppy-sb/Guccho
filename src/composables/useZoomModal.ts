export type Status = 'show' | 'closed'
const status = shallowRef<Status>('closed')

export default function () {
  return { status }
}
