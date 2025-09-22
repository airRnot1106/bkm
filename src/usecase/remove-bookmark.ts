import { Result } from '@praha/byethrow';
import fc from 'fast-check';
import {
  BookmarkId,
  fakeValidBookmarkIdGenerator,
  type IBookmarkRepository,
} from '../core/bookmark';

export const createRemoveBookmarkUseCase =
  (bookmarkRepository: IBookmarkRepository) =>
  ({ id }: { id: BookmarkId }) =>
    Result.pipe(Result.succeed(id), Result.andThen(bookmarkRepository.delete));

if (import.meta.vitest) {
  const { test, expect, describe, vi } = import.meta.vitest;

  describe('createRemoveBookmarkUseCase', () => {
    test('should successfully remove a bookmark', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkIdGenerator.map(BookmarkId.parse),
          async (bookmarkId) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn(),
              delete: vi.fn().mockReturnValue(Result.succeed(undefined)),
              findAll: vi.fn(),
              findById: vi.fn(),
            };

            const removeBookmark = createRemoveBookmarkUseCase(mockRepository);
            const result = await removeBookmark({ id: bookmarkId });

            expect(Result.isSuccess(result)).toBe(true);
            expect(mockRepository.delete).toHaveBeenCalledOnce();
            expect(mockRepository.delete).toHaveBeenCalledWith(bookmarkId);
          },
        ),
      );
    });

    test('should handle repository delete failure', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkIdGenerator.map(BookmarkId.parse),
          async (bookmarkId) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn(),
              delete: vi
                .fn()
                .mockReturnValue(Result.fail(new Error('Repository error'))),
              findAll: vi.fn(),
              findById: vi.fn(),
            };

            const removeBookmark = createRemoveBookmarkUseCase(mockRepository);
            const result = await removeBookmark({ id: bookmarkId });

            expect(Result.isFailure(result)).toBe(true);
            expect(mockRepository.delete).toHaveBeenCalledOnce();
            expect(mockRepository.delete).toHaveBeenCalledWith(bookmarkId);
          },
        ),
      );
    });
  });
}
