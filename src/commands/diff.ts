/**
 * @file diff.ts
 * @description Implements the “diff” command for corev CLI.
 *
 * The "diff" command compares two configuration JSON files and displays their differences.
 * It supports both files that contain the full configuration object, and those that have a
 * nested “config” property. Differences are output with colorized formatting.
 *
 * Example:
 *
 *		corev diff configs/codex@1.0.0.json configs/codex@1.0.1.json
 *
 * @author 		Doğu Abaris <abaris@null.net>
 * @license 	MIT
 * @see 		README.md for more details on using corev.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {diffString} from 'json-diff';
import {Command} from 'commander';

const diff = new Command('diff');

diff
	.arguments('<fileA> <fileB>')
	.description('Show differences between two config JSON files')
	.action((fileA: string, fileB: string) => {
		const filepathA = path.resolve(fileA);
		const filepathB = path.resolve(fileB);

		if (!fs.existsSync(filepathA)) {
			console.error(chalk.red(`File not found: ${filepathA}`));
			process.exit(1);
		}

		if (!fs.existsSync(filepathB)) {
			console.error(chalk.red(`File not found: ${filepathB}`));
			process.exit(1);
		}

		const rawA = JSON.parse(fs.readFileSync(filepathA, 'utf-8'));
		const rawB = JSON.parse(fs.readFileSync(filepathB, 'utf-8'));

		const diffOutput = diffString(rawA, rawB, {color: true});

		if (!diffOutput || diffOutput.trim() === '{}') {
			console.log(chalk.green('No differences found.'));
		} else {
			console.log(chalk.yellow('Differences:'));
			console.log(diffOutput);
		}
	});

export default diff;
