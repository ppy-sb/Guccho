export type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type THEN<T, F> = {
  true: T,
  else: F
}
type CATCH<_C, _R> = {
  catch: _C,
  then: _R
}
export type CASE<T, F> = [T, F]
export type MATCHER<MF extends (i: any) => any> = [Parameters<MF>[number], ReturnType<MF>]
export type DEFAULT<F> = [any, F]
export type Extends<CmpLhs, CmpRhs> = () => CmpLhs extends CmpRhs ? true : false
export type IF<_Cmp extends Extends<any, any>, R extends THEN<unknown, unknown>> = ReturnType<_Cmp> extends true ? R['true'] : R['else']
export type SWITCH<Input, Cases extends CASE<any, any> | MATCHER<any>> =
  {
    [CASE in Cases as Input extends CASE[0] ? CASE[0] extends Input ? 'equals' : 'extends' : 'isNot']: CASE[1]
  } & {
    [CASE in Cases as CASE[0] extends Input ? 'includes' : never]: CASE[1]
  }
export type MATCHES<T extends {extends?: any}> = T['extends']
export type INCLUDES<T extends {includes?: any}> = T['includes']
export type EQUALS<T extends {equals?: any}> = T['equals']
export type NOT<T extends {isNot?: any}> = T['isNot']
export type TRY<T, C extends CATCH<unknown, any>> = T extends C['catch'] ? C['then'] : T

// type res1 = IF<Extends<Array<number>, Array<1>>, {
//   true: 'array[1]',
//   else: IF<Extends<number, number>, {
//     true: 1,
//     else: never
//   }>
// }>

// const cpStr = (str: string) => str

// type SwitchRes<T>= SWITCH<T,
//   | MATCHER<typeof cpStr>
//   | CASE<2, 'number[2]'>
//   | CASE<number, 2>
//   | CASE<string, 'any string'>
//   | CASE<'2', 'string[2]'>
//   | DEFAULT<never>
// >

// type T2 = SwitchRes<'2'>

// type res2 = TRY<
//   switchRes['equals']
//   , {
//     catch: 'string',
//     then: string
//   }>

// type result = IF<Extends<res1, res2>, {
//   true: () => {},
//   else: () => {}
// }>

// TSScript lol
