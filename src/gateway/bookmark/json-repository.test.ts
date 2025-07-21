import * as fc from "fast-check";
import { assertEquals, assertNotEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { createBookmarkJsonRepository } from "./json-repository.ts";
import { BookmarkId } from "../../core/bookmark/bookmark.ts";
import { bookmarkDtoGenerator } from "./bookmark-dto.mock.ts";
import { bookmarkMapper } from "./bookmark-mapper.ts";

Deno.test("bookmark json-repository", async (t) => {
  await t.step(
    "findAll() returns empty array when no file exists",
    async () => {
      const tempDir = await Deno.makeTempDir();
      const repository = createBookmarkJsonRepository(tempDir);

      const result = await repository.findAll();

      assertEquals(Result.isFailure(result), true);
    },
  );
  await t.step(
    "findAll() returns bookmarks from existing file",
    () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(bookmarkDtoGenerator.valid()),
          async (bookmarkDtos) => {
            const tempDir = await Deno.makeTempDir();

            await Deno.writeTextFile(
              `${tempDir}/bookmarks.json`,
              JSON.stringify(bookmarkDtos, null, 2),
            );

            const repository = createBookmarkJsonRepository(tempDir);
            const result = await repository.findAll();

            assertEquals(Result.isSuccess(result), true);
            if (Result.isSuccess(result)) {
              const bookmarks = result.value;
              assertEquals(bookmarks.length, bookmarkDtos.length);
            }
          },
        ),
      );
    },
  );
  await t.step(
    "findById() returns bookmark when exists",
    () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(bookmarkDtoGenerator.valid(), { minLength: 5 }),
          fc.nat({ max: 4 }),
          async (bookmarkDtos, index) => {
            const tempDir = await Deno.makeTempDir();
            const repository = createBookmarkJsonRepository(tempDir);
            Result.pipe(
              Result.do(),
              Result.andThrough(() =>
                Result.try({
                  try: async () => {
                    await Deno.writeTextFile(
                      `${tempDir}/bookmarks.json`,
                      JSON.stringify(bookmarkDtos, null, 2),
                    );
                  },
                  catch: (error) => new Error(`Failed to write file: ${error}`),
                })()
              ),
              Result.andThen(() =>
                Result.combine(bookmarkDtos.map(bookmarkMapper.toDomain))
              ),
              Result.andThen((bookmarks) => {
                const target = bookmarks[index];
                if (!target) {
                  return Result.fail(new Error("Not found target bookmark"));
                }
                return repository.findById(target.id);
              }),
              Result.andThrough((bookmark) => {
                assertNotEquals(bookmark, null);
                return Result.succeed();
              }),
            );
          },
        ),
      );
    },
  );
  await t.step(
    "findById() returns null when not exists",
    () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(bookmarkDtoGenerator.valid()),
          async (bookmarkDtos) => {
            const tempDir = await Deno.makeTempDir();
            const repository = createBookmarkJsonRepository(tempDir);
            Result.pipe(
              Result.do(),
              Result.andThrough(() =>
                Result.try({
                  try: async () => {
                    await Deno.writeTextFile(
                      `${tempDir}/bookmarks.json`,
                      JSON.stringify(bookmarkDtos, null, 2),
                    );
                  },
                  catch: (error) => new Error(`Failed to write file: ${error}`),
                })()
              ),
              Result.andThen(() => {
                const nonExistentId = "non-existent-id" as BookmarkId;
                return repository.findById(nonExistentId);
              }),
              Result.andThrough((bookmark) => {
                assertEquals(bookmark, null);
                return Result.succeed();
              }),
            );
          },
        ),
      );
    },
  );
  await t.step(
    "save() creates new bookmark when file doesn't exist",
    () => {
      fc.assert(
        fc.asyncProperty(
          bookmarkDtoGenerator.valid(),
          async (bookmarkDto) => {
            const tempDir = await Deno.makeTempDir();
            const repository = createBookmarkJsonRepository(tempDir);

            const bookmark = bookmarkMapper.toDomain(bookmarkDto);
            assertEquals(Result.isSuccess(bookmark), true);
            if (Result.isFailure(bookmark)) return;

            const saveResult = await repository.save(bookmark.value);
            assertEquals(Result.isSuccess(saveResult), true);

            const findResult = await repository.findAll();
            assertEquals(Result.isSuccess(findResult), true);
            if (Result.isSuccess(findResult)) {
              assertEquals(findResult.value.length, 1);
              assertEquals(findResult.value[0]?.id, bookmark.value.id);
            }
          },
        ),
      );
    },
  );
});
