import mysql from 'mysql2/promise'
import { config } from '../../env'

export default lazySingleton(() => mysql.createConnection({
  uri: config().dsn,
}))
