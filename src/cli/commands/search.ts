import { spawn } from 'node:child_process';
import { Result } from '@praha/byethrow';
import consola from 'consola';
import { define } from 'gunshi';
import type { Bookmark } from '../../core/bookmark';
import { createBookmarkJsonRepository } from '../../gateway/bookmark';
import { createGetBookmarksUseCase } from '../../usecase/get-bookmarks';
import { getBookmarkDataFilePath } from '../utils';

const openInBrowser = (url: string) => {
  const platform = process.platform;
  const command = (() => {
    switch (platform) {
      case 'darwin':
        return 'open';
      case 'win32':
        return 'start';
      default:
        return 'xdg-open';
    }
  })();

  spawn(command, [url], { detached: true, stdio: 'ignore' });
};

const formatBookmarkForFzf = (bookmark: Bookmark): string => {
  const tags = bookmark.tags.length > 0 ? `[${bookmark.tags.join(', ')}]` : '';
  return `${bookmark.title} ${tags} - ${bookmark.url}`;
};

const parseBookmarkFromFzf = (line: string): string => {
  const urlMatch = line.match(/ - (https?:\/\/.+)$/);
  return urlMatch?.[1] ?? '';
};

const search = define({
  name: 'search',
  description:
    'Search bookmarks with fzf and open selected bookmark in browser',
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
      const fzfProcess = spawn('fzf', ['--prompt=Select bookmark: '], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });

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
        const url = parseBookmarkFromFzf(selectedLine.trim());
        if (url) {
          consola.success(`Opening: ${url}`);
          openInBrowser(url);
        } else {
          consola.error('Failed to parse URL from selection');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        consola.error(
          'fzf is not installed. Please install fzf to use the search command.',
        );
      } else {
        consola.error('Error running fzf:', error);
      }
    }
  },
});

export default search;
