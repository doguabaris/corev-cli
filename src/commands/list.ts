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
 * versions available for each project, optionally including environment-specific
 * folders (e.g., "env/staging").
 *
 * Usage:
 *
 *		corev list
 *
 * Example:
 *
 *		corev list
 *
 * The command outputs a colorized list using chalk to improve readability.
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

/**
 * Recursively finds all JSON config files under a directory.
 * @param baseDir The base directory to scan.
 * @returns A list of relative file paths ending with .json.
 */
function findJsonFiles(baseDir: string): string[] {
	const results: string[] = [];

	function walk(dir: string) {
		const files = fs.readdirSync(dir);

		for (const file of files) {
			const fullPath = path.join(dir, file);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				walk(fullPath);
			} else if (stat.isFile() && file.endsWith('.json')) {
				results.push(path.relative(baseDir, fullPath));
			}
		}
	}

	walk(baseDir);
	return results;
}

list
	.description('List all local config versions (across projects and environments)')
	.action(() => {
		const configsDir = path.resolve('configs');

		if (!fs.existsSync(configsDir)) {
			console.log(chalk.yellow('No configs/ directory found.'));
			return;
		}

		const files = findJsonFiles(configsDir);
		if (files.length === 0) {
			console.log(chalk.yellow('No config files found.'));
			return;
		}

		const grouped: Record<string, Record<string, string[]>> = {};

		for (const filePath of files) {
			const filename = path.basename(filePath);
			const match = filename.match(/^(.+?)@(.+?)\.json$/);
			if (!match) continue;

			const [, , version] = match;

			const parts = filePath.split(path.sep);
			const project = parts[0];
			const envIndex = parts.indexOf('env');
			const env = envIndex !== -1 ? parts[envIndex + 1] : 'default';

			if (!grouped[project]) grouped[project] = {};
			if (!grouped[project][env]) grouped[project][env] = [];

			grouped[project][env].push(version);
		}

		for (const [project, envs] of Object.entries(grouped)) {
			console.log(chalk.cyan(`\n${project}:`));
			for (const [env, versions] of Object.entries(envs)) {
				const label = env === 'default' ? '(default)' : `(env: ${env})`;
				console.log(`  ${chalk.gray(label)}`);
				for (const version of versions.sort()) {
					console.log(`    - ${chalk.green(version)}`);
				}
			}
		}
	});

export default list;
