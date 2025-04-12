/**
 * @file configValidator.ts
 * @description JSON Schema validator for corev configuration files.
 *
 * This module provides a schema validator using the AJV library to ensure that configuration
 * files conform to the expected structure. It validates that each configuration JSON file
 * includes required top-level fields (`name`, `version`, `config`) and follows the type
 * definitions outlined in the schema (`configSchema.ts`).
 *
 * The available function includes:
 *   — validateConfig: Validates a given JSON file against the schema and returns errors if any.
 *
 * @author      Doğu Abaris <abaris@null.net>
 * @license     MIT
 * @see         schema/configSchema.ts for the schema definition.
 */

import Ajv, {ErrorObject} from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import {configSchema} from '../schema/configSchema';

const ajv = new Ajv({allErrors: true});
addFormats(ajv);

const validate = ajv.compile(configSchema);

/**
 * Validates a configuration file against the defined JSON Schema.
 *
 * @param filePath - Absolute or relative path to the JSON config file to validate.
 * @returns An object indicating if the file is valid, and an array of validation error messages if not.
 *
 * @example
 * const result = validateConfig('configs/atlas@1.0.0.json');
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export function validateConfig(filePath: string): { valid: boolean; errors?: string[] } {
	if (!fs.existsSync(filePath)) {
		return {valid: false, errors: [`File not found: ${filePath}`]};
	}

	try {
		const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		const isValid = validate(json);

		if (isValid) return {valid: true};

		const errors = (validate.errors as ErrorObject[]).map(e => {
			const path = 'instancePath' in e ? e.instancePath || '/' : '/';
			return `${path} ${e.message}`;
		});

		return {valid: false, errors};
	} catch {
		return {valid: false, errors: ['Invalid JSON format.']};
	}
}
