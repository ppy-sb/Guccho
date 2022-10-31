/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod'
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

export type VisibilityScope = 'nobody' | 'friends' | 'public';

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

export const schemaForType =
  <T>() =>
  <S extends z.ZodType<T, any, any>>(arg: S) => {
    return arg
  }

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;
