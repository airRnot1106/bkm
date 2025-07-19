import * as fc from "fast-check";
import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { bookmarkGenerator } from "./bookmark.mock.ts";
import { BookmarkId, BookmarkTitle, BookmarkUrl } from "./bookmark.ts";

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

Deno.test("bookmark-title", async (t) => {
  await t.step("should create a bookmark title", async (t) => {
    await t.step("should accept valid bookmark title format", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkTitle.valid(),
          (maybeBookmarkTitle) => {
            const result = Result.parse(BookmarkTitle, maybeBookmarkTitle);
            assertEquals(Result.isSuccess(result), true);
          },
        ),
      );
    });
    await t.step("should reject invalid bookmark title format", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkTitle.invalid(),
          (maybeBookmarkTitle) => {
            const result = Result.parse(BookmarkTitle, maybeBookmarkTitle);
            assertEquals(Result.isFailure(result), true);
          },
        ),
      );
    });
    await t.step("should be equal when titles are the same", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkTitle.valid(),
          (bookmarkTitle) => {
            const result1 = Result.parse(BookmarkTitle, bookmarkTitle);
            const result2 = Result.parse(BookmarkTitle, bookmarkTitle);
            if (Result.isSuccess(result1) && Result.isSuccess(result2)) {
              assertEquals(result1.value, result2.value);
            }
          },
        ),
      );
    });
  });
});

Deno.test("bookmark-url", async (t) => {
  await t.step("should create a bookmark url", async (t) => {
    await t.step("should accept valid bookmark url format", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkUrl.valid(),
          (maybeBookmarkUrl) => {
            const result = Result.parse(BookmarkUrl, maybeBookmarkUrl);
            assertEquals(Result.isSuccess(result), true);
          },
        ),
      );
    });
    await t.step("should reject invalid bookmark url format", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkUrl.invalid(),
          (maybeBookmarkUrl) => {
            const result = Result.parse(BookmarkUrl, maybeBookmarkUrl);
            assertEquals(Result.isFailure(result), true);
          },
        ),
      );
    });
    await t.step("should be equal when titles are the same", () => {
      fc.assert(
        fc.property(
          bookmarkGenerator.bookmarkUrl.valid(),
          (bookmarkUrl) => {
            const result1 = Result.parse(BookmarkUrl, bookmarkUrl);
            const result2 = Result.parse(BookmarkUrl, bookmarkUrl);
            if (Result.isSuccess(result1) && Result.isSuccess(result2)) {
              assertEquals(result1.value, result2.value);
            }
          },
        ),
      );
    });
  });
});
