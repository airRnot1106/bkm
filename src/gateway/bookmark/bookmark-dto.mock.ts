import * as fc from "fast-check";
import {
  bookmarkIdGenerator,
  bookmarkTagGenerator,
  bookmarkTitleGenerator,
  bookmarkUrlGenerator,
} from "../../core/bookmark/bookmark.mock.ts";

export const bookmarkDtoGenerator = {
  valid: () =>
    fc.record({
      id: bookmarkIdGenerator.valid(),
      title: bookmarkTitleGenerator.valid(),
      url: bookmarkUrlGenerator.valid().map((url) => new URL(url).href),
      tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
      createdAt: fc.date({ "noInvalidDate": true }).map((date) =>
        date.toISOString()
      ),
      updatedAt: fc.date({ "noInvalidDate": true }).map((date) =>
        date.toISOString()
      ),
    }),
  invalid: () =>
    fc.oneof(
      fc.record({
        id: bookmarkIdGenerator.invalid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.valid().map((url) => new URL(url).href),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date().map((date) => date.toISOString()),
        updatedAt: fc.date().map((date) => date.toISOString()),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.invalid(),
        url: bookmarkUrlGenerator.valid().map((url) => new URL(url).href),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date().map((date) => date.toISOString()),
        updatedAt: fc.date().map((date) => date.toISOString()),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.invalid(),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date().map((date) => date.toISOString()),
        updatedAt: fc.date().map((date) => date.toISOString()),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.valid().map((url) => new URL(url).href),
        tags: fc.tuple(
          bookmarkTagGenerator.valid(),
          bookmarkTagGenerator.invalid(),
        ),
        createdAt: fc.date().map((date) => date.toISOString()),
        updatedAt: fc.date().map((date) => date.toISOString()),
      }),
    ),
};
