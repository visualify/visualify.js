/**
 * Core 2D Charting Entry Point
 * @description Lightweight bundle with core charting capabilities
 * Includes ECharts, Recharts, parsers, themes, and essential widgets
 * Global name: VisualifyCore
 */

import '../_css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Recharts from '../core/recharts';
import LiveEditor from '../core/liveEditor';
import { VisualifyProvider, useAppContext } from '../core/appContext';

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

// Re-export core classes
export { Recharts, LiveEditor, VisualifyProvider, useAppContext };

/**
 * VisualifyCore namespace
 * Contains core 2D charting exports
 */
const VisualifyCore = {
	// Version info (replaced during build)
	version: process.env.VISUALIFY_VERSION || 'dev',

	// Core classes
	Recharts,
	LiveEditor,

	// React context
	VisualifyProvider,
	useAppContext,

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
};

export default VisualifyCore;
