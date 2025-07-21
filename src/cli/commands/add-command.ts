import { Command } from "@cliffy/command";

interface AddCommandOptions {
  title?: string;
  url?: string;
  tags?: string;
}

export function createAddCommand() {
  return new Command()
    .name("add")
    .description("Add a new bookmark")
    .option("-t, --title <title:string>", "Bookmark title")
    .option("-u, --url <url:string>", "Bookmark URL")
    .option("--tags <tags:string>", "Comma-separated tags")
    .action((options: AddCommandOptions) => {
      console.log("Add command called with options:", options);
    });
}
