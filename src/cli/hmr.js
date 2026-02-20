/**
 * @fileoverview Hot Module Replacement (HMR) engine for Visualify CLI
 * @module cli/hmr
 *
 * Provides file watching, change detection, and WebSocket communication
 * for instant feedback during development without full page reloads.
 */

const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./utils/logger');
const { loadConfig } = require('./utils/config');

/**
 * Default HMR configuration
 * @readonly
 * @type {Object}
 */
const DEFAULT_HMR_CONFIG = {
	enabled: true,
	debounceMs: 300,
	watchPatterns: ['visualify.json', '**/*.json'],
	ignoredPatterns: [
		'**/node_modules/**',
		'**/dist/**',
		'**/build/**',
		'**/.git/**',
		'**/coverage/**',
	],
};

/**
 * HMR Engine class - manages file watching and WebSocket communication
 */
class HMREngine {
	/**
	 * Create an HMR engine instance
	 * @param {Object} options - Configuration options
	 * @param {string} options.rootDir - Root directory to watch
	 * @param {number} [options.debounceMs=300] - Debounce time in milliseconds
	 * @param {string[]} [options.watchPatterns] - File patterns to watch
	 * @param {string[]} [options.ignoredPatterns] - Patterns to ignore
	 */
	constructor(options = {}) {
		this.rootDir = options.rootDir || process.cwd();
		this.config = {
			...DEFAULT_HMR_CONFIG,
			...options,
		};

		this.watcher = null;
		this.clients = new Set();
		this.pendingChanges = new Map();
		this.debounceTimers = new Map();
		this.isRunning = false;
		this.currentConfig = null;

		// Bind methods to preserve context
		this.handleFileChange = this.handleFileChange.bind(this);
		this.handleFileAdd = this.handleFileAdd.bind(this);
		this.handleFileUnlink = this.handleFileUnlink.bind(this);
		this.handleError = this.handleError.bind(this);
	}

	/**
	 * Start the HMR engine
	 * @returns {Promise<void>}
	 */
	async start() {
		if (this.isRunning) {
			logger.warn('HMR engine is already running');
			return;
		}

		logger.debug('Starting HMR engine...');

		try {
			// Load initial config
			this.currentConfig = await loadConfig();

			// Initialize file watcher
			await this.initializeWatcher();

			this.isRunning = true;
			logger.success('HMR engine started');
		} catch (err) {
			logger.error('Failed to start HMR engine:', err.message);
			throw err;
		}
	}

	/**
	 * Stop the HMR engine and cleanup resources
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (!this.isRunning) {
			return;
		}

		logger.debug('Stopping HMR engine...');

		// Clear all pending debounce timers
		for (const [filePath, timer] of this.debounceTimers) {
			clearTimeout(timer);
			logger.debug(`Cleared debounce timer for: ${filePath}`);
		}
		this.debounceTimers.clear();
		this.pendingChanges.clear();

		// Close file watcher
		if (this.watcher) {
			await this.watcher.close();
			this.watcher = null;
			logger.debug('File watcher closed');
		}

		// Close all client connections
		this.clients.clear();

		this.isRunning = false;
		logger.success('HMR engine stopped');
	}

	/**
	 * Initialize the file watcher
	 * @private
	 * @returns {Promise<void>}
	 */
	async initializeWatcher() {
		const watchPaths = this.config.watchPatterns.map((pattern) =>
			path.resolve(this.rootDir, pattern),
		);

		logger.debug('Watching patterns:', watchPaths);
		logger.debug('Ignored patterns:', this.config.ignoredPatterns);

		this.watcher = chokidar.watch(watchPaths, {
			ignored: this.config.ignoredPatterns,
			persistent: true,
			ignoreInitial: true,
			awaitWriteFinish: {
				stabilityThreshold: 100,
				pollInterval: 100,
			},
		});

		// Set up event handlers
		this.watcher
			.on('change', this.handleFileChange)
			.on('add', this.handleFileAdd)
			.on('unlink', this.handleFileUnlink)
			.on('error', this.handleError);

		// Wait for watcher to be ready
		await new Promise((resolve, reject) => {
			this.watcher.once('ready', resolve);
			this.watcher.once('error', reject);
		});

		logger.debug('File watcher is ready');
	}

	/**
	 * Handle file change event
	 * @private
	 * @param {string} filePath - Path to the changed file
	 */
	async handleFileChange(filePath) {
		logger.debug(`File changed: ${filePath}`);
		this.debounceChange(filePath, 'change');
	}

	/**
	 * Handle file add event
	 * @private
	 * @param {string} filePath - Path to the added file
	 */
	async handleFileAdd(filePath) {
		logger.debug(`File added: ${filePath}`);
		this.debounceChange(filePath, 'add');
	}

	/**
	 * Handle file unlink event
	 * @private
	 * @param {string} filePath - Path to the removed file
	 */
	async handleFileUnlink(filePath) {
		logger.debug(`File removed: ${filePath}`);
		this.debounceChange(filePath, 'unlink');
	}

	/**
	 * Handle watcher error
	 * @private
	 * @param {Error} err - The error object
	 */
	handleError(err) {
		logger.error('HMR watcher error:', err.message);
		this.broadcast({
			type: 'error',
			message: `Watcher error: ${err.message}`,
		});
	}

	/**
	 * Debounce file changes to avoid rapid updates
	 * @private
	 * @param {string} filePath - Path to the changed file
	 * @param {string} changeType - Type of change (change, add, unlink)
	 */
	debounceChange(filePath, changeType) {
		// Clear existing timer for this file
		const existingTimer = this.debounceTimers.get(filePath);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		// Set new timer
		const timer = setTimeout(async () => {
			this.debounceTimers.delete(filePath);
			await this.processChange(filePath, changeType);
		}, this.config.debounceMs);

		this.debounceTimers.set(filePath, timer);
	}

