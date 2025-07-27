import { Command } from "@cliffy/command";
import { Input } from "@cliffy/prompt";
import { Result } from "@praha/byethrow";
import {
  BookmarkTag,
  BookmarkTitle,
  BookmarkUrl,
} from "../../core/bookmark/bookmark.ts";
import { createAddBookmarkUseCase } from "../../usecase/add-bookmark.ts";
import { createBookmarkJsonRepository } from "../../gateway/bookmark/json-repository.ts";
import { join } from "@std/path";
import z from "zod";
import { FailedCommand, SucceededCommand } from "./types.ts";

interface AddCommandOptions {
  title?: string;
  url?: string;
  tags?: string;
}

const createSchemaValidator = <
  T extends Parameters<typeof Result.parse>[0],
  V,
  R,
  U extends (input: V) => R,
>(schema: T, map?: U) =>
(input: V) => {
  const result = Result.parse(schema, (map ?? ((i) => i))(input));
  if (Result.isFailure(result)) {
    return result.error.map((e) => e.message).join(",\n");
  }
  return true;
};

const promptForMissingInputs = async (options: AddCommandOptions) => {
  const title = options.title ?? await Input.prompt({
    message: "Enter bookmark title:",
    validate: createSchemaValidator(BookmarkTitle),
  });

  const url = options.url ?? await Input.prompt({
    message: "Enter bookmark URL:",
    validate: createSchemaValidator(BookmarkUrl),
  });

  const tags = options.tags ?? await Input.prompt({
    message: "Enter tags (comma-separated, optional):",
    default: "",
    validate: createSchemaValidator(
      z.array(BookmarkTag),
      (tags) => tags.split(","),
    ),
  });

  return { title, url, tags };
};

const getDataDirectory = (): string => {
  const homeDir = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "/tmp";
  return join(homeDir, ".local", "share", "bkm");
};

const saveBookmark = async (
  title: string,
  url: string,
  tags: string,
): Promise<Result.ResultAsync<SucceededCommand, FailedCommand>> => {
  const dataDir = getDataDirectory();
  const repository = createBookmarkJsonRepository(dataDir);
  const addBookmark = createAddBookmarkUseCase(repository);

  const tagsArray = tags.trim() === ""
    ? []
    : tags.split(",").map((tag) => tag.trim());

  const result = await addBookmark({ title, url, tags: tagsArray });

  if (Result.isSuccess(result)) {
    return Result.succeed({
      code: 0,
      messages: ["✅ Bookmark added successfully!"],
    });
  } else {
    const errorMessage = result.error instanceof Error
      ? result.error.message
      : "Unknown error occurred";
    return Result.fail({
      code: 1,
      messages: ["❌ Failed to add bookmark:", errorMessage],
    });
  }
};

export const createAddCommand = () => {
  return new Command()
    .name("add")
    .description("Add a new bookmark")
    .option("-t, --title <title:string>", "Bookmark title")
    .option("-u, --url <url:string>", "Bookmark URL")
    .option("--tags <tags:string>", "Comma-separated tags")
    .action(async (options: AddCommandOptions) => {
      const inputs = await promptForMissingInputs(options);
      const result = await saveBookmark(inputs.title, inputs.url, inputs.tags);

      if (Result.isSuccess(result)) {
        result.value.messages.forEach((msg) => console.log(msg));
      } else {
        result.error.messages.forEach((msg) => console.error(msg));
        Deno.exit(result.error.code);
      }
    });
};
