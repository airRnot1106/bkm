import * as fc from "fast-check";
import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { createAddBookmarkUseCase } from "./add-bookmark.ts";
import type { IBookmarkRepository } from "../core/bookmark/bookmark.ts";
import {
  bookmarkTagGenerator,
  bookmarkTitleGenerator,
  bookmarkUrlGenerator,
} from "../core/bookmark/bookmark.mock.ts";

const createMockRepository = (): IBookmarkRepository => ({
  save: () => Promise.resolve(Result.succeed(null)),
  findAll: () => Promise.resolve(Result.succeed([])),
  findById: () => Promise.resolve(Result.succeed(null)),
});

const createFailingRepository = (error: Error): IBookmarkRepository => ({
  save: () => Promise.resolve(Result.fail(error)),
  findAll: () => Promise.resolve(Result.fail(error)),
  findById: () => Promise.resolve(Result.fail(error)),
});

Deno.test("add-bookmark usecase", async (t) => {
  await t.step("succeeds with valid inputs", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.valid(),
        bookmarkUrlGenerator.valid(),
        fc.array(bookmarkTagGenerator.valid()),
        async (title, url, tags) => {
          const mockRepository = createMockRepository();
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: mockRepository,
          });

          const result = await addBookmark({ title, url, tags });

          assertEquals(Result.isSuccess(result), true);
        },
      ),
    );
  });

  await t.step("succeeds with empty tags", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.valid(),
        bookmarkUrlGenerator.valid(),
        async (title, url) => {
          const mockRepository = createMockRepository();
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: mockRepository,
          });

          const result = await addBookmark({ title, url });

          assertEquals(Result.isSuccess(result), true);
        },
      ),
    );
  });

  await t.step("fails with invalid title", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.invalid(),
        bookmarkUrlGenerator.valid(),
        fc.array(bookmarkTagGenerator.valid()),
        async (title, url, tags) => {
          const mockRepository = createMockRepository();
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: mockRepository,
          });

          const result = await addBookmark({ title, url, tags });

          assertEquals(Result.isFailure(result), true);
        },
      ),
    );
  });

  await t.step("fails with invalid url", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.valid(),
        bookmarkUrlGenerator.invalid(),
        fc.array(bookmarkTagGenerator.valid()),
        async (title, url, tags) => {
          const mockRepository = createMockRepository();
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: mockRepository,
          });

          const result = await addBookmark({ title, url, tags });

          assertEquals(Result.isFailure(result), true);
        },
      ),
    );
  });

  await t.step("fails with invalid tags", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.valid(),
        bookmarkUrlGenerator.valid(),
        fc.tuple(
          bookmarkTagGenerator.valid(),
          bookmarkTagGenerator.invalid(),
        ),
        async (title, url, [validTag, invalidTag]) => {
          const mockRepository = createMockRepository();
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: mockRepository,
          });

          const result = await addBookmark({
            title,
            url,
            tags: [validTag, invalidTag],
          });

          assertEquals(Result.isFailure(result), true);
        },
      ),
    );
  });

  await t.step("fails when repository save fails", async () => {
    await fc.assert(
      fc.asyncProperty(
        bookmarkTitleGenerator.valid(),
        bookmarkUrlGenerator.valid(),
        fc.array(bookmarkTagGenerator.valid()),
        async (title, url, tags) => {
          const saveError = new Error("Repository save failed");
          const failingRepository = createFailingRepository(saveError);
          const addBookmark = createAddBookmarkUseCase({
            bookmarkRepository: failingRepository,
          });

          const result = await addBookmark({ title, url, tags });

          assertEquals(Result.isFailure(result), true);
          if (Result.isFailure(result)) {
            const error = result.error;
            if (error instanceof Error) {
              assertEquals(error.message, "Repository save failed");
            }
          }
        },
      ),
    );
  });
});
