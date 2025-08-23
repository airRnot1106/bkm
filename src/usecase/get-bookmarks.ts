import { Result } from '@praha/byethrow';
import type { IBookmarkRepository } from '../core/bookmark';
import { fakeBookmark } from '../core/bookmark';

export const createGetBookmarksUseCase =
  (bookmarkRepository: IBookmarkRepository) => () =>
    bookmarkRepository.findAll();

if (import.meta.vitest) {
  const { test, expect, vi } = import.meta.vitest;
  const fc = await import('fast-check');

  test('createGetBookmarksUseCase should call findAll and return bookmarks', () => {
    fc.assert(
      fc.asyncProperty(fc.array(fakeBookmark), async (bookmarks) => {
        const mockBookmarkRepository = {
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          findAll: vi.fn().mockReturnValue(Result.succeed(bookmarks)),
        };

        const getBookmarks = createGetBookmarksUseCase(mockBookmarkRepository);

        const result = await getBookmarks();

        expect(mockBookmarkRepository.findAll).toHaveBeenCalledWith();
        expect(Result.isSuccess(result)).toBe(true);
        if (Result.isSuccess(result)) {
          expect(result.value).toEqual(bookmarks);
        }
      }),
    );
  });

  test('createGetBookmarksUseCase should handle findAll error', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string().map((msg) => new Error(msg)),
        async (findAllError) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn().mockReturnValue(Result.fail(findAllError)),
          };

          const getBookmarks = createGetBookmarksUseCase(
            mockBookmarkRepository,
          );

          const result = await getBookmarks();

          expect(mockBookmarkRepository.findAll).toHaveBeenCalledWith();
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createGetBookmarksUseCase should only call findAll method', () => {
    fc.assert(
      fc.asyncProperty(fc.array(fakeBookmark), async (bookmarks) => {
        const mockBookmarkRepository = {
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          findAll: vi.fn().mockReturnValue(Result.succeed(bookmarks)),
        };

        const getBookmarks = createGetBookmarksUseCase(mockBookmarkRepository);

        await getBookmarks();

        expect(mockBookmarkRepository.findAll).toHaveBeenCalledTimes(1);
        expect(mockBookmarkRepository.insert).not.toHaveBeenCalled();
        expect(mockBookmarkRepository.update).not.toHaveBeenCalled();
        expect(mockBookmarkRepository.delete).not.toHaveBeenCalled();
      }),
    );
  });
}
