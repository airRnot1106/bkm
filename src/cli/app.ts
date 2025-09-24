import consola from 'consola';
import { type Args, type CliOptions, cli, define } from 'gunshi';
import { description, name, version } from '../../package.json';
import add from './commands/add.js';

const main = define({
  name,
  description,
  run: () => {
    consola.info('Hello, World');
  },
});

const subCommands = new Map([['add', add]]);

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
