/**
 * Visualify.js Rollup Configuration
 * @description Multi-mode build system with on-demand chunk splitting
 *
 * Build Outputs:
 * - dist/visualify-docs.js (UMD) - Docsify plugin bundle
 * - dist/visualify-docs.esm.js (ESM) - Docsify plugin ESM
 * - dist/visualify-portal.js (UMD) - Full portal bundle
 * - dist/visualify-portal.esm.js (ESM) - Full portal ESM
 * - dist/visualify-shared.js - Shared components chunk
 * - dist/visualify.js - Legacy single-file build
 * - dist/visualify-core.js (UMD/ESM) - Core 2D charts only
 * - dist/visualify-3d.js (UMD/ESM) - 3D visualization chunk
 * - dist/visualify-pages.js (UMD/ESM) - Page mode components
 * - dist/stats.html - Bundle analysis visualization
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import image from '@rollup/plugin-image';
import inlineReactSvg from 'babel-plugin-inline-react-svg';
import url from '@rollup/plugin-url';
import { visualizer } from 'rollup-plugin-visualizer';

// =============================================================================
// Configuration Constants
// =============================================================================

/** Bundle size thresholds for warnings (in KB) */
const SIZE_THRESHOLDS = {
	docs: 500,      // Docs bundle should be lightweight
	portal: 2000,   // Portal bundle can be larger
	shared: 1000,   // Shared chunk threshold
	threejs: 3000,  // 3D libs are large - separate threshold
	core: 300,      // Core 2D charts - should be small
	charts3d: 200,  // 3D chunk (excluding external 3D libs)
	pages: 500,     // Page mode components
};

/** Version from package.json */
const PACKAGE_VERSION = process.env.npm_package_version || 'dev';

/** Sourcemaps only in development (npm run rollup:dev) */
const SOURCEMAP = process.env.NODE_ENV === 'development';

/** External dependencies that should not be bundled */
const EXTERNAL_DEPS = [
	'react',
	'react-dom',
	'react-dom/client',
	'react/jsx-runtime',
	'echarts',
	'echarts-for-react',
	'echarts-gl',
	'react-plotly.js',
	'plotly.js',
	'react-router-dom',
	'react-bootstrap',
	'bootstrap',
	'axios',
	'lodash',
	'dompurify',
	'react-markdown',
	'remark',
	'remark-html',
	'react-select',
	'react-ace',
	'ace-builds',
	'hilbert',
	'three',
	'@react-three/fiber',
	'@react-three/drei',
];

/** Peer dependencies (always external) */
const PEER_DEPS = ['react', 'react-dom'];

/** Common UMD globals mapping */
const COMMON_GLOBALS = {
	react: 'React',
	'react-dom': 'ReactDOM',
	'react-dom/client': 'ReactDOM',
	echarts: 'echarts',
	'echarts-for-react': 'ReactEcharts',
	'echarts-gl': 'echartsGL',
	lodash: '_',
	hilbert: 'hilbert',
	'react-ace': 'AceEditor',
	three: 'THREE',
	'@react-three/fiber': 'ReactThreeFiber',
	'@react-three/drei': 'ReactThreeDrei',
	'react-bootstrap': 'reactBootstrap',
	'react-router-dom': 'reactRouterDom',
	dompurify: 'DOMPurify',
	axios: 'axios',
	'remark-html': 'remarkHtml',
	'react-select': 'Select',
	'react-plotly.js': 'Plotly',
};

// =============================================================================
// Plugin Configurations
// =============================================================================

/**
 * Create common plugins shared across all builds
 * @param {Object} options - Plugin options
 * @returns {Array} Array of Rollup plugins
 */
/**
 * Custom plugin to resolve extensionless imports in node_modules
 * (e.g., echarts-gl imports zrender/lib/animation/requestAnimationFrame without .js)
 */
/**
 * Fix implicit global assignments in legacy CommonJS modules that break strict mode
 * (e.g., hilbert/hilbert3d.js uses bare `debug = false; log = function(...){}`)
 */
/**
 * Post-process IIFE output to use safe global references (typeof + window)
 * instead of bare variable references that throw ReferenceError when missing.
 * Transforms the IIFE closing: }(echarts,Plotly,...);
 * Into: }(typeof echarts!=="undefined"?echarts:void 0,...);
 */
