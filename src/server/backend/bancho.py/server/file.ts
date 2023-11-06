import { request } from 'node:http'
import { type H3Event } from 'h3'
import { type Id, type ScoreId } from '..'
import { config } from '../env'
import { FileProvider as Base } from '$base/server'

export class FileProvider extends Base<Id, ScoreId> {
  config = config()
  async replay(id: ScoreId, ev: H3Event): Promise<void> {
    this.config.api?.v1 ?? raise(Error, 'need bancho.py api v1 to work.')

    const url = new URL(`${this.config.api?.v1}/get_replay`)
    url.searchParams.set('id', id.toString())

    return new Promise((resolve, reject) => {
      const req = request(url, (im) => {
        im.on('error', reject)
        if ((im.statusCode || 0) >= 400) {
          reject(new Error('Returned bad code'))
        }
        else {
          ev.node.res.writeHead(im.statusCode as number, im.statusMessage, im.rawHeaders)
          im.pipe(ev.node.res)
          im.on('end', resolve)
        }
      })

      req.on('error', reject)

      req.end() // Send the request
    })
  }
}
