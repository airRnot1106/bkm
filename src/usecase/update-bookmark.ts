import { Result } from '@praha/byethrow';
import fc from 'fast-check';
import {
  Bookmark,
  BookmarkId,
  BookmarkParseError,
  BookmarkTag,
  BookmarkTitle,
  BookmarkUrl,
  fakeValidBookmarkGenerator,
  fakeValidBookmarkIdGenerator,
  fakeValidBookmarkTagGenerator,
  fakeValidBookmarkTitleGenerator,
  fakeValidBookmarkUrlGenerator,
  type IBookmarkRepository,
} from '../core/bookmark';
import { UnexpectedError } from '../utils';

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
          return new UnexpectedError({ cause: error });
        }
        return new UnexpectedError({
          cause: new BookmarkParseError({ issues: error }),
        });
      }),
    );

if (import.meta.vitest) {
  const { test, expect, describe, vi } = import.meta.vitest;

  describe('createUpdateBookmarkUseCase', () => {
    test('should successfully update a bookmark with all fields', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkGenerator.map(Bookmark.parse),
          fakeValidBookmarkTitleGenerator.map(BookmarkTitle.parse),
          fakeValidBookmarkUrlGenerator.map(BookmarkUrl.parse),
          fc.array(fakeValidBookmarkTagGenerator.map(BookmarkTag.parse)),
          async (existingBookmark, newTitle, newUrl, newTags) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn().mockReturnValue(Result.succeed(undefined)),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi
                .fn()
                .mockReturnValue(Result.succeed(existingBookmark)),
            };

            const updateBookmark = createUpdateBookmarkUseCase(mockRepository);
            const result = await updateBookmark({
              id: existingBookmark.id,
              title: newTitle,
              url: newUrl,
              tags: newTags,
            });

            expect(Result.isSuccess(result)).toBe(true);
            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.findById).toHaveBeenCalledWith(
              existingBookmark.id,
            );
            expect(mockRepository.update).toHaveBeenCalledOnce();
          },
        ),
      );
    });

    test('should successfully update a bookmark with partial fields', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkGenerator.map(Bookmark.parse),
          fakeValidBookmarkTitleGenerator.map(BookmarkTitle.parse),
          async (existingBookmark, newTitle) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn().mockReturnValue(Result.succeed(undefined)),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi
                .fn()
                .mockReturnValue(Result.succeed(existingBookmark)),
            };

            const updateBookmark = createUpdateBookmarkUseCase(mockRepository);
            const result = await updateBookmark({
              id: existingBookmark.id,
              title: newTitle,
            });

            expect(Result.isSuccess(result)).toBe(true);
            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.update).toHaveBeenCalledOnce();
          },
        ),
      );
    });

    test('should handle repository findById failure', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkIdGenerator.map(BookmarkId.parse),
          fakeValidBookmarkTitleGenerator.map(BookmarkTitle.parse),
          async (id, newTitle) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi
                .fn()
                .mockReturnValue(Result.fail(new Error('Bookmark not found'))),
            };

            const updateBookmark = createUpdateBookmarkUseCase(mockRepository);
            const result = await updateBookmark({
              id,
              title: newTitle,
            });

            expect(Result.isFailure(result)).toBe(true);
            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.update).not.toHaveBeenCalled();
          },
        ),
      );
    });

    test('should handle repository update failure', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkGenerator.map(Bookmark.parse),
          fakeValidBookmarkTitleGenerator.map(BookmarkTitle.parse),
          async (existingBookmark, newTitle) => {
            const mockRepository = {
              insert: vi.fn(),
              update: vi
                .fn()
                .mockReturnValue(Result.fail(new Error('Update failed'))),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi
                .fn()
                .mockReturnValue(Result.succeed(existingBookmark)),
            };

            const updateBookmark = createUpdateBookmarkUseCase(mockRepository);
            const result = await updateBookmark({
              id: existingBookmark.id,
              title: newTitle,
            });

            expect(Result.isFailure(result)).toBe(true);
            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.update).toHaveBeenCalledOnce();
          },
        ),
      );
    });
  });
}