function safeExternalGlobals() {
	const globalNames = ['echarts', 'echartsGL', 'Plotly'];
	return {
		name: 'safe-external-globals',
		renderChunk(code) {
			// Only target the IIFE closing pattern at end of file: }(global1,global2,...);
			const iifeClosingRegex = /\}\(([^)]+)\);?\s*$/;
			const match = code.match(iifeClosingRegex);
			if (!match) return null;

			const args = match[1];
			const safeArgs = args.split(',').map(arg => {
				const trimmed = arg.trim();
				if (globalNames.includes(trimmed)) {
					return `typeof ${trimmed}!=="undefined"?${trimmed}:void 0`;
				}
				return trimmed;
			}).join(',');

			if (safeArgs === args) return null;

			const modified = code.slice(0, match.index) + `}(${safeArgs});`;
			return { code: modified, map: null };
		},
	};
}

function fixImplicitGlobals() {
	return {
		name: 'fix-implicit-globals',
		transform(code, id) {
			if (id.includes('hilbert') && id.endsWith('.js')) {
				// Prepend var declarations for bare globals
				if (code.includes('debug = false') || code.includes('log = function')) {
					return 'var debug, log;\n' + code;
				}
			}
			return null;
		},
	};
}

function resolveExtensionless() {
	return {
		name: 'resolve-extensionless',
		async resolveId(source, importer) {
			if (!importer || !importer.includes('node_modules')) return null;
			if (source.startsWith('.') || source.startsWith('/')) return null;
			// Only handle bare module paths that look like deep imports
			if (!source.includes('/lib/') && !source.includes('/src/')) return null;

			const { resolve } = await import('path');
			const { existsSync } = await import('fs');
			const baseDir = importer.substring(0, importer.lastIndexOf('node_modules') + 'node_modules'.length);
			const fullPath = resolve(baseDir, source);

			// Try adding .js extension
			if (!existsSync(fullPath) && existsSync(fullPath + '.js')) {
				return fullPath + '.js';
			}
			return null;
		},
	};
}

function createCommonPlugins(options = {}) {
	const { isProduction = true } = options;

	return [
		// Resolve extensionless deep imports in node_modules
		resolveExtensionless(),

		// Replace environment variables
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
			'process.env.VISUALIFY_VERSION': JSON.stringify(PACKAGE_VERSION),
		}),

		// Resolve node_modules dependencies
		resolve({
			browser: true,
			preferBuiltins: false,
			extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts'],
		}),

		// Handle JSON imports
		json(),

		// Process CSS and inject
		postcss({
			extensions: ['.css'],
			inject: true,
			minimize: isProduction,
		}),

		// Handle image imports
		image(),

		// URL handling for assets
		url({
			include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
			limit: 0,
			emitFiles: true,
		}),

		// Babel transpilation
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled',
			presets: ['@babel/preset-env', '@babel/preset-react'],
			plugins: [inlineReactSvg],
		}),

		// Fix implicit globals in legacy CJS modules (must run before commonjs)
		fixImplicitGlobals(),

		// CommonJS support
		commonjs({
			include: 'node_modules/**',
		}),

		// Node polyfills for browser
		nodePolyfills(),
	];
}

/**
 * Create production plugins (minification)
 * @returns {Array} Production plugins
 */
function createProductionPlugins() {
	return [
		// Minification with terser
		terser({
			compress: {
				drop_console: false, // Keep console for debugging
				drop_debugger: true,
				pure_funcs: ['console.log'], // Remove console.log in production
			},
			mangle: true,
			format: {
				comments: false,
			},
		}),
	];
}

/**
 * Create bundle analyzer plugin
 * @param {string} filename - Output filename for stats
 * @returns {Object} Visualizer plugin
 */
function createVisualizerPlugin(filename = 'stats.html') {
	return visualizer({
		filename: `dist/${filename}`,
		title: 'Visualify Bundle Analysis',
		template: 'treemap', // treemap, sunburst, or network
		sourcemap: SOURCEMAP,
		gzipSize: true,
		brotliSize: true,
	});
}

// =============================================================================
// Warning Handler
// =============================================================================

/**
 * Custom warning handler to filter noise and highlight important issues
 * @param {Object} warning - Rollup warning object
 * @param {Function} warn - Default warn function
 */
