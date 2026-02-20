/**
 * @fileoverview Development server command for Visualify CLI
 * @module cli/commands/dev
 */

const { Command } = require('commander');
const logger = require('../utils/logger');
const { detectMode, loadConfig } = require('../utils/config');
const { createDevServer } = require('../dev-server');

/**
 * Valid development modes
 * @readonly
 * @type {string[]}
 */
const VALID_MODES = ['auto', 'docs', 'portal'];

/**
 * Default mode when not specified
 * @readonly
 * @type {string}
 */
const DEFAULT_MODE = 'auto';

/**
 * Active dev server instance for cleanup
 * @type {DevServer|null}
 */
let activeServer = null;

/**
 * Setup cleanup handlers for graceful shutdown
 * @param {DevServer} server - The dev server instance
 */
function setupCleanupHandlers(server) {
	const cleanup = async (signal) => {
		logger.newline();
		logger.info(`Received ${signal}, shutting down...`);

		if (server) {
			await server.stop();
		}

		process.exit(0);
	};

	// Handle various termination signals
	process.on('SIGINT', () => cleanup('SIGINT'));
	process.on('SIGTERM', () => cleanup('SIGTERM'));

	// Handle uncaught errors
	process.on('uncaughtException', async (err) => {
		logger.error('Uncaught exception:', err.message);
		if (server) {
			await server.stop();
		}
		process.exit(1);
	});

	process.on('unhandledRejection', async (reason) => {
		logger.error('Unhandled rejection:', reason);
		if (server) {
			await server.stop();
		}
		process.exit(1);
	});
}

/**
 * Execute the dev command
 * @param {string} mode - The development mode
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {boolean} options.hmr - Enable HMR (default: true)
 * @param {number} options.port - Port to run the server on
 * @param {string} options.host - Host to bind the server to
 * @returns {Promise<void>}
 */
async function executeDev(mode, options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Starting dev command with mode:', mode);
		logger.debug('Options:', options);

		// Validate mode
		if (!VALID_MODES.includes(mode)) {
			logger.error(`Invalid mode: "${mode}"`);
			logger.tip(`Valid modes are: ${VALID_MODES.join(', ')}`);
			process.exit(1);
		}

		// Determine actual mode to use
		let actualMode = mode;
		if (mode === 'auto') {
			logger.info('Auto-detecting mode...');
			actualMode = await detectMode();
			logger.info(`Detected mode: ${actualMode}`);
		}

		// Load configuration
		const config = await loadConfig();
		logger.debug('Loaded config:', config);

		// Execute the appropriate mode
		switch (actualMode) {
			case 'docs':
				activeServer = await startDocsMode(config, options);
				break;
			case 'portal':
				activeServer = await startPortalMode(config, options);
				break;
			default:
				logger.error(`Unknown mode: "${actualMode}"`);
				process.exit(1);
		}

		// Setup cleanup handlers
		if (activeServer) {
			setupCleanupHandlers(activeServer);
		}
	} catch (err) {
		logger.error('Failed to start development server:', err.message);
		logger.debug('Stack trace:', err.stack);

		// Cleanup on error
		if (activeServer) {
			await activeServer.stop();
		}

		process.exit(1);
	}
}

/**
 * Start documentation development mode
 * @param {Object} config - Visualify configuration
 * @param {Object} options - Command options
 * @returns {Promise<DevServer>} The dev server instance
 */
async function startDocsMode(config, options) {
	logger.header('Documentation Mode');
	logger.info('Starting documentation development server with HMR...');

	const server = await createDevServer({
		port: options.port || config.port || 3000,
		host: options.host || config.host || 'localhost',
		hmr: options.hmr !== false,
		mode: 'docs',
		rootDir: process.cwd(),
		staticDirs: ['docs', 'public', 'dist'],
	});

	logger.success('Documentation dev server started');
	logger.tip('Edit your markdown files to see changes instantly');

	return server;
}

/**
 * Start portal development mode
 * @param {Object} config - Visualify configuration
 * @param {Object} options - Command options
 * @returns {Promise<DevServer>} The dev server instance
 */
async function startPortalMode(config, options) {
	logger.header('Portal Mode');
	logger.info('Starting portal development server with HMR...');

	const server = await createDevServer({
		port: options.port || config.port || 3000,
		host: options.host || config.host || 'localhost',
		hmr: options.hmr !== false,
		mode: 'portal',
		rootDir: process.cwd(),
		staticDirs: ['public', 'dist', 'build'],
	});

	logger.success('Portal dev server started');
	logger.tip('Edit visualify.json or component files to see changes instantly');

	return server;
}

/**
 * Create and configure the dev command
 * @returns {Command} The configured command
 */
function createDevCommand() {
	const command = new Command('dev')
		.description('Start the development server')
		.argument(
			'[mode]',
			`Development mode: ${VALID_MODES.join(', ')}`,
			DEFAULT_MODE
		)
		.option('-v, --verbose', 'Enable verbose logging')
		.option('-p, --port <number>', 'Port to run the server on')
		.option('-h, --host <host>', 'Host to bind the server to')
		.option('--hmr', 'Enable Hot Module Replacement (default: true)', true)
		.option('--no-hmr', 'Disable Hot Module Replacement')
		.action(executeDev);

	return command;
}

module.exports = {
	createDevCommand,
	executeDev,
	VALID_MODES,
	DEFAULT_MODE,
};
