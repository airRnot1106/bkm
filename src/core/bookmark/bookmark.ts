import { z } from "zod";

export declare const BookmarkIdBrand: unique symbol;

export const BookmarkId = z.uuidv4().brand<typeof BookmarkIdBrand>();

export type BookmarkId = z.infer<typeof BookmarkId>;
