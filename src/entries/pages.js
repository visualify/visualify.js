/**
 * Page Mode Entry Point
 * @description Full page mode bundle with all portal/application components
 * Loaded on demand when mode is 'pages' or standalone portal usage
 * Global name: VisualifyPages
 */

import CreateApp from '../core/visualify';

// Page components
export { default as JsonPage } from '../core/pages/jsonPage';
export { default as LoadingPage } from '../core/pages/loading';
export { default as ErrorPage } from '../core/pages/error';
export { default as NotFoundPage } from '../core/pages/404';

// Layout widgets
export { default as Layout } from '../core/widgets/layout';
export { default as Header } from '../core/widgets/header';
export { default as Footer } from '../core/widgets/footer';
export { default as Controller } from '../core/widgets/controller';
export { default as GridLayout } from '../core/widgets/layout/Grid';
export { default as Mapping } from '../core/widgets/mapping';

// Visualization components (page mode specific)
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

// Data fetching utilities
export { default as fetchData } from '../core/fetch/fetch';
export { default as condFetch } from '../core/fetch/condfetch';
export { default as vfetch } from '../core/fetch/vfetch';
export { default as jsonFetch } from '../core/fetch/json';

// Plotly support
export { default as Replotly } from '../core/modules/replotly';
export * from '../core/parser/plotly.data';
export * from '../core/parser/plotly.layout';
export * from '../core/parser/plotly.config';
export * from '../core/parser/plotly.violin';

// Data parser (for page mode API fetching)
export { default as fetchDataParser } from '../core/parser/echart.parser';
export * from '../core/parser/echart.parser';
export * from '../core/parser/echart.hilbert';

// Web vitals
export { default as reportWebVitals } from '../_utils/reportWebVitals';

// Re-export CreateApp
export { CreateApp };

/**
 * VisualifyPages namespace
 * Full page mode application bundle
 */
const VisualifyPages = {
	version: process.env.VISUALIFY_VERSION || 'dev',

	// Core application creator
	createApp: CreateApp,

	/**
	 * Initialize page mode application
	 * @param {Object} config - Application configuration
	 */
	init(config) {
		if (!config) {
			throw new Error('[VisualifyPages] Configuration object is required');
		}
		config.mode = config.mode || 'pages';
		CreateApp(config);
		console.log(`[VisualifyPages] v${this.version} initialized`);
	},
};

export default VisualifyPages;
