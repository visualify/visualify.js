#!/usr/bin/env node

/**
 * @fileoverview Visualify CLI entry point
 * @module cli/index
 *
 * Visualify.js CLI - Unified documentation and data visualization platform
 * Transforms the separate React visualization library and CLI tool into a unified platform.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const logger = require('./utils/logger');
const { createDevCommand } = require('./commands/dev');
const { createDocsCommand } = require('./commands/docs');
const { createPortalCommand } = require('./commands/portal');
const { createInitCommand } = require('./commands/init');
const { createEditCommand } = require('./commands/edit');

/**
 * CLI version from package.json
 * @readonly
 */
const VERSION = '3.0.0-1.dev';

/**
 * Program name
 * @readonly
 */
const PROGRAM_NAME = 'visualify';

/**
 * Program description
 * @readonly
 */
const PROGRAM_DESCRIPTION = 'Visualify.js - Documentation and Data Visualization Platform';

/**
 * Create and configure the CLI program
 * @returns {Command} The configured CLI program
 */
function createProgram() {
	const program = new Command();

	program
		.name(PROGRAM_NAME)
		.description(PROGRAM_DESCRIPTION)
		.version(VERSION, '-v, --version', 'Display version number')
		.option('--verbose', 'Enable verbose logging')
		.configureHelp({
			sortSubcommands: true,
			showGlobalOptions: true,
		});

	// Add global error handling
	program.exitOverride();

	// Add commands
	program.addCommand(createDevCommand());
	program.addCommand(createDocsCommand());
	program.addCommand(createPortalCommand());
	program.addCommand(createInitCommand());
	program.addCommand(createEditCommand());

	// Add help text
	program.addHelpText(
		'beforeAll',
		chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ${chalk.bold('Visualify.js')} - Documentation & Visualization Platform        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`)
	);

	program.addHelpText(
		'after',
		`
${chalk.bold('Examples:')}
  $ ${PROGRAM_NAME} dev                    Start dev server (auto-detect mode)
  $ ${PROGRAM_NAME} dev docs               Start docs dev server
  $ ${PROGRAM_NAME} docs build             Build static documentation
  $ ${PROGRAM_NAME} portal dev             Start portal dev server
  $ ${PROGRAM_NAME} init my-project        Initialize new project
  $ ${PROGRAM_NAME} edit                   Open visual editor
  $ ${PROGRAM_NAME} edit my-config.json    Edit specific config file

${chalk.bold('Configuration:')}
  Create a ${chalk.cyan('visualify.json')} or ${chalk.cyan('.visualify.json')} file to configure:
  {
    "mode": "auto" | "docs" | "portal",
    "port": 3000,
    "host": "localhost"
  }

${chalk.dim('For more help, visit: https://visualify.pharmacy.arizona.edu')}
`
	);

	return program;
}

/**
 * Main entry point
 * @returns {Promise<void>}
 */
async function main() {
	const program = createProgram();

	try {
		// Parse global options before command execution
		program.hook('preAction', (thisCommand) => {
			const options = thisCommand.opts();
			if (options.verbose) {
				logger.enableVerbose();
				logger.debug('Verbose mode enabled');
			}
		});

		await program.parseAsync(process.argv);
	} catch (err) {
		if (err.code === 'commander.help') {
			process.exit(0);
		}
		if (err.code === 'commander.version') {
			process.exit(0);
		}
		if (err.code === 'commander.helpDisplayed') {
			process.exit(0);
		}
		if (err.code === 'commander.unknownOption') {
			logger.error(err.message);
			process.exit(1);
		}
		if (err.code === 'commander.missingArgument') {
			logger.error(err.message);
			process.exit(1);
		}

		// Unexpected error
		logger.error('Unexpected error:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
	logger.error('Uncaught exception:', err.message);
	logger.debug('Stack trace:', err.stack);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise);
	logger.error('Reason:', reason);
	process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
	logger.newline();
	logger.info('Interrupted by user');
	process.exit(0);
});

process.on('SIGTERM', () => {
	logger.info('Received SIGTERM, shutting down...');
	process.exit(0);
});

// Run the CLI
main();

module.exports = {
	createProgram,
	VERSION,
	PROGRAM_NAME,
};
