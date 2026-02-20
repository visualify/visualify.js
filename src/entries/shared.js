/**
 * Shared Components Entry Point
 * @description Exports components and utilities used by both docs and portal modes
 * This enables code-splitting and reduces bundle duplication
 */

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

// Context
export { VisualifyProvider, useAppContext } from '../core/appContext';

// Shared widgets
export { default as ErrorBoundary } from '../core/widgets/errorBoundary';
export { default as CircularProgress } from '../core/widgets/circularProgress';

// Data fetching utilities
export { default as fetchData } from '../core/fetch/fetch';
export { default as condFetch } from '../core/fetch/condfetch';
export { default as vfetch } from '../core/fetch/vfetch';
export { default as jsonFetch } from '../core/fetch/json';

// Shared CSS (will be extracted by rollup)
import '../_css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
