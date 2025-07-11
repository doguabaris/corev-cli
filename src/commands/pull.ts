/**
 * @file pull.ts
 * @description Implements the “pull” command for the corev CLI tool.
 *
 * The “pull” command retrieves the latest configuration for a specified project from
 * the remote API and saves it locally under the "configs/<project>/" directory.
 * If the `--env` flag is provided, the configuration is saved under:
 *   configs/<project>/env/<env>/<project>@<version>.json
 *
 * The remote API is expected to return a JSON object in the following format:
 *
 * {
 *   "name": "project",
 *   "version": "x.y.z",
 *   "config": { ... }
 * }
 *
 * The API base URL is retrieved from the local configuration file (.corevrc.json),
 * created via the “init” command.
 *
 * Usage:
 *
 *		corev pull <project> [--env <environment>]
 *
 * Example:
 *
 *		corev pull atlas
 *		corev pull atlas --env staging
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
import {getApiBase, getToken, saveConfig} from '../services/configService';
import {validateConfig} from '../services/configValidator';
import {Configuration} from '../types';

const pull = new Command('pull');

pull
	.arguments('<project>')
	.option('--env <environment>', 'Specify the environment to pull config into')
	.description('Pull latest config for a project (optionally for a specific environment)')
	.action(async (project: string, options: { env?: string }) => {
		const {env} = options;
		const spinner = ora(`Fetching config for "${project}"${env ? ` (env: ${env})` : ''}`).start();

		try {
			const api = getApiBase();
			const token = getToken();
			const headers: Record<string, string> = {
				...(token ? {'x-corev-secret': token} : {}),
				...(env ? {'x-corev-env': env} : {}),
			};

			const res = await axios.get<Configuration>(
				`${api}/configs/${project}/latest`,
				{headers}
			);

			const {name, version, config} = res.data;

			saveConfig(project, version, {name, version, config}, env);

			const filePath = env
				? path.resolve(`configs/${project}/env/${env}/${project}@${version}.json`)
				: path.resolve(`configs/${project}/${project}@${version}.json`);

			const {valid, errors} = validateConfig(filePath);

			if (!valid) {
				spinner.warn(`Config pulled but failed schema validation.`);
				console.warn(chalk.yellow('Validation issues:'));
				errors?.forEach(err => console.warn(chalk.yellow(`  - ${err}`)));
			} else {
				spinner.succeed(`Config saved for ${chalk.cyan(project)} version ${chalk.green(version)}${env ? ` (env: ${env})` : ''}`);
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