	/**
	 * Process a debounced file change
	 * @private
	 * @param {string} filePath - Path to the changed file
	 * @param {string} changeType - Type of change
	 */
	async processChange(filePath, changeType) {
		try {
			// Check if it's the main config file
			const isMainConfig = path.basename(filePath) === 'visualify.json';

			if (isMainConfig) {
				await this.handleMainConfigChange(filePath, changeType);
			} else {
				await this.handleComponentChange(filePath, changeType);
			}
		} catch (err) {
			logger.error(`Error processing change for ${filePath}:`, err.message);
			this.broadcast({
				type: 'error',
				file: filePath,
				message: err.message,
				details: err.stack,
			});
		}
	}

	/**
	 * Handle changes to the main visualify.json config
	 * @private
	 * @param {string} filePath - Path to the config file
	 * @param {string} changeType - Type of change
	 */
	async handleMainConfigChange(filePath, changeType) {
		logger.info('Main config changed, reloading...');

		if (changeType === 'unlink') {
			this.broadcast({
				type: 'error',
				file: filePath,
				message: 'Main configuration file was deleted',
			});
			return;
		}

		try {
			// Validate and load new config
			const newConfig = await loadConfig(filePath);

			// Store previous config for comparison
			const previousConfig = this.currentConfig;
			this.currentConfig = newConfig;

			// Broadcast update to all clients
			this.broadcast({
				type: 'update',
				file: filePath,
				configType: 'main',
				config: newConfig,
				previousConfig,
			});

			logger.success('Main config updated and broadcasted');
		} catch (err) {
			logger.error('Failed to reload main config:', err.message);
			this.broadcast({
				type: 'error',
				file: filePath,
				message: `Config error: ${err.message}`,
				isSyntaxError: err instanceof SyntaxError,
			});
		}
	}

	/**
	 * Handle changes to component JSON files
	 * @private
	 * @param {string} filePath - Path to the component file
	 * @param {string} changeType - Type of change
	 */
	async handleComponentChange(filePath, changeType) {
		logger.info(`Component file changed: ${path.basename(filePath)}`);

		if (changeType === 'unlink') {
			this.broadcast({
				type: 'update',
				file: filePath,
				configType: 'component',
				changeType: 'removed',
			});
			return;
		}

		try {
			// Read and validate the component JSON
			const content = await fs.readFile(filePath, 'utf-8');
			const componentConfig = JSON.parse(content);

			// Broadcast update to all clients
			this.broadcast({
				type: 'update',
				file: filePath,
				configType: 'component',
				changeType: 'updated',
				config: componentConfig,
			});

			logger.success(`Component ${path.basename(filePath)} updated`);
		} catch (err) {
			logger.error(`Failed to reload component ${filePath}:`, err.message);
			this.broadcast({
				type: 'error',
				file: filePath,
				message: `Component error: ${err.message}`,
				isSyntaxError: err instanceof SyntaxError,
			});
		}
	}

	/**
	 * Add a WebSocket client connection
	 * @param {WebSocket} client - The WebSocket client
	 */
	addClient(client) {
		this.clients.add(client);
		logger.debug(`Client connected. Total clients: ${this.clients.size}`);

		// Send initial ready message
		this.sendToClient(client, {
			type: 'connected',
			message: 'HMR connected',
			timestamp: Date.now(),
		});

		// Handle client disconnect
		client.on('close', () => {
			this.removeClient(client);
		});

		client.on('error', (err) => {
			logger.debug('Client WebSocket error:', err.message);
			this.removeClient(client);
		});
	}

	/**
	 * Remove a WebSocket client connection
	 * @param {WebSocket} client - The WebSocket client
	 */
	removeClient(client) {
		this.clients.delete(client);
		logger.debug(`Client disconnected. Total clients: ${this.clients.size}`);
	}

	/**
	 * Send a message to a specific client
	 * @param {WebSocket} client - The WebSocket client
	 * @param {Object} message - The message to send
	 */
	sendToClient(client, message) {
		if (client.readyState === 1) {
			// WebSocket.OPEN
			try {
				client.send(JSON.stringify(message));
			} catch (err) {
				logger.debug('Failed to send message to client:', err.message);
				this.removeClient(client);
			}
		}
	}

	/**
	 * Broadcast a message to all connected clients
	 * @param {Object} message - The message to broadcast
	 */
	broadcast(message) {
		const messageStr = JSON.stringify({
			...message,
			timestamp: Date.now(),
		});

		let sentCount = 0;
		for (const client of this.clients) {
			if (client.readyState === 1) {
				// WebSocket.OPEN
				try {
					client.send(messageStr);
					sentCount++;
				} catch (err) {
					logger.debug('Failed to broadcast to client:', err.message);
					this.removeClient(client);
				}
			}
		}

		logger.debug(`Broadcasted message to ${sentCount} clients`);
	}

	/**
	 * Get current HMR status
	 * @returns {Object} Status information
	 */
	getStatus() {
		return {
			isRunning: this.isRunning,
			clientCount: this.clients.size,
			pendingChanges: this.pendingChanges.size,
			debounceTimers: this.debounceTimers.size,
			watchPatterns: this.config.watchPatterns,
		};
	}
}

/**
 * Create and configure an HMR engine instance
 * @param {Object} options - Configuration options
 * @returns {HMREngine} The configured HMR engine
 */
function createHMREngine(options = {}) {
	return new HMREngine(options);
}

module.exports = {
	HMREngine,
	createHMREngine,
	DEFAULT_HMR_CONFIG,
};
