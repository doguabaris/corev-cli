/*!
 * This file contains all types related to configuration management.
 *
 * Exported types should be marked with `@public` comments in this file.
 */

/** @public */
/**
 * The structure of a configuration.
 *
 * This record consists of a project name, a version string, and an arbitrary
 * JSON-like configuration object.
 *
 * Example:
 * ```json
 * {
 *   "name": "atlas",
 *   "version": "1.0.0",
 *   "config": {
 *     "key": "value"
 *   }
 * }
 * ```
 */
export interface Configuration {
	/** Project name (e.g., "atlas"). */
	name: string;
	/** Version string (e.g., "1.0.0" or "2025.04.13-alpha"). */
	version: string;
	/** Configuration data as key-value pairs. */
	config: Record<string, unknown>;
}
