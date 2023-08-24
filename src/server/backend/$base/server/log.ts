import { access } from 'node:fs/promises'
import fs from 'node:fs'
import winston from 'winston'
import { ServiceStatus, Status, status } from './@extends'
import { observe } from '$base/logger'

export class LogProvider extends Status {
  static combined = '.logs/combined.log'
  static error = '.logs/error.log'

  constructor() {
    super()
    this[status] = [ServiceStatus.Up]
  }

  async get(last: number) {
    try {
      await access(LogProvider.combined, fs.constants.R_OK)
      return readLastNLinesFromFile(LogProvider.combined, last)
        .then(lines => lines.map((line) => {
          if (!line.trim()) {
            return undefined
          }
          const v = JSON.parse(line)
          v.timestamp = new Date(v.timestamp)
          return v
        }).filter(TSFilter)) as Promise<{
          [x: string]: unknown
          level: string
          label: string
          backend?: string
          timestamp: Date
          message?: string
          fix?: string
        }[]>
    }
    catch (e) {
      this.status = [ServiceStatus.Degraded]
      throw e
    }
  }
}
const sharedBaseCfg = {
  tailable: true,
  maxFiles: 100,
  maxsize: 1_000_000,
}
observe(new winston.transports.File({ ...sharedBaseCfg, filename: LogProvider.error, level: 'error' }))
observe(new winston.transports.File({ ...sharedBaseCfg, filename: LogProvider.combined }))

function readLastNLinesFromFile(filePath: string, n: number): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const lines: string[] = []
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' })
    let lineCount = 0
    const lastNLines: string[] = []

    fileStream.on('data', (data: string) => {
      const dataLines = data.split(/\r?\n/)

      for (let i = dataLines.length - 1; i >= 0; i--) {
        const line = dataLines[i]
        lineCount++

        if (lineCount > n) {
          break
        }

        lastNLines.unshift(line)
      }
    })

    fileStream.on('end', () => {
      if (lineCount < n) {
        lines.push(...lastNLines)
      }
      else {
        lines.push(...lastNLines.slice(0, n))
      }
      resolve(lines)
    })

    fileStream.on('error', (err: Error) => {
      reject(err)
    })
  })
}
