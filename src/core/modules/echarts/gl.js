/**
 * ECharts GL Integration Module
 * Provides lazy loading and WebGL support detection for 3D charts
 * @module echarts/gl
 */

import { toast } from 'react-toastify';

/**
 * Checks if the browser supports WebGL
 * @returns {boolean} True if WebGL is supported
 */
export function isWebGLSupported() {
	try {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl');
		return !!gl;
	} catch (e) {
		return false;
	}
}

/**
 * Gets WebGL context information for debugging
 * @returns {Object|null} WebGL context info or null if not supported
 */
export function getWebGLInfo() {
	try {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl');
		if (!gl) return null;

		return {
			vendor: gl.getParameter(gl.VENDOR),
			renderer: gl.getParameter(gl.RENDERER),
			version: gl.getParameter(gl.VERSION),
			shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
		};
	} catch (e) {
		return null;
	}
}

// Module cache for lazy loading
let echartsGLModule = null;
let loadingPromise = null;

/**
 * Lazy loads ECharts GL module
 * Only loads when 3D charts are actually rendered
 * @returns {Promise<Object>} ECharts GL module
 * @throws {Error} If WebGL is not supported or module fails to load
 */
export async function loadEChartsGL() {
	// Return cached module if available
	if (echartsGLModule) {
		return echartsGLModule;
	}

	// Return existing promise if already loading
	if (loadingPromise) {
		return loadingPromise;
	}

	// Check WebGL support before attempting to load
	if (!isWebGLSupported()) {
		const error = new Error(
			'WebGL is not supported in this browser. 3D charts require WebGL support.',
		);
		error.code = 'WEBGL_NOT_SUPPORTED';
		throw error;
	}

	// Check if echarts-gl is already loaded globally (e.g., from CDN)
	if (typeof window !== 'undefined' && window['echarts-gl']) {
		echartsGLModule = window['echarts-gl'];
		return Promise.resolve(echartsGLModule);
	}

	// Lazy load ECharts GL
	loadingPromise = import('echarts-gl')
		.then((module) => {
			echartsGLModule = module;
			return module;
		})
		.catch((error) => {
			loadingPromise = null;
			const loadError = new Error(
				`Failed to load ECharts GL: ${error.message}`,
			);
			loadError.code = 'ECHARTS_GL_LOAD_ERROR';
			loadError.originalError = error;
			throw loadError;
		});

	return loadingPromise;
}

/**
 * Preloads ECharts GL module in the background
 * Useful for improving perceived performance when 3D charts are expected
 */
export function preloadEChartsGL() {
	if (!echartsGLModule && !loadingPromise && isWebGLSupported()) {
		loadEChartsGL().catch(() => {
			// Silently fail preload - actual error handling happens at render time
		});
	}
}

/**
 * Gets the current loading state of ECharts GL
 * @returns {Object} Loading state information
 */
export function getLoadingState() {
	return {
		isLoaded: !!echartsGLModule,
		isLoading: !!loadingPromise,
		isSupported: isWebGLSupported(),
	};
}

/**
 * Displays a user-friendly error message for WebGL/3D chart errors
 * @param {Error} error - The error object
 * @param {Object} options - Display options
 * @param {boolean} options.useToast - Whether to use toast notification (default: true)
 * @param {string} options.fallbackMessage - Custom fallback message
 */
export function display3DError(error, options = {}) {
	const { useToast = true, fallbackMessage } = options;

	let message =
		fallbackMessage || 'Unable to display 3D chart. Please try a different browser.';

	if (error.code === 'WEBGL_NOT_SUPPORTED') {
		message =
			'Your browser does not support WebGL, which is required for 3D charts. ' +
			'Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
	} else if (error.code === 'ECHARTS_GL_LOAD_ERROR') {
		message =
			'Failed to load 3D chart library. Please check your internet connection and try again.';
	}

	if (useToast && typeof toast !== 'undefined') {
		toast.error(message, {
			position: 'top-center',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	}

	return message;
}

/**
 * Cleanup function to dispose of WebGL resources
 * Should be called when 3D chart components unmount
 * @param {Object} chartInstance - ECharts instance
 */
export function cleanupWebGL(chartInstance) {
	if (!chartInstance) return;

	try {
		// Remove all event listeners
		chartInstance.off();

		// Dispose the chart instance
		if (!chartInstance.isDisposed()) {
			chartInstance.dispose();
		}
	} catch (error) {
		// Silently handle cleanup errors
		console.warn('Error during WebGL cleanup:', error);
	}
}

/**
 * Hook for handling WebGL context loss
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Function} onRestore - Callback when context is restored
 * @returns {Function} Cleanup function
 */
export function handleWebGLContextLoss(canvas, onRestore) {
	if (!canvas) return () => {};

	const handleContextLost = (event) => {
		event.preventDefault();
		console.warn('WebGL context lost');
	};

	const handleContextRestored = () => {
		console.info('WebGL context restored');
		if (typeof onRestore === 'function') {
			onRestore();
		}
	};

	canvas.addEventListener('webglcontextlost', handleContextLost);
	canvas.addEventListener('webglcontextrestored', handleContextRestored);

	return () => {
		canvas.removeEventListener('webglcontextlost', handleContextLost);
		canvas.removeEventListener('webglcontextrestored', handleContextRestored);
	};
}

export default {
	isWebGLSupported,
	getWebGLInfo,
	loadEChartsGL,
	preloadEChartsGL,
	getLoadingState,
	display3DError,
	cleanupWebGL,
	handleWebGLContextLoss,
};
