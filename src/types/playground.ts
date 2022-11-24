// import { SWITCH, CASE, MATCHER, DEFAULT, TRY, IF, STRICTEQUAL, EXTENDS, INCLUDES } from './internal-utils'

// type SwitchRes<T> = SWITCH.STRICTEQUAL<SWITCH<T,
//   | [2, 'number[2]']
//   | ((index: number) => 'matched number')
//   | CASE<number, 'any number'>
//   | MATCHER<(i: any, str: string) => 'matched any string', 1>
//   | CASE<'2', 'string[2]'>
//   | DEFAULT<never>>
// >

// type result = IF<STRICTEQUAL<1, 1> | EXTENDS<number, 3>, {
//   true: () => true,
//   else: () => false
// }>
