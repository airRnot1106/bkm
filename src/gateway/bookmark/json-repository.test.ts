import { assertEquals } from "@std/assert";
import { Result } from "@praha/byethrow";
import { createBookmarkJsonRepository } from "./json-repository.ts";
import { IBookmarkDto } from "./bookmark-dto.ts";
import { Bookmark, BookmarkId } from "../../core/bookmark/bookmark.ts";

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

Deno.test("JsonRepository - findAll() returns bookmarks from existing file", async () => {
  const tempDir = await Deno.makeTempDir();
  const jsonFile = `${tempDir}/bookmarks.json`;

  const testData: IBookmarkDto[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Bookmark",
      url: "https://example.com",
      tags: ["test"],
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
  ];

  await Deno.writeTextFile(jsonFile, JSON.stringify(testData, null, 2));

  const repository = createBookmarkJsonRepository(tempDir);
  const result = await repository.findAll();

  assertEquals(Result.isSuccess(result), true);
  if (Result.isSuccess(result)) {
    assertEquals(result.value.length, 1);
    assertEquals(result.value[0].id, "550e8400-e29b-41d4-a716-446655440000");
    assertEquals(result.value[0].title, "Test Bookmark");
  }

  await Deno.remove(tempDir, { recursive: true });
});

Deno.test("JsonRepository - findById() returns bookmark when exists", async () => {
  const tempDir = await Deno.makeTempDir();
  const jsonFile = `${tempDir}/bookmarks.json`;

  const testData: IBookmarkDto[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Bookmark",
      url: "https://example.com",
      tags: ["test"],
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Another Bookmark",
      url: "https://example2.com",
      tags: ["test2"],
      createdAt: "2023-01-02T00:00:00.000Z",
      updatedAt: "2023-01-02T00:00:00.000Z",
    },
  ];

  await Deno.writeTextFile(jsonFile, JSON.stringify(testData, null, 2));

  const repository = createBookmarkJsonRepository(tempDir);
  const result = await repository.findById(
    "550e8400-e29b-41d4-a716-446655440001" as BookmarkId,
  );

  assertEquals(Result.isSuccess(result), true);
  if (Result.isSuccess(result) && result.value) {
    assertEquals(result.value.id, "550e8400-e29b-41d4-a716-446655440001");
    assertEquals(result.value.title, "Another Bookmark");
  }

  await Deno.remove(tempDir, { recursive: true });
});

Deno.test("JsonRepository - findById() returns null when not exists", async () => {
  const tempDir = await Deno.makeTempDir();
  const jsonFile = `${tempDir}/bookmarks.json`;

  const testData: IBookmarkDto[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Bookmark",
      url: "https://example.com",
      tags: ["test"],
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
  ];

  await Deno.writeTextFile(jsonFile, JSON.stringify(testData, null, 2));

  const repository = createBookmarkJsonRepository(tempDir);
  const result = await repository.findById("non-existent-id" as BookmarkId);

  assertEquals(Result.isSuccess(result), true);
  if (Result.isSuccess(result)) {
    assertEquals(result.value, null);
  }

  await Deno.remove(tempDir, { recursive: true });
});

Deno.test("JsonRepository - save() creates new bookmark when file doesn't exist", async () => {
  const tempDir = await Deno.makeTempDir();

  const newBookmark = {
    id: "550e8400-e29b-41d4-a716-446655440000" as BookmarkId,
    title: "New Bookmark",
    url: "https://example.com",
    tags: ["new"],
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    updatedAt: new Date("2023-01-01T00:00:00.000Z"),
  } as Bookmark;

  const repository = createBookmarkJsonRepository(tempDir);
  const result = await repository.save(newBookmark);

  assertEquals(Result.isSuccess(result), true);
  if (Result.isSuccess(result)) {
    assertEquals(result.value.id, "550e8400-e29b-41d4-a716-446655440000");
    assertEquals(result.value.title, "New Bookmark");
  }

  // Verify file was created
  const findAllResult = await repository.findAll();
  assertEquals(Result.isSuccess(findAllResult), true);
  if (Result.isSuccess(findAllResult)) {
    assertEquals(findAllResult.value.length, 1);
    assertEquals(
      findAllResult.value[0].id,
      "550e8400-e29b-41d4-a716-446655440000",
    );
  }

  await Deno.remove(tempDir, { recursive: true });
});
