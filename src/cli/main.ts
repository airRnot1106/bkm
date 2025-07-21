import { Command } from "@cliffy/command";
import { createAddCommand } from "./commands/add-command.ts";

export function createCli() {
  const cli = new Command()
    .name("bkm")
    .version("0.1.0")
    .description("Bookmark manager CLI tool")
    .globalOption("-h, --help", "Show help information")
    .globalOption("-v, --version", "Show version information")
    .command("add", createAddCommand());

  return cli;
}

if (import.meta.main) {
  const cli = createCli();
  await cli.parse(Deno.args);
}
