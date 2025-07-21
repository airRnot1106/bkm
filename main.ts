import { createCli } from "./src/cli/main.ts";

if (import.meta.main) {
  const cli = createCli();
  await cli.parse(Deno.args);
}
