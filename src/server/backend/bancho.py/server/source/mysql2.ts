import mysql from 'mysql2/promise'
import { config } from '../../env'

export default mysql.createPool({
  uri: config().dsn,
})
