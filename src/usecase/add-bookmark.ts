import { Result } from '@praha/byethrow';
import {
  Bookmark,
  type BookmarkTag,
  type BookmarkTitle,
  type BookmarkUrl,
  fakeBookmarkTag,
  fakeBookmarkTitle,
  fakeBookmarkUrl,
  type IBookmarkRepository,
} from '../core/bookmark';

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
          return error;
        }
        return new Error(error.map((e) => e.message).join(', '));
      }),
    );

if (import.meta.vitest) {
  const { test, expect, vi } = import.meta.vitest;
  const fc = await import('fast-check');

  test('createAddBookmarkUseCase should call insert with bookmark', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmarkTitle,
        fakeBookmarkUrl,
        fc.array(fakeBookmarkTag),
        async (title, url, tags) => {
          const mockBookmarkRepository = {
            insert: vi.fn().mockReturnValue(Result.succeed(undefined)),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn(),
          };

          const addBookmark = createAddBookmarkUseCase(mockBookmarkRepository);

          const result = await addBookmark({ title, url, tags });

          expect(mockBookmarkRepository.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              title,
              url,
              tags,
              id: expect.any(String),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            }),
          );
          expect(Result.isSuccess(result)).toBe(true);
        },
      ),
    );
  });

  test('createAddBookmarkUseCase should handle insert error', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmarkTitle,
        fakeBookmarkUrl,
        fc.array(fakeBookmarkTag),
        fc.string().map((msg) => new Error(msg)),
        async (title, url, tags, insertError) => {
          const mockBookmarkRepository = {
            insert: vi.fn().mockReturnValue(Result.fail(insertError)),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn(),
          };

          const addBookmark = createAddBookmarkUseCase(mockBookmarkRepository);

          const result = await addBookmark({ title, url, tags });

          expect(mockBookmarkRepository.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              title,
              url,
              tags,
              id: expect.any(String),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            }),
          );
          expect(Result.isFailure(result)).toBe(true);
        },
      ),
    );
  });

  test('createAddBookmarkUseCase should generate unique IDs and timestamps', () => {
    fc.assert(
      fc.asyncProperty(
        fakeBookmarkTitle,
        fakeBookmarkUrl,
        fc.array(fakeBookmarkTag),
        async (title, url, tags) => {
          const mockBookmarkRepository = {
            insert: vi.fn().mockReturnValue(Result.succeed(undefined)),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn(),
          };

          const addBookmark = createAddBookmarkUseCase(mockBookmarkRepository);

          await addBookmark({ title, url, tags });
          await addBookmark({ title, url, tags });

          expect(mockBookmarkRepository.insert).toHaveBeenCalledTimes(2);

          const firstCall = mockBookmarkRepository.insert.mock.calls[0]?.[0];
          const secondCall = mockBookmarkRepository.insert.mock.calls[1]?.[0];

          expect(firstCall.id).not.toBe(secondCall.id);
          expect(firstCall.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          );
          expect(secondCall.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          );
        },
      ),
    );
  });
}
