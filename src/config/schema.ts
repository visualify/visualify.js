/**
 * JSON Schema for visualify.json validation
 * @module schema
 */

/**
 * JSON Schema definition for Visualify.js configuration
 * Used with AJV for validation
 *
 * @example
 * ```typescript
 * import schema from './schema';
 * import Ajv from 'ajv';
 *
 * const ajv = new Ajv();
 * const validate = ajv.compile(schema);
 * const valid = validate(config);
 * ```
 */
const schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: 'https://visualify.js.org/schema/config.json',
	title: 'Visualify Configuration',
	description: 'Configuration schema for Visualify.js applications',
	type: 'object' as const,
	required: ['version'] as const,
	additionalProperties: false,
	properties: {
		/**
		 * Schema version for compatibility checking
		 */
		version: {
			type: 'string' as const,
			enum: ['3.0.0'] as const,
			description: 'Configuration schema version',
			default: '3.0.0',
		},

		/**
		 * Application mode
		 */
		mode: {
			type: 'string' as const,
			enum: ['docs', 'portal', 'hybrid', 'auto'] as const,
			description: 'Application operating mode',
			default: 'auto',
		},

		/**
		 * Documentation configuration
		 */
		docs: {
			type: 'object' as const,
			description: 'Documentation settings',
			additionalProperties: false,
			properties: {
				basePath: {
					type: 'string' as const,
					description: 'Base path for documentation files',
					default: './docs',
					minLength: 1,
				},
				theme: {
					type: 'string' as const,
					description: 'Documentation theme',
					default: 'vue',
					minLength: 1,
				},
				plugins: {
					type: 'array' as const,
					description: 'List of plugin modules to load',
					default: [] as const,
					items: {
						type: 'string' as const,
						minLength: 1,
					},
				},
			},
		},

		/**
		 * Portal configuration
		 */
		portal: {
			type: 'object' as const,
			description: 'Portal settings',
			additionalProperties: false,
			properties: {
				homepage: {
					type: 'string' as const,
					description: 'Homepage configuration file',
					default: 'home.json',
					minLength: 1,
				},
				theme: {
					type: 'string' as const,
					description: 'Portal theme',
					default: 'modern',
					minLength: 1,
				},
				dataSources: {
					type: 'array' as const,
					description: 'Data sources for the portal',
					default: [] as const,
					items: {
						type: 'object' as const,
						required: ['name', 'type'] as const,
						properties: {
							name: {
								type: 'string' as const,
								minLength: 1,
							},
							type: {
								type: 'string' as const,
								enum: ['json', 'csv', 'api', 'websocket'] as const,
							},
							url: {
								type: 'string' as const,
								format: 'uri',
							},
							path: {
								type: 'string' as const,
							},
						},
						additionalProperties: true,
					},
				},
			},
		},

		/**
		 * Visualization configuration
		 */
		visualization: {
			type: 'object' as const,
			description: 'Visualization settings',
			additionalProperties: false,
			properties: {
				defaultLibrary: {
					type: 'string' as const,
					enum: ['echarts', 'plotly'] as const,
					description: 'Default charting library',
					default: 'echarts',
				},
				enable3D: {
					type: 'boolean' as const,
					description: 'Enable 3D visualization capabilities',
					default: false,
				},
				webWorkers: {
					type: 'boolean' as const,
					description: 'Use Web Workers for rendering',
					default: false,
				},
			},
		},

		/**
		 * Internationalization (i18n) configuration
		 */
		i18n: {
			type: 'object' as const,
			description: 'Internationalization settings',
			additionalProperties: false,
			properties: {
				locale: {
					type: 'string' as const,
					description: 'Locale setting (auto for browser detection)',
					default: 'auto',
					enum: ['auto', 'en', 'zh', 'es', 'de', 'ar', 'he'] as const,
				},
				fallbackLocale: {
					type: 'string' as const,
					description: 'Fallback locale when translation is missing',
					default: 'en',
					enum: ['en', 'zh', 'es', 'de', 'ar', 'he'] as const,
				},
				enableRTL: {
					type: 'boolean' as const,
					description: 'Enable RTL (Right-to-Left) layout support',
					default: true,
				},
			},
		},
	},
} as const;

/**
 * Type derived from the schema for compile-time validation
 * This ensures the schema matches the VisualifyConfig interface
 */
export type SchemaType = typeof schema;

/**
 * Schema default values extracted for programmatic use
 */
export const SCHEMA_DEFAULTS = {
	version: '3.0.0',
	mode: 'auto',
	docs: {
		basePath: './docs',
		theme: 'vue',
		plugins: [] as string[],
	},
	portal: {
		homepage: 'home.json',
		theme: 'modern',
		dataSources: [] as Array<{
			name: string;
			type: 'json' | 'csv' | 'api' | 'websocket';
			url?: string;
			path?: string;
		}>,
	},
	visualization: {
		defaultLibrary: 'echarts' as const,
		enable3D: false,
		webWorkers: false,
	},
	i18n: {
		locale: 'auto' as const,
		fallbackLocale: 'en' as const,
		enableRTL: true,
	},
} as const;

export default schema;
