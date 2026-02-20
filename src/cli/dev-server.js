/**
 * @fileoverview Development server with Hot Module Replacement (HMR) for Visualify CLI
 * @module cli/dev-server
 *
 * Provides an Express server with WebSocket support for HMR,
 * static file serving, and error overlay functionality.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const { WebSocketServer } = require('ws');
const logger = require('./utils/logger');
const { createHMREngine } = require('./hmr');
const { loadConfig } = require('./utils/config');

/**
 * Default server configuration
 * @readonly
 * @type {Object}
 */
const DEFAULT_SERVER_CONFIG = {
	port: 3000,
	host: 'localhost',
	hmr: true,
	staticDirs: ['public', 'dist', 'build'],
	cors: true,
};

/**
 * Development Server class with HMR support
 */
class DevServer {
	/**
	 * Create a dev server instance
	 * @param {Object} options - Server configuration options
	 * @param {number} [options.port=3000] - Port to run the server on
	 * @param {string} [options.host='localhost'] - Host to bind the server to
	 * @param {boolean} [options.hmr=true] - Enable HMR
	 * @param {string} [options.rootDir] - Root directory for serving files
	 * @param {string} [options.mode='portal'] - Development mode (docs or portal)
	 */
	constructor(options = {}) {
		this.config = {
			...DEFAULT_SERVER_CONFIG,
			...options,
		};

		this.rootDir = options.rootDir || process.cwd();
		this.mode = options.mode || 'portal';

		this.app = null;
		this.server = null;
		this.wss = null;
		this.hmrEngine = null;
		this.isRunning = false;

		// Error overlay HTML template
		this.errorOverlayTemplate = null;
	}

	/**
	 * Start the development server
	 * @returns {Promise<void>}
	 */
	async start() {
		if (this.isRunning) {
			logger.warn('Dev server is already running');
			return;
		}

		logger.header('Starting Development Server');
		logger.debug('Server config:', this.config);

		try {
			// Create Express app
			this.app = express();

			// Configure middleware
			await this.configureMiddleware();

			// Create HTTP server
			this.server = http.createServer(this.app);

			// Setup WebSocket server for HMR
			if (this.config.hmr) {
				await this.setupWebSocket();
			}

			// Start listening
			await this.startListening();

			this.isRunning = true;
			this.printServerInfo();
		} catch (err) {
			logger.error('Failed to start dev server:', err.message);
			await this.stop();
			throw err;
		}
	}

	/**
	 * Stop the development server
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (!this.isRunning) {
			return;
		}

		logger.debug('Stopping dev server...');

		// Stop HMR engine
		if (this.hmrEngine) {
			await this.hmrEngine.stop();
			this.hmrEngine = null;
		}

		// Close WebSocket server
		if (this.wss) {
			this.wss.close();
			this.wss = null;
		}

		// Close HTTP server
		if (this.server) {
			await new Promise((resolve) => {
				this.server.close(resolve);
			});
			this.server = null;
		}

		this.app = null;
		this.isRunning = false;
		logger.success('Dev server stopped');
	}

	/**
	 * Configure Express middleware
	 * @private
	 * @returns {Promise<void>}
	 */
	async configureMiddleware() {
		// CORS middleware
		if (this.config.cors) {
			this.app.use((req, res, next) => {
				res.header('Access-Control-Allow-Origin', '*');
				res.header(
					'Access-Control-Allow-Headers',
					'Origin, X-Requested-With, Content-Type, Accept',
				);
				next();
			});
		}

		// Parse JSON bodies
		this.app.use(express.json());

		// Inject HMR client script
		this.app.use(this.injectHMRClient.bind(this));

		// Serve static files from configured directories
		for (const dir of this.config.staticDirs) {
			const staticPath = path.join(this.rootDir, dir);
			try {
				await fs.access(staticPath);
				this.app.use(express.static(staticPath));
				logger.debug(`Serving static files from: ${dir}`);
			} catch {
				logger.debug(`Static directory not found: ${dir}`);
			}
		}

		// API endpoint for server status
		this.app.get('/__hmr/status', (req, res) => {
			res.json({
				status: 'ok',
				mode: this.mode,
				hmr: this.config.hmr,
				hmrStatus: this.hmrEngine?.getStatus() || null,
				timestamp: Date.now(),
			});
		});

		// API endpoint for current config
		this.app.get('/__hmr/config', async (req, res) => {
			try {
				const config = await loadConfig();
				res.json(config);
			} catch (err) {
				res.status(500).json({ error: err.message });
			}
		});

		// Health check endpoint
		this.app.get('/__health', (req, res) => {
			res.json({ status: 'healthy', timestamp: Date.now() });
		});

		// SPA fallback for client-side routing
		this.app.get('*', this.handleSPAFallback.bind(this));

		// Error handling middleware
		this.app.use(this.handleError.bind(this));
	}

