/**
 * @file push.ts
 * @description Implements the “push” command for the corev CLI tool.
 *
 * The “push” command sends a local configuration file to a remote API. The configuration file
 * must follow the naming convention: `<project>@<version>.json`. This command reads the
 * specified file, parses it as JSON, validates it, and makes a POST request to the remote API endpoint.
 *
 * The `<file>` argument must be a path to a local JSON file, either relative or absolute.
 * The **filename itself** must follow the format `<project>@<version>.json`, regardless of the folder structure.
 *
 * The remote API endpoint is determined by the API base URL stored in the local configuration
 * file (".corevrc.json"), which is created via the “init” command. The payload sent to the API
 * includes the version and validated configuration data.
 *
 * Usage:
 *   corev push <path-to-config-file>
 *
 * Valid examples:
 *   corev push configs/atlas@1.0.0.json
 *   corev push ./atlas@1.2.3.json
 *   corev push /Users/username/Desktop/demo@2.0.0.json.
 *
 * Invalid filename formats:
 *   corev push my-config.json
 *   corev push config-v1.json
 *   corev push data.json
 *
 * On success, a message is printed with the project name, and the HTTP status code returned by the API.
 *
 * @author     Doğu Abaris <abaris@null.net>
 * @license    MIT
 * @see        README.md for more details on using corev.
 */


import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import {Command} from 'commander';
import {getApiBase, getToken, loadConfig, parseFilename} from '../services/configService';
import {validateConfig} from '../services/configValidator';
import {Configuration} from "../types";

const push = new Command('push');

push
	.argument('<file>', 'Path to the config JSON file')
	.option('--env <environment>', 'Specify environment to push config into')
	.description('Push a config JSON file to the remote server')
	.action(async (file: string, options: { env?: string }) => {
		const {env} = options;
		const spinner = ora(`Uploading ${file}${env ? ` (env: ${env})` : ''}`).start();

		try {
			const api = getApiBase();
			const token = getToken();
			const headers: Record<string, string> = {
				...(token ? {'x-corev-secret': token} : {}),
				...(env ? {'x-corev-env': env} : {}),
				'x-corev-action': 'push'
			};

			const filepath = path.resolve(file);
			const parsed = parseFilename(path.basename(file));
			if (!parsed) {
				spinner.fail('Invalid filename format. Use <project>@<version>.json');
				console.error(chalk.red(`Invalid file name: ${file}`));
				process.exit(1);
			}

			const {project} = parsed;
			const payload = loadConfig(filepath) as Configuration;

			const {valid, errors} = validateConfig(filepath);
			if (!valid) {
				spinner.fail('Schema validation failed.');
				console.error(chalk.red('Validation errors:'));
				errors?.forEach(err => console.error(chalk.red(`  - ${err}`)));
				process.exit(1);
			}

			const res = await axios.post(`${api}/configs/${project}`, payload, {headers});

			spinner.succeed(`Pushed config for ${chalk.cyan(project)} (status ${res.status})${env ? ` to env: ${chalk.gray(env)}` : ''}`);
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
