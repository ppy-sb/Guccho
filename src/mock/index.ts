export const createActionResult = (data: Record<string, any> = {}) => () => ({
  status: 'succeed',
  ...data
})
export const sleep = ms => new Promise((resolve) => {
  setTimeout(resolve, ms)
})
export const userLogin = result => sleep(500).then(createActionResult(result))
export const userRegister = result => sleep(500).then(createActionResult(result))
