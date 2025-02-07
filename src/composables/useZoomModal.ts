export type Status = 'show' | 'closed'
const status = shallowRef<Status>('closed')
const l2Status = shallowRef<Status>('closed')

export type Callback = undefined | (() => void)
export default function () {
  const l2 = ref(false)
  const _status = computed({
    get() {
      return l2.value ? l2Status.value : status.value
    },
    set(v) {
      if (l2.value) {
        l2Status.value = v
      }
      else {
        status.value = v
      }
    },
  })
  async function show(wrapper: HTMLDialogElement, cb?: Callback) {
    if (status.value === 'show') {
      l2.value = true
    }
    _status.value = 'show'
    cb?.()

    // give other things 1 tick to prepare
    await nextTick()

    wrapper.showModal()
  }
  async function close(wrapper: HTMLDialogElement, cb?: Callback) {
    _status.value = 'closed'

    // give other things 1 tick to prepare
    await nextTick()

    if (!wrapper) {
      cb?.()
    }

    const to = setTimeout(() => {
      wrapper.onanimationend = null
    }, 1500)

    wrapper.onanimationend = () => {
      clearTimeout(to)
      wrapper.onanimationend = null
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
