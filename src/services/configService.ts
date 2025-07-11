/**
 * @file configService.ts
 * @description Core service module for corev.
 *
 * This module provides helper functions for managing configuration files for the corev CLI tool.
 * It includes utilities to handle file paths, parse configuration file names (which must follow
 * the format `<project>@<version>.json`), and read/write configuration data. Additionally, it
 * provides functions to save and retrieve the API base URL from a local configuration file
 * (".corevrc.json"), which is used by other CLI commands.
 *
 * The available functions include:
 *   - getConfigPath: Constructs the full file path for a project's configuration version.
 *   - parseFilename: Extracts the project name and version from a given filename.
 *   - loadConfig: Reads and parses a JSON configuration file.
 *   - saveConfig: Serializes and writes configuration data to a file.
 *   - saveApiBase: Saves the specified API base URL to the local configuration file.
 *   - getApiBase: Retrieves the API base URL from the local configuration file.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import fs from 'fs';
import path from 'path';
import {Configuration, CorevSettings} from "../types";

const CONFIG_DIR = path.resolve('configs');
const RC_PATH = path.resolve('.corevrc.json');

/**
 * Constructs the full file path to a versioned configuration JSON file
 * for a given project and optional environment.
 *
 * If an environment is specified, the config file is assumed to be located under:
 *   configs/<project>/env/<env>/<project>@<version>.json
 *
 * Otherwise, it defaults to:
 *   configs/<project>/<project>@<version>.json
 *
 * @param project - The project slug (e.g., "atlas").
 * @param version - The configuration version string (e.g., "1.0.3").
 * @param env - (Optional) The environment name (e.g., "staging", “production”).
 * @returns The full local file path to the config file.
 */
export function getConfigPath(project: string, version: string, env?: string): string {
	const baseDir = env
		? path.join(CONFIG_DIR, project, 'env', env)
		: path.join(CONFIG_DIR, project);
	return path.join(baseDir, `${project}@${version}.json`);
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
 * Saves a configuration object to the appropriate location under the "configs/" directory.
 *
 * If an `env` argument is provided, the configuration is saved to:
 *   configs/<project>/env/<env>/<project>@<version>.json
 *
 * Otherwise, it is saved to the default project directory:
 *   configs/<project>/<project>@<version>.json
 *
 * This ensures that both environment-specific and default (production) configurations
 * are organized consistently.
 *
 * @param project - The project name (e.g., "atlas").
 * @param version - The configuration version (e.g., "1.0.0").
 * @param config - The configuration object to save.
 * @param env - (Optional) The target environment name (e.g., "staging", "dev").
 */
export function saveConfig(
	project: string,
	version: string,
	config: Configuration,
	env?: string
): void {
	const baseDir = env
		? path.join(CONFIG_DIR, project, 'env', env)
		: path.join(CONFIG_DIR, project);

	if (!fs.existsSync(baseDir)) {
		fs.mkdirSync(baseDir, {recursive: true});
	}

	const filepath = path.join(baseDir, `${project}@${version}.json`);
	fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
}

/**
 * Saves the provided API base URL to the local configuration file (.corevrc.json).
 *
 * @param api - The API base URL to save.
 */
export function saveApiBase(api: string): void {
	fs.writeFileSync(RC_PATH, JSON.stringify({api}, null, 2));
}

/**
 * Saves the provided API token to .corevrc.json, preserving other fields like api.
 */
export function saveToken(token: string): void {
	const existing = loadRc();
	fs.writeFileSync(RC_PATH, JSON.stringify({...existing, token}, null, 2));
}

/**
 * Reads and parses .corevrc.json, or returns an empty object if missing.
 */
function loadRc(): Record<string, CorevSettings> {
	if (fs.existsSync(RC_PATH)) {
		return JSON.parse(fs.readFileSync(RC_PATH, 'utf-8'));
	}
	return {};
}

/**
 * Retrieves the API base URL from the local configuration file (.corevrc.json).
 *
 * @returns The API base URL.
 * @throws If the configuration file does not exist, or the API base URL is not set.
 */
export function getApiBase(): string {
	if (fs.existsSync(RC_PATH)) {
		const data = JSON.parse(fs.readFileSync(RC_PATH, 'utf-8'));
		if (data.api) {
			return data.api.replace(/\/+$/, '');
		}
	}

	throw new Error('API base URL not set. Please run "corev init --api <url>" first.');
}

/**
 * Retrieves the API secret token from the local configuration file (.corevrc.json).
 *
 * @returns The API token as a string, or null if not set.
 */
export function getToken(): string | null {
	if (fs.existsSync(RC_PATH)) {
		const data = JSON.parse(fs.readFileSync(RC_PATH, 'utf-8')) as CorevSettings;
		return data.token || null;
	}
	return null;
}
