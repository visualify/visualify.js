/**
 * Portal Application Entry Point
 * @description Full data portal bundle with all visualization components
 * Exports the complete Visualify application for standalone portals
 * Global name: Visualify
 */

import CreateApp from '../core/visualify';
import Recharts from '../core/recharts';
import LiveEditor from '../core/liveEditor';
import { VisualifyProvider, useAppContext } from '../core/appContext';

// Import shared components directly (not via shared.js to avoid code-splitting issues with UMD)
// Core chart components
export { default as ReCharts } from '../core/modules/echarts';
export { default as EChartSwitcher } from '../core/modules/echartswitcher';

// Chart utilities and parsers
export * from '../core/parser/echart.data';
export * from '../core/parser/echart.features';
export * from '../core/parser/echart.series';
export * from '../core/parser/echart.types';
export * from '../core/parser/echart.parser';
export * from '../core/parser/echart.hilbert';

// Plotly support
export { default as Replotly } from '../core/modules/replotly';
export * from '../core/parser/plotly.data';
export * from '../core/parser/plotly.layout';
export * from '../core/parser/plotly.config';
export * from '../core/parser/plotly.violin';

// ECharts utilities and presets
export * from '../core/modules/echartsUtils';
export { fetchPresetFromURL, getEmbeddedPreset } from '../core/modules/echarts/presetHandler';
export * from '../core/modules/echarts/common';

// Theme system
export { default as ThemeSelector } from '../core/themes/themeSelector';
export * from '../core/themes/modern';

// Shared widgets
export { default as ErrorBoundary } from '../core/widgets/errorBoundary';
export { default as CircularProgress } from '../core/widgets/circularProgress';

// Data fetching utilities
export { default as fetchData } from '../core/fetch/fetch';
export { default as condFetch } from '../core/fetch/condfetch';
export { default as vfetch } from '../core/fetch/vfetch';
export { default as jsonFetch } from '../core/fetch/json';

// Re-export core application classes
export { CreateApp, Recharts, LiveEditor, VisualifyProvider, useAppContext };

// Import and re-export page components
export { default as JsonPage } from '../core/pages/jsonPage';
export { default as LoadingPage } from '../core/pages/loading';
export { default as ErrorPage } from '../core/pages/error';
export { default as NotFoundPage } from '../core/pages/404';

// Import and re-export widget components
export { default as Layout } from '../core/widgets/layout';
export { default as Header } from '../core/widgets/header';
export { default as Footer } from '../core/widgets/footer';
export { default as Controller } from '../core/widgets/controller';
export { default as GridLayout } from '../core/widgets/layout/Grid';
export { default as Mapping } from '../core/widgets/mapping';

// Import and re-export visualization components
export { default as Scatter } from '../core/components/Scatter';
export { default as ScatterBio } from '../core/components/ScatterBio';
export { default as ScatterL } from '../core/components/scatterL';
export { default as VisiumPlot } from '../core/components/VisiumPlot';
export { default as Visium } from '../core/components/visium';
export { default as DotPlot } from '../core/components/dotplot';
export { default as Macaron } from '../core/components/macaron';
export { default as Ratio } from '../core/components/ratio';
export { default as Timeline } from '../core/components/timeline';
export { default as Selection } from '../core/components/selection';
export { default as SearchBar } from '../core/components/searchbar';
export { default as Browser } from '../core/components/browser';
export { default as List } from '../core/components/list';
export { default as Html } from '../core/components/html';
export { default as Markdown } from '../core/components/markdown';

// Router components
export { default as JsonRouter } from '../core/router/jsonRouter';
export * from '../core/router/alias';

// Web vitals reporting
export { default as reportWebVitals } from '../_utils/reportWebVitals';

/**
 * Visualify Portal namespace
 * Contains all exports for the full portal application
 */
const Visualify = {
	// Version info (replaced during build)
	version: process.env.VISUALIFY_VERSION || 'dev',

	// Core application
	createApp: CreateApp,

	// Charting classes
	Recharts,
	LiveEditor,

	// React context
	VisualifyProvider,
	useAppContext,

	/**
	 * Initialize the Visualify portal application
	 * @param {Object} config - Application configuration
	 * @param {string} config.el - DOM selector for mounting
	 * @param {string} config.theme - Theme name (default: 'modern')
	 * @param {Object} config.routes - Route configuration
	 * @param {Object} config.data - Initial data
	 */
	init(config) {
		if (!config) {
			throw new Error('[Visualify] Configuration object is required');
		}

		if (!config.el) {
			throw new Error('[Visualify] config.el is required (DOM selector)');
		}

		// Set default mode to pages for portal
		config.mode = config.mode || 'pages';

		// Initialize the application
		CreateApp(config);

		// Report web vitals if enabled
		if (config.reportWebVitals !== false) {
			reportWebVitals();
		}

		console.log(`[Visualify] Portal v${this.version} initialized`);
	},

	/**
	 * Create a chart instance (convenience method)
	 * @param {Object} config - Chart configuration
	 * @returns {Recharts} Recharts instance
	 */
	chart(config) {
		return new Recharts(config);
	},

	/**
	 * Create a live editor instance (convenience method)
	 * @param {Object} config - Editor configuration
	 * @returns {LiveEditor} LiveEditor instance
	 */
	editor(config) {
		return new LiveEditor(config);
	},

	/**
	 * Check if running in browser environment
	 * @returns {boolean}
	 */
	get isBrowser() {
		return typeof window !== 'undefined';
	},

	/**
	 * Check if running in Node.js environment
	 * @returns {boolean}
	 */
	get isNode() {
		return typeof window === 'undefined';
	},
};

// Auto-initialize if window.$visualify is already set (legacy support)
if (typeof window !== 'undefined' && window.$visualify) {
	const config = window.$visualify;
	if (config.mode === 'pages' || config.mode === undefined) {
		Visualify.init(config);
	}
}

// Also support the property setter pattern for deferred initialization
if (typeof window !== 'undefined') {
	let _visualifyConfig = null;

	Object.defineProperty(window, '$visualify', {
		set(config) {
			_visualifyConfig = config;
			if (config && (config.mode === 'pages' || config.mode === undefined)) {
				Visualify.init(config);
			}
		},
		get() {
			return _visualifyConfig;
		},
		configurable: true,
	});
}

export default Visualify;
