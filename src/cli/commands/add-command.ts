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

const saveBookmark = async (title: string, url: string, tags: string) => {
  const dataDir = getDataDirectory();
  const repository = createBookmarkJsonRepository(dataDir);
  const addBookmark = createAddBookmarkUseCase({
    bookmarkRepository: repository,
  });

  const tagsArray = tags.trim() === ""
    ? []
    : tags.split(",").map((tag) => tag.trim());

  const result = await addBookmark({ title, url, tags: tagsArray });

  if (Result.isSuccess(result)) {
    console.log("✅ Bookmark added successfully!");
  } else {
    console.error("❌ Failed to add bookmark:");
    if (result.error instanceof Error) {
      console.error(result.error.message);
    } else {
      console.error("Unknown error occurred");
    }
    Deno.exit(1);
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
      await saveBookmark(inputs.title, inputs.url, inputs.tags);
    });
};
