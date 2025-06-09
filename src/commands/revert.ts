/**
 * @file revert.ts
 * @description Implements the “revert” command for the corev CLI tool.
 *
 * The “revert” command reverts the remote configuration for a specified project to a
 * previous version by re-pushing an older local configuration.
 *
 * Usage:
 *
 *		corev revert <project> <version>
 *
 * Example:
 *
 *		corev revert atlas 1.0.0
 *
 * Upon success, the older configuration is re-pushed to the API and becomes the new
 * “latest” configuration for that project.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import {Command} from 'commander';
import {getApiBase, getConfigPath, loadConfig} from '../services/configService';
import {validateConfig} from '../services/configValidator';
import {Configuration} from '../types';
import * as readline from "node:readline";

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
	.arguments('<project> <version>')
	.description('Revert the remote config for a project to a specific local version by re-pushing it')
	.action(async (project: string, version: string) => {
		const filename = `${project}@${version}.json`;
		const filepath = getConfigPath(project, version);
		const spinner = ora(`Attempting revert for "${project}" to version "${version}" using ${filename}`).start();

		if (!fs.existsSync(filepath)) {
			spinner.fail(`Local file not found: ${filepath}`);
			console.error(
				chalk.red(`Cannot revert: Version ${version} for project ${project} is not available locally in the 'configs/' directory.`)
			);
			console.error(chalk.yellow(`Hint: You might need to 'pull' or ensure the file ${filename} exists locally.`));
			process.exit(1);
		}

		try {
			const api = getApiBase();

			const {valid, errors} = validateConfig(filepath);
			if (!valid) {
				spinner.fail('Local config file for revert failed schema validation.');
				console.error(chalk.red('Validation errors:'));
				errors?.forEach(err => console.error(chalk.red(`  - ${err}`)));
				process.exit(1);
			}

			const payload = loadConfig(filepath) as Configuration;

			if (payload.name !== project || payload.version !== version) {
				spinner.warn(`Mismatch in file content: File ${filename} contains name "${payload.name}" and version "${payload.version}".`);
				const answer = await askForConfirmation('Proceed with revert? (y/N): ');
				if (answer.trim().toLowerCase() !== 'y') {
					spinner.info('Revert aborted by user.');
					process.exit(0);
				}
			}

			const res = await axios.post(`${api}/configs/${project}`, payload);

			spinner.succeed(`Revert successful for ${chalk.cyan(project)} to version ${chalk.green(version)} (Server status ${res.status})`);
		} catch (error: unknown) {
			spinner.fail(`Failed to revert config for ${project} to ${version}.`);
			if (axios.isAxiosError(error)) {
				console.error(chalk.red(`API Error: ${error.message} (Status: ${error.response?.status})`));
				if (error.response?.data?.message) {
					console.error(chalk.red(`Server Message: ${error.response.data.message}`));
				}
			} else if (error instanceof Error) {
				console.error(chalk.red(error.message));
			} else {
				console.error(chalk.red('Unknown error occurred.'));
			}
			process.exit(1);
		}
	});

export default revert;
