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
 * 2. POST /configs/:project
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
