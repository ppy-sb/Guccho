import { relations } from 'drizzle-orm'
import { index, int, mysqlEnum, mysqlTable, primaryKey, text } from 'drizzle-orm/mysql-core'
import { users } from '../../bancho.py/drizzle/schema'

export * from '../../bancho.py/drizzle/schema'

export const userpages = mysqlTable('userpages', {
  id: int('id').autoincrement().notNull(),
  userId: int('user_id').notNull(),
  html: text('html'),
  raw: text('raw'),
  rawType: mysqlEnum('raw_type', ['tiptap']),
},
(table) => {
  return {
    userId: index('user_id').on(table.userId),
    userpagesIdPk: primaryKey({ columns: [table.id], name: 'userpages_id_pk' }),
  }
})

export const userpagesRelations = relations(userpages, ({ one }) => ({
  user: one(users, { fields: [userpages.userId], references: [users.id] }),
}))
