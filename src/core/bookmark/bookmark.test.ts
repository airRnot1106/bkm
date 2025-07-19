import * as fc from "fast-check";
import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import {
  bookmarkIdGenerator,
  bookmarkTagGenerator,
  bookmarkTitleGenerator,
  bookmarkUrlGenerator,
} from "./bookmark.mock.ts";
import {
  BookmarkId,
  BookmarkTag,
  BookmarkTitle,
  BookmarkUrl,
} from "./bookmark.ts";

Deno.test("bookmark-id", async (t) => {
  await t.step("should create a bookmark id", async (t) => {
    await t.step("should accept valid bookmark id format", () => {
      fc.assert(
        fc.property(bookmarkIdGenerator.valid(), (maybeBookmarkId) => {
          const result = Result.parse(BookmarkId, maybeBookmarkId);
          assertEquals(Result.isSuccess(result), true);
        }),
      );
    });
    await t.step("should reject invalid bookmark id format", () => {
      fc.assert(
        fc.property(
          bookmarkIdGenerator.invalid(),
          (maybeBookmarkId) => {
            const result = Result.parse(BookmarkId, maybeBookmarkId);
            assertEquals(Result.isFailure(result), true);
          },
        ),
      );
    });
    await t.step("should be equal when ids are the same", () => {
      fc.assert(
        fc.property(bookmarkIdGenerator.valid(), (bookmarkId) => {
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
          bookmarkTitleGenerator.valid(),
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
          bookmarkTitleGenerator.invalid(),
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
          bookmarkTitleGenerator.valid(),
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
          bookmarkUrlGenerator.valid(),
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
          bookmarkUrlGenerator.invalid(),
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
          bookmarkUrlGenerator.valid(),
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

Deno.test("bookmark-tag", async (t) => {
  await t.step("should create a bookmark tag", async (t) => {
    await t.step("should accept valid bookmark tag format", () => {
      fc.assert(
        fc.property(
          bookmarkTagGenerator.valid(),
          (maybeBookmarkTag) => {
            const result = Result.parse(BookmarkTag, maybeBookmarkTag);
            assertEquals(Result.isSuccess(result), true);
          },
        ),
      );
    });
    await t.step("should reject invalid bookmark tag format", () => {
      fc.assert(
        fc.property(
          bookmarkTagGenerator.invalid(),
          (maybeBookmarkTag) => {
            const result = Result.parse(BookmarkTag, maybeBookmarkTag);
            assertEquals(Result.isFailure(result), true);
          },
        ),
      );
    });
    await t.step("should be equal when tags are the same", () => {
      fc.assert(
        fc.property(
          bookmarkTagGenerator.valid(),
          (bookmarkTag) => {
            const result1 = Result.parse(BookmarkTag, bookmarkTag);
            const result2 = Result.parse(BookmarkTag, bookmarkTag);
            if (Result.isSuccess(result1) && Result.isSuccess(result2)) {
              assertEquals(result1.value, result2.value);
            }
          },
        ),
      );
    });
  });
});
