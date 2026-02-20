/**
 * Docsify Plugin Entry Point
 * @description Lightweight bundle for Docsify integration
 * Exports only the charting capabilities needed for documentation
 * Global name: VisualifyDocs
 */

import DocsifyPlugin from '../docsify/plugin';
import { processMarkdown, processVisualifyBlocks, extractConfigs } from '../docsify/markdown';
import Recharts from '../core/recharts';
import LiveEditor from '../core/liveEditor';
import { VisualifyProvider } from '../core/appContext';

// Re-export shared components for docs usage
export { Recharts, LiveEditor, VisualifyProvider };

/**
 * Docsify plugin initialization
 * Registers Visualify components as Docsify plugins
 */
function install(hook, vm) {
	hook.init(function () {
		// Initialize any required setup before Docsify starts
		console.log('[VisualifyDocs] Initializing Docsify plugin...');
	});

	hook.mounted(function () {
		// Auto-mount charts with data-visualify attribute after each page mount
		const chartElements = document.querySelectorAll('[data-visualify]');
		chartElements.forEach((el) => {
			try {
				const config = JSON.parse(el.dataset.visualify || '{}');
				const chart = new Recharts(config);
				chart.mount(el);
			} catch (e) {
				console.error('[VisualifyDocs] Failed to mount chart:', e);
			}
		});
	});

	hook.doneEach(function () {
		// Re-mount charts after each navigation (SPA behavior)
		const chartElements = document.querySelectorAll('[data-visualify]');
		chartElements.forEach((el) => {
			// Skip if already mounted
			if (el.dataset.visualifyMounted) return;

			try {
				const config = JSON.parse(el.dataset.visualify || '{}');
				const chart = new Recharts(config);
				chart.mount(el);
				el.dataset.visualifyMounted = 'true';
			} catch (e) {
				console.error('[VisualifyDocs] Failed to mount chart:', e);
			}
		});
	});
}

/**
 * Global install function for UMD builds
 * Attaches to window.VisualifyDocs
 */
const VisualifyDocs = {
	// Core charting classes
	Recharts,
	LiveEditor,

	// Provider for React context
	VisualifyProvider,

	// Docsify plugin
	plugin: DocsifyPlugin,

	// Markdown processing utilities
	markdown: {
		process: processMarkdown,
		processBlocks: processVisualifyBlocks,
		extractConfigs,
	},

	// Legacy install function for backwards compatibility
	install,

	// Version info (replaced during build)
	version: process.env.VISUALIFY_VERSION || 'dev',

	/**
	 * Create a chart instance
	 * @param {Object} config - Chart configuration
	 * @returns {Recharts} Recharts instance
	 */
	createChart(config) {
		return new Recharts(config);
	},

	/**
	 * Create a live editor instance
	 * @param {Object} config - Editor configuration
	 * @returns {LiveEditor} LiveEditor instance
	 */
	createEditor(config) {
		return new LiveEditor(config);
	},

	/**
	 * Mount all charts with data-visualify attribute in container
	 * @param {string|Element} container - Container element or selector
	 */
	mountAll(container = document) {
		const root = typeof container === 'string'
			? document.querySelector(container)
			: container;

		if (!root) {
			console.error('[VisualifyDocs] Container not found:', container);
			return;
		}

		const chartElements = root.querySelectorAll('[data-visualify]');
		chartElements.forEach((el) => {
			// Skip if already mounted
			if (el.dataset.visualifyMounted) return;

			try {
				const config = JSON.parse(el.dataset.visualify || '{}');
				const chart = new Recharts(config);
				chart.mount(el);
				el.dataset.visualifyMounted = 'true';
			} catch (e) {
				console.error('[VisualifyDocs] Failed to mount chart:', e);
			}
		});
	},

	/**
	 * Process visualify code blocks in markdown content
	 * @param {string} content - Markdown content
	 * @returns {string} HTML with visualify charts
	 */
	processMarkdown(content) {
		return processVisualifyBlocks(content);
	},
};

// Auto-install if Docsify is present
if (typeof window !== 'undefined' && window.$docsify) {
	window.$docsify.plugins = [].concat(
		window.$docsify.plugins || [],
		DocsifyPlugin.install
	);
}

export default VisualifyDocs;
