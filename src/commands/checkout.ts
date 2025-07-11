/**
 * @file checkout.ts
 * @description Implements the “checkout” command for the corev CLI tool.
 *
 * The “checkout” command retrieves a specific configuration version for a specified project from
 * the remote API and saves it locally under the "configs/" directory. This allows users to
 * temporarily or permanently switch their local working configuration to an older or specific
 * named version. The remote API is expected to return a JSON object in the following format:
 *
 * {
 *   "name": "project-name",
 * 	 "version": "x.y.z",
 * 	 "config": { ... }
 * }
 *
 * The API base URL is get from a local configuration file (.corevrc.json), which is
 * created via the “init” command.
 *
 * Usage:
 *
 * 		corev checkout <project> <version>
 *
 * Example:
 *
 * 		corev checkout atlas 1.0.0
 *
 * Upon success, the configuration is saved as: configs/<project>@<version>.json
 *
 * @author 		Doğu Abaris <abaris@null.net>
 * @license 	MIT
 * @see 		README.md for more details on using corev.
 */

import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import {Command} from 'commander';
import {getApiBase, getToken, saveConfig} from '../services/configService';
import {validateConfig} from '../services/configValidator';
import {Configuration} from '../types';

const checkout = new Command('checkout');

checkout
	.arguments('<project> <version>')
	.description('Checkout a specific config version for a project and save it locally')
	.action(async (project: string, version: string) => {
		const spinner = ora(`Attempting to checkout config for "${project}" version "${version}"`).start();

		try {
			const api = getApiBase();
			const token = getToken();
			const headers = token ? {'x-corev-secret': token} : {};
			const res = await axios.get<Configuration>(
				`${api}/configs/${project}/${version}`,
				{headers}
			);
			const {name, config, version: fetchedVersion} = res.data;

			if (name !== project || fetchedVersion !== version) {
				spinner.warn(`Mismatched config received. Expected project "${project}" version "${version}", got "${name}" version "${fetchedVersion}".`);
			}

			saveConfig(project, fetchedVersion, {name, version: fetchedVersion, config});

			const filePath = path.resolve(`configs/${project}/${project}@${fetchedVersion}.json`);
			const {valid, errors} = validateConfig(filePath);

			if (!valid) {
				spinner.warn(`Config checked out but failed schema validation.`);
				console.warn(chalk.yellow('Validation issues:'));
				errors?.forEach(err => console.warn(chalk.yellow(`  - ${err}`)));
			} else {
				spinner.succeed(`Config checked out for ${chalk.cyan(project)} version ${chalk.green(fetchedVersion)}`);
			}
		} catch (error: unknown) {
			spinner.fail(`Failed to checkout config for ${project} version ${version}.`);
			if (axios.isAxiosError(error)) {
				console.error(chalk.red(`API Error: ${error.message} (Status: ${error.response?.status || 'N/A'})`));
				if (error.response?.data?.message) {
					console.error(chalk.red(`Server Message: ${error.response.data.message}`));
				}
				if (error.response?.status === 404) {
					console.error(chalk.yellow(`Hint: Version '${version}' for project '${project}' might not exist on the remote server.`));
				}
			} else if (error instanceof Error) {
				console.error(chalk.red(error.message));
			} else {
				console.error(chalk.red('Unknown error occurred.'));
			}
			process.exit(1);
		}
	});

export default checkout;
