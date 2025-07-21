import { Command } from "@cliffy/command";
import { Input } from "@cliffy/prompt";
import { Result } from "@praha/byethrow";
import {
  BOOKMARK_TAG_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
} from "../../core/bookmark/bookmark.ts";
import { createAddBookmarkUseCase } from "../../usecase/add-bookmark.ts";
import { createBookmarkJsonRepository } from "../../gateway/bookmark/json-repository.ts";
import { join } from "@std/path";

interface AddCommandOptions {
  title?: string;
  url?: string;
  tags?: string;
}

const validateTitle = (input: string): string | true => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return "Title cannot be empty";
  }
  if (trimmed.length > BOOKMARK_TITLE_MAX_LENGTH) {
    return `Title must be ${BOOKMARK_TITLE_MAX_LENGTH} characters or less`;
  }
  return true;
};

const validateUrl = (input: string): string | true => {
  try {
    const url = new URL(input);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL must use http or https protocol";
    }
    return true;
  } catch {
    return "Please enter a valid URL";
  }
};

const validateTags = (input: string): string | true => {
  if (input.trim() === "") return true;

  const tags = input.split(",").map((tag) => tag.trim());
  for (const tag of tags) {
    if (tag.length === 0) {
      return "Tags cannot be empty (remove extra commas)";
    }
    if (tag.length > BOOKMARK_TAG_MAX_LENGTH) {
      return `Each tag must be ${BOOKMARK_TAG_MAX_LENGTH} characters or less`;
    }
  }
  return true;
};

const promptForMissingInputs = async (options: AddCommandOptions) => {
  const title = options.title ?? await Input.prompt({
    message: "Enter bookmark title:",
    validate: validateTitle,
  });

  const url = options.url ?? await Input.prompt({
    message: "Enter bookmark URL:",
    validate: validateUrl,
  });

  const tags = options.tags ?? await Input.prompt({
    message: "Enter tags (comma-separated, optional):",
    default: "",
    validate: validateTags,
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
