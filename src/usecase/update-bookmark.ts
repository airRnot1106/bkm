import { Result } from '@praha/byethrow';
import {
  Bookmark,
  type BookmarkId,
  type BookmarkTag,
  type BookmarkTitle,
  type BookmarkUrl,
  fakeBookmark,
  fakeBookmarkId,
  fakeBookmarkTag,
  fakeBookmarkTitle,
  fakeBookmarkUrl,
  type IBookmarkRepository,
} from '../core/bookmark';

export const createUpdateBookmarkUseCase =
  (bookmarkRepository: IBookmarkRepository) =>
  ({
    id,
    title,
    url,
    tags,
  }: {
    id: BookmarkId;
    title?: BookmarkTitle;
    url?: BookmarkUrl;
    tags?: BookmarkTag[];
  }) =>
    Result.pipe(
      Result.succeed({
        id,
        title,
        url,
        tags,
      }),
      Result.bind('target', ({ id }) => bookmarkRepository.findById(id)),
      Result.map(({ target, title, url, tags }) => ({
        ...target,
        title: title ?? target.title,
        url: url ?? target.url,
        tags: tags ?? target.tags,
        updatedAt: new Date(),
      })),
      Result.andThen(Result.parse(Bookmark)),
      Result.andThen(bookmarkRepository.update),
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

  test('createUpdateBookmarkUseCase should call findById and update with updated bookmark', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmark,
        fakeBookmarkTitle,
        fakeBookmarkUrl,
        fc.array(fakeBookmarkTag),
        async (existingBookmark, newTitle, newUrl, newTags) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn().mockReturnValue(Result.succeed(undefined)),
            delete: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn().mockReturnValue(Result.succeed(existingBookmark)),
          };

          const updateBookmark = createUpdateBookmarkUseCase(
            mockBookmarkRepository,
          );

          const result = await updateBookmark({
            id: existingBookmark.id,
            title: newTitle,
            url: newUrl,
            tags: newTags,
          });

          expect(mockBookmarkRepository.findById).toHaveBeenCalledWith(
            existingBookmark.id,
          );
          expect(mockBookmarkRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
              id: existingBookmark.id,
              title: newTitle,
              url: newUrl,
              tags: newTags,
              createdAt: existingBookmark.createdAt,
              updatedAt: expect.any(Date),
            }),
          );
          expect(Result.isSuccess(result)).toBe(true);
        },
      ),
    );
  });

  test('createUpdateBookmarkUseCase should handle partial updates', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmark,
        fakeBookmarkTitle,
        async (existingBookmark, newTitle) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn().mockReturnValue(Result.succeed(undefined)),
            delete: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn().mockReturnValue(Result.succeed(existingBookmark)),
          };

          const updateBookmark = createUpdateBookmarkUseCase(
            mockBookmarkRepository,
          );

          const result = await updateBookmark({
            id: existingBookmark.id,
            title: newTitle,
          });

          expect(mockBookmarkRepository.findById).toHaveBeenCalledWith(
            existingBookmark.id,
          );
          expect(mockBookmarkRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
              id: existingBookmark.id,
              title: newTitle,
              url: existingBookmark.url,
              tags: existingBookmark.tags,
              createdAt: existingBookmark.createdAt,
              updatedAt: expect.any(Date),
            }),
          );
          expect(Result.isSuccess(result)).toBe(true);
        },
      ),
    );
  });

  test('createUpdateBookmarkUseCase should handle findById error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmarkId,
        fc.string().map((msg) => new Error(msg)),
        async (id, findByIdError) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn().mockReturnValue(Result.fail(findByIdError)),
          };

          const updateBookmark = createUpdateBookmarkUseCase(
            mockBookmarkRepository,
          );

          const result = await updateBookmark({ id });

          expect(mockBookmarkRepository.findById).toHaveBeenCalledWith(id);
          expect(mockBookmarkRepository.update).not.toHaveBeenCalled();
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createUpdateBookmarkUseCase should handle update error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmark,
        fakeBookmarkTitle,
        fc.string().map((msg) => new Error(msg)),
        async (existingBookmark, newTitle, updateError) => {
          const mockBookmarkRepository = {
            insert: vi.fn(),
            update: vi.fn().mockReturnValue(Result.fail(updateError)),
            delete: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn().mockReturnValue(Result.succeed(existingBookmark)),
          };

          const updateBookmark = createUpdateBookmarkUseCase(
            mockBookmarkRepository,
          );

          const result = await updateBookmark({
            id: existingBookmark.id,
            title: newTitle,
          });

          expect(mockBookmarkRepository.findById).toHaveBeenCalledWith(
            existingBookmark.id,
          );
          expect(mockBookmarkRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
              id: existingBookmark.id,
              title: newTitle,
              updatedAt: expect.any(Date),
            }),
          );
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createUpdateBookmarkUseCase should update updatedAt timestamp', () => {
    fc.assert(
      fc.asyncProperty(fakeBookmark, async (existingBookmark) => {
        const mockBookmarkRepository = {
          insert: vi.fn(),
          update: vi.fn().mockReturnValue(Result.succeed(undefined)),
          delete: vi.fn(),
          findAll: vi.fn(),
          findById: vi.fn().mockReturnValue(Result.succeed(existingBookmark)),
        };

        const updateBookmark = createUpdateBookmarkUseCase(
          mockBookmarkRepository,
        );

        await updateBookmark({ id: existingBookmark.id });

        expect(mockBookmarkRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        );

        const updatedBookmark =
          mockBookmarkRepository.update.mock.calls[0]?.[0];
        expect(updatedBookmark.updatedAt).not.toEqual(
          existingBookmark.updatedAt,
        );
      }),
    );
  });
}