	/**
	 * Inject HMR client script into HTML responses
	 * @private
	 * @param {Object} req - Express request
	 * @param {Object} res - Express response
	 * @param {Function} next - Express next function
	 */
	injectHMRClient(req, res, next) {
		// Only process HTML requests
		if (!req.headers.accept?.includes('text/html')) {
			return next();
		}

		const originalSend = res.send.bind(res);

		res.send = (body) => {
			if (typeof body === 'string' && body.includes('</html>')) {
				const hmrScript = this.generateHMRClientScript();
				body = body.replace('</head>', `${hmrScript}</head>`);
			}
			return originalSend(body);
		};

		next();
	}

	/**
	 * Generate the HMR client script to inject
	 * @private
	 * @returns {string} The script tag HTML
	 */
	generateHMRClientScript() {
		const wsProtocol = 'ws';
		const wsUrl = `${wsProtocol}://${this.config.host}:${this.config.port}/__hmr`;

		return `
<script>
(function() {
	// Visualify HMR Client
	window.__VISUALIFY_HMR__ = {
		enabled: true,
		wsUrl: '${wsUrl}',
		connected: false,
		reconnectAttempts: 0,
		maxReconnectAttempts: 10,
		reconnectDelay: 1000
	};

	// HMR client will be initialized by the main hmr-client.js module
	// This script just sets up the configuration
	if (typeof window.VisualifyHMR !== 'undefined') {
		window.VisualifyHMR.init(window.__VISUALIFY_HMR__.wsUrl);
	}
})();
</script>`;
	}

	/**
	 * Setup WebSocket server for HMR
	 * @private
	 * @returns {Promise<void>}
	 */
	async setupWebSocket() {
		// Create WebSocket server
		this.wss = new WebSocketServer({
			server: this.server,
			path: '/__hmr',
		});

		// Create HMR engine
		this.hmrEngine = createHMREngine({
			rootDir: this.rootDir,
			debounceMs: 300,
		});

		// Handle WebSocket connections
		this.wss.on('connection', (ws, req) => {
			logger.debug(`WebSocket client connected from ${req.socket.remoteAddress}`);
			this.hmrEngine.addClient(ws);

			// Handle messages from client
			ws.on('message', (data) => {
				this.handleClientMessage(ws, data);
			});
		});

		// Start HMR engine
		await this.hmrEngine.start();

		logger.debug('WebSocket server setup complete');
	}

	/**
	 * Handle messages from WebSocket clients
	 * @private
	 * @param {WebSocket} ws - The WebSocket client
	 * @param {Buffer} data - The message data
	 */
	handleClientMessage(ws, data) {
		try {
			const message = JSON.parse(data.toString());
			logger.debug('Received message from client:', message.type);

			switch (message.type) {
				case 'ready':
					// Client is ready for updates
					logger.debug('Client reported ready');
					break;

				case 'error':
					// Client encountered an error
					logger.error('Client error:', message.message);
					break;

				case 'pong':
					// Heartbeat response
					break;

				default:
					logger.debug('Unknown message type:', message.type);
			}
		} catch (err) {
			logger.debug('Failed to parse client message:', err.message);
		}
	}

