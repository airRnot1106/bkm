import { Result } from "@praha/byethrow";
import { IBookmarkDto } from "./bookmark-dto.ts";
import {
  Bookmark,
  BookmarkId,
  BookmarkTag,
  BookmarkTitle,
  BookmarkUrl,
} from "../../core/bookmark/bookmark.ts";
import z from "zod";

export const bookmarkMapper = {
  toDomain: (
    dto: IBookmarkDto,
  ): Result.Result<Bookmark, Error[]> => {
    const { id, title, url, tags, createdAt, updatedAt } = dto;
    return Result.pipe(
      Result.do(),
      Result.bind("id", () => Result.parse(BookmarkId, id)),
      Result.bind("title", () => Result.parse(BookmarkTitle, title)),
      Result.bind("url", () => Result.parse(BookmarkUrl, url)),
      Result.bind("tags", () => Result.parse(z.array(BookmarkTag), tags)),
      Result.bind(
        "createdAt",
        () => Result.parse(z.coerce.date(), new Date(createdAt)),
      ),
      Result.bind(
        "updatedAt",
        () => Result.parse(z.coerce.date(), new Date(updatedAt)),
      ),
      Result.bind(
        "bookmark",
        ({ id, title, url, tags, createdAt, updatedAt }) =>
          Result.parse(Bookmark, {
            id,
            title,
            url,
            tags,
            createdAt,
            updatedAt,
          }),
      ),
      Result.andThen(({ bookmark }) => Result.succeed(bookmark)),
      Result.mapError((error) => error.map((e) => new Error(e.message))),
    );
  },
  toDto: (bookmark: Bookmark) =>
    ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      tags: bookmark.tags,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
    }) as const satisfies IBookmarkDto,
};
