/* eslint-disable antfu/no-const-enum */
export namespace Mail {
  export const enum Variant {
    Verify,
    AccountRecovery,
  }

  interface Verify {
    name: string
    serverName: string
    baseURL: string
    id: string

  }

  interface AccountRecovery {
    name: string
    id: string
  }
  interface Template extends Record<string, unknown> {
    name: string
    serverName: string
    link: string
  }

  export interface Param {
    [Variant.AccountRecovery]: (input: AccountRecovery) => Template
    [Variant.Verify]: (input: Verify) => Template
  }

}
