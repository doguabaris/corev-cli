/**
 * @file init.ts
 * @description Implements the “init” command for the corev CLI tool.
 *
 * The "init" command initializes the CLI by setting the API base URL and/or API token,
 * which are saved to a local configuration file (.corevrc.json). This configuration is
 * then used by other commands (pull, push, diff, list) to interact with the remote API.
 *
 * Usage:
 *
 *    corev init --api <url>
 *    corev init --token <secret>
 *    corev init --host
 *    corev init --host --token <secret>
 *
 * This command is intended to be run once to configure the CLI. The saved API endpoint
 * is then automatically loaded by subsequent commands, so the user does not need to
 * repeatedly specify it.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import {Command} from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import {saveApiBase, saveToken} from '../services/configService';

const init = new Command('init');

init
	.description('Initialize corev CLI by setting the API base URL and/or secret token')
	.option('--api <url>', 'Set a custom API endpoint')
	.option('--host', 'Use a self-hosted Corev instance')
	.option('--token <secret>', 'Optional API token to save (applies to all modes)')
	.action(async (options) => {
		let api: string | null = options.api ?? null;
		let token: string | null = options.token ?? null;

		if (options.host) {
			const hostPrompt = await prompts([
				{
					type: 'text',
					name: 'api',
					message: 'Enter your hosted Corev endpoint (e.g., https://corev.example.com):',
					initial: options.api,
					validate: (val) =>
						val.trim() === '' ? 'API endpoint is required for hosted Corev' : true
				},
				{
					type: 'password',
					name: 'token',
					message: 'Enter your API secret token:',
					initial: options.token,
					validate: (val) =>
						val.trim() === '' ? 'API secret token is required' : true
				}
			]);

			api = hostPrompt.api;
			token = hostPrompt.token;
		}

		if (!api && !token) {
			const {mode} = await prompts({
				type: 'select',
				name: 'mode',
				message: 'How would you like to use Corev?',
				choices: [
					{title: 'Use a self-hosted Corev instance', value: 'host'},
					{title: 'Use my own API endpoint', value: 'custom'}
				]
			});

			if (mode === 'host') {
				console.log(
					chalk.yellow(
						'\nNote: You must first deploy the Corev Host backend on your machine before using this option.\n' +
						'Refer to https://github.com/doguabaris/corev-host for setup instructions.\n'
					)
				);

				const hostInput = await prompts([
					{
						type: 'text',
						name: 'api',
						message: 'Enter your hosted Corev endpoint (e.g., https://corev.example.com):',
						validate: (val) =>
							val.trim() === '' ? 'API endpoint is required for hosted Corev' : true
					},
					{
						type: 'password',
						name: 'token',
						message: 'Enter your API secret token:',
						validate: (val) =>
							val.trim() === '' ? 'API secret token is required' : true
					}
				]);
				api = hostInput.api;
				token = hostInput.token;

			} else if (mode === 'custom') {
				const customInput = await prompts([
					{
						type: 'text',
						name: 'api',
						message: 'Enter your custom API endpoint (e.g., http://localhost:3000):',
						validate: (val) =>
							val.trim() === '' ? 'API endpoint is required' : true
					},
					{
						type: 'password',
						name: 'token',
						message: 'Enter your API secret token (optional):'
					}
				]);
				api = customInput.api;
				token = customInput.token;
			}
		}

		if (!api && !token) {
			console.log(chalk.red('✖ At least one of --api or --token must be provided.'));
			process.exit(1);
		}

		if (api) {
			saveApiBase(api.trim().toLowerCase());
			console.log(chalk.green(`✔ Corev configured with: ${api}`));
		}

		if (token) {
			saveToken(token.trim());
			console.log(chalk.gray('✔ Token saved to config'));
		}
	});

export default init;
