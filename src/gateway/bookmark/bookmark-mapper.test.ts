import * as fc from "fast-check";
import { assertEquals, assertExists } from "@std/assert";
import { Result } from "@praha/byethrow";
import { bookmarkMapper } from "./bookmark-mapper.ts";
import { bookmarkGenerator } from "../../core/bookmark/bookmark.mock.ts";
import { Bookmark } from "../../core/bookmark/bookmark.ts";
import { bookmarkDtoGenerator } from "./bookmark-dto.mock.ts";

Deno.test("bookmark-mapper", async (t) => {
  await t.step("toDomain", async (t) => {
    await t.step("should convert valid DTO to domain object", () => {
      fc.assert(
        fc.property(bookmarkDtoGenerator.valid(), (dto) => {
          const result = bookmarkMapper.toDomain(dto);
          assertEquals(Result.isSuccess(result), true);

          if (Result.isSuccess(result)) {
            assertEquals(result.value.id, dto.id);
            assertEquals(result.value.title, dto.title.trim());
            assertEquals(result.value.url, dto.url);
            assertEquals(result.value.tags, dto.tags.map((tag) => tag.trim()));
            assertEquals(result.value.createdAt.toISOString(), dto.createdAt);
            assertEquals(result.value.updatedAt.toISOString(), dto.updatedAt);
          }
        }),
      );
    });

    await t.step("should reject invalid DTO", () => {
      fc.assert(
        fc.property(bookmarkDtoGenerator.invalid(), (dto) => {
          const result = bookmarkMapper.toDomain(dto);
          assertEquals(Result.isFailure(result), true);
        }),
      );
    });
  });
  await t.step("toDto", async (t) => {
    await t.step("should convert domain object to DTO", () => {
      fc.assert(
        fc.property(bookmarkGenerator.valid(), (bookmarkData) => {
          Result.pipe(
            Result.parse(Bookmark, bookmarkData),
            Result.map((bookmark) => bookmarkMapper.toDto(bookmark)),
            Result.andThrough((dto) => {
              assertEquals(typeof dto.id, "string");
              assertEquals(typeof dto.title, "string");
              assertEquals(typeof dto.url, "string");
              assertEquals(Array.isArray(dto.tags), true);
              assertEquals(typeof dto.createdAt, "string");
              assertEquals(typeof dto.updatedAt, "string");

              assertExists(new Date(dto.createdAt));
              assertExists(new Date(dto.updatedAt));
              assertEquals(isNaN(Date.parse(dto.createdAt)), false);
              assertEquals(isNaN(Date.parse(dto.updatedAt)), false);
              return Result.succeed();
            }),
          );
        }),
      );
    });
  });
});
