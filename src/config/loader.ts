/**
 * Configuration loading with merging logic
 * @module loader
 */

import * as fs from 'fs';
import * as path from 'path';
import defaults from './defaults';
import { validateConfig } from './validator';
import {
	VisualifyConfig,
	PartialConfig,
	LoadConfigOptions,
	ConfigCacheEntry,
	CacheStats,
	ConfigWatcher,
	ConfigReloadCallback,
} from '../../types';

/**
 * Cache for parsed configurations to avoid re-reading files
 */
const configCache = new Map<string, ConfigCacheEntry>();

/**
 * File watchers for development mode
 */
const fileWatchers = new Map<string, fs.FSWatcher>();

/**
 * Callbacks to invoke on config reload
 */
const reloadCallbacks = new Map<string, Set<ConfigReloadCallback>>();

/**
 * Configuration file names to search for
 */
const CONFIG_FILES: readonly string[] = ['visualify.json', '.visualify.json'];

/**
 * Environment variable prefix for Visualify config
 */
const ENV_PREFIX = 'VISUALIFY_';

/**
 * Error thrown when configuration loading fails
 */
class ConfigLoadError extends Error {
	code: string;
	filepath?: string;
	originalError?: Error;

	constructor(message: string, code: string, filepath?: string, originalError?: Error) {
		super(message);
		this.name = 'ConfigLoadError';
		this.code = code;
		this.filepath = filepath;
		this.originalError = originalError;
	}
}

/**
 * Find configuration file in the given directory
 * @param cwd - Current working directory to search
 * @returns Path to config file or null if not found
 */
function findConfigFile(cwd: string): string | null {
	for (const filename of CONFIG_FILES) {
		const filepath = path.join(cwd, filename);
		if (fs.existsSync(filepath)) {
			return filepath;
		}
	}
	return null;
}

/**
 * Read and parse a JSON file
 * @param filepath - Path to the JSON file
 * @returns Parsed JSON content
 * @throws ConfigLoadError if file cannot be read or parsed
 */
function readJsonFile(filepath: string): unknown {
	const content = fs.readFileSync(filepath, 'utf-8');
	try {
		return JSON.parse(content);
	} catch (parseError) {
		throw new ConfigLoadError(
			`Invalid JSON in ${filepath}: ${(parseError as Error).message}`,
			'INVALID_JSON',
			filepath,
			parseError as Error
		);
	}
}

/**
 * Load configuration from file
 * @param cwd - Current working directory
 * @returns Parsed configuration or null if no file found
 */
function loadConfigFile(cwd: string): PartialConfig | null {
	const filepath = findConfigFile(cwd);

	if (!filepath) {
		return null;
	}

	// Check cache first
	const cached = configCache.get(filepath);
	if (cached) {
		const stats = fs.statSync(filepath);
		if (cached.mtime >= stats.mtime) {
			return cached.config as PartialConfig;
		}
	}

	const config = readJsonFile(filepath) as PartialConfig;

	// Update cache
	const stats = fs.statSync(filepath);
	configCache.set(filepath, {
		config: config as VisualifyConfig,
		mtime: stats.mtime,
		filepath,
	});

	return config;
}

/**
 * Parse environment variable value
 * @param value - Raw environment variable value
 * @returns Parsed value (boolean, number, null, or string)
 */
function parseEnvValue(value: string): unknown {
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === 'null') return null;
	if (value !== '' && !isNaN(Number(value))) return Number(value);
	return value;
}

/**
 * Load configuration from environment variables
 * Environment variables should be prefixed with VISUALIFY_
 * Nested properties use double underscore: VISUALIFY_DOCS__THEME
 * @returns Configuration from environment
 */
function loadEnvironmentConfig(): PartialConfig {
	const config: PartialConfig = {};

	for (const [key, value] of Object.entries(process.env)) {
		if (!key || !value || !key.startsWith(ENV_PREFIX)) {
			continue;
		}

		// Remove prefix and split by double underscore for nesting
		const pathParts = key
			.slice(ENV_PREFIX.length)
			.toLowerCase()
			.split('__');

		// Parse value
		const parsedValue = parseEnvValue(value);

		// Build nested object
		pathParts.reduce((acc: Record<string, unknown>, part, index) => {
			if (index === pathParts.length - 1) {
				acc[part] = parsedValue;
				return acc;
			}
			if (!acc[part]) acc[part] = {};
			return acc[part] as Record<string, unknown>;
		}, config as Record<string, unknown>);
	}

	return config;
}

/**
 * Check if value is a plain object
 * @param value - Value to check
 * @returns True if value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep merge objects (arrays are concatenated, not merged)
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 */
function deepMerge<T extends Record<string, unknown>>(
	target: T,
	...sources: Array<Partial<T> | undefined | null>
): T {
	if (!sources.length) return target;

	const source = sources.shift();
	if (source === undefined || source === null) {
		return deepMerge(target, ...sources);
	}

	if (!isPlainObject(target) || !isPlainObject(source)) {
		return deepMerge(target, ...sources);
	}

	for (const key of Object.keys(source)) {
		const sourceValue = source[key];
		if (sourceValue === undefined) continue;

		const targetValue = target[key];

		if (Array.isArray(sourceValue)) {
			(target as Record<string, unknown>)[key] = Array.isArray(targetValue)
				? [...targetValue, ...sourceValue]
				: [...sourceValue];
		} else if (isPlainObject(sourceValue)) {
			(target as Record<string, unknown>)[key] = deepMerge(
				isPlainObject(targetValue) ? targetValue : {},
				sourceValue
			);
		} else {
			(target as Record<string, unknown>)[key] = sourceValue;
		}
	}

	return deepMerge(target, ...sources);
}

