/**
 * Accessibility (a11y) Module for Visualify.js
 * Provides comprehensive accessibility support for charts
 * @module a11y
 */

export * from './aria-labels';
export * from './keyboard-nav';
export * from './color-contrast';

// CSS class for screen reader only content
export const SR_ONLY_CLASS = 'sr-only';

// Default ARIA attributes for chart containers
export const DEFAULT_CHART_ARIA = {
	role: 'img',
	tabIndex: 0,
};

// Focus styles for keyboard navigation
export const FOCUS_STYLES = {
	outline: '3px solid #4A90E2',
	outlineOffset: '2px',
};

/**
 * CSS styles for screen reader only content
 * Include this in your global CSS or component styles
 */
export const srOnlyStyles = `
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

/* Focus indicators for keyboard navigation */
.visualify-chart:focus,
.visualify-chart:focus-visible {
	outline: 3px solid #4A90E2;
	outline-offset: 2px;
}

.visualify-chart:focus:not(:focus-visible) {
	outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
	.visualify-chart {
		border: 2px solid currentColor;
	}
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
	.visualify-chart,
	.visualify-chart * {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
	}
}
`;

/**
 * Applies screen reader only styles to a style element
 * Call this once in your application initialization
 */
export const applyA11yStyles = () => {
	if (typeof document === 'undefined') return;

	const styleId = 'visualify-a11y-styles';
	if (document.getElementById(styleId)) return;

	const styleEl = document.createElement('style');
	styleEl.id = styleId;
	styleEl.textContent = srOnlyStyles;
	document.head.appendChild(styleEl);
};

/**
 * Creates a hidden data table for screen readers
 * @param {Object} tableData - Table data from generateDataTable
 * @param {string} id - Unique ID for the table
 * @returns {JSX.Element} Hidden table element
 */
export const createScreenReaderTable = (tableData, id) => {
	if (!tableData || !tableData.rows || tableData.rows.length === 0) {
		return null;
	}

	return {
		type: 'table',
		props: {
			id,
			className: SR_ONLY_CLASS,
			'aria-label': `${tableData.caption} - Data table`,
		},
		children: [
			{
				type: 'caption',
				props: {},
				children: tableData.caption,
			},
			{
				type: 'thead',
				props: {},
				children: {
					type: 'tr',
					props: {},
					children: tableData.headers.map((header, i) => ({
						type: 'th',
						props: { key: i, scope: 'col' },
						children: header,
					})),
				},
			},
			{
				type: 'tbody',
				props: {},
				children: tableData.rows.map((row) => ({
					type: 'tr',
					props: { key: row.id },
					children: row.cells.map((cell, i) => ({
						type: 'td',
						props: { key: i },
						children: cell,
					})),
				})),
			},
		],
	};
};

/**
 * Complete accessibility configuration for charts
 */
export const defaultA11yConfig = {
	// ARIA settings
	aria: {
		enabled: true,
		role: 'img',
		describeData: true,
	},

	// Keyboard navigation
	keyboard: {
		enabled: true,
		arrowNavigation: true,
		enterActivation: true,
		wrapAround: true,
		announceChanges: true,
	},

	// Screen reader
	screenReader: {
		enabled: true,
		dataTable: true,
		liveRegion: true,
	},

	// Color contrast
	contrast: {
		enabled: true,
		autoFix: true,
		minRatio: 4.5,
		patterns: false,
	},

	// Focus management
	focus: {
		visible: true,
		trapInModal: true,
	},

	// Motion
	motion: {
		respectPrefersReducedMotion: true,
	},
};

export default {
	SR_ONLY_CLASS,
	DEFAULT_CHART_ARIA,
	FOCUS_STYLES,
	srOnlyStyles,
	applyA11yStyles,
	createScreenReaderTable,
	defaultA11yConfig,
};
