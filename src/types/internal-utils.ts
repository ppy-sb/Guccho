export type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type WithDefaultValue<
  T extends Record<string, any>,
  Default extends Record<any, any>
> = {
    [K in keyof T]: T[K] extends never | undefined ? Default[K] : T[K];
  };
type THEN<T = true, F = false> = {
  true: T;
  else: F;
};
type CATCH<C = unknown, T = unknown> = {
  catch: C;
  then?: T;
};
// if
export type EXTENDS<CmpLhs, CmpRhs> = CmpLhs extends CmpRhs ? true : false;
export type INCLUDES<CmpLhs, CmpRhs> = EXTENDS<CmpRhs, CmpLhs>;
export type STRICTEQUAL<CmpLhs, CmpRhs> =
  (EXTENDS<CmpLhs, CmpRhs> | INCLUDES<CmpLhs, CmpRhs>) extends true ? true : false;
export type IF<
  _Cmp extends boolean,
  R extends THEN<unknown, unknown> = THEN
> = true extends _Cmp ? R['true'] : R['else'];

// switch
export type CASE<T, F> = [T, F];
export type MATCHER<
  MF extends (...i: any[]) => any,
  ParameterIndex extends number = 0
> = [Parameters<MF>[ParameterIndex], ReturnType<MF>];
export type DEFAULT<F> = [any, F];
type SwitchCase<Input, MatchType> = Input extends MatchType
  ? MatchType extends Input
  ? 'eq' | 'extends' | 'includes'
  : 'extends'
  : MatchType extends Input
  ? 'includes'
  : 'isNot'

export type SWITCH<Input, Cases extends [any, any] | ((...i: any) => any)> = (i: Input) => {
  [Case in Cases as Case extends [any, any]
  ? SwitchCase<Input, Case[0]>
  : Case extends (...i: any) => any
  ? SwitchCase<Input, Parameters<Case>[0]>
  : never]: Case extends [any, any]
  ? Case[1]
  : Case extends (...i: any) => any
  ? ReturnType<Case>
  : never;
};
export namespace SWITCH {
  export type STRICTEQUAL<S extends SWITCH<any, any>> = () => ReturnType<S>['eq']
  export type EXTENDS<S extends SWITCH<any, any>> = () => ReturnType<S>['extends']
  export type INCLUDES<S extends SWITCH<any, any>> = () => ReturnType<S>['includes']
  export type INPUT<S extends SWITCH<any, any>> = Parameters<S>
}
export type TRY<T, C extends CATCH<unknown, unknown>> = T extends C['catch']
  ? C['then']
  : T;

// TSScript lol
// from here is dump
// export type MATCHES<T extends { extends?: any }> = T['extends']
// export type INCLUDES<T extends { includes?: any }> = T['includes']
// export type STRICTEQUAL<T extends { STRICTEQUAL?: any }> = T['STRICTEQUAL']
// export type NOT<T extends { isNot?: any }> = T['isNot']
