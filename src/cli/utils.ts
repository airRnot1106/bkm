import { homedir } from 'node:os';
import { join } from 'node:path';
import { Result } from '@praha/byethrow';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import consola, { type PromptOptions } from 'consola';
import { name } from '../../package.json';

export const getBookmarkDataFilePath = () =>
  join(homedir(), '.local', 'share', name, 'data.json');

export const retryablePrompt = async <T extends StandardSchemaV1, U>(
  schema: T,
  message: string,
  options?: PromptOptions & {
    shouldExitOnCancel?: boolean;
    mapError?: (issues: readonly StandardSchemaV1.Issue[]) => U;
  },
) => {
  const { shouldExitOnCancel = false, mapError, ...rest } = options ?? {};

  while (true) {
    const result = await Result.pipe(
      Result.succeed(
        consola.prompt(message, {
          ...rest,
          cancel: 'symbol',
        }),
      ),
      Result.andThrough((value) => {
        if (shouldExitOnCancel && value === Symbol.for('cancel')) {
          process.exit(0);
        }
        return Result.succeed();
      }),
      Result.andThen(Result.parse(schema)),
      Result.mapError(
        (issues) =>
          mapError?.(issues) ?? issues.map((e) => e.message).join('\n'),
      ),
    );

    if (Result.isSuccess(result)) {
      return result.value;
    }

    consola.error(result.error);
  }
};
