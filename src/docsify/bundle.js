/**
 * @fileoverview Docsify + Visualify Bundled Distribution
 * @module docsify/bundle
 *
 * UMD bundle entry point that combines Docsify with Visualify plugin.
 * Auto-initializes if Docsify configuration is present.
 *
 * @example
 * // In HTML:
 * <script src="visualify-docsify.min.js"></script>
 * <script>
 *   window.$docsify = {
 *     // Docsify configuration
 *   };
 * </script>
 * <script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
 */

import DocsifyPlugin from './plugin';
import { processMarkdown, processVisualifyBlocks, extractConfigs } from './markdown';

/**
 * Bundle version (replaced during build)
 * @type {string}
 */
const VERSION = process.env.VISUALIFY_VERSION || 'dev';

/**
 * Check if running in browser environment
 * @type {boolean}
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Default Docsify configuration with Visualify support
 * @type {Object}
 */
const DEFAULT_DOCSIFY_CONFIG = {
	// Enable markdown plugin
	markdown: {
		renderer: {
			code: function (code, lang) {
				if (lang === 'visualify') {
					return processMarkdown(code);
				}
				// Default code rendering
				return (
					'<pre v-pre><code class="lang-' +
					lang +
					'">' +
					code +
					'</code></pre>'
				);
			},
		},
	},
	// Add Visualify plugin
	plugins: [DocsifyPlugin.install],
};

/**
 * Merge user config with defaults
 * @param {Object} userConfig - User's Docsify configuration
 * @returns {Object} Merged configuration
 */
function mergeConfig(userConfig = {}) {
	const merged = {
		...DEFAULT_DOCSIFY_CONFIG,
		...userConfig,
	};

	// Merge markdown renderer carefully
	if (userConfig.markdown) {
		if (typeof userConfig.markdown === 'function') {
			// User provided a custom markdown function
			const userMarkdown = userConfig.markdown;
			merged.markdown = function (marked, renderer) {
				const result = userMarkdown(marked, renderer);
				// Ensure visualify code blocks are handled
				const originalCode = renderer.code;
				renderer.code = function (code, lang) {
					if (lang === 'visualify') {
						return processMarkdown(code);
					}
					return originalCode ? originalCode.call(this, code, lang) : code;
				};
				return result;
			};
		} else if (userConfig.markdown.renderer) {
			// Merge renderers
			merged.markdown = {
				...userConfig.markdown,
				renderer: {
					...DEFAULT_DOCSIFY_CONFIG.markdown.renderer,
					...userConfig.markdown.renderer,
				},
			};
		}
	}

	// Merge plugins array
	if (userConfig.plugins) {
		merged.plugins = [DocsifyPlugin.install, ...userConfig.plugins];
	}

	return merged;
}

/**
 * Initialize Docsify with Visualify plugin
 * @param {Object} [config] - Optional configuration override
 */
function init(config = {}) {
	if (!isBrowser) {
		console.warn('[VisualifyDocs] init() can only be called in browser environment');
		return;
	}

	// Merge with existing $docsify config if present
	const existingConfig = window.$docsify || {};
	window.$docsify = mergeConfig({ ...existingConfig, ...config });

	console.log('[VisualifyDocs] Configuration applied. Load Docsify to initialize.');
}

/**
 * Auto-initialize if Docsify is already present
 */
function autoInit() {
	if (!isBrowser) {
		return;
	}

	// Check if Docsify config exists
	if (window.$docsify) {
		// Merge our config with existing
		window.$docsify = mergeConfig(window.$docsify);
		console.log('[VisualifyDocs] Auto-initialized with existing Docsify config');
	} else {
		// Set up default config for when Docsify loads
		window.$docsify = DEFAULT_DOCSIFY_CONFIG;
		console.log('[VisualifyDocs] Default configuration set');
	}
}

/**
 * Main bundle exports
 */
const VisualifyDocsifyBundle = {
	// Version
	VERSION,

	// Core plugin
	plugin: DocsifyPlugin,

	// Markdown processing utilities
	markdown: {
		process: processMarkdown,
		processBlocks: processVisualifyBlocks,
		extractConfigs,
	},

	// Configuration
	config: DEFAULT_DOCSIFY_CONFIG,

	// Initialization
	init,
	mergeConfig,
	autoInit,

	/**
	 * Mount all charts in a container
	 * @param {Element} [container] - Container element
	 */
	mountAll(container) {
		return DocsifyPlugin.mountAllCharts(container);
	},

	/**
	 * Cleanup charts in a container
	 * @param {Element} [container] - Container element
	 */
	cleanup(container) {
		return DocsifyPlugin.cleanupCharts(container);
	},
};

// Auto-initialize in browser
if (isBrowser) {
	// Wait for DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', autoInit);
	} else {
		autoInit();
	}
}

// UMD export pattern
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS
		module.exports = factory();
	} else {
		// Browser global
		root.VisualifyDocsify = factory();
	}
})(typeof self !== 'undefined' ? self : this, function () {
	return VisualifyDocsifyBundle;
});

export default VisualifyDocsifyBundle;
export { init, mergeConfig, autoInit, DocsifyPlugin, processMarkdown };
