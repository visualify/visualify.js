/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 15:35:28
 * @FilePath     : /visualifyjs/src/core/visualify.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ThemeSelector from './themes/themeSelector';
import JsonRouter from './router/jsonRouter';
import { VisualifyProvider, useAppContext } from './appContext';
import { initHMR, useHMR } from './hmr-client';
import { initializeI18n } from '../i18n';

/**
 * Global app state for HMR preservation
 * @type {Object|null}
 */
let preservedAppState = null;

/**
 * Visualify root component with HMR support
 * @param {Object} props - Component props
 * @param {Object} props.config - Visualify configuration
 * @param {Object} [props.initialState] - Preserved state from HMR
 */
function Visualify({ config, initialState }) {
	// global variable
	const { theme = 'modern' } = config;
	const { setSharedData } = useAppContext();
	const isFirstRender = useRef(true);

	// Restore preserved state on mount
	useEffect(() => {
		if (initialState?.sharedData && isFirstRender.current) {
			setSharedData(initialState.sharedData);
		}
		isFirstRender.current = false;
	}, [initialState, setSharedData]);

	// Setup HMR integration
	useHMR({
		configType: 'main',
		onUpdate: (update) => {
			console.log('[Visualify] Received config update:', update.file);
			// Reload the page to apply new config
			// In a more advanced implementation, we could hot-swap the config
			if (update.config) {
				window.location.reload();
			}
		},
		onError: (error) => {
			console.error('[Visualify] HMR error:', error.message);
		},
		preserveState: () => ({
			sharedData: preservedAppState?.sharedData,
		}),
	});

	return (
		<JsonRouter config={config}>
			<ThemeSelector
				theme={theme}
				config={config}
			/>
		</JsonRouter>
	);
}

/**
 * State preservation wrapper component
 * @param {Object} props - Component props
 * @param {Object} props.config - Visualify configuration
 */
function VisualifyWithStatePreservation({ config }) {
	const [currentConfig, setCurrentConfig] = useState(config);
	const [initialState, setInitialState] = useState(null);
	const { sharedData } = useAppContext();

	// Preserve state before unloading
	useEffect(() => {
		const preserveState = () => {
			preservedAppState = {
				sharedData,
				config: currentConfig,
				timestamp: Date.now(),
			};
		};

		window.addEventListener('beforeunload', preserveState);
		return () => window.removeEventListener('beforeunload', preserveState);
	}, [sharedData, currentConfig]);

	// Handle HMR updates
	useEffect(() => {
		if (typeof window !== 'undefined' && window.__VISUALIFY_HMR__?.enabled) {
			const hmrClient = initHMR();

			if (hmrClient) {
				// Register update handler for main config
				const unsubscribe = hmrClient.onUpdate('main', (update) => {
					console.log('[Visualify] Config update received:', update);

					if (update.config) {
						// Preserve current state
						preservedAppState = { sharedData };

						// Update config
						setCurrentConfig(update.config);
						setInitialState(preservedAppState);
					}
				});

				return () => unsubscribe();
			}
		}
	}, [sharedData]);

	return (
		<Visualify
			config={currentConfig}
			initialState={initialState}
		/>
	);
}

/**
 * Create and render the Visualify application
 * @param {Object} config - Application configuration
 */
function CreateApp(config) {
	if (!config) throw new Error('Missing configuration.');
	const el = document.querySelector(config.el || '#root');
	if (!el) throw new Error('el not found. Please check your `el` option.');

	// Initialize i18n before rendering any components that use useTranslation
	initializeI18n(config.i18n || {});

	// Store original config for HMR reloads
	const originalConfig = { ...config };

	// deletion used configuration
	delete config.el;
	delete config.mode;

	const app = ReactDOM.createRoot(el);

	// Initialize HMR client if enabled
	if (typeof window !== 'undefined' && window.__VISUALIFY_HMR__?.enabled) {
		initHMR();
	}

	// Render the app — VisualifyProvider must wrap everything that uses useAppContext
	app.render(
		<React.StrictMode>
			<VisualifyProvider>
				<VisualifyWithStatePreservation config={originalConfig} />
			</VisualifyProvider>
		</React.StrictMode>,
	);

	// Expose reload function for HMR
	if (typeof window !== 'undefined') {
		window.__VISUALIFY_RELOAD__ = (newConfig) => {
			app.render(
				<React.StrictMode>
					<VisualifyProvider>
						<VisualifyWithStatePreservation
							config={newConfig || originalConfig}
						/>
					</VisualifyProvider>
				</React.StrictMode>,
			);
		};
	}
}

/**
 * Reload the application with new configuration (for HMR)
 * @param {Object} newConfig - New configuration object
 * @param {Object} [preservedState] - State to preserve during reload
 */
export function reloadApp(newConfig, preservedState) {
	if (typeof window !== 'undefined' && window.__VISUALIFY_RELOAD__) {
		// Store preserved state globally
		if (preservedState) {
			preservedAppState = preservedState;
		}

		// Trigger reload
		window.__VISUALIFY_RELOAD__(newConfig);
	} else {
		console.warn('[Visualify] Reload function not available');
	}
}

/**
 * Get the current preserved application state
 * @returns {Object|null} The preserved state
 */
export function getPreservedState() {
	return preservedAppState;
}

/**
 * Clear the preserved application state
 */
export function clearPreservedState() {
	preservedAppState = null;
}

export default CreateApp;
