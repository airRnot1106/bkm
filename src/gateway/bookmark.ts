import { Result } from '@praha/byethrow';
import { formatISO } from 'date-fns/fp';
import {
  Bookmark,
  BookmarkNotFoundError,
  BookmarkParseError,
  type IBookmarkRepository,
} from '../core/bookmark';
import {
  ensureFileExists,
  readFile,
  UnexpectedError,
  writeFile,
} from '../utils';

interface IBookmarkDTO {
  id: string;
  title: string;
  url: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const bookmarkMapper = {
  toDTO: (bookmark: Bookmark): Result.Result<IBookmarkDTO, never> =>
    Result.succeed({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      tags: bookmark.tags,
      createdAt: formatISO(bookmark.createdAt),
      updatedAt: formatISO(bookmark.updatedAt),
    }),
  toDTOs: (bookmarks: Bookmark[]): Result.Result<IBookmarkDTO[], never[]> =>
    Result.combine(bookmarks.map(bookmarkMapper.toDTO)),
  fromDTO: (dto: unknown) => Result.parse(Bookmark, dto),
  fromDTOs: (dtos: unknown) => Result.parse(Bookmark.array(), dtos),
} as const;

export const createBookmarkJsonRepository = (
  bookmarkPath: string,
): IBookmarkRepository => {
  const repository: IBookmarkRepository = {
    async insert(bookmark) {
      return Result.pipe(
        Result.do(),
        Result.bind('target', () => Result.succeed(bookmark)),
        Result.bind('bookmarks', repository.findAll),
        Result.map(({ target, bookmarks }) => [...bookmarks, target]),
        Result.andThen(bookmarkMapper.toDTOs),
        Result.map((dtos) => JSON.stringify(dtos, null, 2)),
        Result.andThrough(ensureFileExists(bookmarkPath)),
        Result.andThen(writeFile(bookmarkPath)),
        Result.mapError((error) => {
          if (error instanceof Error) {
            return error;
          }
          return new UnexpectedError();
        }),
      );
    },
    async update(bookmark) {
      return Result.pipe(
        Result.do(),
        Result.bind('target', () => Result.succeed(bookmark)),
        Result.bind('bookmarks', repository.findAll),
        Result.map(({ target, bookmarks }) => ({
          target,
          bookmarks: bookmarks.map((b) => (b.id === target.id ? target : b)),
        })),
        Result.map(({ target, bookmarks }) => [...bookmarks, target]),
        Result.andThen(bookmarkMapper.toDTOs),
        Result.map((dtos) => JSON.stringify(dtos, null, 2)),
        Result.andThrough(ensureFileExists(bookmarkPath)),
        Result.andThen(writeFile(bookmarkPath)),
        Result.mapError((error) => {
          if (error instanceof Error) {
            return error;
          }
          return new UnexpectedError();
        }),
      );
    },
    async delete(bookmarkId) {
      return Result.pipe(
        Result.do(),
        Result.andThen(repository.findAll),
        Result.map((bookmarks) => bookmarks.filter((b) => b.id !== bookmarkId)),
        Result.andThen(bookmarkMapper.toDTOs),
        Result.map((dtos) => JSON.stringify(dtos, null, 2)),
        Result.andThrough(ensureFileExists(bookmarkPath)),
        Result.andThen(writeFile(bookmarkPath)),
        Result.mapError((error) => {
          if (error instanceof Error) {
            return error;
          }
          return new UnexpectedError();
        }),
      );
    },
    async findAll() {
      return Result.pipe(
        Result.do(),
        Result.andThen(readFile(bookmarkPath)),
        Result.map(JSON.parse),
        Result.andThen(bookmarkMapper.fromDTOs),
        Result.mapError((error) => {
          if (error instanceof Error) {
            return error;
          }
          return new BookmarkParseError({ issues: error });
        }),
      );
    },
    async findById(bookmarkId) {
      return Result.pipe(
        Result.do(),
        Result.andThen(repository.findAll),
        Result.map((bookmarks) =>
          bookmarks.find((bookmark) => bookmark.id === bookmarkId),
        ),
        Result.andThen((bookmark) =>
          bookmark != null
            ? Result.succeed(bookmark)
            : Result.fail(new BookmarkNotFoundError({ id: bookmarkId })),
        ),
      );
    },
  };
  return repository;
};
