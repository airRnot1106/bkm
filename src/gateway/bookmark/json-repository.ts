import { Result } from "@praha/byethrow";
import { IBookmarkRepository } from "../../core/bookmark/bookmark.ts";

export const createBookmarkJsonRepository = (
  _dataDir: string,
): IBookmarkRepository => ({
  save(_bookmark) {
    return Promise.resolve(Result.fail(new Error("Not implemented")));
  },
  findAll() {
    return Promise.resolve(Result.succeed([]));
  },
  findById(_id) {
    return Promise.resolve(Result.fail(new Error("Not implemented")));
  },
});
