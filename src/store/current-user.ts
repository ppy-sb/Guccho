import { defineStore } from 'pinia'

/** counterストア */
export const useCounterStore = defineStore('counter', {
  state: () => ({
    /** 件数 */
    count: 0
  }),
  getters: {
    /** countを2倍 */
    double: state => state.count * 2
  },
  actions: {
    /**
     * countに1を加算
     */
    increment () {
      this.count++
    }
  }
})