	/**
	 * Handle SPA fallback for client-side routing
	 * @private
	 * @param {Object} req - Express request
	 * @param {Object} res - Express response
	 */
	async handleSPAFallback(req, res) {
		// Don't handle API routes
		if (req.path.startsWith('/__')) {
			return res.status(404).json({ error: 'Not found' });
		}

		// Try to serve index.html
		const indexPaths = [
			path.join(this.rootDir, 'public', 'index.html'),
			path.join(this.rootDir, 'index.html'),
			path.join(this.rootDir, 'dist', 'index.html'),
		];

		for (const indexPath of indexPaths) {
			try {
				let content = await fs.readFile(indexPath, 'utf-8');

				// Inject HMR client if enabled
				if (this.config.hmr && !content.includes('__VISUALIFY_HMR__')) {
					const hmrScript = this.generateHMRClientScript();
					content = content.replace('</head>', `${hmrScript}</head>`);
				}

				return res.send(content);
			} catch {
				// Try next path
			}
		}

		// No index.html found, serve a default page
		res.send(this.generateDefaultPage());
	}

	/**
	 * Generate a default HTML page when no index.html is found
	 * @private
	 * @returns {string} The HTML page
	 */
	generateDefaultPage() {
		const hmrScript = this.config.hmr ? this.generateHMRClientScript() : '';

		return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Visualify Dev Server</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			max-width: 800px;
			margin: 50px auto;
			padding: 20px;
			background: #f5f5f5;
		}
		.container {
			background: white;
			padding: 40px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}
		h1 { color: #333; }
		.info { color: #666; margin: 20px 0; }
		.status { padding: 10px; border-radius: 4px; margin: 10px 0; }
		.status.ok { background: #d4edda; color: #155724; }
		.status.warn { background: #fff3cd; color: #856404; }
		code {
			background: #f4f4f4;
			padding: 2px 6px;
			border-radius: 3px;
			font-family: monospace;
		}
	</style>
	${hmrScript}
</head>
<body>
	<div class="container">
		<h1>Visualify Development Server</h1>
		<div class="status ok">Server is running in ${this.mode} mode</div>
		<p class="info">
			No index.html file was found in your project.
			Create a <code>public/index.html</code> file to customize this page.
		</p>
		<p><strong>Mode:</strong> ${this.mode}</p>
		<p><strong>HMR:</strong> ${this.config.hmr ? 'Enabled' : 'Disabled'}</p>
		<p><strong>Root:</strong> ${this.rootDir}</p>
		<hr>
		<p class="info">
			<a href="/__hmr/status">HMR Status</a> |
			<a href="/__health">Health Check</a>
		</p>
	</div>
</body>
</html>`;
	}

	/**
	 * Handle errors in Express
	 * @private
	 * @param {Error} err - The error object
	 * @param {Object} req - Express request
	 * @param {Object} res - Express response
	 * @param {Function} next - Express next function
	 */
	handleError(err, req, res, next) {
		logger.error('Server error:', err.message);

		if (res.headersSent) {
			return next(err);
		}

		res.status(500).json({
			error: 'Internal server error',
			message: err.message,
			...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
		});
	}

	/**
	 * Start listening on the configured port
	 * @private
	 * @returns {Promise<void>}
	 */
	async startListening() {
		return new Promise((resolve, reject) => {
			this.server.listen(this.config.port, this.config.host, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});

			this.server.on('error', (err) => {
				if (err.code === 'EADDRINUSE') {
					reject(new Error(`Port ${this.config.port} is already in use`));
				} else {
					reject(err);
				}
			});
		});
	}

	/**
	 * Print server information to console
	 * @private
	 */
	printServerInfo() {
		const protocol = 'http';
		const url = `${protocol}://${this.config.host}:${this.config.port}`;

		logger.newline();
		logger.success(`Development server running at: ${url}`);
		logger.info(`Mode: ${this.mode}`);
		logger.info(`HMR: ${this.config.hmr ? 'Enabled' : 'Disabled'}`);
		logger.newline();
		logger.tip('Press Ctrl+C to stop the server');
		logger.newline();
	}

	/**
	 * Get server status
	 * @returns {Object} Status information
	 */
	getStatus() {
		return {
			isRunning: this.isRunning,
			config: this.config,
			mode: this.mode,
			hmrStatus: this.hmrEngine?.getStatus() || null,
		};
	}
}

/**
 * Create and start a development server
 * @param {Object} options - Server configuration options
 * @returns {Promise<DevServer>} The started dev server
 */
async function createDevServer(options = {}) {
	const server = new DevServer(options);
	await server.start();
	return server;
}

module.exports = {
	DevServer,
	createDevServer,
	DEFAULT_SERVER_CONFIG,
};
