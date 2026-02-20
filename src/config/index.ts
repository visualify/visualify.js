/**
 * Visualify.js Configuration System
 *
 * This module provides configuration management for Visualify.js applications.
 * It supports loading from files, environment variables, and CLI arguments with
 * proper validation using JSON Schema.
 *
 * @module config
 * @example
 * ```typescript
 * import { loadConfig, validateConfig, defaults } from './config';
 *
 * // Load and validate configuration
 * const config = await loadConfig(process.cwd(), cliArgs);
 *
 * // Validate custom configuration
 * const result = validateConfig(myConfig);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */

// Export defaults
export { default as defaults } from './defaults';

// Export schema
export { default as schema } from './schema';
export type { SchemaType } from './schema';

// Export validation functions
export {
	validateConfig,
	validateProperty,
	isVersionCompatible,
	isValidConfig,
	ERROR_TEMPLATES,
	SUGGESTED_FIXES,
} from './validator';

// Export loading functions and constants
export {
	loadConfig,
	watchConfig,
	findConfigFile,
	loadConfigFile,
	loadEnvironmentConfig,
	clearCache,
	getCacheStats,
	deepMerge,
	ConfigLoadError,
	CONFIG_FILES,
	ENV_PREFIX,
} from './loader';

// Re-export types
export type {
	VisualifyConfig,
	DocsConfig,
	PortalConfig,
	VisualizationConfig,
	DataSource,
	AppMode,
	ChartLibrary,
	DataSourceType,
	LoadConfigOptions,
	ConfigCacheEntry,
	CacheStats,
	ConfigWatcher,
	ConfigReloadCallback,
	PartialConfig,
} from '../../types';
