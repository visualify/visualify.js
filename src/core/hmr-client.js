/**
 * @fileoverview Client-side Hot Module Replacement (HMR) handler for Visualify
 * @module core/hmr-client
 *
 * Provides WebSocket client functionality for HMR, chart update logic,
 * state preservation, and error display capabilities.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Default HMR client configuration
 * @readonly
 * @type {Object}
 */
const DEFAULT_CONFIG = {
	wsUrl: 'ws://localhost:3000/__hmr',
	reconnectDelay: 1000,
	maxReconnectAttempts: 10,
	heartbeatInterval: 30000,
	debug: false,
};

/**
 * HMR Client class - manages WebSocket connection and updates
 */
class HMRClient {
	/**
	 * Create an HMR client instance
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		this.config = { ...DEFAULT_CONFIG, ...options };
		this.ws = null;
		this.reconnectAttempts = 0;
		this.reconnectTimer = null;
		this.heartbeatTimer = null;
		this.isConnected = false;
		this.updateHandlers = new Map();
		this.errorHandlers = new Set();
		this.statePreservers = new Map();
		this.errorOverlay = null;

		// Bound methods
		this.handleOpen = this.handleOpen.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleError = this.handleError.bind(this);
		this.reconnect = this.reconnect.bind(this);
		this.sendHeartbeat = this.sendHeartbeat.bind(this);
	}

	/**
	 * Initialize the HMR client and connect to WebSocket
	 * @returns {void}
	 */
	init() {
		if (this.ws) {
			this.log('HMR client already initialized');
			return;
		}

		this.log('Initializing HMR client...');
		this.connect();
		this.createErrorOverlay();
	}

	/**
	 * Connect to the WebSocket server
	 * @private
	 * @returns {void}
	 */
	connect() {
		try {
			this.log(`Connecting to ${this.config.wsUrl}...`);
			this.ws = new WebSocket(this.config.wsUrl);

			this.ws.addEventListener('open', this.handleOpen);
			this.ws.addEventListener('message', this.handleMessage);
			this.ws.addEventListener('close', this.handleClose);
			this.ws.addEventListener('error', this.handleError);
		} catch (err) {
			this.error('Failed to create WebSocket:', err);
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from the WebSocket server
	 * @returns {void}
	 */
	disconnect() {
		this.log('Disconnecting HMR client...');

		// Clear timers
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}

		// Close WebSocket
		if (this.ws) {
			this.ws.removeEventListener('open', this.handleOpen);
			this.ws.removeEventListener('message', this.handleMessage);
			this.ws.removeEventListener('close', this.handleClose);
			this.ws.removeEventListener('error', this.handleError);

			if (this.ws.readyState === WebSocket.OPEN) {
				this.ws.close();
			}

			this.ws = null;
		}

		this.isConnected = false;
	}

	/**
	 * Handle WebSocket open event
	 * @private
	 * @returns {void}
	 */
	handleOpen() {
		this.log('Connected to HMR server');
		this.isConnected = true;
		this.reconnectAttempts = 0;

		// Start heartbeat
		this.heartbeatTimer = setInterval(
			this.sendHeartbeat,
			this.config.heartbeatInterval,
		);

		// Clear any error overlay on successful connection
		this.clearErrorOverlay();

		// Send ready message
		this.send({ type: 'ready' });
	}

	/**
	 * Handle WebSocket message event
	 * @private
	 * @param {MessageEvent} event - The message event
	 * @returns {void}
	 */
	handleMessage(event) {
		try {
			const message = JSON.parse(event.data);
			this.log('Received message:', message.type);

			switch (message.type) {
				case 'connected':
					this.log('HMR connection established');
					break;

				case 'update':
					this.handleUpdate(message);
					break;

				case 'error':
					this.handleServerError(message);
					break;

				case 'ping':
					this.send({ type: 'pong' });
					break;

				default:
					this.log('Unknown message type:', message.type);
			}
		} catch (err) {
			this.error('Failed to parse message:', err);
		}
	}

	/**
	 * Handle WebSocket close event
	 * @private
	 * @returns {void}
	 */
	handleClose() {
		this.log('WebSocket connection closed');
		this.isConnected = false;

		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}

		// Attempt to reconnect
		this.scheduleReconnect();
	}

