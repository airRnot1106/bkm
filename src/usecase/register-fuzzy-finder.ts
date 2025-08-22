import { Result } from '@praha/byethrow';
import {
  Config,
  type FuzzyFinder,
  fakeConfig,
  fakeFuzzyFinder,
  type IConfigRepository,
} from '../core/config';

export const createRegisterFuzzyFinderUseCase =
  (configRepository: IConfigRepository) => (fuzzyFinder: FuzzyFinder) =>
    Result.pipe(
      Result.do(),
      Result.andThen(configRepository.load),
      Result.map((config) => ({ ...config, fuzzyFinder })),
      Result.andThen(Result.parse(Config)),
      Result.andThen(configRepository.save),
      Result.mapError((error) => {
        if (error instanceof Error) {
          return error;
        }
        return new Error(error.map((e) => e.message).join(', '));
      }),
    );

if (import.meta.vitest) {
  const { test, expect, vi } = import.meta.vitest;
  const fc = await import('fast-check');

  test('createRegisterFuzzyFinderUseCase should call save with updated config', () => {
    fc.assert(
      fc.asyncProperty(
        fakeConfig,
        fakeFuzzyFinder,
        async (config, fuzzyFinder) => {
          const mockConfigRepository = {
            load: vi.fn().mockReturnValue(Result.succeed(config)),
            save: vi.fn().mockReturnValue(Result.succeed(undefined)),
          };

          const registerFuzzyFinder =
            createRegisterFuzzyFinderUseCase(mockConfigRepository);

          const result = await registerFuzzyFinder(fuzzyFinder);
          expect(mockConfigRepository.load).toHaveBeenCalled();
          expect(mockConfigRepository.save).toHaveBeenCalledWith({
            ...config,
            fuzzyFinder: fuzzyFinder,
          });
          expect(Result.isSuccess(result)).toBe(true);
        },
      ),
    );
  });

  test('createRegisterFuzzyFinderUseCase should handle load error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeFuzzyFinder,
        fc.string().map((msg) => new Error(msg)),
        async (fuzzyFinder, loadError) => {
          const mockConfigRepository = {
            load: vi.fn().mockReturnValue(Result.fail(loadError)),
            save: vi.fn(),
          };

          const registerFuzzyFinder =
            createRegisterFuzzyFinderUseCase(mockConfigRepository);

          const result = await registerFuzzyFinder(fuzzyFinder);
          expect(mockConfigRepository.load).toHaveBeenCalled();
          expect(mockConfigRepository.save).not.toHaveBeenCalled();
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createRegisterFuzzyFinderUseCase should handle save error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeConfig,
        fakeFuzzyFinder,
        fc.string().map((msg) => new Error(msg)),
        async (config, fuzzyFinder, saveError) => {
          const mockConfigRepository = {
            load: vi.fn().mockReturnValue(Result.succeed(config)),
            save: vi.fn().mockReturnValue(Result.fail(saveError)),
          };

          const registerFuzzyFinder =
            createRegisterFuzzyFinderUseCase(mockConfigRepository);

          const result = await registerFuzzyFinder(fuzzyFinder);
          expect(mockConfigRepository.load).toHaveBeenCalled();
          expect(mockConfigRepository.save).toHaveBeenCalledWith({
            ...config,
            fuzzyFinder: fuzzyFinder,
          });
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });
}
