import { getFullUser } from '../../backend-clients'
import { createProtectedRouter } from '../controllers/protected/user'

export const router = createProtectedRouter()

  .query('full-secret', {
    async resolve ({ ctx }) {
      return await getFullUser(ctx.user.id, { email: true, secrets: true })
    }
  })
