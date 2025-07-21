import { createCli } from "./src/cli/app.ts";

if (import.meta.main) {
  const cli = createCli();
  await cli.parse(Deno.args);
}
