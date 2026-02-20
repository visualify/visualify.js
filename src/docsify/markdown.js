/**
 * @fileoverview Docsify Markdown Processor for Visualify
 * @module docsify/markdown
 *
 * Parses visualify code blocks in markdown and converts them
 * to HTML with data attributes for chart mounting.
 */

/**
 * Default chart configuration
 * @type {Object}
 */
const DEFAULT_CONFIG = {
	type: 'scatter',
};

/**
 * Valid chart types
 * @type {string[]}
 */
const VALID_CHART_TYPES = [
	'scatter',
	'scatter3d',
	'line',
	'bar',
	'pie',
	'heatmap',
	'violin',
	'dotplot',
	'hilbert',
	'visium',
];

/**
 * Validate and normalize chart configuration
 * @param {Object} config - Raw configuration object
 * @returns {Object} Normalized configuration
 */
function validateConfig(config) {
	if (!config || typeof config !== 'object') {
		console.warn('[VisualifyDocs] Invalid config, using defaults');
		return { ...DEFAULT_CONFIG };
	}

	const normalized = { ...DEFAULT_CONFIG, ...config };

	// Validate chart type
	if (normalized.type && !VALID_CHART_TYPES.includes(normalized.type)) {
		console.warn(
			`[VisualifyDocs] Unknown chart type "${normalized.type}", defaulting to "scatter"`
		);
		normalized.type = 'scatter';
	}

	// Ensure data property exists
	if (!normalized.data && !normalized.src) {
		console.warn('[VisualifyDocs] No data or src provided, chart may fail to render');
	}

	return normalized;
}

/**
 * Parse JSON safely with error handling
 * @param {string} json - JSON string to parse
 * @param {string} [context] - Context for error messages
 * @returns {Object|null} Parsed object or null on error
 */
function safeJsonParse(json, context = 'unknown') {
	try {
		return JSON.parse(json);
	} catch (err) {
		console.warn(`[VisualifyDocs] JSON parse error in ${context}:`, err.message);
		return null;
	}
}

/**
 * Generate a unique ID for chart containers
 * @returns {string} Unique ID
 */
function generateChartId() {
	return `visualify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Process inline visualify configuration
 * @param {string} code - Code block content (JSON)
 * @returns {string} HTML output
 */
function processInlineConfig(code) {
	const config = safeJsonParse(code, 'inline config');

	if (!config) {
		return renderError('Invalid JSON in visualify code block');
	}

	const normalizedConfig = validateConfig(config);
	const chartId = generateChartId();

	return renderChartContainer(chartId, normalizedConfig);
}

/**
 * Process external file reference
 * @param {Object} config - Configuration with src property
 * @returns {string} HTML output
 */
function processExternalFile(config) {
	const chartId = generateChartId();
	return renderChartContainer(chartId, config);
}

/**
 * Render chart container HTML
 * @param {string} id - Unique chart ID
 * @param {Object} config - Chart configuration
 * @returns {string} HTML string
 */
function renderChartContainer(id, config) {
	const configJson = JSON.stringify(config).replace(/"/g, '&quot;');
	const { type = 'scatter' } = config;

	return (
		`<div class="visualify-chart-wrapper" data-visualify-type="${type}">` +
		`<div ` +
		`id="${id}" ` +
		`class="visualify-chart-container" ` +
		`data-visualify="${configJson}" ` +
		`style="width: 100%; min-height: 400px;"` +
		`></div>` +
		`</div>`
	);
}

/**
 * Render error message HTML
 * @param {string} message - Error message
 * @returns {string} HTML string
 */
function renderError(message) {
	return (
		`<div class="visualify-error" style="` +
		`padding: 16px; ` +
		`border: 1px solid #ff4d4f; ` +
		`border-radius: 4px; ` +
		`background: #fff2f0; ` +
		`color: #cf1322; ` +
		`margin: 16px 0;` +
		`">` +
		`<strong>Visualify Error:</strong> ${escapeHtml(message)}` +
		`</div>`
	);
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
	const div = typeof document !== 'undefined' ? document.createElement('div') : null;
	if (div) {
		div.textContent = text;
		return div.innerHTML;
	}
	// Server-side fallback
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Process visualify code block content
 * @param {string} code - Code block content
 * @returns {string} HTML output
 */
function processMarkdown(code) {
	if (!code || typeof code !== 'string') {
		return renderError('Empty visualify code block');
	}

	const trimmedCode = code.trim();

	if (!trimmedCode) {
		return renderError('Empty visualify code block');
	}

	// Try to parse as JSON
	const config = safeJsonParse(trimmedCode, 'markdown processor');

	if (!config) {
		return renderError('Invalid JSON in visualify code block. Ensure your configuration is valid JSON.');
	}

	// Check for external file reference
	if (config.src) {
		return processExternalFile(config);
	}

	// Process inline configuration
	return processInlineConfig(trimmedCode);
}

/**
 * Process visualify code blocks in full markdown content
 * Useful for pre-processing before Docsify renders
 * @param {string} content - Full markdown content
 * @returns {string} Processed markdown with HTML placeholders
 */
function processVisualifyBlocks(content) {
	if (!content || typeof content !== 'string') {
		return content;
	}

	// Match visualify code blocks
	const visualifyRegex = /```visualify\n([\s\S]*?)```/g;

	return content.replace(visualifyRegex, (match, code) => {
		return processMarkdown(code);
	});
}

/**
 * Extract visualify configurations from markdown
 * Useful for search indexing or pre-loading
 * @param {string} content - Markdown content
 * @returns {Array<Object>} Array of chart configurations
 */
function extractConfigs(content) {
	if (!content || typeof content !== 'string') {
		return [];
	}

	const configs = [];
	const visualifyRegex = /```visualify\n([\s\S]*?)```/g;
	let match;

	while ((match = visualifyRegex.exec(content)) !== null) {
		const config = safeJsonParse(match[1], 'config extraction');
		if (config) {
			configs.push(validateConfig(config));
		}
	}

	return configs;
}

/**
 * Check if content has visualify blocks (fast check)
 * @param {string} content - Markdown content
 * @returns {boolean}
 */
function hasVisualifyBlocks(content) {
	return typeof content === 'string' && content.includes('```visualify');
}

export {
	processMarkdown,
	processVisualifyBlocks,
	extractConfigs,
	validateConfig,
	hasVisualifyBlocks,
	DEFAULT_CONFIG,
	VALID_CHART_TYPES,
};

export default processMarkdown;
