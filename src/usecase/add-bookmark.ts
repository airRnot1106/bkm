import { Result } from "@praha/byethrow";
import {
  Bookmark,
  BookmarkId,
  BookmarkTag,
  BookmarkTitle,
  BookmarkUrl,
  IBookmarkRepository,
} from "../core/bookmark/bookmark.ts";
import z from "zod";

export const createAddBookmarkUseCase = (
  { bookmarkRepository }: { bookmarkRepository: IBookmarkRepository },
) =>
({ title, url, tags = [] }: {
  title: string;
  url: string;
  tags?: string[];
}) =>
  Result.pipe(
    Result.do(),
    Result.bind("id", () => Result.parse(BookmarkId, crypto.randomUUID())),
    Result.bind("title", () => Result.parse(BookmarkTitle, title)),
    Result.bind("url", () => Result.parse(BookmarkUrl, url)),
    Result.bind("tags", () => Result.parse(z.array(BookmarkTag), tags)),
    Result.bind("bookmark", ({ id, title, url, tags }) =>
      Result.parse(Bookmark, { id, title, url, tags })),
    Result.andThen(({ bookmark }) =>
      bookmarkRepository.save(bookmark)
    ),
  );
