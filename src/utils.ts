import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { Result } from '@praha/byethrow';
import { ErrorFactory } from '@praha/error-factory';

export class UnexpectedError extends ErrorFactory({
  name: 'UnexpectedError',
  message: 'An unexpected error occurred',
}) {}

export class FileSystemError extends ErrorFactory({
  name: 'FileSystemError',
  message: 'File system operation failed',
}) {}

export const mkdir = (dirPath: string) =>
  Result.try({
    try: () => fs.mkdir(dirPath, { recursive: true }),
    catch: (error) => {
      if (error instanceof Error) {
        return new FileSystemError({ cause: error });
      }
      return new UnexpectedError({
        cause: new FileSystemError({
          cause: new Error(`Failed to make directory: ${dirPath}`),
        }),
      });
    },
  });

export const writeFile = (filePath: string) =>
  Result.try({
    try: (data: string) => fs.writeFile(filePath, data, 'utf8'),
    catch: (error) => {
      if (error instanceof Error) {
        return new FileSystemError({ cause: error });
      }
      return new UnexpectedError({
        cause: new FileSystemError({
          cause: new Error(`Failed to write file: ${filePath}`),
        }),
      });
    },
  });

export const readFile = (filePath: string) =>
  Result.try({
    try: () => fs.readFile(filePath, 'utf8'),
    catch: (error) => {
      if (error instanceof Error) {
        return new FileSystemError({ cause: error });
      }
      return new UnexpectedError({
        cause: new FileSystemError({
          cause: new Error(`Failed to read file: ${filePath}`),
        }),
      });
    },
  });

export const ensureFileExists = (filePath: string) => () =>
  Result.pipe(
    Result.succeed(filePath),
    Result.map((filePath) => ({ dirPath: dirname(filePath), filePath })),
    Result.andThen(({ dirPath, filePath }) =>
      Result.pipe(
        Result.do(),
        Result.andThen(mkdir(dirPath)),
        Result.andThen(() => Result.succeed('')),
        Result.andThen(writeFile(filePath)),
      ),
    ),
  );
