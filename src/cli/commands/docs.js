/**
 * @fileoverview Documentation commands for Visualify CLI
 * @module cli/commands/docs
 *
 * Implements `visualify docs dev` and `visualify docs build` commands
 * with full Docsify integration and Visualify plugin support.
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const logger = require('../utils/logger');
const { loadConfig, fileExists } = require('../utils/config');

/**
 * Valid documentation actions
 * @readonly
 * @type {string[]}
 */
const VALID_ACTIONS = ['dev', 'build'];

/**
 * Default Docsify configuration
 * @readonly
 * @type {Object}
 */
const DEFAULT_DOCSIFY_CONFIG = {
	name: 'Documentation',
	repo: '',
	loadSidebar: true,
	loadNavbar: true,
	coverpage: false,
	onlyCover: false,
	auto2top: true,
	maxLevel: 4,
	subMaxLevel: 2,
	mergeNavbar: true,
	search: {
		maxAge: 86400000,
		paths: 'auto',
		placeholder: 'Type to search',
		noData: 'No results!',
		depth: 2,
		hideOtherSidebarContent: false,
	},
	plugins: [],
};

/**
 * Find the docs directory
 * @param {string} [customPath] - Custom path provided by user
 * @returns {Promise<string|null>} Path to docs directory or null
 */
async function findDocsDirectory(customPath) {
	if (customPath) {
		const resolvedPath = path.resolve(customPath);
		if (await fileExists(resolvedPath)) {
			const stat = await fs.stat(resolvedPath);
			if (stat.isDirectory()) {
				return resolvedPath;
			}
		}
		logger.error(`Docs directory not found: ${resolvedPath}`);
		return null;
	}

	// Try common docs directory names
	const candidates = ['docs', 'doc', 'documentation', 'md'];
	const cwd = process.cwd();

	for (const dir of candidates) {
		const dirPath = path.join(cwd, dir);
		if (await fileExists(dirPath)) {
			const stat = await fs.stat(dirPath);
			if (stat.isDirectory()) {
				logger.debug(`Found docs directory: ${dirPath}`);
				return dirPath;
			}
		}
	}

	// Default to current directory if it has markdown files
	try {
		const files = await fs.readdir(cwd);
		const hasMarkdown = files.some((f) => f.endsWith('.md'));
		if (hasMarkdown) {
			logger.debug('Using current directory as docs root (found markdown files)');
			return cwd;
		}
	} catch (err) {
		logger.debug('Error checking current directory:', err.message);
	}

	return null;
}

/**
 * Ensure docsify-cli is installed
 * @returns {Promise<boolean>}
 */
