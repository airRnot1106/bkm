import { Result } from "@praha/byethrow";
import { Bookmark, IBookmarkRepository } from "../core/bookmark/bookmark.ts";

export interface SearchItem {
  displayText: string;
  data: Bookmark;
}

const toSearchableFormat = (bookmark: Bookmark) =>
  `${bookmark.title}: ${bookmark.url} [${bookmark.tags.join(",")}]`;

export const createSearchBookmarkUseCase = (
  bookmarkRepository: IBookmarkRepository,
) =>
(): Result.ResultAsync<SearchItem[], Error> =>
  Result.pipe(
    bookmarkRepository.findAll(),
    Result.map((bookmarks) =>
      bookmarks.map((bookmark) => ({
        displayText: toSearchableFormat(bookmark),
        data: bookmark,
      }))
    ),
  );
