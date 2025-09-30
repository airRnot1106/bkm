import { Result } from '@praha/byethrow';
import consola from 'consola';
import { define } from 'gunshi';
import z from 'zod';
import { BookmarkTag, BookmarkTitle, BookmarkUrl } from '../../core/bookmark';
import { createBookmarkJsonRepository } from '../../gateway/bookmark';
import { createAddBookmarkUseCase } from '../../usecase/add-bookmark';
import { getBookmarkDataFilePath, retryablePrompt } from '../utils';

const add = define({
  name: 'add',
  description: 'Add a new bookmark',
  args: {
    title: {
      type: 'custom',
      short: 't',
      description: 'Title of the bookmark',
      parse: (input) =>
        Result.unwrap(
          Result.pipe(
            Result.succeed(input),
            Result.andThen(Result.parse(BookmarkTitle)),
            Result.inspectError((errors) =>
              consola.error(
                `title: ${errors.map((e) => e.message).join(', ')}`,
              ),
            ),
            Result.mapError(() => new Error(``)),
          ),
        ),
    },
    url: {
      type: 'custom',
      short: 'u',
      description: 'URL of the bookmark',
      parse: (input) =>
        Result.unwrap(
          Result.pipe(
            Result.succeed(input),
            Result.andThen(Result.parse(BookmarkUrl)),
            Result.inspectError((errors) =>
              consola.error(`url: ${errors.map((e) => e.message).join(', ')}`),
            ),
            Result.mapError(() => new Error()),
          ),
        ),
    },
    tags: {
      type: 'custom',
      description: 'Tags for the bookmark (comma separated)',
      parse: (input) =>
        Result.unwrap(
          Result.pipe(
            Result.succeed(input),
            Result.map((str) => str.split(',')),
            Result.andThen(Result.parse(BookmarkTag.array())),
            Result.inspectError((errors) =>
              consola.error(`tags: ${errors.map((e) => e.message).join(', ')}`),
            ),
            Result.mapError(() => new Error()),
          ),
        ),
    },
  },
  run: async (ctx) => {
    const { title, url, tags } = {
      title:
        ctx.values.title ??
        (await retryablePrompt(BookmarkTitle, 'Title: ', {
          shouldExitOnCancel: true,
        })),
      url:
        ctx.values.url ??
        (await retryablePrompt(BookmarkUrl, 'URL: ', {
          shouldExitOnCancel: true,
        })),
      tags:
        ctx.values.tags ??
        (await retryablePrompt(
          z
            .string()
            .nullable()
            .default(null)
            .transform((value) => (value == null ? [] : value.split(',')))
            .pipe(z.array(BookmarkTag)),
          'Tags (comma separated): ',
          {
            shouldExitOnCancel: true,
          },
        )),
    };

    const repository = createBookmarkJsonRepository(getBookmarkDataFilePath());
    const add = createAddBookmarkUseCase(repository);

    await add({ title, url, tags });
  },
});

export default add;