	/**
	 * Handle WebSocket error event
	 * @private
	 * @param {Event} event - The error event
	 * @returns {void}
	 */
	handleError(event) {
		this.error('WebSocket error:', event);
	}

	/**
	 * Schedule a reconnection attempt
	 * @private
	 * @returns {void}
	 */
	scheduleReconnect() {
		if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
			this.error('Max reconnection attempts reached');
			this.showErrorOverlay({
				message: 'Lost connection to HMR server. Please refresh the page.',
			});
			return;
		}

		this.reconnectAttempts++;
		const delay = this.config.reconnectDelay * Math.min(this.reconnectAttempts, 5);

		this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

		this.reconnectTimer = setTimeout(() => {
			this.reconnect();
		}, delay);
	}

	/**
	 * Attempt to reconnect to the server
	 * @private
	 * @returns {void}
	 */
	reconnect() {
		if (this.isConnected) {
			return;
		}

		this.disconnect();
		this.connect();
	}

	/**
	 * Send a heartbeat ping to keep connection alive
	 * @private
	 * @returns {void}
	 */
	sendHeartbeat() {
		if (this.isConnected) {
			this.send({ type: 'ping' });
		}
	}

	/**
	 * Send a message to the server
	 * @param {Object} message - The message to send
	 * @returns {void}
	 */
	send(message) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			try {
				this.ws.send(JSON.stringify(message));
			} catch (err) {
				this.error('Failed to send message:', err);
			}
		}
	}

	/**
	 * Handle update message from server
	 * @private
	 * @param {Object} message - The update message
	 * @returns {void}
	 */
	handleUpdate(message) {
		const { configType, file, config, changeType } = message;

		this.log(`Processing ${configType} update:`, file);

		// Clear error overlay on successful update
		this.clearErrorOverlay();

		// Get state preserver for this config type
		const preserveState = this.statePreservers.get(configType);
		let preservedState = null;

		if (preserveState && changeType !== 'removed') {
			preservedState = preserveState();
			this.log('State preserved for update');
		}

		// Call registered update handlers
		const handlers = this.updateHandlers.get(configType);
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler({
						file,
						config,
						changeType,
						preservedState,
					});
				} catch (err) {
					this.error('Update handler failed:', err);
				}
			});
		}

		// Notify general update handlers
		const generalHandlers = this.updateHandlers.get('*');
		if (generalHandlers) {
			generalHandlers.forEach((handler) => {
				try {
					handler({
						type: configType,
						file,
						config,
						changeType,
						preservedState,
					});
				} catch (err) {
					this.error('General update handler failed:', err);
				}
			});
		}
	}

	/**
	 * Handle error message from server
	 * @private
	 * @param {Object} message - The error message
	 * @returns {void}
	 */
	handleServerError(message) {
		this.error('Server error:', message.message);

		// Show error overlay
		this.showErrorOverlay({
			file: message.file,
			message: message.message,
			details: message.details,
			isSyntaxError: message.isSyntaxError,
		});

		// Notify error handlers
		this.errorHandlers.forEach((handler) => {
			try {
				handler(message);
			} catch (err) {
				this.error('Error handler failed:', err);
			}
		});
	}

	/**
	 * Create the error overlay element
	 * @private
	 * @returns {void}
	 */
	createErrorOverlay() {
		if (typeof document === 'undefined') return;

		// Remove existing overlay if any
		const existing = document.getElementById('visualify-hmr-error');
		if (existing) {
			existing.remove();
		}

		const overlay = document.createElement('div');
		overlay.id = 'visualify-hmr-error';
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.85);
			z-index: 99999;
			display: none;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			padding: 20px;
			overflow: auto;
		`;

		const content = document.createElement('div');
		content.style.cssText = `
			background: #1e1e1e;
			border-radius: 8px;
			max-width: 800px;
			margin: 40px auto;
			padding: 24px;
			color: #fff;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		`;

		content.innerHTML = `
			<div style="display: flex; align-items: center; margin-bottom: 16px;">
				<span style="
					background: #ff5555;
					color: white;
					padding: 4px 12px;
					border-radius: 4px;
					font-size: 12px;
					font-weight: bold;
					margin-right: 12px;
				">ERROR</span>
				<h2 style="margin: 0; font-size: 18px;">Hot Module Replacement Failed</h2>
			</div>
			<div id="visualify-hmr-error-message" style="
				background: #2d2d2d;
				padding: 16px;
				border-radius: 4px;
				font-family: monospace;
				font-size: 14px;
				margin-bottom: 16px;
				white-space: pre-wrap;
				word-break: break-word;
			"></div>
			<div id="visualify-hmr-error-file" style="
				color: #888;
				font-size: 12px;
				margin-bottom: 16px;
			"></div>
			<button onclick="window.__VISUALIFY_HMR_CLIENT__.clearErrorOverlay()" style="
				background: #4a9eff;
				color: white;
				border: none;
				padding: 8px 16px;
				border-radius: 4px;
				cursor: pointer;
				font-size: 14px;
			">Dismiss</button>
		`;

		overlay.appendChild(content);
		document.body.appendChild(overlay);

		this.errorOverlay = overlay;
	}

	/**
	 * Show the error overlay
	 * @private
	 * @param {Object} error - The error details
	 * @returns {void}
	 */
	showErrorOverlay(error) {
		if (!this.errorOverlay) return;

		const messageEl = document.getElementById('visualify-hmr-error-message');
		const fileEl = document.getElementById('visualify-hmr-error-file');

		if (messageEl) {
			messageEl.textContent = error.message || 'Unknown error';
		}

		if (fileEl && error.file) {
			fileEl.textContent = `File: ${error.file}`;
		}

		this.errorOverlay.style.display = 'block';
	}

	/**
	 * Clear the error overlay
	 * @returns {void}
	 */
	clearErrorOverlay() {
		if (this.errorOverlay) {
			this.errorOverlay.style.display = 'none';
		}
	}

	/**
	 * Register an update handler
	 * @param {string} configType - The config type to handle (e.g., 'main', 'component', '*')
	 * @param {Function} handler - The handler function
	 * @returns {Function} Unregister function
	 */
	onUpdate(configType, handler) {
		if (!this.updateHandlers.has(configType)) {
			this.updateHandlers.set(configType, new Set());
		}

		this.updateHandlers.get(configType).add(handler);

		// Return unregister function
		return () => {
			this.updateHandlers.get(configType)?.delete(handler);
		};
	}

	/**
	 * Register an error handler
	 * @param {Function} handler - The error handler function
	 * @returns {Function} Unregister function
	 */
	onError(handler) {
		this.errorHandlers.add(handler);

		return () => {
			this.errorHandlers.delete(handler);
		};
	}

	/**
	 * Register a state preserver function
	 * @param {string} configType - The config type
	 * @param {Function} preserver - Function that returns state to preserve
	 * @returns {Function} Unregister function
	 */
	registerStatePreserver(configType, preserver) {
		this.statePreservers.set(configType, preserver);

		return () => {
			this.statePreservers.delete(configType);
		};
	}

	/**
	 * Log a message (if debug is enabled)
	 * @private
	 * @param {...any} args - Messages to log
	 * @returns {void}
	 */
	log(...args) {
		if (this.config.debug) {
			console.log('[HMR]', ...args);
		}
	}

	/**
	 * Log an error
	 * @private
	 * @param {...any} args - Error messages
	 * @returns {void}
	 */
	error(...args) {
		console.error('[HMR]', ...args);
	}
}

