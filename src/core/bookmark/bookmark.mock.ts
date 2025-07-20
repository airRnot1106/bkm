import * as fc from "fast-check";
import {
  BOOKMARK_TAG_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
} from "./bookmark.ts";

const MAX_NAT = 10000;

export const bookmarkIdGenerator = {
  valid: () => fc.uuid({ "version": 4 }),
  invalid: () =>
    fc.string().filter((id) =>
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(id)
    ),
};

export const bookmarkTitleGenerator = {
  valid: () =>
    fc.oneof(
      fc.string().map((title) => title.trim()).filter((title) =>
        title.length > 0 && title.length <= BOOKMARK_TITLE_MAX_LENGTH
      ),
      fc.tuple(
        fc.nat({ max: MAX_NAT }),
        fc.nat({ max: MAX_NAT }),
      ).map((
        [start, end],
      ) =>
        " ".repeat(start) + "X".repeat(BOOKMARK_TITLE_MAX_LENGTH) +
        " ".repeat(end)
      ),
    ),
  invalid: () =>
    fc.oneof(
      fc.string().filter((title) =>
        title.length < 1 || title.length > BOOKMARK_TITLE_MAX_LENGTH
      ),
      fc.tuple(
        fc.nat({ max: MAX_NAT }),
        fc.nat({ max: MAX_NAT }),
      ).map(([start, end]) =>
        " ".repeat(start) + "X".repeat(BOOKMARK_TITLE_MAX_LENGTH + 1) +
        " ".repeat(end)
      ),
      fc.constant(""),
      fc.nat({ max: MAX_NAT }).map((num) => " ".repeat(num)),
    ),
};

export const bookmarkUrlGenerator = {
  valid: () => fc.webUrl({ withFragments: true, withQueryParameters: true }),
  invalid: () => fc.string().filter((url) => !/^https?:\/\/.+\..+/.test(url)),
};

export const bookmarkTagGenerator = {
  valid: () =>
    fc.oneof(
      fc.string().map((title) => title.trim()).filter((title) =>
        title.length > 0 && title.length <= BOOKMARK_TAG_MAX_LENGTH
      ),
      fc.tuple(
        fc.nat({ max: MAX_NAT }),
        fc.nat({ max: MAX_NAT }),
      ).map((
        [start, end],
      ) =>
        " ".repeat(start) + "X".repeat(BOOKMARK_TAG_MAX_LENGTH) +
        " ".repeat(end)
      ),
    ),
  invalid: () =>
    fc.oneof(
      fc.string().filter((title) =>
        title.length < 1 || title.length > BOOKMARK_TAG_MAX_LENGTH
      ),
      fc.tuple(
        fc.nat({ max: MAX_NAT }),
        fc.nat({ max: MAX_NAT }),
      ).map(([start, end]) =>
        " ".repeat(start) + "X".repeat(BOOKMARK_TAG_MAX_LENGTH + 1) +
        " ".repeat(end)
      ),
      fc.constant(""),
      fc.nat({ max: MAX_NAT }).map((num) => " ".repeat(num)),
    ),
};

export const bookmarkGenerator = {
  valid: () =>
    fc.record({
      id: bookmarkIdGenerator.valid(),
      title: bookmarkTitleGenerator.valid(),
      url: bookmarkUrlGenerator.valid(),
      tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
      createdAt: fc.date(),
      updatedAt: fc.date(),
    }),
  invalid: () =>
    fc.oneof(
      fc.record({
        id: bookmarkIdGenerator.invalid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.valid(),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date(),
        updatedAt: fc.date(),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.invalid(),
        url: bookmarkUrlGenerator.valid(),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date(),
        updatedAt: fc.date(),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.invalid(),
        tags: fc.array(bookmarkTagGenerator.valid(), { minLength: 0 }),
        createdAt: fc.date(),
        updatedAt: fc.date(),
      }),
      fc.record({
        id: bookmarkIdGenerator.valid(),
        title: bookmarkTitleGenerator.valid(),
        url: bookmarkUrlGenerator.valid(),
        tags: fc.tuple(
          bookmarkTagGenerator.valid(),
          bookmarkTagGenerator.invalid(),
        ),
        createdAt: fc.date(),
        updatedAt: fc.date(),
      }),
    ),
};
