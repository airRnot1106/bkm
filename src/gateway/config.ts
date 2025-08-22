import { Result } from '@praha/byethrow';
import { Config, type IConfigRepository } from '../core/config';
import { ensureFileExists, readFile, writeFile } from '../utils';

interface IConfigDTO {
  fuzzyFinder: {
    command: string;
    args: string[];
  };
}

const configMapper = {
  toDTO: (config: Config): Result.Result<IConfigDTO, never> =>
    Result.succeed({
      fuzzyFinder: {
        command: config.fuzzyFinder.command,
        args: config.fuzzyFinder.args,
      },
    }),
  fromDTO: (dto: unknown) => Result.parse(Config, dto),
} as const;

export const createConfigJsonRepository = (
  configPath: string,
): IConfigRepository => {
  const repository: IConfigRepository = {
    async save(config) {
      return Result.pipe(
        Result.succeed(config),
        Result.andThen(configMapper.toDTO),
        Result.map((dto) => JSON.stringify(dto, null, 2)),
        Result.andThrough(ensureFileExists(configPath)),
        Result.andThen(writeFile(configPath)),
      );
    },
    async load() {
      return Result.pipe(
        Result.do(),
        Result.andThrough(ensureFileExists(configPath)),
        Result.andThen(readFile(configPath)),
        Result.andThen(configMapper.fromDTO),
        Result.mapError((error) => {
          if (error instanceof Error) {
            return error;
          }
          return new Error(error.map((e) => e.message).join(', '));
        }),
      );
    },
  };
  return repository;
};
