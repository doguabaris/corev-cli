#!/usr/bin/env node
/**
 * @file cli.ts
 * @description Entry point for the corev CLI tool.
 *
 * The Corev CLI is a minimal command line interface designed for managing versioned
 * configuration files across projects and environments. It supports the following operations:
 *
 *  - init: Initialize the CLI with a central API endpoint. This creates a configuration
 *    file (".corevrc.json") that stores the API base URL for future commands.
 *
 *  - pull: Pull the latest configuration for a given project from the remote API and
 *    store it locally.
 *
 *  - push: Push a local configuration file to the remote API.
 *
 *  - diff: Display differences between two configuration files.
 *
 *  - list: List all available configuration versions stored locally.
 *
 * 	- revert: Revert a project to a previous config version.
 *
 *  - checkout: Retrieve a specific configuration version from the remote API
 *
 *  - env: Manage per-project environments (e.g., staging, dev, test).
 *
 * This tool is intended for use in distributed environments, but is general enough
 * to be applied to any scenario requiring efficient versioned configuration management.
 *
 * @example
 *   // Initialize the CLI with an API endpoint:
 *   corev init --api http://localhost:3000
 *
 *   // Pull the latest configuration for a project:
 *   corev pull codex
 *
 *   // Push a local configuration file:
 *   corev push configs/codex@1.0.0.json
 *
 *   // Show differences between two configuration files:
 *   corev diff configs/codex@1.0.0.json configs/codex@1.0.1.json
 *
 *   // List all local configuration versions:
 *   corev list
 *
 *   // Revert the remote configuration for a project to a previous version:
 *   corev revert atlas 1.0.0
 *
 *   // Checkout a specific configuration version from the API:
 *   corev checkout atlas 1.0.0
 *
 *   // Add a new environment for a project (e.g., staging):
 *   corev env add staging
 *
 *@author		Doğu Abaris <abaris@null.net>
 *@license		MIT
 *@see			README.md for more details on using corev.
 */

import figlet from 'figlet';
import {Command} from 'commander';
import pull from './commands/pull';
import push from './commands/push';
import diff from './commands/diff';
import list from './commands/list';
import init from './commands/init';
import revert from './commands/revert';
import checkout from './commands/checkout';
import env from "./commands/env";
import path from "path";
import fs from "fs";
import chalk from "chalk";

const pkg = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
	.name('corev')
	.description('CLI for managing versioned configuration files across projects and environments')
	.version(pkg.version, '-v, --version', 'Display CLI version');

program.addCommand(pull);
program.addCommand(push);
program.addCommand(diff);
program.addCommand(list);
program.addCommand(init);
program.addCommand(revert)
program.addCommand(checkout)
program.addCommand(env)

if (!process.argv.slice(2).length) {
	const banner = figlet.textSync('COREV', {font: 'Block'});
	console.log(chalk.hex('#aeffde')(banner));
	program.outputHelp();
	process.exit(0);
} else {
	program.parse();
}
