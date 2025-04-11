#!/usr/bin/env node
/**
 * @file index.ts
 * @description Entry point for the cono CLI tool.
 *
 * The cono CLI tool is a minimal command line interface designed for managing versioned
 * configuration files across projects and environments. It supports the following operations:
 *
 *  — init: Initialize the CLI with a central API endpoint. This creates a configuration
 *    file (".conorc.json") that stores the API base URL for future commands.
 *
 *  — pull: Pull the latest configuration for a given project from the remote API and
 *    store it locally.
 *
 *  — push: Push a local configuration file to the remote API.
 *
 *  — diff: Display differences between two configuration files.
 *
 *  — list: List all available configuration versions stored locally.
 *
 * This tool is intended for use in distributed environments, but is general enough
 * to be applied to any scenario requiring efficient versioned configuration management.
 *
 * @example
 *   // Initialize the CLI with an API endpoint:
 *   cono init --api http://localhost:3000
 *
 *   // Pull the latest configuration for a project:
 *   cono pull codex
 *
 *   // Push a local configuration file:
 *   cono push configs/codex@1.0.0.json
 *
 *   // Show differences between two configuration files:
 *   cono diff configs/codex@1.0.0.json configs/codex@1.0.1.json
 *
 *   // List all local configuration versions:
 *   cono list
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using cono.
 */

import {Command} from 'commander';
import pull from './commands/pull';
import push from './commands/push';
import diff from './commands/diff';
import list from './commands/list';
import init from './commands/init';

const program = new Command();

program
	.name('cono')
	.description('CLI for managing versioned configuration files across projects and environments');

program.addCommand(pull);
program.addCommand(push);
program.addCommand(diff);
program.addCommand(list);
program.addCommand(init);

if (!process.argv.slice(2).length) {
	program.outputHelp();
	process.exit(0);
}

program.parse();
