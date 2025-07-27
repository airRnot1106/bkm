import { Command } from "@cliffy/command";
import { Result } from "@praha/byethrow";
import { createSearchBookmarkUseCase } from "../../usecase/search-bookmark.ts";
import { createBookmarkJsonRepository } from "../../gateway/bookmark/json-repository.ts";
import { join } from "@std/path";
import { FailedCommand, SucceededCommand } from "./types.ts";

const getDataDirectory = (): string => {
  const homeDir = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "/tmp";
  return join(homeDir, ".local", "share", "bkm");
};

const getFuzzyFinderCommand = (): string => {
  return Deno.env.get("BKM_FUZZY_FINDER") ?? "fzf";
};

const executeFuzzyFinder = (
  items: string[],
): Result.ResultAsync<string | null, Error> => {
  const fuzzyFinderCmd = getFuzzyFinderCommand();

  return Result.try({
    try: async () => {
      const command = new Deno.Command(fuzzyFinderCmd, {
        stdin: "piped",
        stdout: "piped",
        stderr: "piped",
      });

      const process = command.spawn();

      // Write items to stdin
      const writer = process.stdin.getWriter();
      await writer.write(new TextEncoder().encode(items.join("\n")));
      await writer.close();

      const { code, stdout, stderr } = await process.output();

      if (code === 0) {
        const output = new TextDecoder().decode(stdout).trim();
        return output || null;
      } else if (code === 1 || code === 130) {
        // User cancelled (fzf returns 1 or 130 on ESC/Ctrl+C)
        return null;
      } else {
        const errorMessage = new TextDecoder().decode(stderr);
        throw new Error(`Fuzzy finder failed: ${errorMessage}`);
      }
    },
    catch: (error) => {
      if (error instanceof Deno.errors.NotFound) {
        return new Error(
          `Fuzzy finder '${fuzzyFinderCmd}' not found`,
        );
      } else if (error instanceof Deno.errors.PermissionDenied) {
        return new Error(
          `Permission denied when trying to execute '${fuzzyFinderCmd}'.`,
        );
      } else if (error instanceof Deno.errors.InvalidData) {
        return new Error(
          `Invalid data provided to '${fuzzyFinderCmd}': ${error.message}`,
        );
      } else if (error instanceof Error) {
        return new Error(`Fuzzy finder error: ${error.message}`);
      }
      return new Error(
        `An unexpected error occurred while executing '${fuzzyFinderCmd}': ${error}`,
      );
    },
  })();
};

const openInBrowser = (url: string): Result.ResultAsync<void, Error> => {
  const platform = Deno.build.os;

  let command: [string, ...string[]];
  switch (platform) {
    case "darwin":
      command = ["open", url];
      break;
    case "linux":
      command = ["xdg-open", url];
      break;
    case "windows":
      command = ["cmd", "/c", "start", url];
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return Result.try({
    try: async () => {
      const process = new Deno.Command(command[0], {
        args: command.slice(1),
        stdout: "null",
        stderr: "null",
      });

      await process.output();
    },
    catch: (error) => {
      if (error instanceof Deno.errors.PermissionDenied) {
        return new Error(
          `Permission denied when trying to execute '${command[0]}'.`,
        );
      } else if (error instanceof Error) {
        return new Error(`Failed to open URL in browser: ${error.message}`);
      }
      return new Error(
        `An unexpected error occurred while executing '${
          command[0]
        }': ${error}`,
      );
    },
  })();
};

const searchBookmarks = async (): Promise<
  Result.ResultAsync<SucceededCommand, FailedCommand>
> => {
  const dataDir = getDataDirectory();
  const repository = createBookmarkJsonRepository(dataDir);
  const searchBookmarksUseCase = createSearchBookmarkUseCase(repository);

  const result = await searchBookmarksUseCase();

  if (Result.isFailure(result)) {
    const errorMessage = result.error instanceof Error
      ? result.error.message
      : "Failed to search bookmarks";
    return Result.fail({
      code: 1,
      messages: ["❌ Search failed:", errorMessage],
    });
  }

  const searchItems = result.value;

  if (searchItems.length === 0) {
    return Result.fail({
      code: 1,
      messages: ["❌ No bookmarks found"],
    });
  }

  const displayTexts = searchItems.map((item) => item.displayText);

  return Result.try({
    try: async () => {
      const selectedText = await executeFuzzyFinder(displayTexts);

      if (Result.isFailure(selectedText)) {
        throw selectedText.error;
      }

      if (selectedText.value === null) {
        return {
          code: 0,
          messages: [],
        };
      }

      const selectedItem = searchItems.find((item) =>
        item.displayText === selectedText.value
      );

      if (!selectedItem) {
        throw new Error("Selected item not found");
      }

      const openResult = await openInBrowser(selectedItem.data.url);
      if (Result.isFailure(openResult)) {
        throw openResult.error;
      }

      return {
        code: 0,
        messages: [`🔗 Opening: ${selectedItem.data.url}`],
      };
    },
    catch: (error) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";
      return {
        code: 1,
        messages: ["❌ Search failed:", errorMessage],
      };
    },
  })();
};

export const createSearchCommand = () => {
  return new Command()
    .name("search")
    .description("Search and open bookmarks with fuzzy finder")
    .action(async () => {
      const result = await searchBookmarks();

      if (Result.isSuccess(result)) {
        result.value.messages.forEach((msg) => console.log(msg));
      } else {
        result.error.messages.forEach((msg) => console.error(msg));
        Deno.exit(result.error.code);
      }
    });
};
