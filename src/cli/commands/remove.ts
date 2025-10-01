import { spawn } from 'node:child_process';
import { Result } from '@praha/byethrow';
import consola from 'consola';
import { define } from 'gunshi';
import type { Bookmark } from '../../core/bookmark';
import { BookmarkId } from '../../core/bookmark';
import { createBookmarkJsonRepository } from '../../gateway/bookmark';
import { createGetBookmarksUseCase } from '../../usecase/get-bookmarks';
import { createRemoveBookmarkUseCase } from '../../usecase/remove-bookmark';
import { getBookmarkDataFilePath } from '../utils';

const formatBookmarkForFzf = (bookmark: Bookmark): string => {
  const tags = bookmark.tags.length > 0 ? `[${bookmark.tags.join(', ')}]` : '';
  return `${bookmark.title} ${tags} - ${bookmark.url} (ID: ${bookmark.id})`;
};

const parseBookmarkIdFromFzf = (line: string): string => {
  const idMatch = line.match(/\(ID: ([^)]+)\)$/);
  return idMatch?.[1] ?? '';
};

const remove = define({
  name: 'remove',
  description: 'Remove a bookmark by selecting from fzf',
  args: {},
  run: async () => {
    const repository = createBookmarkJsonRepository(getBookmarkDataFilePath());
    const getBookmarks = createGetBookmarksUseCase(repository);

    const result = await getBookmarks();

    if (Result.isFailure(result)) {
      consola.error('Failed to get bookmarks:', result.error);
      return;
    }

    const bookmarks = result.value;

    if (bookmarks.length === 0) {
      consola.info('No bookmarks found');
      return;
    }

    const fzfInput = bookmarks.map(formatBookmarkForFzf).join('\n');

    try {
      const fzfProcess = spawn(
        'fzf',
        ['--prompt=Select bookmark to remove: '],
        {
          stdio: ['pipe', 'pipe', 'inherit'],
        },
      );

      fzfProcess.stdin.write(fzfInput);
      fzfProcess.stdin.end();

      let selectedLine = '';
      fzfProcess.stdout.on('data', (data) => {
        selectedLine += data.toString();
      });

      await new Promise<void>((resolve, reject) => {
        fzfProcess.on('close', (code) => {
          if (code === 0 || code === 130) {
            resolve();
          } else {
            reject(new Error(`fzf exited with code ${code}`));
          }
        });
      });

      if (selectedLine.trim()) {
        const bookmarkIdString = parseBookmarkIdFromFzf(selectedLine.trim());
        if (!bookmarkIdString) {
          consola.error('Failed to parse bookmark ID from selection');
          return;
        }

        const selectedBookmark = bookmarks.find(
          (b) => b.id === bookmarkIdString,
        );
        if (!selectedBookmark) {
          consola.error('Selected bookmark not found');
          return;
        }

        // Show confirmation prompt
        consola.info(`You are about to delete:`);
        consola.info(`  Title: ${selectedBookmark.title}`);
        consola.info(`  URL: ${selectedBookmark.url}`);
        consola.info(`  Tags: ${selectedBookmark.tags.join(', ') || 'None'}`);

        const confirmed = await consola.prompt(
          'Are you sure you want to delete this bookmark?',
          {
            type: 'confirm',
            initial: false,
          },
        );

        if (confirmed) {
          const bookmarkId = BookmarkId.parse(bookmarkIdString);
          const removeBookmark = createRemoveBookmarkUseCase(repository);

          const removeResult = await removeBookmark({ id: bookmarkId });

          if (Result.isSuccess(removeResult)) {
            consola.success('Bookmark deleted successfully');
          } else {
            consola.error('Failed to delete bookmark:', removeResult.error);
          }
        } else {
          consola.info('Deletion cancelled');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        consola.error(
          'fzf is not installed. Please install fzf to use the remove command.',
        );
      } else {
        consola.error('Error running fzf:', error);
      }
    }
  },
});

export default remove;
