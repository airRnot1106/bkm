import { Result } from '@praha/byethrow';
import fc from 'fast-check';
import {
  Bookmark,
  BookmarkParseError,
  type BookmarkTag,
  type BookmarkTitle,
  type BookmarkUrl,
  fakeValidBookmarkGenerator,
  type IBookmarkRepository,
} from '../core/bookmark';
import { UnexpectedError } from '../utils';

export const createAddBookmarkUseCase =
  (bookmarkRepository: IBookmarkRepository) =>
  ({
    title,
    url,
    tags,
  }: {
    title: BookmarkTitle;
    url: BookmarkUrl;
    tags: BookmarkTag[];
  }) =>
    Result.pipe(
      Result.succeed({
        title,
        url,
        tags,
      }),
      Result.bind('id', () => Result.succeed(crypto.randomUUID())),
      Result.bind('createdAt', () => Result.succeed(new Date())),
      Result.bind('updatedAt', () => Result.succeed(new Date())),
      Result.andThen(Result.parse(Bookmark)),
      Result.andThen(bookmarkRepository.insert),
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

  describe('createAddBookmarkUseCase', () => {
    test('should successfully add a bookmark', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkGenerator.map(Bookmark.parse),
          async (bookmark) => {
            const mockRepository = {
              insert: vi.fn().mockReturnValue(Result.succeed(undefined)),
              update: vi.fn(),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi.fn(),
            };
            const addBookmark = createAddBookmarkUseCase(mockRepository);

            const result = await addBookmark(bookmark);

            expect(Result.isSuccess(result)).toBe(true);
            expect(mockRepository.insert).toHaveBeenCalledOnce();
          },
        ),
      );
    });

    test('should handle repository insert failure', () => {
      fc.assert(
        fc.asyncProperty(
          fakeValidBookmarkGenerator.map(Bookmark.parse),
          async (bookmark) => {
            const mockRepository = {
              insert: vi
                .fn()
                .mockReturnValue(Result.fail(new Error('Repository error'))),
              update: vi.fn(),
              delete: vi.fn(),
              findAll: vi.fn(),
              findById: vi.fn(),
            };
            const addBookmark = createAddBookmarkUseCase(mockRepository);

            const result = await addBookmark(bookmark);

            expect(Result.isFailure(result)).toBe(true);
            expect(mockRepository.insert).toHaveBeenCalledOnce();
          },
        ),
      );
    });
  });
}
