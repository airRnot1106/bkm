import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { Result } from '@praha/byethrow';

export const mkdir = (dirPath: string) =>
  Result.try({
    try: () => fs.mkdir(dirPath, { recursive: true }),
    catch: (error) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error(`Failed to create directory ${dirPath}: ${error}`);
    },
  });

export const writeFile = (filePath: string) =>
  Result.try({
    try: (data: string) => fs.writeFile(filePath, data, 'utf8'),
    catch: (error) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error(`Failed to write file ${filePath}: ${error}`);
    },
  });

export const readFile = (filePath: string) =>
  Result.try({
    try: () => fs.readFile(filePath, 'utf8'),
    catch: (error) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error(`Failed to read file ${filePath}: ${error}`);
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
