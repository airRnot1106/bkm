import { Result } from '@praha/byethrow';
import fc from 'fast-check';
import type { IBookmarkRepository } from '../core/bookmark';
import { fakeValidBookmarkGenerator } from '../core/bookmark';
import { UnexpectedError } from '../utils';

export const createGetBookmarksUseCase =
  (bookmarkRepository: IBookmarkRepository) => () =>
    Result.pipe(
      Result.do(),
      Result.andThen(bookmarkRepository.findAll),
      Result.mapError((error) => new UnexpectedError({ cause: error })),
    );

if (import.meta.vitest) {
  const { test, expect, describe, vi } = import.meta.vitest;

  describe('createGetBookmarksUseCase', () => {
    test('should successfully get all bookmarks', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(fakeValidBookmarkGenerator),
          async (bookmarks) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              findAll: vi.fn().mockReturnValue(Result.succeed(bookmarks)),
              findById: vi.fn(),
            };

            const getBookmarks = createGetBookmarksUseCase(mockRepository);
            const result = await getBookmarks();

            expect(Result.isSuccess(result)).toBe(true);
            expect(mockRepository.findAll).toHaveBeenCalledOnce();
            if (Result.isSuccess(result)) {
              expect(result.value).toEqual(bookmarks);
            }
          },
        ),
      );
    });

    test('should handle repository findAll failure', async () => {
      const mockRepository = {
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findAll: vi
          .fn()
          .mockReturnValue(Result.fail(new Error('Repository error'))),
        findById: vi.fn(),
      };

      const getBookmarks = createGetBookmarksUseCase(mockRepository);
      const result = await getBookmarks();

      expect(Result.isFailure(result)).toBe(true);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });
}