// Global HMR client instance
let globalClient = null;

/**
 * Initialize the global HMR client
 * @param {Object} options - Configuration options
 * @returns {HMRClient} The HMR client instance
 */
export function initHMR(options = {}) {
	if (typeof window === 'undefined') {
		return null;
	}
	if (window.__VISUALIFY_HMR__?.enabled !== true) {
		return null;
	}

	if (!globalClient) {
		// Try to get URL from global config
		const wsUrl = window.__VISUALIFY_HMR__?.wsUrl || DEFAULT_CONFIG.wsUrl;

		globalClient = new HMRClient({
			...options,
			wsUrl,
		});

		globalClient.init();

		// Store globally for access
		window.__VISUALIFY_HMR_CLIENT__ = globalClient;
	}

	return globalClient;
}

/**
 * Get the global HMR client instance
 * @returns {HMRClient|null} The HMR client instance
 */
export function getHMRClient() {
	return globalClient || window?.__VISUALIFY_HMR_CLIENT__ || null;
}

/**
 * React hook for HMR integration
 * @param {Object} options - Hook options
 * @param {string} options.configType - The config type to listen for
 * @param {Function} options.onUpdate - Callback when update is received
 * @param {Function} options.onError - Callback when error is received
 * @param {Function} options.preserveState - Function to preserve state
 * @returns {Object} HMR status and utilities
 */
