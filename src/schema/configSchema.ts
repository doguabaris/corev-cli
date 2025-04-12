export const configSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
		version: {
			type: 'string',
		},
		config: {
			type: 'object',
			additionalProperties: true,
		}
	},
	required: ['name', 'version', 'config'],
	additionalProperties: false
} as const;
