import * as fc from "fast-check";
import { BOOKMARK_TITLE_MAX_LENGTH } from "./bookmark.ts";

const MAX_NAT = 10000;

export const bookmarkGenerator = {
  bookmarkId: {
    valid: () => fc.uuid({ "version": 4 }),
    invalid: () =>
      fc.string().filter((id) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          .test(id)
      ),
  },
  bookmarkTitle: {
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
  },
};
