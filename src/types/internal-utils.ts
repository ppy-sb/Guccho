export type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type THEN<T = true, F = false> = {
  true: T
  else: F
}
type CATCH<C = unknown, T = unknown> = {
  catch: C
  then?: T
}
export type CASE<T, F> = [T, F]
export type MATCHER<MF extends (i: any) => any> = [
  Parameters<MF>[number],
  ReturnType<MF>
]
export type DEFAULT<F> = [any, F]
export type EXTENDS<CmpLhs, CmpRhs> = () => CmpLhs extends CmpRhs ? true : false
export type INCLUDES<CmpLhs, CmpRhs> = EXTENDS<CmpRhs, CmpLhs>
// yes it's union operator bc we are checking against true so true | false is false!
export type EQUALS<CmpLhs, CmpRhs> = () => ReturnType<EXTENDS<CmpLhs, CmpRhs>> | ReturnType<INCLUDES<CmpLhs, CmpRhs>>

export type IF<
  _Cmp extends EXTENDS<any, any> | INCLUDES<any, any> | EQUALS<any, any>,
  R extends THEN<unknown, unknown> = THEN
> = ReturnType<_Cmp> extends true ? R['true'] : R['else']
export type SWITCH<Input, Cases extends CASE<any, any> | MATCHER<any>> = {
  [CASE in Cases as Input extends CASE[0]
    ? CASE[0] extends Input
      ? 'equals' | 'extends' | 'includes'
      : 'extends'
    : CASE[0] extends Input
    ? 'includes'
    : 'isNot']: CASE[1]
}
export type TRY<T, C extends CATCH<unknown, unknown>> = T extends C['catch']
  ? C['then']
  : T

// type res1 = IF<EXTENDS<Array<number>, Array<1>>, {
//   true: 'array[1]',
//   else: IF<EQUALS<2, 1>>
// }>

// type SwitchRes<T> = SWITCH<T,
//   | CASE<2, 'number[2]'>
//   | CASE<number, 'any number'>
//   | CASE<string, 'any string'>
//   | CASE<'2', 'string[2]'>
//   | DEFAULT<never>
// >

// type res2 = TRY<
//   SwitchRes<number>['equals']
//   , {
//     catch: 'any number',
//     then: 'caught[any number]'
//   }>

// type result = IF<Extends<res1, res2>, {
//   true: () => {},
//   else: () => {}
// }>

// TSScript lol
// from here is dump
// export type MATCHES<T extends { extends?: any }> = T['extends']
// export type INCLUDES<T extends { includes?: any }> = T['includes']
// export type EQUALS<T extends { equals?: any }> = T['equals']
// export type NOT<T extends { isNot?: any }> = T['isNot']
