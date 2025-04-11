/**
 * @file push.ts
 * @description Implements the “push” command for the corev CLI tool.
 *
 * The “push” command sends a local configuration file to a remote API. The configuration file
 * must follow the naming convention: `<project>@<version>.json`. This command reads the
 * specified file, parses it as JSON, and makes a POST request to the remote API endpoint.
 *
 * The remote API endpoint is determined by the API base URL stored in the local configuration
 * file (".corevrc.json"), which is created via the “init” command. The payload sent to the API
 * should include the version and configuration data.
 *
 * Usage:
 *   corev push <file>
 *
 * Example:
 *   corev push configs/atlas@1.0.0.json
 *
 * The command expects the file name to be in the format:
 *   <project>@<version>.json
 *
 * On success, it prints a success message with the project name, and the HTTP status code returned by the API.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import {Command} from 'commander';
import {getApiBase, loadConfig, parseFilename} from '../services/configService';

const push = new Command('push');

push
	.arguments('<file>')
	.description('Push a config JSON file to the remote server')
	.action(async (file: string) => {
		const spinner = ora(`Uploading ${file}`).start();

		try {
			const api = getApiBase();
			const filepath = path.resolve(file);

			const parsed = parseFilename(path.basename(file));
			if (!parsed) {
				spinner.fail('Invalid filename format. Use <project>@<version>.json');
				console.error(chalk.red(`Invalid file name: ${file}`));
				process.exit(1);
			}

			const {project} = parsed;
			const payload = loadConfig(filepath);

			const res = await axios.post(`${api}/configs/${project}`, payload);

			spinner.succeed(`Pushed config for ${chalk.cyan(project)} (status ${res.status})`);
		} catch (error: unknown) {
			spinner.fail('Failed to push config.');
			if (error instanceof Error) {
				console.error(chalk.red(error.message));
			} else {
				console.error(chalk.red('Unknown error occurred.'));
			}
		}
	});

export default push;
