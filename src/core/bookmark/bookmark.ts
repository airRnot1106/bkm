import { z } from "zod";
import { Result } from "@praha/byethrow";

/* BookmarkId */

export declare const BookmarkIdBrand: unique symbol;

export const BookmarkId = z.uuidv4().brand<typeof BookmarkIdBrand>();

export type BookmarkId = z.infer<typeof BookmarkId>;

/* BookmarkTitle */

export declare const BookmarkTitleBrand: unique symbol;

export const BOOKMARK_TITLE_MAX_LENGTH = 50;

export const BookmarkTitle = z.string().trim().min(1).max(
  BOOKMARK_TITLE_MAX_LENGTH,
).brand<
  typeof BookmarkTitleBrand
>();

export type BookmarkTitle = z.infer<typeof BookmarkTitle>;

/* BookmarkUrl */

export declare const BookmarkUrlBrand: unique symbol;

export const BookmarkUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain,
}).brand<
  typeof BookmarkUrlBrand
>();

export type BookmarkUrl = z.infer<typeof BookmarkUrl>;

/* BookmarkTag */

export declare const BookmarkTagBrand: unique symbol;

export const BOOKMARK_TAG_MAX_LENGTH = 50;

export const BookmarkTag = z.string().trim().min(1).max(
  BOOKMARK_TAG_MAX_LENGTH,
).brand<
  typeof BookmarkTagBrand
>();

export type BookmarkTag = z.infer<typeof BookmarkTag>;

/* Bookmark */

export declare const BookmarkBrand: unique symbol;

export const Bookmark = z.object({
  id: BookmarkId,
  title: BookmarkTitle,
  url: BookmarkUrl,
  tags: z.array(BookmarkTag),
  createdAt: z.date(),
  updatedAt: z.date(),
}).brand<typeof BookmarkBrand>();

export type Bookmark = z.infer<typeof Bookmark>;

export interface IBookmarkRepository {
  save(bookmark: Bookmark): Result.ResultAsync<null, Error>;
  findAll(): Result.ResultAsync<Bookmark[], Error>;
  findById(id: BookmarkId): Result.ResultAsync<Bookmark | null, Error>;
}
