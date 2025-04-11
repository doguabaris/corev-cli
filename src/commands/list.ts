/**
 * @file list.ts
 * @description Implements the “list” command for the corev CLI tool.
 *
 * The “list” command scans the local configuration storage directory ("configs/")
 * for JSON files that follow the naming convention:
 *
 *   <project>@<version>.json
 *
 * It groups these files by project and displays a formatted list of configuration
 * versions available for each project. For example, a file named "atlas@1.0.0.json"
 * indicates that the configuration for project “atlas” is at a version "1.0.0".
 *
 * Usage:
 *   corev list
 *
 * The command outputs a colorized list using chalk to improve readability.
 *
 * @example
 *   $ corev list
 *
 *   atlas:
 *     — 1.0.0
 *     — 1.0.1
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {Command} from 'commander';

const list = new Command('list');

list
	.description('List all local config versions')
	.action(() => {
		const configsDir = path.resolve('configs');

		if (!fs.existsSync(configsDir)) {
			console.log(chalk.yellow('No configs directory found.'));
			return;
		}

		const files = fs.readdirSync(configsDir).filter(f => f.endsWith('.json'));

		if (files.length === 0) {
			console.log(chalk.yellow('No config files found.'));
			return;
		}

		const grouped: Record<string, string[]> = {};

		for (const file of files) {
			const match = file.match(/^(.+?)@(.+?)\.json$/);
			if (match) {
				const [, project, version] = match;
				grouped[project] = grouped[project] || [];
				grouped[project].push(version);
			}
		}

		for (const [project, versions] of Object.entries(grouped)) {
			console.log(chalk.cyan(`\n${project}:`));
			for (const version of versions.sort()) {
				console.log(`  — ${chalk.green(version)}`);
			}
		}
	});

export default list;