export function useHMR(options = {}) {
	const { configType, onUpdate, onError, preserveState } = options;
	const clientRef = useRef(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (window.__VISUALIFY_HMR__?.enabled !== true) return;

		// Initialize HMR client
		const client = initHMR();
		clientRef.current = client;

		if (!client) return;

		const unsubscribers = [];

		// Register update handler
		if (onUpdate && configType) {
			const unsubscribe = client.onUpdate(configType, onUpdate);
			unsubscribers.push(unsubscribe);
		}

		// Register error handler
		if (onError) {
			const unsubscribe = client.onError(onError);
			unsubscribers.push(unsubscribe);
		}

		// Register state preserver
		if (preserveState && configType) {
			const unsubscribe = client.registerStatePreserver(configType, preserveState);
			unsubscribers.push(unsubscribe);
		}

		// Cleanup
		return () => {
			unsubscribers.forEach((unsubscribe) => unsubscribe());
		};
	}, [configType, onUpdate, onError, preserveState]);

	return {
		isConnected: clientRef.current?.isConnected || false,
		client: clientRef.current,
		clearError: () => clientRef.current?.clearErrorOverlay(),
	};
}

/**
 * Preserve ECharts instance state
 * @param {Object} chartInstance - The ECharts instance
 * @returns {Object} Preserved state
 */
export function preserveChartState(chartInstance) {
	if (!chartInstance) return null;

	try {
		const option = chartInstance.getOption();

		return {
			// Preserve zoom state for dataZoom components
			dataZoom: option.dataZoom?.map((dz) => ({
				start: dz.start,
				end: dz.end,
				startValue: dz.startValue,
				endValue: dz.endValue,
			})),

			// Preserve legend selection
			legend: option.legend?.[0]?.selected,

			// Preserve tooltip state
			tooltip: option.tooltip?.[0],

			// Preserve brush selection if any
			brush: option.brush,

			// Preserve current data view
			series: option.series?.map((s) => ({
				name: s.name,
				data: s.data,
			})),
		};
	} catch (err) {
		console.error('[HMR] Failed to preserve chart state:', err);
		return null;
	}
}

/**
 * Restore ECharts instance state
 * @param {Object} chartInstance - The ECharts instance
 * @param {Object} state - The state to restore
 */
export function restoreChartState(chartInstance, state) {
	if (!chartInstance || !state) return;

	try {
		// Restore dataZoom state
		if (state.dataZoom) {
			chartInstance.setOption({
				dataZoom: state.dataZoom,
			});
		}

		// Restore legend selection
		if (state.legend) {
			chartInstance.setOption({
				legend: { selected: state.legend },
			});
		}

		// Restore brush if any
		if (state.brush) {
			chartInstance.setOption({ brush: state.brush });
		}
	} catch (err) {
		console.error('[HMR] Failed to restore chart state:', err);
	}
}

// Auto-initialize if in browser and enabled
if (typeof window !== 'undefined' && window.__VISUALIFY_HMR__?.enabled) {
	initHMR();
}

export default HMRClient;
