import { promisify } from 'node:util'
import { parseDsnOrThrow } from '@httpx/dsn-parser'
import MySQLEvents, { type DeleteEvent, type InsertEvent, type RowEvent, type UpdateEvent } from '@rodrigogs/mysql-events'
import { type InferSelectModel, type Table, getTableColumns, getTableName } from 'drizzle-orm'
import { config } from '../../env'
import { Logger } from '../../log'
import { GucchoError } from '~/def/messages'

class Watcher {
  logger = Logger.child({ label: 'event-source' })
  gucchoBackendConfig = config()
  parsed = parseDsnOrThrow(this.gucchoBackendConfig.replica)
  position = 0

  instance = new MySQLEvents(this.gucchoBackendConfig.replica, {
    startAtEnd: true,
    includeEvents: ['updaterows', 'deleterows', 'writerows'],
    excludedSchemas: {
      mysql: true,
    },
  })

  triggers = new Set<{
    name: string
    expression: string
    statement: keyof typeof MySQLEvents.STATEMENTS
    onEvent: (event: RowEvent<any>) => void
  }>()

  async init() {
    await this.instance.start()
    if (this.gucchoBackendConfig.setReplicaBinlogFormat) {
      const _query = promisify(this.instance.connection.query.bind(this.instance.connection))
      await _query('SET SESSION binlog_format = \'ROW\';')
    }
    this.instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, this.onConnectionError.bind(this))
    this.instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, this.logger.error)
    this.instance.on(MySQLEvents.EVENTS.STARTED, () => this.logger.info('started watching binlog'))
  }

  watch<T extends Table, E extends keyof typeof MySQLEvents.STATEMENTS>(table: T, statement: E, cb: (event: RowEventType<T, E>) => void) {
    const head = this.parsed.db ? `${this.parsed.db}.` : ''
    const tableName = head + getTableName(table)

    const ctx = {
      name: generateTriggerName(tableName, statement),
      expression: `${tableName}.*`,
      statement,
      onEvent: (event: RowEvent<Record<string, unknown>>) => {
        this.position = event.nextPosition
        try {
          const evt: RowEvent<InferSelectModel<T>> = {
            ...event,
            affectedColumns: [],
            affectedRows: [],
          }
          const columns = getTableColumns(table)
          for (const col in columns) {
            const name = columns[col].name
            if (event.affectedColumns.includes(name)) {
              evt.affectedColumns.push(col)
            }
          }
          for (const row of event.affectedRows) {
            const newRow = {
              before: row.before ? toAliasedRow(table, row.before) : undefined,
              after: row.after ? toAliasedRow(table, row.after) : undefined,
            }
            evt.affectedRows.push(newRow as any)
          }
          cb(evt as RowEventType<T, E>)
        }
        catch (err) {
          this.logger.error(err)
          // throwGucchoError(GucchoError.UnknownError)
        }
      },
    }

    this.instance.addTrigger(ctx)
    this.triggers.add(ctx)

    return {
      dispose: () => {
        this.instance.removeTrigger(ctx)
        this.triggers.delete(ctx)
      },
    }
  }

  async onConnectionError(err: Error) {
    this.logger.error(err)
    this.logger.error('connection error, reconnecting...')
    for (const trigger of this.triggers) {
      this.instance.removeTrigger(trigger)
    }
    await this.instance.stop()

    this.instance = new MySQLEvents(this.gucchoBackendConfig.replica, {
      position: this.position,
      includeEvents: ['updaterows', 'deleterows', 'writerows'],
      excludedSchemas: {
        mysql: true,
      },
    })
    for (const trigger of this.triggers) {
      this.instance.addTrigger(trigger)
    }
    await this.init()
  }
}

type RowEventType<T extends Table, E extends keyof typeof MySQLEvents.STATEMENTS> =
  E extends typeof MySQLEvents.STATEMENTS.INSERT
    ? InsertEvent<InferSelectModel<T>>
    : E extends typeof MySQLEvents.STATEMENTS.UPDATE
      ? UpdateEvent<InferSelectModel<T>>
      : E extends typeof MySQLEvents.STATEMENTS.DELETE
        ? DeleteEvent<InferSelectModel<T>>
        : RowEvent<InferSelectModel<T>>

const watcher = new Watcher()
async function ensureWatcher() {
  if (!watcher.instance.isStarted) {
    await watcher.init()
  }
}

export function watchTable<T extends Table, E extends keyof typeof MySQLEvents.STATEMENTS>(table: T, statement: E, cb: (event: RowEventType<T, E>) => void) {
  ensureWatcher()
  return watcher.watch(table, statement, cb)
}

function generateTriggerName(tableName: string, statement: keyof typeof MySQLEvents.STATEMENTS) {
  return `guccho-${tableName}-${statement}`
}

function toAliasedRow<T extends Table>(table: T, row: Record<string, unknown>) {
  const columns = getTableColumns(table)
  const newRow: Record<string, unknown> = {}
  for (const col in columns) {
    const _col = columns[col]
    const value = row[_col.name]
    newRow[col] = value instanceof Date
      ? value
      : _col.mapFromDriverValue(value)
  }
  return newRow as InferSelectModel<T>
}
