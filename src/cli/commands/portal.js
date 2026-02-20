/**
 * @fileoverview Portal commands for Visualify CLI
 * @module cli/commands/portal
 */

const { Command } = require('commander');
const logger = require('../utils/logger');

/**
 * Valid portal actions
 * @readonly
 * @type {string[]}
 */
const VALID_ACTIONS = ['dev', 'build', 'rtree2d', 'mapping'];

/**
 * Legacy commands preserved for backward compatibility
 * @readonly
 * @type {string[]}
 */
const LEGACY_COMMANDS = ['rtree2d', 'mapping'];

/**
 * Execute the portal dev command
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<void>}
 */
async function executePortalDev(options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Starting portal dev server');
		logger.debug('Options:', options);

		logger.header('Portal Development Server');
		logger.info('Starting portal development server...');

		// TODO: Implement actual portal dev server
		const port = options.port || 8080;
		logger.info(`Server will run on port ${port}`);

		logger.success('Portal dev server started (stub)');
		logger.tip('Press Ctrl+C to stop the server');
	} catch (err) {
		logger.error('Failed to start portal dev server:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Execute the portal build command
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {string} [options.output] - Output directory
 * @returns {Promise<void>}
 */
async function executePortalBuild(options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Building portal');
		logger.debug('Options:', options);

		logger.header('Portal Build');
		logger.info('Building portal for production...');

		// TODO: Implement actual portal build
		const outputDir = options.output || './dist/portal';
		logger.info(`Output directory: ${outputDir}`);

		logger.success('Portal built successfully (stub)');
		logger.example(`npx serve ${outputDir}`, 'Serve the built portal');
	} catch (err) {
		logger.error('Failed to build portal:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Execute the legacy rtree2d command
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<void>}
 */
async function executeRtree2d(options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Executing rtree2d command');
		logger.debug('Options:', options);

		logger.header('RTree2D (Legacy Command)');
		logger.warn('This is a legacy command preserved for backward compatibility');
		logger.info('Processing 2D R-tree visualization...');

		// TODO: Implement actual rtree2d functionality
		logger.success('RTree2D processing complete (stub)');
	} catch (err) {
		logger.error('Failed to execute rtree2d:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Execute the legacy mapping command
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<void>}
 */
async function executeMapping(options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Executing mapping command');
		logger.debug('Options:', options);

		logger.header('Mapping (Legacy Command)');
		logger.warn('This is a legacy command preserved for backward compatibility');
		logger.info('Processing mapping visualization...');

		// TODO: Implement actual mapping functionality
		logger.success('Mapping processing complete (stub)');
	} catch (err) {
		logger.error('Failed to execute mapping:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Execute the portal command with a subcommand
 * @param {string} action - The action to perform
 * @param {Object} options - Command options
 * @returns {Promise<void>}
 */
async function executePortal(action, options) {
	if (!VALID_ACTIONS.includes(action)) {
		logger.error(`Invalid action: "${action}"`);
		logger.tip(`Valid actions are: ${VALID_ACTIONS.join(', ')}`);
		process.exit(1);
	}

	if (LEGACY_COMMANDS.includes(action)) {
		logger.warn(`"${action}" is a legacy command`);
	}

	switch (action) {
		case 'dev':
			await executePortalDev(options);
			break;
		case 'build':
			await executePortalBuild(options);
			break;
		case 'rtree2d':
			await executeRtree2d(options);
			break;
		case 'mapping':
			await executeMapping(options);
			break;
	}
}

/**
 * Create and configure the portal command
 * @returns {Command} The configured command
 */
function createPortalCommand() {
	const command = new Command('portal')
		.description('Portal management commands')
		.addHelpText(
			'after',
			`
Examples:
  $ visualify portal dev        Start the portal dev server
  $ visualify portal build      Build portal for production
  $ visualify portal rtree2d    Run 2D R-tree visualization (legacy)
  $ visualify portal mapping    Run mapping visualization (legacy)

Legacy Commands:
  rtree2d, mapping              Preserved for backward compatibility
`
		);

	// Add subcommands
	command
		.command('dev')
		.description('Start the portal development server')
		.option('-v, --verbose', 'Enable verbose logging')
		.option('-p, --port <number>', 'Port to run the server on', '8080')
		.action(executePortalDev);

	command
		.command('build')
		.description('Build portal for production')
		.option('-v, --verbose', 'Enable verbose logging')
		.option('-o, --output <dir>', 'Output directory for built files')
		.action(executePortalBuild);

	// Legacy commands
	command
		.command('rtree2d')
		.description('2D R-tree visualization (legacy command)')
		.option('-v, --verbose', 'Enable verbose logging')
		.action(executeRtree2d);

	command
		.command('mapping')
		.description('Mapping visualization (legacy command)')
		.option('-v, --verbose', 'Enable verbose logging')
		.action(executeMapping);

	return command;
}

module.exports = {
	createPortalCommand,
	executePortal,
	executePortalDev,
	executePortalBuild,
	executeRtree2d,
	executeMapping,
	VALID_ACTIONS,
	LEGACY_COMMANDS,
};
