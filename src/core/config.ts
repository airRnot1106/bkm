import type { Result } from '@praha/byethrow';
import fc from 'fast-check';
import z from 'zod';

/* FuzzyFinderCommand */

declare const FuzzyFinderCommandBrand: unique symbol;

export const FuzzyFinderCommand = z
  .string()
  .min(1)
  .brand<typeof FuzzyFinderCommandBrand>();

export type FuzzyFinderCommand = z.infer<typeof FuzzyFinderCommand>;

/* FuzzyFinderArgs */

declare const FuzzyFinderArgsBrand: unique symbol;

export const FuzzyFinderArgs = z
  .array(z.string())
  .brand<typeof FuzzyFinderArgsBrand>();

export type FuzzyFinderArgs = z.infer<typeof FuzzyFinderArgs>;

/* FuzzyFinder */

declare const FuzzyFinderBrand: unique symbol;

export const FuzzyFinder = z
  .object({
    command: FuzzyFinderCommand,
    args: FuzzyFinderArgs,
  })
  .brand<typeof FuzzyFinderBrand>();

export type FuzzyFinder = z.infer<typeof FuzzyFinder>;

/* Config */

declare const ConfigBrand: unique symbol;

export const Config = z
  .object({
    fuzzyFinder: FuzzyFinder,
  })
  .brand<typeof ConfigBrand>();

export type Config = z.infer<typeof Config>;

/* IConfigRepository */

export interface IConfigRepository {
  save(config: Config): Result.ResultAsync<void, Error>;
  load(): Result.ResultAsync<Config, Error>;
}

/* Fake Data Generators */

const fakeRawFuzzyFinderCommand = fc.string({
  minLength: 1,
});
export const fakeFuzzyFinderCommand = fakeRawFuzzyFinderCommand.map(
  FuzzyFinderCommand.parse,
);

const fakeRawFuzzyFinderArgs = fc.array(fc.string());
export const fakeFuzzyFinderArgs = fakeRawFuzzyFinderArgs.map(
  FuzzyFinderArgs.parse,
);

const fakeRawFuzzyFinder = fc.record({
  command: fakeRawFuzzyFinderCommand,
  args: fakeRawFuzzyFinderArgs,
});
export const fakeFuzzyFinder = fakeRawFuzzyFinder.map(FuzzyFinder.parse);

const fakeRawConfig = fc.record({
  fuzzyFinder: fakeRawFuzzyFinder,
});
export const fakeConfig = fakeRawConfig.map(Config.parse);

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test('FuzzyFinderCommand should validate string values', () => {
    fc.assert(
      fc.property(fakeRawFuzzyFinderCommand, (str) => {
        const result = FuzzyFinderCommand.safeParse(str);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('FuzzyFinderArgs should validate array of strings', () => {
    fc.assert(
      fc.property(fakeRawFuzzyFinderArgs, (arr) => {
        const result = FuzzyFinderArgs.safeParse(arr);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('FuzzyFinder should validate object with command and args', () => {
    fc.assert(
      fc.property(fakeRawFuzzyFinder, (fuzzyFinder) => {
        const result = FuzzyFinder.safeParse(fuzzyFinder);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('Config should validate object with fuzzyFinder', () => {
    fc.assert(
      fc.property(fakeRawConfig, (config) => {
        const result = Config.safeParse(config);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('FuzzyFinderCommand should reject non-string values', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.boolean(), fc.object({})),
        (value) => {
          const result = FuzzyFinderCommand.safeParse(value);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('FuzzyFinderArgs should reject non-array values', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.integer(), fc.boolean()),
        (value) => {
          const result = FuzzyFinderArgs.safeParse(value);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('FuzzyFinder should reject objects missing required fields', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({ command: fc.string() }),
          fc.record({ args: fc.array(fc.string()) }),
          fc.record({}),
        ),
        (value) => {
          const result = FuzzyFinder.safeParse(value);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('Config should reject objects missing fuzzyFinder', () => {
    fc.assert(
      fc.property(fc.record({}), (value) => {
        const result = Config.safeParse(value);
        expect(result.success).toBe(false);
      }),
    );
  });
}
