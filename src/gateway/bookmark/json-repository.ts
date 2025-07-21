import { Result } from "@praha/byethrow";
import { IBookmarkRepository } from "../../core/bookmark/bookmark.ts";
import { bookmarkMapper } from "./bookmark-mapper.ts";
import { IBookmarkDto } from "./bookmark-dto.ts";

export const createBookmarkJsonRepository = (
  dataDir: string,
): IBookmarkRepository => {
  const getJsonFilePath = () => `${dataDir}/bookmarks.json`;

  return {
    save(bookmark) {
      return Result.pipe(
        this.findAll(),
        Result.map((
          bookmarks,
        ) => [...bookmarks.filter((b) => b.id !== bookmark.id), bookmark]),
        Result.map((bookmarks) => bookmarks.map(bookmarkMapper.toDto)),
        Result.andThrough((dtos) =>
          Result.try({
            try: async () => {
              const jsonFilePath = getJsonFilePath();

              // Ensure directory exists
              await Deno.mkdir(dataDir, { recursive: true });

              await Deno.writeTextFile(
                jsonFilePath,
                JSON.stringify(dtos, null, 2),
              );
            },
            catch: (error) =>
              new Error("Failed to save bookmarks", { cause: error }),
          })()
        ),
        Result.map(() => null),
      );
    },
    findAll() {
      return Result.pipe(
        Result.try({
          try: async () => {
            const jsonFilePath = getJsonFilePath();

            const text = await Deno.readTextFile(jsonFilePath);
            return JSON.parse(text) as IBookmarkDto[];
          },
          catch: (error) =>
            new Error("Failed to read bookmarks", { cause: error }),
        })(),
        Result.andThen((dtos) =>
          Result.combine(dtos.map(bookmarkMapper.toDomain))
        ),
        Result.mapError((errors) =>
          new Error("Failed to parse bookmarks", { cause: errors })
        ),
      );
    },
    findById(id) {
      return Result.pipe(
        this.findAll(),
        Result.map((bookmarks) =>
          bookmarks.find((bookmark) => bookmark.id === id)
        ),
        Result.andThen((bookmark) =>
          bookmark
            ? Result.succeed(bookmark)
            : Result.fail(new Error(`Bookmark with id ${id} not found`))
        ),
      );
    },
  };
};
