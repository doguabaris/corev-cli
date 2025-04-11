/**
 * @file init.ts
 * @description Implements the “init” command for the corev CLI tool.
 *
 * The "init" command initializes the CLI by setting the API base URL, which is saved
 * to a local configuration file (.corevrc.json). This configuration is then used by
 * other commands (pull, push, diff, list) to interact with the remote configuration API.
 *
 * Usage:
 *   corev init --api <url>
 *
 * Example:
 *   corev init --api http://localhost:3000
 *
 * This command is intended to be run once to configure the CLI. The saved API endpoint
 * is then automatically loaded by subsequent commands, so the user does not need to
 * repeatedly specify it.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import {Command} from 'commander';
import chalk from 'chalk';
import {saveApiBase} from '../services/configService';

const init = new Command('init');

init
	.requiredOption('--api <url>', 'Set the base URL for the configuration API')
	.description('Initialize corev CLI by saving the API base URL')
	.action((options) => {
		saveApiBase(options.api);
		console.log(chalk.green(`API base URL saved as: ${options.api}`));
	});

export default init;
