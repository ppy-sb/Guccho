/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Enumerate } from './internal-utils'

export type Mode = 'osu' | 'taiko' | 'fruits' | 'mania';
export type Ruleset = 'standard' | 'relax' | 'autopilot';

export type Relationship = 'friend' | 'block'
export type MutualRelationship = 'mutual-friend' | 'mutual-block'

export type StandardAvailable = Mode;
export type RelaxAvailable = 'osu' | 'taiko' | 'fruits';
export type AutopilotAvailable = 'osu';

export type AutoAvailable<_Ruleset extends Ruleset> =
  _Ruleset extends StandardAvailable
    ? StandardAvailable
    : _Ruleset extends RelaxAvailable
    ? RelaxAvailable
    : _Ruleset extends AutopilotAvailable
    ? AutopilotAvailable
    : never;

export type ScoreRankingSystem = 'rankedScore' | 'totalScore';
export type PPRankingSystem = 'ppv2' | 'ppv1';
export type RankingSystem = PPRankingSystem | ScoreRankingSystem;

export type Scope = 'self' | 'friends' | 'public';

// utils
export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
export type Awaitable<T> = T | Promise<T>;

export type APIfy<
  T extends Record<string, any>,
  Keys extends keyof T | '_noProp' = '_noProp'
> = {
  [K in keyof T as K extends Keys
    ? `fetch${Capitalize<string & K>}`
    : Keys extends '_noProp'
    ? K | `fetch${Capitalize<string & K>}`
    : K]: K extends Keys ? () => Awaitable<T[Uncapitalize<string & K>]> : T[K];
};
export type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export type UserpageShowType = 'tab' | 'dropdown' | 'hidden'
export type ServerConfig<AvailableRankingSystem extends RankingSystem> = Record<AvailableRankingSystem, {
  userpage: {
    show: UserpageShowType
  },
  name: string
}>