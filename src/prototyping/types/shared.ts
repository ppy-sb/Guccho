/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod'
export type Mode = 'osu' | 'taiko' | 'fruits' | 'mania';
export type Ruleset = 'standard' | 'relax' | 'autopilot';

export type StandardAvailable = Mode;
export type RelaxAvailable = 'osu' | 'taiko' | 'fruits';
export type AutopilotAvailable = 'osu';

export type ScoreRankingSystem = 'rankedScores' | 'totalScores';
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
    : K
    ]: K extends Keys
    ? () => Awaitable<T[Uncapitalize<string & K>]>
    : T[K];
  };

export const schemaForType = <T>() => <S extends z.ZodType<T, any, any>>(arg: S) => {
  return arg
}

// export type SchemaFromType<T> = ReturnType<ReturnType<typeof schemaForType<T>>>
