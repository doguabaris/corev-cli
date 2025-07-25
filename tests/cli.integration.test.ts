/**
 * @file cli.integration.test.ts
 * @description Integration tests for the corev CLI tool.
 *
 * This file contains integration tests for corev, a command line tool for managing
 * versioned configuration files across projects and environments. The tests verify that:
 *
 *  - The “init” command correctly initializes the CLI and saves the API endpoint.
 *  - The “pull” command retrieves the latest configuration from the remote API and saves
 *    it locally in the expected nested format (configs/<project>/<project>@<version>.json).
 *  - The “push” command successfully sends a local configuration file to the remote API.
 *  - The “diff” command outputs the differences between two configuration files.
 *  - The “list” command displays all locally stored configuration versions grouped by project.
 *  - The “revert” command reverts a project to a previous version.
 *  - The “checkout” command retrieves a specific configuration version from the remote API
 *    and saves it in nested format.
 *
 * The tests make use of a mock API server implemented in "tests/mock-api.mjs" to simulate
 * remote responses. The server is started before the tests run and terminated after they
 * complete, and any test files created during the tests are cleaned up.
 *
 * Usage:
 *   Ensure all dependencies are installed, then run:
 *     npm test
 *
 * @author     Doğu Abaris
 * @license    MIT
 * @see        README.md for more details on using corev.
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {promisify} from 'util';
import {execFile as execFileCb, spawn} from 'child_process';
import stripAnsi from 'strip-ansi';
import path from 'path';
import fs from 'fs';
import http from 'http';
import {Configuration} from '../src/types';

const execFile = promisify(execFileCb);
const cliPath = path.resolve('src/cli.ts');
const configDir = path.resolve('configs');
const rcFile = path.resolve('.corevrc.json');
const pulledConfig = path.join(configDir, 'atlas', 'atlas@1.0.0.json');
const pushedConfig = path.join(configDir, 'atlas', 'atlas@1.0.1.json');
const checkedOutConfig101 = path.join(configDir, 'atlas', 'atlas@1.0.1.json');
const nonExistentVersionConfig = path.join(configDir, 'atlas', 'atlas@9.9.9.json');

let mockServer: ReturnType<typeof spawn>;

beforeAll(async () => {
	mockServer = spawn('node', ['tests/mock-api.mjs'], {stdio: 'inherit'});

	await new Promise<void>((resolve) => {
		const check = () => {
			http
				.get('http://localhost:3000/configs/atlas/latest', () => resolve())
				.on('error', () => setTimeout(check, 100));
		};
		check();
	});

	if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
});

afterAll(() => {
	mockServer?.kill();
	[pulledConfig, pushedConfig, rcFile].forEach((f) => {
		if (fs.existsSync(f)) fs.unlinkSync(f);
	});
	const nestedDir = path.join(configDir, 'atlas');
	if (fs.existsSync(nestedDir)) {
		fs.rmSync(nestedDir, {recursive: true, force: true});
	}
	if (fs.existsSync(rcFile)) fs.unlinkSync(rcFile);
	const envPath = path.join(configDir, 'atlas', 'env', 'staging');
	if (fs.existsSync(envPath)) fs.rmSync(envPath, {recursive: true});
});

describe('corev CLI integration', () => {
	it('should init and create .corevrc.json', async () => {
		const {
			stdout,
			stderr
		} = await execFile('ts-node', [cliPath, 'init', '--api', 'http://localhost:3000']);
		const combined = stripAnsi(stdout + stderr);
		expect(combined).toContain('Corev configured with:');
		expect(fs.existsSync(rcFile)).toBe(true);
	});

	it('should pull config and create nested file', async () => {
		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'pull', 'atlas']);
		const combined = stripAnsi(stdout + stderr);
		expect(combined).toMatch(/Config saved for atlas/);
		expect(fs.existsSync(pulledConfig)).toBe(true);

		const content = JSON.parse(fs.readFileSync(pulledConfig, 'utf-8')) as Configuration;
		expect(content.config.foo).toBe('bar');
	});

	it('should push local config to API', async () => {
		const dir = path.dirname(pushedConfig);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

		const payload: Configuration = {
			name: 'atlas',
			version: '1.0.1',
			config: {
				foo: 'bar',
			},
		};
		fs.writeFileSync(pushedConfig, JSON.stringify(payload, null, 2));

		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'push', pushedConfig]);
		const combined = stripAnsi(stdout + stderr);
		expect(combined).toContain('Pushed config for atlas');
	});

	it('should show differences between two config files', async () => {
		const payload: Configuration = {
			name: 'atlas',
			version: '1.0.1',
			config: {
				foo: 'baz',
			},
		};
		fs.writeFileSync(pushedConfig, JSON.stringify(payload, null, 2));

		const {
			stdout,
			stderr
		} = await execFile('ts-node', [cliPath, 'diff', pulledConfig, pushedConfig]);
		const cleaned = stripAnsi(stdout + stderr);

		expect(cleaned).toContain('Differences:');
		expect(cleaned).toMatch(/foo/);
		expect(cleaned).toMatch(/bar/);
		expect(cleaned).toMatch(/baz/);
	});

	it('should list pulled configs', async () => {
		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'list']);
		const cleaned = stripAnsi(stdout + stderr);
		expect(cleaned).toContain('atlas');
		expect(cleaned).toContain('1.0.0');
		expect(cleaned).toContain('1.0.1');
	});

	it('should revert config for atlas to an older version', async () => {
		if (!fs.existsSync(pulledConfig)) {
			throw new Error(`Required file not found: ${pulledConfig}`);
		}

		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'revert', 'atlas', '1.0.0']);
		const combinedOutput = stripAnsi(stdout + stderr);

		expect(combinedOutput).toContain('Successfully reverted atlas to version 1.0.0');
	});

	it('should checkout a specific config version (atlas 1.0.1) and create nested file', async () => {
		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'checkout', 'atlas', '1.0.1']);
		const combined = stripAnsi(stdout + stderr);

		expect(combined).toContain('Config checked out for atlas version 1.0.1');
		expect(fs.existsSync(checkedOutConfig101)).toBe(true);

		const content = JSON.parse(fs.readFileSync(checkedOutConfig101, 'utf-8')) as Configuration;
		expect(content.name).toBe('atlas');
		expect(content.version).toBe('1.0.1');
		expect(content.config.trigger_threshold).toBe(0.80);
		expect(content.config.compression).toBe('gzip');
		expect(content.config.new_feature_flag).toBe(true);
	});

	it('should fail to checkout a non-existent version and report error', async () => {
		const project = 'atlas';
		const version = '9.9.9';
		const expectedErrorMessagePart = `Failed to checkout config for ${project} version ${version}.`;

		try {
			await execFile('ts-node', [cliPath, 'checkout', project, version]);
			expect.fail('Checkout of non-existent version should have failed.');
		} catch (error: unknown) {
			const err = error as { stdout: string; stderr: string; code: number };
			const combined = stripAnsi(err.stdout + err.stderr);
			expect(combined).toContain(expectedErrorMessagePart);
			expect(combined).toContain(`API Error: Request failed with status code 404`);
			expect(combined).toContain(
				`Hint: Version '${version}' for project '${project}' might not exist on the remote server.`
			);
			expect(fs.existsSync(nonExistentVersionConfig)).toBe(false);
			expect(err.code).toBe(1);
		}
	});

	it('should create environment folder with README', async () => {
		const project = 'atlas';
		const environment = 'staging';
		const envDir = path.join(configDir, project, 'env', environment);
		const readmePath = path.join(envDir, 'README.txt');

		if (fs.existsSync(envDir)) fs.rmSync(envDir, {recursive: true});

		const {stdout, stderr} = await execFile('ts-node', [cliPath, 'env', project, environment]);
		const output = stripAnsi(stdout + stderr);

		expect(output).toContain(`✔ Created: ${envDir}`);
		expect(fs.existsSync(envDir)).toBe(true);
		expect(fs.existsSync(readmePath)).toBe(true);

		const readmeContent = fs.readFileSync(readmePath, 'utf8');
		expect(readmeContent).toMatch(/environment-specific config files/);
		expect(readmeContent).toContain(project);
		expect(readmeContent).toContain(environment);
	});
});
