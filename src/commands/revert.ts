/**
 * @file revert.ts
 * @description Implements the “revert” command for the corev CLI tool.
 *
 * The “revert” command reverts the remote configuration for a specified project
 * and environment to a previous version by re-pushing a local configuration file.
 *
 * Usage:
 *
 *   corev revert <project> <version> [--env <environment>]
 *
 * Examples:
 *   corev revert atlas 1.0.0
 *   corev revert codex 2.1.4 --env staging
 *
 * Upon success, the older configuration is re-pushed to the API and becomes the new
 * “latest” configuration for that project in the specified environment.
 *
 * @author     Doğu Abaris <abaris@null.net>
 * @license    MIT
 * @see        README.md for more details on using corev.
 */

import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import {Command} from 'commander';
import {getApiBase, getConfigPath, getToken, loadConfig} from '../services/configService';
import {validateConfig} from '../services/configValidator';
import {Configuration} from '../types';
import * as readline from 'node:readline';

const revert = new Command('revert');

/**
 * Prompts the user with a question and returns their answer.
 * @param query The question to display.
 * @returns A promise that resolves with the user’s answer.
 */
function askForConfirmation(query: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise(resolve => {
		rl.question(query, answer => {
			rl.close();
			resolve(answer);
		});
	});
}

revert
	.name('revert')
	.usage('<project> <version> [--env <environment>]')
	.description('Revert a project config to a specific version (optionally for an environment)')
	.argument('<project>', 'Project name (slug)')
	.argument('<version>', 'Version string to revert to')
	.option('--env <environment>', 'Specify environment to revert config into')
	.action(async (project: string, version: string, options: { env?: string }) => {
		const {env} = options;
		const filename = `${project}@${version}.json`;
		const filepath = getConfigPath(project, version, env);
		const spinner = ora(`Reverting ${project} to ${version}${env ? ` (env: ${env})` : ''}...`).start();

		if (!fs.existsSync(filepath)) {
			spinner.fail(`Local config file not found: ${filepath}`);
			console.error(chalk.red(`Make sure the file exists before reverting.`));
			process.exit(1);
		}

		try {
			const api = getApiBase();
			const token = getToken();
			const headers: Record<string, string> = {
				...(token ? {'x-corev-secret': token} : {}),
				...(env ? {'x-corev-env': env} : {}),
				'x-corev-action': 'revert',
			};

			const {valid, errors} = validateConfig(filepath);
			if (!valid) {
				spinner.fail('Validation failed for local config file.');
				errors?.forEach(err => console.error(chalk.red(`  - ${err}`)));
				process.exit(1);
			}

			const payload = loadConfig(filepath) as Configuration;

			if (payload.name !== project || payload.version !== version) {
				spinner.warn(`Warning: ${filename} contains mismatched name/version.`);
				const answer = await askForConfirmation('Continue anyway? (y/N): ');
				if (answer.trim().toLowerCase() !== 'y') {
					spinner.info('Revert aborted.');
					process.exit(0);
				}
			}

			await axios.post(`${api}/configs/${project}`, payload, {headers});
			spinner.succeed(`Successfully reverted ${chalk.cyan(project)} to version ${chalk.green(version)}${env ? ` (env: ${chalk.gray(env)})` : ''}`);
		} catch (error: unknown) {
			spinner.fail(`Revert failed for ${project}@${version}.`);
			if (axios.isAxiosError(error)) {
				console.error(chalk.red(`API Error: ${error.message} (${error.response?.status})`));
				if (error.response?.data?.message) {
					console.error(chalk.red(`Server message: ${error.response.data.message}`));
				}
			} else {
				console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error occurred.'));
			}
			process.exit(1);
		}
	});

export default revert;
