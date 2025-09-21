import type { Result } from '@praha/byethrow';
import fc from 'fast-check';
import z from 'zod';

/* BookmarkId */

declare const BookmarkIdBrand: unique symbol;

export const BookmarkId = z.uuidv4().brand<typeof BookmarkIdBrand>();

export type BookmarkId = z.infer<typeof BookmarkId>;

export const fakeValidBookmarkIdGenerator = fc.uuid({ version: 4 });
export const fakeInvalidBookmarkIdGenerator = fc
  .string()
  .filter(
    (s) =>
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        s,
      ),
  );

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

export const fakeValidBookmarkTitleGenerator = fc
  .string()
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && s.length <= BOOKMARK_TITLE_MAX_LENGTH);
export const fakeInvalidBookmarkTitleGenerator = fc.string().filter((s) => {
  const trimmed = s.trim();
  return trimmed.length === 0 || trimmed.length > BOOKMARK_TITLE_MAX_LENGTH;
});

/* BookmarkUrl */

declare const BookmarkUrlBrand: unique symbol;

export const BookmarkUrl = z
  .url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
  })
  .brand<typeof BookmarkUrlBrand>();

export type BookmarkUrl = z.infer<typeof BookmarkUrl>;

const validUrlSchemes = ['http', 'https'];
export const fakeValidBookmarkUrlGenerator = fc.webUrl({
  validSchemes: validUrlSchemes,
  withFragments: true,
  withQueryParameters: true,
});
export const fakeInvalidBookmarkUrlGenerator = fc
  .array(
    fc.string({ minLength: 1 }).filter((s) => !validUrlSchemes.includes(s)),
    { minLength: 1 },
  )
  .chain((schemes) =>
    fc.webUrl({
      validSchemes: schemes,
      withFragments: true,
      withQueryParameters: true,
    }),
  );

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

export const fakeValidBookmarkTagGenerator = fc
  .string()
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && s.length <= BOOKMARK_TAG_MAX_LENGTH);
export const fakeInvalidBookmarkTagGenerator = fc.string().filter((s) => {
  const trimmed = s.trim();
  return trimmed.length === 0 || trimmed.length > BOOKMARK_TAG_MAX_LENGTH;
});

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

const fakeValidBookmarkRecord = {
  id: fakeValidBookmarkIdGenerator,
  title: fakeValidBookmarkTitleGenerator,
  url: fakeValidBookmarkUrlGenerator,
  tags: fc.array(fakeValidBookmarkTagGenerator),
  createdAt: fc.date({ noInvalidDate: true }),
  updatedAt: fc.date({ noInvalidDate: true }),
};
export const fakeValidBookmarkGenerator = fc.record(fakeValidBookmarkRecord);
export const fakeInvalidBookmarkGenerator = fc.oneof(
  // id
  fc.record({
    ...fakeValidBookmarkRecord,
    id: fakeInvalidBookmarkIdGenerator,
  }),
  // title
  fc.record({
    ...fakeValidBookmarkRecord,
    title: fakeInvalidBookmarkTitleGenerator,
  }),
  // url
  fc.record({
    ...fakeValidBookmarkRecord,
    url: fakeInvalidBookmarkUrlGenerator,
  }),
  // tags
  fc.record({
    ...fakeValidBookmarkRecord,
    tags: fc.array(fakeInvalidBookmarkTagGenerator, { minLength: 1 }),
  }),
  // createdAt
  fc.record({
    ...fakeValidBookmarkRecord,
    createdAt: fc.string().filter((s) => Number.isNaN(Date.parse(s))),
  }),
  // updatedAt
  fc.record({
    ...fakeValidBookmarkRecord,
    updatedAt: fc.string().filter((s) => Number.isNaN(Date.parse(s))),
  }),
);

/* IBookmarkRepository */

export interface IBookmarkRepository {
  insert(bookmark: Bookmark): Result.ResultAsync<void, Error>;
  update(bookmark: Bookmark): Result.ResultAsync<void, Error>;
  delete(id: BookmarkId): Result.ResultAsync<void, Error>;
  findAll(): Result.ResultAsync<Bookmark[], Error>;
  findById(id: BookmarkId): Result.ResultAsync<Bookmark, Error>;
}
