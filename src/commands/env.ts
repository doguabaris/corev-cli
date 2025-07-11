/**
 * @file env.ts
 * @description Implements the “env” command for the corev CLI tool.
 *
 * This command allows users to create environment-specific directories under
 * `configs/<project>/env/`, so they can organize configs per environment:
 *
 *   configs/atlas/env/staging/atlas@1.0.0.json
 *   configs/atlas/env/dev/atlas@1.0.0.json
 *   configs/atlas/env/test/atlas@1.0.0.json
 *
 * Usage:
 *
 * 		corev env <project> <env>
 *
 * Example:
 *
 * 		corev env atlas staging
 *
 * This creates the directory: configs/atlas/env/staging/
 *
 * A `README.txt` file is also created inside the environment folder to clarify its purpose.
 *
 * @author     Doğu Abaris <abaris@null.net>
 * @license    MIT
 * @see        README.md for more details on using corev.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {Command} from 'commander';

const env = new Command('env');

env
	.arguments('<project> <env>')
	.description('Create an environment folder under configs/<project>/env/<env>')
	.action((project: string, env: string) => {
		const targetPath = path.resolve('configs', project, 'env', env);

		if (fs.existsSync(targetPath)) {
			console.log(chalk.yellow(`⚠ Environment '${env}' already exists for project '${project}' at ${targetPath}`));
			return;
		}

		try {
			fs.mkdirSync(targetPath, {recursive: true});

			const readmeContent = `This folder contains environment-specific config files for project '${project}', environment '${env}'.\n\nUse <project>@<version>.json naming inside this folder.`;
			fs.writeFileSync(path.join(targetPath, 'README.txt'), readmeContent);

			console.log(chalk.green(`✔ Created: ${targetPath}`));
		} catch (err) {
			console.error(chalk.red(`✖ Failed to create environment folder: ${err}`));
		}
	});

export default env;
