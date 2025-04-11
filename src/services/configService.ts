/**
 * @file configService.ts
 * @description Core service module for cono.
 *
 * This module provides helper functions for managing configuration files for the cono CLI tool.
 * It includes utilities to handle file paths, parse configuration file names (which must follow
 * the format `<project>@<version>.json`), and read/write configuration data. Additionally, it
 * provides functions to save and retrieve the API base URL from a local configuration file
 * (".conorc.json"), which is used by other CLI commands.
 *
 * The available functions include:
 *   — getConfigPath: Constructs the full file path for a project's configuration version.
 *   — parseFilename: Extracts the project name and version from a given filename.
 *   — loadConfig: Reads and parses a JSON configuration file.
 *   — saveConfig: Serializes and writes configuration data to a file.
 *   — saveApiBase: Saves the specified API base URL to the local configuration file.
 *   — getApiBase: Retrieves the API base URL from the local configuration file.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using cono.
 */

import fs from 'fs';
import path from 'path';

const CONFIG_DIR = path.resolve('configs');
const RC_PATH = path.join(CONFIG_DIR, '.conorc.json');

/**
 * Constructs the file path for a given project and configuration version.
 *
 * @param project - The project name.
 * @param version - The configuration version.
 * @returns The full path of the configuration file.
 */
export function getConfigPath(project: string, version: string): string {
	return path.join(CONFIG_DIR, `${project}@${version}.json`);
}

/**
 * Parses a configuration filename of the form `<project>@<version>.json`.
 *
 * @param filename - The name of the file to parse.
 * @returns An object containing the project and version if parsing is successful, or null otherwise.
 */
export function parseFilename(filename: string): { project: string; version: string } | null {
	const match = filename.match(/^(.+?)@(.+?)\.json$/);
	if (!match) return null;

	return {
		project: match[1],
		version: match[2],
	};
}

/**
 * Loads and parses a JSON configuration file.
 *
 * @typeParam T - The expected type of the parsed JSON object.
 * @param filepath - The full path to the configuration file.
 * @returns The parsed configuration data.
 * @throws If the file does not exist or cannot be parsed.
 */
export function loadConfig<T = unknown>(filepath: string): T {
	if (!fs.existsSync(filepath)) {
		throw new Error(`File not found: ${filepath}`);
	}
	const content = fs.readFileSync(filepath, 'utf-8');
	return JSON.parse(content) as T;
}

/**
 * Saves a configuration object to a file under the configs directory.
 *
 * @param project - The project name.
 * @param version - The configuration version.
 * @param config - The configuration data to save.
 */
export function saveConfig(project: string, version: string, config: object): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR);
	}
	const filepath = getConfigPath(project, version);
	fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
}

/**
 * Saves the provided API base URL to the local configuration file (.conorc.json).
 *
 * @param api - The API base URL to save.
 */
export function saveApiBase(api: string): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR);
	}
	fs.writeFileSync(RC_PATH, JSON.stringify({api}, null, 2));
}

/**
 * Retrieves the API base URL from the local configuration file (.conorc.json).
 *
 * @returns The API base URL.
 * @throws If the configuration file does not exist, or the API base URL is not set.
 */
export function getApiBase(): string {
	const RC_PATH = path.join(CONFIG_DIR, '.conorc.json');

	if (fs.existsSync(RC_PATH)) {
		const data = JSON.parse(fs.readFileSync(RC_PATH, 'utf-8'));
		if (data.api) {
			return data.api;
		}
	}

	throw new Error('API base URL not set. Please run "cono init --api <url>" first.');
}
