import { Result } from "@praha/byethrow";
import { IBookmarkRepository } from "../../core/bookmark/bookmark.ts";
import { bookmarkMapper } from "./bookmark-mapper.ts";
import { IBookmarkDto } from "./bookmark-dto.ts";

export const createBookmarkJsonRepository = (
  dataDir: string,
): IBookmarkRepository => {
  const getJsonFilePath = () => `${dataDir}/bookmarks.json`;

  return {
    save(_bookmark) {
      return Promise.resolve(Result.fail(new Error("Not implemented")));
    },
    async findAll() {
      try {
        const jsonFilePath = getJsonFilePath();

        try {
          const content = await Deno.readTextFile(jsonFilePath);
          const dtos: IBookmarkDto[] = JSON.parse(content);

          const bookmarks = [];
          for (const dto of dtos) {
            const bookmarkResult = bookmarkMapper.toDomain(dto);
            if (Result.isSuccess(bookmarkResult)) {
              bookmarks.push(bookmarkResult.value);
            } else {
              return Result.fail(
                new Error(
                  `Failed to convert DTO to domain: ${
                    JSON.stringify(bookmarkResult.error)
                  }`,
                ),
              );
            }
          }

          return Result.succeed(bookmarks);
        } catch (error) {
          if (error instanceof Deno.errors.NotFound) {
            return Result.succeed([]);
          }
          throw error;
        }
      } catch (error) {
        return Result.fail(
          new Error("Failed to read bookmarks", { cause: error }),
        );
      }
    },
    async findById(id) {
      const allBookmarksResult = await this.findAll();

      if (Result.isFailure(allBookmarksResult)) {
        return allBookmarksResult;
      }

      const bookmark = allBookmarksResult.value.find((b) => b.id === id);
      return Result.succeed(bookmark || null);
    },
  };
};
