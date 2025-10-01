import { type Args, type CliOptions, cli, define } from 'gunshi';
import { description, name, version } from '../../package.json';
import add from './commands/add';
import remove from './commands/remove';
import search from './commands/search';

const main = define({
  name: 'search',
  description: 'Search bookmarks',
  run: async (ctx) => {
    await search.run?.(ctx);
  },
});

const subCommands = new Map([
  ['add', add],
  ['remove', remove],
  ['search', search],
]);

const renderHeader: CliOptions<Args>['renderHeader'] = async ({
  env: { name, version },
  values: { help: isHelp },
}) => (isHelp ? `${name} v${version}` : '');

await cli(process.argv.slice(2), main, {
  name,
  description,
  version,
  renderHeader,
  subCommands,
});
