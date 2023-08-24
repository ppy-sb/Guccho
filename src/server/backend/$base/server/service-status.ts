import { cpus } from 'node:os'
import { memoryUsage } from 'node:process'
import { currentLoad, mem } from 'systeminformation'

import { ServiceStatus, status } from './@extends'
import * as services from '~/server/singleton/service'

export class ServiceStatusProvider {
  static lastTime = process.hrtime()
  static lastUsage = process.cpuUsage()
  static interval = 2000

  static processUsage: {
    system: number
    user: number
    current: number
  } = {
      system: 0,
      user: 0,
      current: 0,
    }

  static #calcPercentageLoad(usage: number, time: ReturnType<typeof process['hrtime']>) {
    return 100 * (usage / (time[0] * 1e9 + time[1]))
  }

  static async metrics() {
    const [load, memory] = await Promise.all([ServiceStatusProvider.load(), ServiceStatusProvider.memory()])
    return {
      load,
      memory,
    }
  }

  static async load() {
    const load = await currentLoad()
    return {
      app: {
        web: ServiceStatusProvider.processUsage,
      },
      system: {
        avg: load.avgLoad,
        current: load.currentLoad,
        user: load.currentLoadUser,
        system: load.currentLoadSystem,
        idle: load.currentLoadIdle,
        // Lower priority
        nice: load.currentLoadNice,
      },
    }
  }

  static collectLoad() {
    const durationUsage = process.cpuUsage(ServiceStatusProvider.lastUsage)
    const duration = process.hrtime(ServiceStatusProvider.lastTime)

    ServiceStatusProvider.lastTime = process.hrtime()
    ServiceStatusProvider.lastUsage = process.cpuUsage()

    const calc = (a: number, b: [number, number]) => ServiceStatusProvider.#calcPercentageLoad(a, b) / cpus().length

    ServiceStatusProvider.processUsage = {
      user: calc(durationUsage.user, duration) * 10000,
      system: calc(durationUsage.system, duration) * 10000,
      get current() {
        return this.user + this.system
      },
    }
  }

  static async memory() {
    const m = await mem()

    return {
      system: pick(m, [
        'total',
        'available',
        'free',
        'used',
        'active',
        'buffcache',
      ]),
    }
  }

  static async server() {
    return memoryUsage()
  }

  static async reportStatus() {
    const ret = Object.fromEntries(Object.keys(services).map((key) => {
      return [key, (services[key as keyof typeof services] as any)[status] || [ServiceStatus.Unknown]]
    }))
    return ret
  }

  static async config() {
    const npm: Record<string, unknown> = {}
    const npmConfig: Record<string, unknown> = {}
    const returnValue: Record<string, unknown> = {}
    let key: keyof typeof process['env']
    for (key in process.env) {
      if (key.startsWith('npm_package_scripts')) {
        continue
      }
      const dependencies = 'npm_package_dependencies_'
      if (key.startsWith(dependencies)) {
        // npmPackage.dependencies[key.slice(dependencies.length)] = process.env[key]
        continue
      }
      const devDependencies = 'npm_package_devDependencies_'
      if (key.startsWith(devDependencies)) {
        // npmPackage.dependencies[key.slice(devDependencies.length)] = process.env[key]
        continue
      }
      const _npmConfig = 'npm_config_'
      if (key.startsWith(_npmConfig)) {
        npmConfig[key.slice(_npmConfig.length)] = process.env[key]
        continue
      }
      const _npm = 'npm_'
      if (key.startsWith(_npm)) {
        npm[key.slice(_npm.length)] = process.env[key]
        continue
      }
      returnValue[key] = process.env[key]
    }
    return {
      npm: {
        ...npm,
        config: npmConfig,
      },
      ...returnValue,
    }
  }
}
setInterval(ServiceStatusProvider.collectLoad, ServiceStatusProvider.interval)
