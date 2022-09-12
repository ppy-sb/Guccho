export const createActionResult = (data: Record<string, any> = {}) => () => ({
  status: 'succeed',
  ...data
})
export const sleep = ms => new Promise((resolve) => {
  setTimeout(resolve, ms)
})
export const userLogin = () => sleep(500).then(createActionResult)
export const userRegister = () => sleep(500).then(createActionResult)
