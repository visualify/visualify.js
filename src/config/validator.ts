/**
 * Configuration validation logic using AJV with i18n support
 * @module validator
 */

import Ajv from 'ajv';
import type { ErrorObject, Options as AjvOptions } from 'ajv';
import schema from './schema';
import { ValidationError, ValidationResult, VisualifyConfig } from '../../types';

// i18n support for validation messages
let currentLocale = 'en';
const translations: Record<string, Record<string, string>> = {
	en: {
		'required': "Missing required property '{property}'",
		'type': "Property '{property}' should be {expected}, received {received}",
		'enum': "Property '{property}' must be one of: {values}",
		'minLength': "Property '{property}' cannot be empty",
		'format': "Property '{property}' has invalid format",
		'additionalProperties': "Unknown property '{property}'",
		'configObject': 'Configuration must be an object',
		'configObjectSuggestion': 'Provide a valid JSON object with configuration properties',
	},
	zh: {
		'required': "缺少必需属性'{property}'",
		'type': "属性'{property}'应为{expected}，实际为{received}",
		'enum': "属性'{property}'必须是以下之一：{values}",
		'minLength': "属性'{property}'不能为空",
		'format': "属性'{property}'格式无效",
		'additionalProperties': "未知属性'{property}'",
		'configObject': '配置必须是一个对象',
		'configObjectSuggestion': '提供一个包含配置属性的有效JSON对象',
	},
	es: {
		'required': "Falta la propiedad obligatoria '{property}'",
		'type': "La propiedad '{property}' debería ser {expected}, se recibió {received}",
		'enum': "La propiedad '{property}' debe ser una de: {values}",
		'minLength': "La propiedad '{property}' no puede estar vacía",
		'format': "La propiedad '{property}' tiene un formato inválido",
		'additionalProperties': "Propiedad desconocida '{property}'",
		'configObject': 'La configuración debe ser un objeto',
		'configObjectSuggestion': 'Proporcione un objeto JSON válido con propiedades de configuración',
	},
	de: {
		'required': "Eigenschaft '{property}' ist erforderlich",
		'type': "Eigenschaft '{property}' sollte {expected} sein, empfangen wurde {received}",
		'enum': "Eigenschaft '{property}' muss einer der folgenden sein: {values}",
		'minLength': "Eigenschaft '{property}' darf nicht leer sein",
		'format': "Eigenschaft '{property}' hat ein ungültiges Format",
		'additionalProperties': "Unbekannte Eigenschaft '{property}'",
		'configObject': 'Konfiguration muss ein Objekt sein',
		'configObjectSuggestion': 'Geben Sie ein gültiges JSON-Objekt mit Konfigurationseigenschaften an',
	},
};

/**
 * Set the current locale for validation messages
 * @param locale - Locale code
 */
export function setValidationLocale(locale: string): void {
	currentLocale = locale;
}

/**
 * Get the current locale
 * @returns Current locale code
 */
export function getValidationLocale(): string {
	return currentLocale;
}

/**
 * Translate a key with interpolation
 * @param key - Translation key
 * @param params - Interpolation parameters
 * @returns Translated string
 */
function t(key: string, params: Record<string, string> = {}): string {
	const messages = translations[currentLocale] || translations['en'];
	let message = messages[key] || key;

	Object.keys(params).forEach((param) => {
		message = message.replace(new RegExp(`{${param}}`, 'g'), params[param]);
	});

	return message;
}

/**
 * Error message templates for common validation errors
 */
const ERROR_TEMPLATES: Record<string, string> = {
	required: "Missing required property '{property}'",
	type: "Property '{property}' should be {expected}, received {received}",
	enum: "Property '{property}' must be one of: {values}",
	minLength: "Property '{property}' cannot be empty",
	format: "Property '{property}' has invalid format",
	additionalProperties: "Unknown property '{property}'",
};

/**
 * Suggested fixes for common errors
 * Maps property paths to fix functions
 */
const SUGGESTED_FIXES: Record<
	string,
	(error: ErrorObject) => string | null
> = {
	version: (error: ErrorObject): string | null => {
		if (error.keyword === 'enum') {
			return "Set version to '3.0.0'";
		}
		return null;
	},
	mode: (error: ErrorObject): string | null => {
		if (error.keyword === 'enum') {
			return "Use one of: 'docs', 'portal', 'hybrid', 'auto'";
		}
		return null;
	},
	defaultLibrary: (error: ErrorObject): string | null => {
		if (error.keyword === 'enum') {
			return "Use either 'echarts' or 'plotly'";
		}
		return null;
	},
	'docs.basePath': (): string => "Use a relative path like './docs' or './documentation'",
	'docs.theme': (): string => "Available themes: 'vue', 'modern', 'classic'",
	'portal.homepage': (): string => "Use a filename like 'home.json' or 'index.json'",
	'portal.dataSources': (error: ErrorObject): string | null => {
		if (error.keyword === 'required') {
			return "Each data source needs 'name' and 'type' properties";
		}
		return null;
	},
};

