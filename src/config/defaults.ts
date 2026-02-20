/**
 * Default configuration values for Visualify.js
 * @module defaults
 */

import { VisualifyConfig } from '../../types';

/**
 * Complete default configuration object for Visualify.js
 * These values are used when not specified in visualify.json or overrides
 *
 * @example
 * ```typescript
 * import defaults from './defaults';
 *
 * const config = {
 *   ...defaults,
 *   mode: 'portal' // Override specific values
 * };
 * ```
 */
const defaults: VisualifyConfig = {
	/**
	 * Schema version - must match the expected version for compatibility
	 */
	version: '3.0.0',

	/**
	 * Application mode - determines how Visualify operates
	 * - 'docs': Documentation mode with markdown rendering
	 * - 'portal': Full portal mode with navigation
	 * - 'hybrid': Combined docs and portal
	 * - 'auto': Automatically detect based on content
	 */
	mode: 'auto',

	/**
	 * Documentation configuration
	 */
	docs: {
		/**
		 * Base path for documentation files
		 */
		basePath: './docs',

		/**
		 * Documentation theme
		 */
		theme: 'vue',

		/**
		 * List of plugin modules to load
		 */
		plugins: [],
	},

	/**
	 * Portal configuration
	 */
	portal: {
		/**
		 * Homepage configuration file
		 */
		homepage: 'home.json',

		/**
		 * Portal theme
		 */
		theme: 'modern',

		/**
		 * Data sources for the portal
		 */
		dataSources: [],
	},

	/**
	 * Visualization configuration
	 */
	visualization: {
		/**
		 * Default charting library
		 * - 'echarts': Apache ECharts (default)
		 * - 'plotly': Plotly.js
		 */
		defaultLibrary: 'echarts',

		/**
		 * Enable 3D visualization capabilities
		 */
		enable3D: false,

		/**
		 * Use Web Workers for rendering (improves performance)
		 */
		webWorkers: false,
	},

	/**
	 * Internationalization (i18n) configuration
	 */
	i18n: {
		/**
		 * Locale setting
		 * - 'auto': Automatically detect from browser
		 * - 'en', 'zh', 'es', 'de', 'ar', 'he': Specific language
		 */
		locale: 'auto',

		/**
		 * Fallback locale when translation is missing
		 */
		fallbackLocale: 'en',

		/**
		 * Enable RTL (Right-to-Left) layout support
		 */
		enableRTL: true,
	},
};

export default defaults;
