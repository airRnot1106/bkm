import * as fc from "fast-check";

export const bookmarkGenerator = {
  bookmarkId: {
    valid: () => fc.uuid({ "version": 4 }),
    invalid: () =>
      fc.string().filter((id) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          .test(id)
      ),
  },
};
