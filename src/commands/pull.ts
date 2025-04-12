/**
 * @file pull.ts
 * @description Implements the “pull” command for the corev CLI tool.
 *
 * The “pull” command retrieves the latest configuration for a specified project from
 * the remote API and saves it locally under the "configs/" directory. The remote API is
 * expected to return a JSON object in the following format:
 *
 * {
 *   "version": "x.y.z",
 *   "config": { ... }
 * }
 *
 * The API base URL is get from a local configuration file (.corevrc.json), which is
 * created via the “init” command.
 *
 * Usage:
 *   corev pull <project>
 *
 * Example:
 *   corev pull atlas
 *
 * Upon success, the configuration is saved as:
 *   configs/<project>@<version>.json
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import {Command} from 'commander';
import {getApiBase, saveConfig} from '../services/configService';
import {validateConfig} from '../services/configValidator';

const pull = new Command('pull');

pull
	.arguments('<project>')
	.description('Pull latest config for a project')
	.action(async (project: string) => {
		const spinner = ora(`Fetching config for "${project}"`).start();

		try {
			const api = getApiBase();
			const res = await axios.get(`${api}/configs/${project}/latest`);
			const {config, version} = res.data;

			saveConfig(project, version, { name: project, version, config });

			const filePath = path.resolve(`configs/${project}@${version}.json`);
			const {valid, errors} = validateConfig(filePath);

			if (!valid) {
				spinner.warn(`Config pulled but failed schema validation.`);
				console.warn(chalk.yellow('Validation issues:'));
				errors?.forEach(err => console.warn(chalk.yellow(`  - ${err}`)));
			} else {
				spinner.succeed(`Config saved for ${chalk.cyan(project)} version ${chalk.green(version)}`);
			}
		} catch (error: unknown) {
			spinner.fail('Failed to fetch config.');
			if (error instanceof Error) {
				console.error(chalk.red(error.message));
			} else {
				console.error(chalk.red('Unknown error occurred.'));
			}
		}
	});

export default pull;