/**
 * Validation options
 */
interface ValidateOptions {
	/** Source identifier for error context */
	source?: string;
}

/**
 * Initialize AJV instance with configuration
 * @returns Configured AJV instance
 */
function createValidator(): InstanceType<typeof Ajv> {
	const options: AjvOptions = {
		allErrors: true,
		verbose: true,
	};
	return new Ajv(options);
}

/**
 * Format a single validation error into a readable message
 * @param error - AJV error object
 * @param configSource - Source of the configuration (for context)
 * @returns Formatted error with message, path, and suggestion
 */
function formatError(error: ErrorObject, configSource = 'config'): ValidationError {
	// Handle both AJV v6 (dataPath) and v8+ (instancePath) property names
	const instancePath = (error as { instancePath?: string; dataPath?: string }).instancePath
		|| (error as { dataPath?: string }).dataPath
		|| '';
	const path = instancePath
		? instancePath.slice(1).replace(/\//g, '.')
		: (error.params as { missingProperty?: string }).missingProperty || 'root';

	const property = path.split('.').pop() || 'root';

	// Build base message using i18n
	const params = error.params as Record<string, unknown>;
	let message = t(error.keyword, {
		property: path,
		expected: params.type as string,
		received: typeof error.data,
		values: (params.allowedValues as string[])?.join(', '),
	}) || ERROR_TEMPLATES[error.keyword] || error.message || 'Validation error';

	// Get suggestion if available
	const suggestionKey = Object.keys(SUGGESTED_FIXES).find(
		(key) => path === key || path.endsWith(`.${key}`)
	);
	const suggestion = suggestionKey
		? SUGGESTED_FIXES[suggestionKey](error as ErrorObject)
		: null;

	return {
		path,
		property,
		message,
		suggestion,
		keyword: error.keyword,
		value: error.data,
		source: configSource,
	};
}

/**
 * Validate configuration against the schema
 * @param config - Configuration object to validate
 * @param options - Validation options
 * @returns Validation result with valid flag, errors array, and summary
 *
 * @example
 * ```typescript
 * const result = validateConfig({
 *   version: '3.0.0',
 *   mode: 'docs'
 * });
 *
 * if (!result.valid) {
 *   console.error(result.errors[0].message);
 *   if (result.errors[0].suggestion) {
 *     console.log('Suggestion:', result.errors[0].suggestion);
 *   }
 * }
 * ```
 */
function validateConfig(
	config: unknown,
	options: ValidateOptions = {}
): ValidationResult {
	const { source = 'config' } = options;

	// Check if config is an object
	if (config === null || typeof config !== 'object') {
		return {
			valid: false,
			errors: [
				{
					path: 'root',
					property: 'root',
					message: t('configObject'),
					suggestion: t('configObjectSuggestion'),
					keyword: 'type',
					value: config,
					source,
				},
			],
			summary: t('configObject'),
		};
	}

	const ajv = createValidator();
	const validate = ajv.compile(schema);
	const valid = validate(config);

	if (valid) {
		return {
			valid: true,
			errors: [],
			summary: null,
		};
	}

	const errors = (validate.errors || []).map((error: ErrorObject) => formatError(error, source));

	// Build summary message
	const errorCount = errors.length;
	const summary =
		errorCount === 1
			? `1 validation error: ${errors[0].message}`
			: `${errorCount} validation errors found`;

	return {
		valid: false,
		errors,
		summary,
	};
}

/**
 * Validate a specific configuration property
 * @param path - Dot-notation path to the property
 * @param value - Value to validate
 * @returns Validation result for the property
 */
function validateProperty(path: string, value: unknown): ValidationResult {
	const pathParts = path.split('.');

	// Build minimal config with the property
	const config = pathParts.reduceRight((acc, part, index) => {
		if (index === pathParts.length - 1) {
			return { [part]: value };
		}
		return { [part]: acc };
	}, {} as Record<string, unknown>);

	// Add required version
	(config as Record<string, unknown>).version = '3.0.0';

	return validateConfig(config, { source: `property:${path}` });
}

/**
 * Check if a version is compatible with the current schema
 * @param version - Version string to check
 * @returns True if compatible
 */
function isVersionCompatible(version: string): boolean {
	return version === '3.0.0';
}

/**
 * Type guard to check if a value is a valid VisualifyConfig
 * @param value - Value to check
 * @returns True if value is a valid VisualifyConfig
 */
function isValidConfig(value: unknown): value is VisualifyConfig {
	const result = validateConfig(value);
	return result.valid;
}

export {
	validateConfig,
	validateProperty,
	isVersionCompatible,
	isValidConfig,
	ERROR_TEMPLATES,
	SUGGESTED_FIXES,
};

export default {
	validateConfig,
	validateProperty,
	isVersionCompatible,
	isValidConfig,
	setValidationLocale,
	getValidationLocale,
	ERROR_TEMPLATES,
	SUGGESTED_FIXES,
};
