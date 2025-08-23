import { Result } from '@praha/byethrow';
import type { BookmarkId, IBookmarkRepository } from '../core/bookmark';
import { fakeBookmarkId } from '../core/bookmark';

export const createRemoveBookmarkUseCase =
  (bookmarkRepository: IBookmarkRepository) =>
  ({ id }: { id: BookmarkId }) =>
    Result.pipe(Result.succeed(id), Result.andThen(bookmarkRepository.delete));

if (import.meta.vitest) {
  const { test, expect, vi } = import.meta.vitest;
  const fc = await import('fast-check');

  test('createRemoveBookmarkUseCase should call delete with bookmark id', () => {
    fc.assert(
      fc.asyncProperty(fakeBookmarkId, async (id) => {
        const mockBookmarkRepository = {
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn().mockReturnValue(Result.succeed(undefined)),
          findAll: vi.fn(),
          findById: vi.fn(),
        };

        const removeBookmark = createRemoveBookmarkUseCase(
          mockBookmarkRepository,
        );

        const result = await removeBookmark({ id });

        expect(mockBookmarkRepository.delete).toHaveBeenCalledWith(id);
        expect(Result.isSuccess(result)).toBe(true);
      }),
    );
  });

  test('createRemoveBookmarkUseCase should handle delete error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmarkId,
        fc.string().map((msg) => new Error(msg)),
        async (id, deleteError) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn().mockReturnValue(Result.fail(deleteError)),
            findAll: vi.fn(),
            findById: vi.fn(),
          };

          const removeBookmark = createRemoveBookmarkUseCase(
            mockBookmarkRepository,
          );

          const result = await removeBookmark({ id });

          expect(mockBookmarkRepository.delete).toHaveBeenCalledWith(id);
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createRemoveBookmarkUseCase should only call delete method', () => {
    fc.assert(
      fc.asyncProperty(fakeBookmarkId, async (id) => {
        const mockBookmarkRepository = {
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn().mockReturnValue(Result.succeed(undefined)),
          findAll: vi.fn(),
          findById: vi.fn(),
        };

        const removeBookmark = createRemoveBookmarkUseCase(
          mockBookmarkRepository,
        );

        await removeBookmark({ id });

        expect(mockBookmarkRepository.delete).toHaveBeenCalledTimes(1);
        expect(mockBookmarkRepository.insert).not.toHaveBeenCalled();
        expect(mockBookmarkRepository.update).not.toHaveBeenCalled();
        expect(mockBookmarkRepository.findAll).not.toHaveBeenCalled();
        expect(mockBookmarkRepository.findById).not.toHaveBeenCalled();
      }),
    );
  });
}
