/**
 * @file mock-api.mjs
 * @description A simple Express-based mock API server for testing the corev CLI tool.
 *
 * This mock API provides two endpoints:
 *
 * 1. GET /configs/:project/latest
 *    - Returns the latest configuration for the specified project.
 *    - The response is a JSON object containing a “version”, and a "config" object.
 *
 *    Example response for GET /configs/atlas/latest:
 *    {
 *      "name": "atlas",
 *      "version": "1.0.0",
 *      "config": {
 *        "detector": "ATLAS",
 *        "trigger_threshold": 0.75,
 *        "compression": "zstd"
 *      }
 *    }
 *
 * 2. GET /configs/:project/:version
 *    - Returns a specific configuration version for the specified project.
 *    - Simulates different configurations for '1.0.0' and '1.0.1'.
 *    - Returns 404 for other versions.
 *
 *    Example response for GET /configs/atlas/1.0.0:
 *    {
 *      "name": "atlas",
 *      "version": "1.0.0",
 *      "config": { ... }
 *    }
 *
 * 3. POST /configs/:project
 *    - Accepts a configuration payload for the specified project.
 *    - Logs the received configuration and returns a confirmation message.
 *
 *    Example request for POST /configs/atlas:
 *    {
 *      "name": "atlas",
 *      "version": "1.0.1",
 *      "config": { ... }
 *    }
 *    Response:
 *    { "message": "Config for atlas accepted." }
 *
 * Usage:
 *   Run the server with:
 *     node tests/mock-api.mjs
 *
 * This server is intended for local and integration testing of the corev CLI tool.
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using corev.
 */

import express from 'express';
import bodyParser from 'body-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const app = express();
const port = 3000;

app.use(bodyParser.json({limit: '100kb'}));

const configSchema = {
	type: 'object',
	properties: {
		name: {type: 'string'},
		version: {type: 'string'},
		config: {
			type: 'object',
			additionalProperties: true,
			maxProperties: 100
		}
	},
	required: ['name', 'version', 'config'],
	additionalProperties: false,
	maxProperties: 5
};

const ajv = new Ajv({
	allErrors: true,
	code: {
		es5: true,
		lines: true
	}
});

addFormats(ajv);
const validate = ajv.compile(configSchema);

const mockConfigurations = {
	'atlas': {
		'1.0.0': {
			name: 'atlas',
			version: '1.0.0',
			config: {
				detector: 'ATLAS',
				trigger_threshold: 0.75,
				compression: 'zstd',
				logging_level: 'info'
			}
		},
		'1.0.1': {
			name: 'atlas',
			version: '1.0.1',
			config: {
				detector: 'ATLAS',
				trigger_threshold: 0.80,
				compression: 'gzip',
				new_feature_flag: true
			}
		},
		'2.0.0': {
			name: 'atlas',
			version: '2.0.0',
			config: {
				detector: 'ATLAS_v2',
				trigger_threshold: 0.90,
				compression: 'brotli',
				logging_level: 'debug',
				experiment_id: 'EXP-A-123'
			}
		}
	},
};

app.get('/configs/:project/latest', (req, res) => {
	const {project} = req.params;
	res.json({
		name: project,
		version: '1.0.0',
		config: {
			foo: 'bar',
			enableFeature: true
		}
	});
});

app.get('/configs/:project/:version', (req, res) => {
	const {project, version} = req.params;
	const projectConfigs = mockConfigurations[project];

	if (!projectConfigs) {
		return res.status(404).json({message: `Project '${project}' not found.`});
	}

	const config = projectConfigs[version];

	if (!config) {
		return res.status(404).json({message: `Config for project '${project}' with version '${version}' not found.`});
	}

	res.json(config);
});

app.post('/configs/:project', (req, res) => {
	const {project} = req.params;
	const body = req.body;

	if (
		!body ||
		typeof body !== 'object' ||
		Array.isArray(body)
	) {
		return res.status(400).json({error: 'Malformed request body.'});
	}

	if (!validate(body)) {
		console.warn(`Invalid config for ${project}`);
		console.warn(validate.errors);
		return res.status(400).json({
			error: 'Invalid config format.',
			validation: validate.errors
		});
	}

	console.log(`Valid config received for ${project}:`);
	console.dir(body, {depth: null});

	res.status(200).json({message: `Config for ${project} accepted.`});
});

app.listen(port, () => {
	console.log(`Mock API listening on http://localhost:${port}`);
});
