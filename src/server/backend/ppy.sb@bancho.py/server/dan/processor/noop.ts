import { BaseDanProcessor } from './$base'

export class NoopDanProcessor extends BaseDanProcessor<any, any> implements BaseDanProcessor<any, any> {
  async init() {}
  async recalcDan(_opt: any): Promise<void> {}
  async recalcProvidedDan(_opt: any): Promise<void> {}
  async recalcUserFull(_user: any): Promise<void> {}
  async dispose() {}
}
