export type Status = 'show' | 'closing' | 'closed'
const status = shallowRef<Status>('closed')

export type Callback = undefined | (() => void)
function show(wrapper: HTMLDialogElement, cb?: Callback) {
  status.value = 'show'
  cb?.()
  // give other things 1 tick to prepare
  nextTick(() => wrapper.showModal())
}
function close(wrapper: HTMLDialogElement, cb?: Callback) {
  status.value = 'closing'
  // give other things 1 tick to prepare
  nextTick(() => {
    if (!wrapper) {
      return
    }
    wrapper.onanimationend = () => {
      wrapper.close()
      status.value = 'closed'
      wrapper.onanimationend = null
      cb?.()
    }
  })
}

function onNativeCancel(e: Event) {
  e.preventDefault()
  close(e.target as HTMLDialogElement)
  // status.value = 'closed'
}
export default function () {
  return { status, show, close, onNativeCancel }
}
