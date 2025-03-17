export type Status = 'show' | 'closed'
const status = shallowRef<Status>('closed')
const l2Status = shallowRef<Status>('closed')

export type Callback = undefined | (() => void)
export default function () {
  const _status = ref<Status>('closed')

  async function show(wrapper: HTMLDialogElement, cb?: Callback) {
    if (status.value === 'closed') {
      status.value = 'show'
    }
    else if (l2Status.value === 'closed') {
      l2Status.value = 'show'
    }
    _status.value = 'show'
    cb?.()

    // give other things 1 tick to prepare
    await nextTick()

    wrapper.showModal()
  }
  async function close(wrapper: HTMLDialogElement, cb?: Callback) {
    if (l2Status.value === 'show') {
      l2Status.value = 'closed'
    }
    else if (status.value === 'show') {
      status.value = 'closed'
    }
    _status.value = 'closed'

    // give other things 1 tick to prepare
    await nextTick()

    if (!wrapper) {
      cb?.()
    }

    // const to = setTimeout(() => {
    //   wrapper.ontransitionend = null
    // }, 500)

    wrapper.ontransitionend = () => {
      // clearTimeout(to)
      wrapper.ontransitionend = null
      wrapper.close()
      cb?.()
    }
  }

  function onNativeCancel(e: Event) {
    e.preventDefault()
    close(e.target as HTMLDialogElement)
  // status.value = 'closed'
  }
  return {
    status: _status,
    l1Status: status,
    l2Status,
    show,
    close,
    onNativeCancel,
  }
}
