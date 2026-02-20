/**
 * @fileoverview Docsify Plugin Hook for Visualify
 * @module docsify/plugin
 *
 * Hooks into Docsify's lifecycle to process visualify code blocks
 * and auto-mount charts with data-visualify attribute.
 */

import { processMarkdown } from './markdown';

/**
 * Chart instance registry for cleanup
 * @type {WeakMap<Element, Object>}
 */
const chartRegistry = new WeakMap();

/**
 * Lazy-loaded Visualify components
 * @type {Object|null}
 */
let VisualifyComponents = null;

/**
 * Loading promise to prevent duplicate loads
 * @type {Promise|null}
 */
let loadPromise = null;

/**
 * Lazy load Visualify components only when needed
 * @returns {Promise<Object>} Visualify components
 */
async function loadVisualifyComponents() {
	if (VisualifyComponents) {
		return VisualifyComponents;
	}

	if (loadPromise) {
		return loadPromise;
	}

	loadPromise = import('../core/recharts')
		.then((module) => {
			VisualifyComponents = {
				Recharts: module.default,
			};
			return VisualifyComponents;
		})
		.catch((err) => {
			console.error('[VisualifyDocs] Failed to load Visualify components:', err);
			throw err;
		});

	return loadPromise;
}

/**
 * Mount a chart on a single element
 * @param {Element} el - DOM element to mount chart on
 * @param {Object} [config] - Optional config (parsed from data-visualify if not provided)
 */
async function mountChart(el, config) {
	// Skip if already mounted
	if (el.dataset.visualifyMounted === 'true') {
		return;
	}

	try {
		const chartConfig = config || JSON.parse(el.dataset.visualify || '{}');

		// Handle external file reference
		if (chartConfig.src) {
			const response = await fetch(chartConfig.src);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${chartConfig.src}: ${response.statusText}`);
			}
			const externalConfig = await response.json();
			Object.assign(chartConfig, externalConfig);
			delete chartConfig.src;
		}

		// Load Visualify components lazily
		const { Recharts } = await loadVisualifyComponents();

		// Create and mount chart
		const chart = new Recharts(chartConfig);
		chart.mount(el);

		// Track for cleanup
		chartRegistry.set(el, chart);
		el.dataset.visualifyMounted = 'true';

		// Store config for potential re-mounting
		el.dataset.visualify = JSON.stringify(chartConfig);
	} catch (err) {
		console.error('[VisualifyDocs] Failed to mount chart:', err);

		// Display error in place of chart
		el.innerHTML = `<div style="
			padding: 16px;
			border: 1px solid #ff4d4f;
			border-radius: 4px;
			background: #fff2f0;
			color: #cf1322;
		">
			<strong>Visualify Error:</strong> ${err.message}
		</div>`;
	}
}

/**
 * Mount all charts in a container
 * @param {Element} [container] - Container element (defaults to document)
 */
async function mountAllCharts(container = document) {
	const elements = container.querySelectorAll('[data-visualify]:not([data-visualify-mounted="true"])');

	if (elements.length === 0) {
		return;
	}

	// Load components once for all charts
	await loadVisualifyComponents();

	// Mount all charts
	const mountPromises = Array.from(elements).map((el) => mountChart(el));
	await Promise.all(mountPromises);
}

/**
 * Cleanup charts in a container (for SPA navigation)
 * @param {Element} [container] - Container element (defaults to document)
 */
function cleanupCharts(container = document) {
	const elements = container.querySelectorAll('[data-visualify]');

	elements.forEach((el) => {
		const chart = chartRegistry.get(el);
		if (chart && typeof chart.dispose === 'function') {
			chart.dispose();
		}
		chartRegistry.delete(el);
		el.dataset.visualifyMounted = 'false';
	});
}

/**
 * Check if markdown contains visualify code blocks
 * @param {string} content - Markdown content
 * @returns {boolean}
 */
function hasVisualifyBlocks(content) {
	return /```visualify\n/.test(content);
}

/**
 * Docsify plugin install function
 * @param {Object} hook - Docsify hook object
 * @param {Object} vm - Docsify vm instance
 */
function install(hook, vm) {
	// Initialize - called before Docsify starts
	hook.init(function () {
		console.log('[VisualifyDocs] Initializing Docsify plugin...');

		// Add custom markdown configuration
		if (window.$docsify && window.$docsify.markdown) {
			const originalRenderer = window.$docsify.markdown.renderer;

			window.$docsify.markdown.renderer = {
				...originalRenderer,
				code: function (code, lang) {
					if (lang === 'visualify') {
						return processMarkdown(code);
					}
					// Fall back to original renderer for other languages
					if (originalRenderer && originalRenderer.code) {
						return originalRenderer.code.call(this, code, lang);
					}
					return `<pre><code class="lang-${lang}">${code}</code></pre>`;
				},
			};
		}
	});

	// Before each page load - cleanup previous charts
	hook.beforeEach(function (content) {
		// Check if we need to load Visualify (optimization)
		if (hasVisualifyBlocks(content)) {
			// Preload components in background
			loadVisualifyComponents().catch(() => {
				// Silently fail - will retry on mount
			});
		}
		return content;
	});

	// After each markdown parsing - process any remaining blocks
	hook.afterEach(function (html, next) {
		// If markdown renderer didn't catch all blocks (e.g., via plugin order)
		// We can process them here as a fallback
		next(html);
	});

	// Mounted - initial page load
	hook.mounted(function () {
		console.log('[VisualifyDocs] Docsify mounted, scanning for charts...');
		mountAllCharts();
	});

	// Done each - after each route change (SPA navigation)
	hook.doneEach(function () {
		console.log('[VisualifyDocs] Route changed, mounting charts...');
		mountAllCharts();
	});

	// Destroyed - cleanup when leaving
	hook.destroyed(function () {
		console.log('[VisualifyDocs] Cleaning up charts...');
		cleanupCharts();
	});
}

/**
 * Global API for manual chart mounting
 */
const VisualifyDocsify = {
	install,
	mountChart,
	mountAllCharts,
	cleanupCharts,
	loadVisualifyComponents,

	/**
	 * Check if an element has a mounted chart
	 * @param {Element} el - DOM element
	 * @returns {boolean}
	 */
	isMounted(el) {
		return el.dataset.visualifyMounted === 'true';
	},

	/**
	 * Get chart instance for an element
	 * @param {Element} el - DOM element
	 * @returns {Object|null}
	 */
	getChart(el) {
		return chartRegistry.get(el) || null;
	},

	/**
	 * Version info
	 */
	version: process.env.VISUALIFY_VERSION || 'dev',
};

// Auto-install if Docsify is present
if (typeof window !== 'undefined' && window.$docsify) {
	window.$docsify.plugins = [].concat(
		window.$docsify.plugins || [],
		install
	);
	console.log('[VisualifyDocs] Auto-registered with Docsify');
}

export default VisualifyDocsify;
export { install, mountChart, mountAllCharts, cleanupCharts, loadVisualifyComponents };
