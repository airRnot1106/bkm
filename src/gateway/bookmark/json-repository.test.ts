import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { createBookmarkJsonRepository } from "./json-repository.ts";

Deno.test("JsonRepository - findAll() returns empty array when no file exists", async () => {
  const tempDir = await Deno.makeTempDir();
  const repository = createBookmarkJsonRepository(tempDir);

  const result = await repository.findAll();

  assertEquals(Result.isSuccess(result), true);
  if (Result.isSuccess(result)) {
    assertEquals(result.value, []);
  }

  await Deno.remove(tempDir, { recursive: true });
});
