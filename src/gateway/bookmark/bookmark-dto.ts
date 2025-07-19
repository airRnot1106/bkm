export interface IBookmarkDto {
  id: string; // BookmarkId
  title: string; // BookmarkTitle
  url: string; // BookmarkUrl
  tags: string[]; // Array of BookmarkTag
  createdAt: Date; // ISO string
  updatedAt: Date; // ISO string
}