function onwarn(warning, warn) {
	// Ignore module level directives (use client, etc.)
	if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
		return;
	}

	// Ignore circular dependency warnings from node_modules
	if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.ids?.some(id => id.includes('node_modules'))) {
		return;
	}

	// Ignore eval warnings (some dependencies use eval)
	if (warning.code === 'EVAL') {
		return;
	}

	// Log bundle size warnings
	if (warning.code === 'PLUGIN_WARNING' && warning.message?.includes('bundle size')) {
		console.warn(`⚠️  Bundle Size Warning: ${warning.message}`);
	}

	// Warn about 3D library dynamic imports
	if (warning.code === 'UNRESOLVED_IMPORT') {
		const threeJsLibs = ['three', '@react-three/fiber', '@react-three/drei', 'echarts-gl'];
		if (threeJsLibs.some(lib => warning.source?.includes(lib))) {
			console.warn(`⚠️  3D Library Import: ${warning.source} - Ensure it's available at runtime`);
			return;
		}
	}

	// Handle dynamic import warnings for 3D chunks
	if (warning.code === 'DYNAMIC_IMPORT_FAILED') {
		console.warn(`⚠️  Dynamic Import Warning: ${warning.message}`);
		return;
	}

	warn(warning);
}

// =============================================================================
// Build Configurations
// =============================================================================

/**
 * Docs entry configuration
 * Lightweight bundle for Docsify plugin usage
 */
const docsConfig = {
	input: 'src/entries/docs.js',
	output: [
		{
			file: 'dist/visualify-docs.js',
			format: 'umd',
			name: 'VisualifyDocs',
			globals: {
				react: 'React',
				'react-dom': 'ReactDOM',
				'react-dom/client': 'ReactDOM',
				'echarts-for-react': 'ReactEcharts',
				lodash: '_',
				hilbert: 'hilbert',
				'react-ace': 'AceEditor',
				three: 'THREE',
				'echarts-gl': 'echartsGL',
			},
			exports: 'named',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			// Preserve dynamic imports for 3D lazy loading
			// Dynamic import() statements will be preserved for runtime loading
			// Banner with version info
			banner: `/*! VisualifyDocs v${PACKAGE_VERSION} | Docsify Plugin Bundle */`,
		},
		{
			file: 'dist/visualify-docs.esm.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! VisualifyDocs v${PACKAGE_VERSION} | Docsify Plugin ESM */`,
			// Preserve dynamic imports for 3D lazy loading
			// This allows Three.js to be loaded only when needed
		},
	],
	external: EXTERNAL_DEPS,
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		...createProductionPlugins(),
	],
	onwarn,
};

/**
 * Portal entry configuration
 * Full application bundle for data portals
 */
const portalConfig = {
	input: 'src/entries/portal.js',
	output: [
		{
			file: 'dist/visualify-portal.js',
			format: 'umd',
			name: 'Visualify',
			globals: {
				react: 'React',
				'react-dom': 'ReactDOM',
				'react-dom/client': 'ReactDOM',
				echarts: 'echarts',
				'echarts-for-react': 'ReactEcharts',
				lodash: '_',
				hilbert: 'hilbert',
				'react-ace': 'AceEditor',
				'react-bootstrap': 'reactBootstrap',
				'react-router-dom': 'reactRouterDom',
				dompurify: 'DOMPurify',
				axios: 'axios',
				'remark-html': 'remarkHtml',
				'react-select': 'Select',
				'react-plotly.js': 'Plotly',
				three: 'THREE',
				'echarts-gl': 'echartsGL',
				'@react-three/fiber': 'ReactThreeFiber',
				'@react-three/drei': 'ReactThreeDrei',
			},
			exports: 'named',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			// Preserve dynamic imports for 3D lazy loading
			// Dynamic import() statements will be preserved for runtime loading
			banner: `/*! Visualify v${PACKAGE_VERSION} | Portal Bundle */`,
		},
		{
			file: 'dist/visualify-portal.esm.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! Visualify v${PACKAGE_VERSION} | Portal ESM */`,
			// Preserve dynamic imports for 3D lazy loading
			// Three.js and ECharts GL will be loaded on demand
		},
	],
	external: EXTERNAL_DEPS,
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		...createProductionPlugins(),
	],
	onwarn,
};

/**
 * Shared chunk configuration
 * Code-splitting for components used by both docs and portal
 */
const sharedConfig = {
	input: 'src/entries/shared.js',
	output: [
		{
			file: 'dist/visualify-shared.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			banner: `/*! Visualify v${PACKAGE_VERSION} | Shared Components */`,
		},
	],
	external: EXTERNAL_DEPS,
	plugins: createCommonPlugins({ isProduction: true }),
	onwarn,
};

