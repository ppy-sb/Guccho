import { z } from 'zod'
import { router } from './index'
import { sampleUserWithSecrets } from '@/prototyping/objects/user'

router.query('getUser', {
  input: z.object({
    handle: z.union([z.string(), z.number()])
  }),
  resolve () {
    return sampleUserWithSecrets
  }
})
