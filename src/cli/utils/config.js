/**
 * @fileoverview Configuration utilities for Visualify CLI
 * @module cli/utils/config
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Configuration file names to search for
 * @readonly
 * @type {string[]}
 */
const CONFIG_FILES = ['visualify.json', '.visualify.json'];

/**
 * Default configuration values
 * @readonly
 * @type {Object}
 */
const DEFAULT_CONFIG = {
	mode: 'auto',
	port: 3000,
	host: 'localhost',
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} Whether the file exists
 */
async function fileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

/**
 * Find the configuration file in the current directory
 * @returns {Promise<string|null>} Path to config file or null
 */
async function findConfigFile() {
	const cwd = process.cwd();

	for (const configFile of CONFIG_FILES) {
		const configPath = path.join(cwd, configFile);
		if (await fileExists(configPath)) {
			logger.debug(`Found config file: ${configPath}`);
			return configPath;
		}
	}

	logger.debug('No config file found');
	return null;
}

/**
 * Load and parse the configuration file
 * @param {string} [configPath] - Path to config file (optional)
 * @returns {Promise<Object>} Merged configuration object
 */
async function loadConfig(configPath) {
	const targetPath = configPath || (await findConfigFile());

	if (!targetPath) {
		logger.debug('Using default configuration');
		return { ...DEFAULT_CONFIG };
	}

	try {
		const content = await fs.readFile(targetPath, 'utf-8');
		const parsed = JSON.parse(content);
		logger.debug(`Loaded config from ${targetPath}`);

		return {
			...DEFAULT_CONFIG,
			...parsed,
		};
	} catch (err) {
		if (err instanceof SyntaxError) {
			logger.error(`Invalid JSON in config file: ${targetPath}`);
			throw new Error(`Failed to parse config file: ${err.message}`);
		}
		logger.error(`Failed to read config file: ${targetPath}`);
		throw err;
	}
}

/**
 * Detect the project mode based on file structure
 * @returns {Promise<string>} Detected mode ('docs' or 'portal')
 */
async function detectMode() {
	const cwd = process.cwd();
	logger.debug('Detecting mode from file structure...');

	// Check for docs directory with markdown files
	const docsPath = path.join(cwd, 'docs');
	if (await fileExists(docsPath)) {
		try {
			const files = await fs.readdir(docsPath);
			const hasMarkdown = files.some(
				(file) => file.endsWith('.md') || file.endsWith('.mdx')
			);
			if (hasMarkdown) {
				logger.debug('Found docs directory with markdown files');
				return 'docs';
			}
		} catch (err) {
			logger.debug('Error reading docs directory:', err.message);
		}
	}

	// Check for portal indicators
	const portalIndicators = [
		'src/pages',
		'src/routes',
		'visualify.config.js',
		'src/App.jsx',
		'src/App.tsx',
	];

	for (const indicator of portalIndicators) {
		const indicatorPath = path.join(cwd, indicator);
		if (await fileExists(indicatorPath)) {
			logger.debug(`Found portal indicator: ${indicator}`);
			return 'portal';
		}
	}

	// Default to docs if we can't determine
	logger.debug('Could not detect mode, defaulting to docs');
	logger.warn('Could not auto-detect project mode, defaulting to docs');
	logger.tip('Create a visualify.json file to specify mode explicitly');
	return 'docs';
}

/**
 * Get the configured mode from config or auto-detect
 * @returns {Promise<string>} The mode to use
 */
async function getMode() {
	const config = await loadConfig();

	if (config.mode && config.mode !== 'auto') {
		logger.debug(`Using configured mode: ${config.mode}`);
		return config.mode;
	}

	return detectMode();
}

/**
 * Save configuration to file
 * @param {Object} config - Configuration object to save
 * @param {string} [configPath] - Path to save to (defaults to visualify.json)
 * @returns {Promise<void>}
 */
async function saveConfig(config, configPath = 'visualify.json') {
	try {
		const content = JSON.stringify(config, null, 2);
		await fs.writeFile(configPath, content, 'utf-8');
		logger.debug(`Saved config to ${configPath}`);
	} catch (err) {
		logger.error(`Failed to save config to ${configPath}:`, err.message);
		throw err;
	}
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateConfig(config) {
	const errors = [];
	const validModes = ['auto', 'docs', 'portal'];

	if (config.mode && !validModes.includes(config.mode)) {
		errors.push(`Invalid mode: "${config.mode}". Must be one of: ${validModes.join(', ')}`);
	}

	if (config.port && (typeof config.port !== 'number' || config.port < 1 || config.port > 65535)) {
		errors.push('Invalid port: must be a number between 1 and 65535');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

module.exports = {
	CONFIG_FILES,
	DEFAULT_CONFIG,
	fileExists,
	findConfigFile,
	loadConfig,
	detectMode,
	getMode,
	saveConfig,
	validateConfig,
};