/**
 * Legacy single-file build — IIFE for direct <script> tag usage
 * Externalizes heavy libraries (echarts, plotly, three) to keep bundle under 4MB.
 * IMPORTANT: CDN <script> tags for echarts/plotly MUST load before this bundle.
 * Use dist/visualify-loader.js for automatic CDN loading.
 */
const legacyConfig = {
	input: 'src/index.js',
	output: {
		file: 'dist/visualify.js',
		format: 'iife',
		name: 'Visualify',
		sourcemap: SOURCEMAP,
		inlineDynamicImports: true,
		banner: `/*! Visualify v${PACKAGE_VERSION} | Legacy Build (requires echarts + plotly CDN) */`,
		globals: {
			'echarts': 'echarts',
			'echarts-gl': 'echartsGL',
			'plotly.js': 'Plotly',
			'plotly.js/dist/plotly': 'Plotly',
		},
	},
	// Externalize heavy visualization libraries — MUST be loaded via CDN first
	external: (id) => {
		if (['echarts', 'echarts-gl'].includes(id)) return true;
		if (id.startsWith('plotly.js')) return true;
		return false;
	},
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		terser({
			compress: {
				drop_console: false,
				drop_debugger: true,
				keep_classnames: true,
				keep_fnames: true,
			},
			mangle: {
				keep_classnames: true,
				keep_fnames: true,
			},
			format: {
				comments: false,
			},
		}),
	],
	onwarn,
};

/**
 * Docs static bundle - Used by the documentation site
 * Same externalization as legacy — docs/index.html has CDN scripts
 */
const docsStaticConfig = {
	input: 'src/index.js',
	output: {
		file: 'docs/static/js/visualify.js',
		format: 'iife',
		name: 'Visualify',
		sourcemap: false,
		inlineDynamicImports: true,
		banner: `/*! Visualify v${PACKAGE_VERSION} | Docs Static Bundle (requires echarts + plotly CDN) */`,
		globals: {
			'echarts': 'echarts',
			'echarts-gl': 'echartsGL',
			'plotly.js': 'Plotly',
			'plotly.js/dist/plotly': 'Plotly',
		},
	},
	external: (id) => {
		if (['echarts', 'echarts-gl'].includes(id)) return true;
		if (id.startsWith('plotly.js')) return true;
		return false;
	},
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		terser({
			compress: {
				drop_console: false,
				drop_debugger: true,
				keep_classnames: true,
				keep_fnames: true,
			},
			mangle: {
				keep_classnames: true,
				keep_fnames: true,
			},
			format: {
				comments: false,
			},
		}),
	],
	onwarn,
};

// =============================================================================
// On-Demand Chunk Configurations (v3 Bundle Splitting)
// =============================================================================

/**
 * Core 2D Charts chunk
 * Lightweight bundle with only core charting capabilities
 */
const coreConfig = {
	input: 'src/entries/core.js',
	output: [
		{
			file: 'dist/visualify-core.js',
			format: 'umd',
			name: 'VisualifyCore',
			globals: COMMON_GLOBALS,
			exports: 'named',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! VisualifyCore v${PACKAGE_VERSION} | Core 2D Charts */`,
		},
		{
			file: 'dist/visualify-core.esm.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! VisualifyCore v${PACKAGE_VERSION} | Core 2D Charts ESM */`,
		},
	],
	external: EXTERNAL_DEPS,
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		...createProductionPlugins(),
	],
	onwarn,
};

/**
 * 3D Charts chunk
 * Loaded on demand when 3D chart types are used
 * External: three, echarts-gl, @react-three/*
 */
const charts3dConfig = {
	input: 'src/entries/charts3d.js',
	output: [
		{
			file: 'dist/visualify-3d.js',
			format: 'umd',
			name: 'Visualify3D',
			globals: COMMON_GLOBALS,
			exports: 'named',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! Visualify3D v${PACKAGE_VERSION} | 3D Charts Chunk */`,
		},
		{
			file: 'dist/visualify-3d.esm.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! Visualify3D v${PACKAGE_VERSION} | 3D Charts ESM */`,
		},
	],
	external: EXTERNAL_DEPS,
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		...createProductionPlugins(),
	],
	onwarn,
};

/**
 * Page Mode chunk
 * Loaded on demand for full portal/application usage
 */
