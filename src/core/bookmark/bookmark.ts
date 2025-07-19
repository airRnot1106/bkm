import { z } from "zod";

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
