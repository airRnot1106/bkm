import { Command } from "@cliffy/command";

export function createCli() {
  const cli = new Command()
    .name("bkm")
    .version("0.1.0")
    .description("Bookmark manager CLI tool")
    .globalOption("-h, --help", "Show help information")
    .globalOption("-v, --version", "Show version information");

  return cli;
}

if (import.meta.main) {
  const cli = createCli();
  await cli.parse(Deno.args);
}
