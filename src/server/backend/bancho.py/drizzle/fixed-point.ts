import { type AnyMySqlTable, MySqlColumnBuilderWithAutoIncrement, MySqlColumnWithAutoIncrement, type MySqlDecimalConfig } from 'drizzle-orm/mysql-core'
import { type ColumnBaseConfig, type ColumnBuilderBaseConfig, type ColumnBuilderRuntimeConfig, type MakeColumnConfig, entityKind } from 'drizzle-orm'

export type FixedPointRepresentationInitial<TName extends string> = FixedPointRepresentationBuilder<{
  name: TName
  dataType: 'number'
  columnType: 'FixedPointRepresentation'
  data: number
  driverParam: string
  enumValues: undefined
}>

export class FixedPointRepresentationBuilder<T extends ColumnBuilderBaseConfig<'number', 'FixedPointRepresentation'>,
> extends MySqlColumnBuilderWithAutoIncrement<T, MySqlDecimalConfig> {
  static readonly [entityKind]: string = 'MySqlDecimalBuilder'

  constructor(name: T['name'], precision?: number, scale?: number) {
    super(name, 'number', 'FixedPointRepresentation')
    this.config.precision = precision
    this.config.scale = scale
  }

  /** @internal */
  build<TTableName extends string>(
    table: AnyMySqlTable<{ name: TTableName }>,
  ): FixedPointRepresentation<MakeColumnConfig<T, TTableName>> {
    return new FixedPointRepresentation<MakeColumnConfig<T, TTableName>>(
      table,
      this.config as ColumnBuilderRuntimeConfig<any, any>,
    )
  }
}

export class FixedPointRepresentation<T extends ColumnBaseConfig<'number', 'FixedPointRepresentation'>> extends MySqlColumnWithAutoIncrement<T, MySqlDecimalConfig> {
  static readonly [entityKind]: string = 'FixedPointRepresentation'

  readonly precision: number | undefined = this.config.precision
  readonly scale: number | undefined = this.config.scale

  getSQLType(): string {
    return `float${this.scale !== undefined ? `(${this.scale}${this.precision ? `,${this.precision})` : ')'}` : ''}`
  }

  mapFromDriverValue(value: number): number {
    return Number(value.toFixed(this.precision))
  }

  mapToDriverValue(value: number): number {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion
    return Number.parseFloat(value as unknown as string)
  }
}

export function decimal<TName extends string>(
  name: TName,
  config: MySqlDecimalConfig = {},
): FixedPointRepresentationInitial<TName> {
  return new FixedPointRepresentationBuilder(name, config.precision, config.scale)
}