async function ensureDocsifyCLI() {
	return new Promise((resolve) => {
		exec('npx docsify --version', (error) => {
			if (error) {
				logger.warn('docsify-cli not found. It will be installed when needed.');
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

/**
 * Generate Visualify plugin script for Docsify
 * @returns {string} Script tag HTML
 */
function generateVisualifyScript() {
	const visualifyPath = path.join(__dirname, '../../../dist/visualify-docsify.js');

	// Check if built bundle exists, otherwise use source
	return `
<!-- Visualify Plugin for Docsify -->
<script>
window.$docsify = window.$docsify || {};
window.$docsify.plugins = [].concat(
  window.$docsify.plugins || [],
  function(hook, vm) {
    hook.init(function() {
      console.log('[Visualify] Plugin initialized');
    });

    hook.mounted(function() {
      if (window.VisualifyDocsify) {
        window.VisualifyDocsify.mountAll();
      }
    });

    hook.doneEach(function() {
      if (window.VisualifyDocsify) {
        window.VisualifyDocsify.mountAll();
      }
    });
  }
);
</script>
<script src="https://cdn.jsdelivr.net/npm/visualifyjs@latest/dist/visualify-docsify.min.js"></script>
`;
}

/**
 * Generate index.html for Docsify
 * @param {Object} options - Generation options
 * @param {string} options.docsPath - Path to docs directory
 * @param {Object} [options.config] - Custom Docsify configuration
 * @returns {string} HTML content
 */
async function generateIndexHtml(options) {
	const { docsPath, config = {} } = options;

	// Try to load existing configuration
	const visualifyConfig = await loadConfig().catch(() => ({}));
	const docsifyConfig = {
		...DEFAULT_DOCSIFY_CONFIG,
		...visualifyConfig.docsify,
		...config,
	};

	// Check for README.md
	const readmePath = path.join(docsPath, 'README.md');
	const hasReadme = await fileExists(readmePath);

	if (!hasReadme) {
		logger.warn('No README.md found in docs directory');
	}

	const configJson = JSON.stringify(docsifyConfig, null, 2);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docsifyConfig.name}</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="${docsifyConfig.name}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
  <style>
    .visualify-chart-wrapper {
      margin: 1em 0;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;
    }
    .visualify-chart-container {
      width: 100%;
      min-height: 400px;
    }
    .visualify-error {
      padding: 16px;
      border: 1px solid #ff4d4f;
      border-radius: 4px;
      background: #fff2f0;
      color: #cf1322;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = ${configJson};
  </script>
  <!-- Docsify v4 -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <!-- Search plugin -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
  <!-- Copy code plugin -->
  <script src="//cdn.jsdelivr.net/npm/docsify-copy-code@2"></script>
  ${generateVisualifyScript()}
</body>
</html>
`;
}

/**
 * Execute the docs dev command
 * @param {string} [docsPath] - Path to docs directory
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {string} options.port - Port to run server on
 * @param {string} options.host - Host to bind server to
 * @param {boolean} options.open - Open browser automatically
 * @returns {Promise<void>}
 */
async function executeDocsDev(docsPath, options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Starting docs dev server');
		logger.debug('Options:', options);

		// Find docs directory
		const targetPath = await findDocsDirectory(docsPath);
		if (!targetPath) {
			logger.error('Could not find docs directory');
			logger.tip('Create a docs/ directory or specify a path: visualify docs dev ./my-docs');
			process.exit(1);
		}

		logger.header('Documentation Development Server');
		logger.info(`Docs directory: ${targetPath}`);

		// Ensure index.html exists
		const indexPath = path.join(targetPath, 'index.html');
		if (!(await fileExists(indexPath))) {
			logger.info('Creating index.html...');
			const html = await generateIndexHtml({ docsPath: targetPath });
			await fs.writeFile(indexPath, html, 'utf-8');
			logger.success('Created index.html');
		}

		// Check for docsify-cli
		await ensureDocsifyCLI();

		const port = options.port || '3000';
		const host = options.host || 'localhost';

		logger.info('Starting Docsify dev server...');
		logger.debug(`Port: ${port}, Host: ${host}`);

		// Build docsify-cli command
		const args = ['docsify', 'serve', targetPath, '--port', port, '--host', host];

		if (options.open) {
			args.push('--open');
		}

		// Spawn docsify serve process
		const child = spawn('npx', args, {
			stdio: 'pipe',
			shell: true,
		});

		let serverStarted = false;

		child.stdout.on('data', (data) => {
			const output = data.toString();

			// Filter and format Docsify output
			if (output.includes('Listening') || output.includes('http')) {
				if (!serverStarted) {
					serverStarted = true;
					logger.success(`Server running at http://${host}:${port}`);
					logger.newline();
					logger.info('Features:');
					logger.example('Hot reload', 'Changes are automatically refreshed');
					logger.example('Visualify charts', 'Code blocks with ```visualify are rendered as charts');
					logger.newline();
					logger.tip('Press Ctrl+C to stop the server');
				}
			}

			if (options.verbose) {
				process.stdout.write(output);
			}
		});

		child.stderr.on('data', (data) => {
			const output = data.toString();

			// Only show errors unless verbose
			if (options.verbose || output.includes('error') || output.includes('Error')) {
				process.stderr.write(output);
			}
		});

		child.on('close', (code) => {
			if (code !== 0 && code !== null) {
				logger.error(`Docsify server exited with code ${code}`);
				process.exit(1);
			}
		});

		child.on('error', (err) => {
			logger.error('Failed to start Docsify server:', err.message);
			logger.tip('Try installing docsify-cli globally: npm i -g docsify-cli');
			process.exit(1);
		});

		// Handle graceful shutdown
		process.on('SIGINT', () => {
			logger.newline();
			logger.info('Shutting down server...');
			child.kill('SIGINT');
		});

		process.on('SIGTERM', () => {
			child.kill('SIGTERM');
		});

	} catch (err) {
		logger.error('Failed to start docs dev server:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Execute the docs build command
 * @param {string} [docsPath] - Path to docs directory
 * @param {string} [destPath] - Destination path for built files
 * @param {Object} options - Command options
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<void>}
 */
async function executeDocsBuild(docsPath, destPath, options) {
	try {
		if (options.verbose) {
			logger.enableVerbose();
		}

		logger.debug('Building documentation');
		logger.debug('Options:', options);

		// Find docs directory
		const sourcePath = await findDocsDirectory(docsPath);
		if (!sourcePath) {
			logger.error('Could not find docs directory');
			logger.tip('Create a docs/ directory or specify a path: visualify docs build ./my-docs');
			process.exit(1);
		}

		// Determine output directory
		const outputDir = destPath
			? path.resolve(destPath)
			: path.join(process.cwd(), 'dist-docs');

		logger.header('Documentation Build');
		logger.info(`Source: ${sourcePath}`);
		logger.info(`Output: ${outputDir}`);

		// Ensure index.html exists
		const indexPath = path.join(sourcePath, 'index.html');
		if (!(await fileExists(indexPath))) {
			logger.info('Creating index.html...');
			const html = await generateIndexHtml({ docsPath: sourcePath });
			await fs.writeFile(indexPath, html, 'utf-8');
			logger.success('Created index.html');
		}

		// Create output directory
		await fs.mkdir(outputDir, { recursive: true });

		// Copy all files from source to output
		logger.info('Copying files...');
		await copyDirectory(sourcePath, outputDir);

		logger.success('Documentation built successfully!');
		logger.newline();
		logger.info('To serve the built documentation:');
		logger.example(`npx serve ${outputDir}`, 'Serve with npx serve');
		logger.example(`python -m http.server -d ${outputDir}`, 'Serve with Python');

	} catch (err) {
		logger.error('Failed to build documentation:', err.message);
		logger.debug('Stack trace:', err.stack);
		process.exit(1);
	}
}

/**
 * Copy directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
async function copyDirectory(src, dest) {
	const entries = await fs.readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await fs.mkdir(destPath, { recursive: true });
			await copyDirectory(srcPath, destPath);
		} else {
			await fs.copyFile(srcPath, destPath);
		}
	}
}

/**
 * Execute the docs command with a subcommand
 * @param {string} action - The action to perform
 * @param {string} [docsPath] - Path to docs directory
 * @param {string} [destPath] - Destination path (for build)
 * @param {Object} options - Command options
 * @returns {Promise<void>}
 */
async function executeDocs(action, docsPath, destPath, options) {
	if (!VALID_ACTIONS.includes(action)) {
		logger.error(`Invalid action: "${action}"`);
		logger.tip(`Valid actions are: ${VALID_ACTIONS.join(', ')}`);
		process.exit(1);
	}

	switch (action) {
		case 'dev':
			await executeDocsDev(docsPath, options);
			break;
		case 'build':
			await executeDocsBuild(docsPath, destPath, options);
			break;
	}
}

/**
 * Create and configure the docs command
 * @returns {Command} The configured command
 */
function createDocsCommand() {
	const command = new Command('docs')
		.description('Documentation management commands')
		.addHelpText(
			'after',
			`
Examples:
  $ visualify docs dev                    Start dev server (auto-detect docs dir)
  $ visualify docs dev ./docs             Start dev server with specific path
  $ visualify docs dev -p 8080            Start on port 8080
  $ visualify docs build                  Build to ./dist-docs
  $ visualify docs build ./docs ./site    Build to custom output directory
  $ visualify docs dev --open             Start and open browser

Configuration:
  Create visualify.json to customize Docsify behavior:
  {
    "docsify": {
      "name": "My Documentation",
      "themeColor": "#3F51B5",
      "search": { "depth": 3 }
    }
  }
`
		);

	// Add subcommands
	command
		.command('dev')
		.description('Start the documentation development server')
		.argument('[path]', 'Path to docs directory (default: auto-detect)')
		.option('-v, --verbose', 'Enable verbose logging')
		.option('-p, --port <number>', 'Port to run the server on', '3000')
		.option('-h, --host <host>', 'Host to bind the server to', 'localhost')
		.option('-o, --open', 'Open browser automatically')
		.action((path, options) => executeDocsDev(path, options));

	command
		.command('build')
		.description('Build static documentation')
		.argument('[path]', 'Path to docs directory (default: auto-detect)')
		.argument('[dest]', 'Output directory (default: ./dist-docs)')
		.option('-v, --verbose', 'Enable verbose logging')
		.action((path, dest, options) => executeDocsBuild(path, dest, options));

	return command;
}

module.exports = {
	createDocsCommand,
	executeDocs,
	executeDocsDev,
	executeDocsBuild,
	VALID_ACTIONS,
	generateIndexHtml,
	findDocsDirectory,
};
