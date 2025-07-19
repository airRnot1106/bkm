import * as fc from "fast-check";
import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { bookmarkGenerator } from "./bookmark.mock.ts";
import { BookmarkId } from "./bookmark.ts";

Deno.test("bookmark-id", async (t) => {
  await t.step("should create a bookmark id", async (t) => {
    await t.step("should accept valid bookmark id format", () => {
      fc.assert(
        fc.property(bookmarkGenerator.bookmarkId.valid(), (maybeBookmarkId) => {
          const result = Result.parse(BookmarkId, maybeBookmarkId);
          assertEquals(Result.isSuccess(result), true);
        }),
      );
    });
    await t.step("should reject invalid bookmark id format", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkId.invalid(),
          (maybeBookmarkId) => {
            const result = Result.parse(BookmarkId, maybeBookmarkId);
            assertEquals(Result.isFailure(result), true);
          },
        ),
      );
    });
    await t.step("should be equal when ids are the same", () => {
      fc.assert(
        fc.property(bookmarkGenerator.bookmarkId.valid(), (bookmarkId) => {
          const result1 = Result.parse(BookmarkId, bookmarkId);
          const result2 = Result.parse(BookmarkId, bookmarkId);
          if (Result.isSuccess(result1) && Result.isSuccess(result2)) {
            assertEquals(result1.value, result2.value);
          }
        }),
      );
    });
  });
});