const pagesConfig = {
	input: 'src/entries/pages.js',
	output: [
		{
			file: 'dist/visualify-pages.js',
			format: 'umd',
			name: 'VisualifyPages',
			globals: COMMON_GLOBALS,
			exports: 'named',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! VisualifyPages v${PACKAGE_VERSION} | Page Mode Chunk */`,
		},
		{
			file: 'dist/visualify-pages.esm.js',
			format: 'esm',
			sourcemap: SOURCEMAP,
			inlineDynamicImports: true,
			banner: `/*! VisualifyPages v${PACKAGE_VERSION} | Page Mode ESM */`,
		},
	],
	external: EXTERNAL_DEPS,
	plugins: [
		...createCommonPlugins({ isProduction: true }),
		...createProductionPlugins(),
	],
	onwarn,
};

/**
 * CDN Loader — tiny bootstrap script that auto-loads CDN deps then visualify.js
 * Users include just one <script> tag instead of multiple CDN + visualify tags
 */
const loaderConfig = {
	input: 'src/loader.js',
	output: {
		file: 'dist/visualify-loader.js',
		format: 'iife',
		banner: `/*! Visualify Loader v${PACKAGE_VERSION} | Auto-loads CDN deps + visualify.js */`,
	},
	plugins: [
		terser({
			compress: { drop_console: false, drop_debugger: true },
			format: { comments: false },
		}),
	],
	onwarn,
};

// =============================================================================
// Development Configuration (when NODE_ENV=development)
// =============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
	// Add visualizer in development builds
	docsConfig.plugins.push(createVisualizerPlugin('stats-docs.html'));
	portalConfig.plugins.push(createVisualizerPlugin('stats-portal.html'));
	portalConfig.plugins.push(createVisualizerPlugin('stats.html'));
}

// =============================================================================
// Export Configuration Array
// =============================================================================

/**
 * Export all build configurations
 * Rollup will build each configuration in parallel
 */
export default [
	// Primary dual-mode builds
	docsConfig,
	portalConfig,

	// Shared components chunk
	sharedConfig,

	// Legacy compatibility build
	legacyConfig,

	// Docs static bundle (self-contained)
	docsStaticConfig,

	// On-demand chunks (v3 bundle splitting)
	coreConfig,
	charts3dConfig,
	pagesConfig,

	// CDN loader (tiny bootstrap)
	loaderConfig,
];

// =============================================================================
// Build Output Summary (logged during build)
// =============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Visualify.js Build System v${PACKAGE_VERSION.padEnd(16)}║
╠══════════════════════════════════════════════════════════════╣
║ Build Targets:                                               ║
║   • visualify-docs.js      - Docsify UMD bundle              ║
║   • visualify-docs.esm.js  - Docsify ESM bundle              ║
║   • visualify-portal.js    - Portal UMD bundle               ║
║   • visualify-portal.esm.js- Portal ESM bundle               ║
║   • visualify-shared.js    - Shared components               ║
║   • visualify.js           - Legacy build (backward compat)  ║
║   • stats.html             - Bundle analysis                 ║
╠══════════════════════════════════════════════════════════════╣
║ On-Demand Chunks (v3):                                       ║
║   • visualify-core.js      - Core 2D charts only             ║
║   • visualify-3d.js        - 3D visualization chunk          ║
║   • visualify-pages.js     - Page mode components            ║
╠══════════════════════════════════════════════════════════════╣
║ Size Thresholds:                                             ║
║   • Docs:    ${String(SIZE_THRESHOLDS.docs).padStart(4)} KB  │  Core:   ${String(SIZE_THRESHOLDS.core).padStart(4)} KB          ║
║   • Portal:  ${String(SIZE_THRESHOLDS.portal).padStart(4)} KB  │  3D:     ${String(SIZE_THRESHOLDS.charts3d).padStart(4)} KB          ║
║   • Shared:  ${String(SIZE_THRESHOLDS.shared).padStart(4)} KB  │  Pages:  ${String(SIZE_THRESHOLDS.pages).padStart(4)} KB          ║
╠══════════════════════════════════════════════════════════════╣
║ 3D Dependencies (External):                                  ║
║   • three                  - Three.js core library           ║
║   • @react-three/fiber     - React renderer for Three.js     ║
║   • @react-three/drei      - Useful helpers for R3F          ║
║   • echarts-gl             - ECharts GL extension            ║
╚══════════════════════════════════════════════════════════════╝
`);
