import type { Result } from '@praha/byethrow';
import fc from 'fast-check';
import z from 'zod';

/* BookmarkId */

declare const BookmarkIdBrand: unique symbol;

export const BookmarkId = z.uuidv4().brand<typeof BookmarkIdBrand>();

export type BookmarkId = z.infer<typeof BookmarkId>;

/* BookmarkTitle */

declare const BookmarkTitleBrand: unique symbol;

const BOOKMARK_TITLE_MAX_LENGTH = 50;

export const BookmarkTitle = z
  .string()
  .trim()
  .min(1)
  .max(BOOKMARK_TITLE_MAX_LENGTH)
  .brand<typeof BookmarkTitleBrand>();

export type BookmarkTitle = z.infer<typeof BookmarkTitle>;

/* BookmarkUrl */

declare const BookmarkUrlBrand: unique symbol;

export const BookmarkUrl = z
  .url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
  })
  .brand<typeof BookmarkUrlBrand>();

export type BookmarkUrl = z.infer<typeof BookmarkUrl>;

/* BookmarkTag */

declare const BookmarkTagBrand: unique symbol;

const BOOKMARK_TAG_MAX_LENGTH = 50;

export const BookmarkTag = z
  .string()
  .trim()
  .min(1)
  .max(BOOKMARK_TAG_MAX_LENGTH)
  .brand<typeof BookmarkTagBrand>();

export type BookmarkTag = z.infer<typeof BookmarkTag>;

/* Bookmark */

export declare const BookmarkBrand: unique symbol;

export const Bookmark = z
  .object({
    id: BookmarkId,
    title: BookmarkTitle,
    url: BookmarkUrl,
    tags: z.array(BookmarkTag),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .brand<typeof BookmarkBrand>();

export type Bookmark = z.infer<typeof Bookmark>;

/* IBookmarkRepository */

export interface IBookmarkRepository {
  insert(bookmark: Bookmark): Result.ResultAsync<void, Error>;
  update(bookmark: Bookmark): Result.ResultAsync<void, Error>;
  delete(id: BookmarkId): Result.ResultAsync<void, Error>;
  findAll(): Result.ResultAsync<Bookmark[], Error>;
  findById(id: BookmarkId): Result.ResultAsync<Bookmark, Error>;
}

/* Fake Data Generators */

const fakeRawBookmarkId = fc.uuid({ version: 4 });
export const fakeBookmarkId = fakeRawBookmarkId.map(BookmarkId.parse);

const fakeRawBookmarkTitle = fc
  .string({
    minLength: 1,
  })
  .filter(
    (title) =>
      title.trim().length > 0 &&
      title.trim().length <= BOOKMARK_TITLE_MAX_LENGTH,
  );
export const fakeBookmarkTitle = fakeRawBookmarkTitle.map(BookmarkTitle.parse);

const fakeRawBookmarkUrl = fc.webUrl({
  withFragments: true,
  withQueryParameters: true,
});
export const fakeBookmarkUrl = fakeRawBookmarkUrl.map(BookmarkUrl.parse);

const fakeRawBookmarkTag = fc
  .string({
    minLength: 1,
  })
  .filter(
    (tag) =>
      tag.trim().length > 0 && tag.trim().length <= BOOKMARK_TAG_MAX_LENGTH,
  );
export const fakeBookmarkTag = fakeRawBookmarkTag.map(BookmarkTag.parse);

const fakeRawBookmark = fc
  .record({
    id: fakeRawBookmarkId,
    title: fakeRawBookmarkTitle,
    url: fakeRawBookmarkUrl,
    tags: fc.array(fakeRawBookmarkTag),
    createdAt: fc.date({ noInvalidDate: true }),
    updatedAt: fc.date({ noInvalidDate: true }),
  })
  .filter(({ createdAt, updatedAt }) => createdAt <= updatedAt);
export const fakeBookmark = fakeRawBookmark.map(Bookmark.parse);

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test('BookmarkId should validate UUID v4 values', () => {
    fc.assert(
      fc.property(fakeRawBookmarkId, (id) => {
        const result = BookmarkId.safeParse(id);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('BookmarkTitle should validate valid title strings', () => {
    fc.assert(
      fc.property(fakeRawBookmarkTitle, (title) => {
        const result = BookmarkTitle.safeParse(title);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('BookmarkUrl should validate valid URL strings', () => {
    fc.assert(
      fc.property(fakeRawBookmarkUrl, (url) => {
        const result = BookmarkUrl.safeParse(url);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('BookmarkTag should validate valid tag strings', () => {
    fc.assert(
      fc.property(fakeRawBookmarkTag, (tag) => {
        const result = BookmarkTag.safeParse(tag);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('Bookmark should validate complete bookmark objects', () => {
    fc.assert(
      fc.property(fakeRawBookmark, (bookmark) => {
        const result = Bookmark.safeParse(bookmark);
        expect(result.success).toBe(true);
      }),
    );
  });

  test('BookmarkId should reject invalid UUID formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc
            .string()
            .filter(
              (str) =>
                !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                  str,
                ),
            ),
          fc.integer(),
          fc.boolean(),
        ),
        (invalidId) => {
          const result = BookmarkId.safeParse(invalidId);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('BookmarkTitle should reject empty or too long titles', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc
            .string({ minLength: BOOKMARK_TITLE_MAX_LENGTH + 1 })
            .filter((str) => str.trim().length > BOOKMARK_TITLE_MAX_LENGTH),
          fc.integer(),
          fc.boolean(),
        ),
        (invalidTitle) => {
          const result = BookmarkTitle.safeParse(invalidTitle);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('BookmarkUrl should reject invalid URLs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string().filter((str) => !str.startsWith('http')),
          fc.constant('ftp://example.com'),
          fc.constant('not-a-url'),
          fc.integer(),
          fc.boolean(),
        ),
        (invalidUrl) => {
          const result = BookmarkUrl.safeParse(invalidUrl);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('BookmarkTag should reject empty or too long tags', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc
            .string({ minLength: BOOKMARK_TAG_MAX_LENGTH + 1 })
            .filter((str) => str.trim().length > BOOKMARK_TAG_MAX_LENGTH),
          fc.integer(),
          fc.boolean(),
        ),
        (invalidTag) => {
          const result = BookmarkTag.safeParse(invalidTag);
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  test('Bookmark should reject objects with missing required fields', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({ id: fakeRawBookmarkId }),
          fc.record({ title: fakeRawBookmarkTitle }),
          fc.record({ url: fakeRawBookmarkUrl }),
          fc.record({}),
        ),
        (invalidBookmark) => {
          const result = Bookmark.safeParse(invalidBookmark);
          expect(result.success).toBe(false);
        },
      ),
    );
  });
}