/**
 * Normalize dot-notation keys to nested objects
 * @param overrides - Object with potential dot-notation keys
 * @returns Normalized object with nested structure
 */
function normalizeOverrides(
	overrides: Record<string, unknown>
): Record<string, unknown> {
	const normalized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(overrides)) {
		if (key.includes('.')) {
			const parts = key.split('.');
			parts.reduce((acc, part, index) => {
				if (index === parts.length - 1) {
					acc[part] = value;
					return acc;
				}
				if (!acc[part]) acc[part] = {};
				return acc[part] as Record<string, unknown>;
			}, normalized);
		} else {
			normalized[key] = value;
		}
	}

	return normalized;
}

/**
 * Load and merge configuration from all sources
 * Merging order: defaults < file < environment < CLI args
 *
 * @param cwd - Current working directory (default: process.cwd())
 * @param overrides - CLI argument overrides
 * @param options - Loading options
 * @returns Merged configuration object
 *
 * @example
 * ```typescript
 * // Load with defaults
 * const config = await loadConfig();
 *
 * // Load with CLI overrides
 * const config = await loadConfig(process.cwd(), {
 *   mode: 'docs',
 *   'docs.theme': 'modern'
 * });
 *
 * // Load without validation (for partial configs)
 * const config = await loadConfig(cwd, {}, { validate: false });
 * ```
 */
async function loadConfig(
	cwd: string = process.cwd(),
	overrides: Record<string, unknown> = {},
	options: LoadConfigOptions = {}
): Promise<VisualifyConfig> {
	const {
		validate = true,
		skipFile = false,
		skipEnvironment = false,
	} = options;

	// Start with defaults
	let config: Record<string, unknown> = { ...defaults };

	// Merge with file config
	if (!skipFile) {
		const fileConfig = loadConfigFile(cwd);
		if (fileConfig) {
			config = deepMerge(config, fileConfig);
		}
	}

	// Merge with environment config
	if (!skipEnvironment) {
		const envConfig = loadEnvironmentConfig();
		config = deepMerge(config, envConfig);
	}

	// Merge with CLI overrides
	if (overrides && Object.keys(overrides).length > 0) {
		const normalizedOverrides = normalizeOverrides(overrides);
		config = deepMerge(config, normalizedOverrides);
	}

	// Validate final config
	if (validate) {
		const validation = validateConfig(config, { source: 'merged' });
		if (!validation.valid) {
			const error = new ConfigLoadError(
				validation.summary || 'Configuration validation failed',
				'CONFIG_VALIDATION_ERROR'
			);
			// Attach errors to the error object for programmatic access
			Object.defineProperty(error, 'errors', {
				value: validation.errors,
				enumerable: false,
				writable: false,
				configurable: false,
			});
			throw error;
		}
	}

	return config as VisualifyConfig;
}

/**
 * Watch configuration file for changes
 * @param cwd - Current working directory (default: process.cwd())
 * @param callback - Callback to invoke on change
 * @returns Watcher control object with stop() method
 *
 * @example
 * ```typescript
 * const watcher = watchConfig(process.cwd(), (config, error) => {
 *   if (error) {
 *     console.error('Config reload error:', error);
 *   } else {
 *     console.log('Config reloaded:', config);
 *   }
 * });
 *
 * // Stop watching
 * watcher.stop();
 * ```
 */
function watchConfig(
	cwd: string = process.cwd(),
	callback: ConfigReloadCallback
): ConfigWatcher {
	const filepath = findConfigFile(cwd);

	if (!filepath) {
		throw new ConfigLoadError(
			`No config file found in ${cwd}`,
			'CONFIG_FILE_NOT_FOUND'
		);
	}

	// Store callback
	if (!reloadCallbacks.has(filepath)) {
		reloadCallbacks.set(filepath, new Set());
	}
	reloadCallbacks.get(filepath)!.add(callback);

	// Create watcher if not exists
	if (!fileWatchers.has(filepath)) {
		const watcher = fs.watch(filepath, (eventType) => {
			if (eventType === 'change') {
				// Clear cache for this file
				configCache.delete(filepath);

				// Reload config
				loadConfig(cwd)
					.then((newConfig) => {
						const callbacks = reloadCallbacks.get(filepath);
						if (callbacks) {
							callbacks.forEach((cb) => {
								try {
									cb(newConfig, null);
								} catch (err) {
									console.error('Config reload callback error:', err);
								}
							});
						}
					})
					.catch((error) => {
						const callbacks = reloadCallbacks.get(filepath);
						if (callbacks) {
							callbacks.forEach((cb) => cb(null, error as Error));
						}
					});
			}
		});

		fileWatchers.set(filepath, watcher);
	}

	return {
		stop: () => {
			const callbacks = reloadCallbacks.get(filepath);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					// No more callbacks, stop watcher
					const watcher = fileWatchers.get(filepath);
					if (watcher) {
						watcher.close();
						fileWatchers.delete(filepath);
					}
					reloadCallbacks.delete(filepath);
				}
			}
		},
		filepath,
	};
}

/**
 * Clear the configuration cache
 */
function clearCache(): void {
	configCache.clear();
}

/**
 * Get cache statistics
 * @returns Cache statistics
 */
function getCacheStats(): CacheStats {
	return {
		size: configCache.size,
		files: Array.from(configCache.keys()),
	};
}

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
};

export default {
	loadConfig,
	watchConfig,
	findConfigFile,
	loadConfigFile,
	loadEnvironmentConfig,
	clearCache,
	getCacheStats,
	deepMerge,
	CONFIG_FILES,
	ENV_PREFIX,
};
