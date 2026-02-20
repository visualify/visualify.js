/**
 * ARIA Label Generators for Visualify.js
 * Provides accessible labels and descriptions for charts
 * @module a11y/aria-labels
 */

/**
 * Generates a descriptive ARIA label for a chart
 * @param {Object} config - Chart configuration
 * @param {string} chartType - Type of chart (scatter, bar, line, etc.)
 * @returns {string} Descriptive label for screen readers
 */
export const generateChartLabel = (config, chartType = 'chart') => {
	const title = typeof config.title === 'string'
		? config.title
		: config.title?.text || 'Untitled chart';

	const dataPoints = config.data?.length || config.series?.[0]?.data?.length || 0;
	const xAxisLabel = config.labels?.x || config.xAxis?.name || 'X axis';
	const yAxisLabel = config.labels?.y || config.yAxis?.name || 'Y axis';
	const zAxisLabel = config.zAxis3D?.name || config.zAxis?.name || 'Z axis';

	let description = `${title}. ${chartType} chart`;

	if (dataPoints > 0) {
		description += ` with ${dataPoints} data points`;
	}

	if (config.is3D || chartType.includes('3D')) {
		description += `. Three-dimensional view showing ${xAxisLabel}, ${yAxisLabel}, and ${zAxisLabel}`;
	} else {
		description += `. X axis shows ${xAxisLabel}, Y axis shows ${yAxisLabel}`;
	}

	if (config.description) {
		description += `. ${config.description}`;
	}

	return description;
};

/**
 * Formats data into a readable string for screen readers
 * @param {Array} data - Chart data array
 * @param {Object} config - Chart configuration
 * @param {string} chartType - Type of chart
 * @returns {string} Formatted data description
 */
export const formatDataForScreenReader = (data, config = {}, chartType = 'chart') => {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return 'No data available';
	}

	const maxItems = 10; // Limit to avoid overwhelming screen readers
	const dataLength = data.length;

	let description = `Data summary: ${dataLength} total items. `;

	// Format based on data structure
	const sample = data[0];

	if (Array.isArray(sample)) {
		// Array format: [[x, y], [x, y, z], etc.]
		const dimensions = sample.length;
		description += `Each data point has ${dimensions} dimensions. `;

		const items = data.slice(0, maxItems).map((item, index) => {
			if (dimensions === 2) {
				return `Point ${index + 1}: ${formatValue(item[0])}, ${formatValue(item[1])}`;
			} else if (dimensions >= 3) {
				return `Point ${index + 1}: ${formatValue(item[0])}, ${formatValue(item[1])}, ${formatValue(item[2])}`;
			}
			return `Point ${index + 1}: ${formatValue(item[0])}`;
		}).join('; ');

		description += items;
	} else if (typeof sample === 'object') {
		// Object format: {x, y, z, name, value, etc.}
		const items = data.slice(0, maxItems).map((item, index) => {
			const name = item.name || item.label || `Item ${index + 1}`;
			const value = item.value !== undefined ? item.value :
				(item.z !== undefined ? `(${item.x}, ${item.y}, ${item.z})` :
				 `(${item.x}, ${item.y})`);
			return `${name}: ${formatValue(value)}`;
		}).join('; ');

		description += items;
	} else {
		// Simple value array
		const items = data.slice(0, maxItems).map((item, index) =>
			`Item ${index + 1}: ${formatValue(item)}`
		).join('; ');

		description += items;
	}

	if (dataLength > maxItems) {
		description += `. And ${dataLength - maxItems} more items`;
	}

	return description;
};

/**
 * Generates an accessible name for a data point
 * @param {Object|Array} dataPoint - Single data point
 * @param {number} index - Index of the data point
 * @param {Object} config - Chart configuration
 * @returns {string} Accessible name for the data point
 */
export const generateDataPointLabel = (dataPoint, index, config = {}) => {
	if (Array.isArray(dataPoint)) {
		const xLabel = config.labels?.x || 'X';
		const yLabel = config.labels?.y || 'Y';
		const zLabel = config.zAxis3D?.name || config.zAxis?.name || 'Z';

		if (dataPoint.length >= 3) {
			return `Data point ${index + 1}: ${xLabel} ${formatValue(dataPoint[0])}, ${yLabel} ${formatValue(dataPoint[1])}, ${zLabel} ${formatValue(dataPoint[2])}`;
		}
		return `Data point ${index + 1}: ${xLabel} ${formatValue(dataPoint[0])}, ${yLabel} ${formatValue(dataPoint[1])}`;
	}

	if (typeof dataPoint === 'object') {
		const name = dataPoint.name || dataPoint.label || `Data point ${index + 1}`;
		const value = dataPoint.value !== undefined ? formatValue(dataPoint.value) : '';
		const x = dataPoint.x !== undefined ? `${config.labels?.x || 'X'}: ${formatValue(dataPoint.x)}` : '';
		const y = dataPoint.y !== undefined ? `${config.labels?.y || 'Y'}: ${formatValue(dataPoint.y)}` : '';
		const z = dataPoint.z !== undefined ? `${config.zAxis3D?.name || 'Z'}: ${formatValue(dataPoint.z)}` : '';

		const coords = [x, y, z].filter(Boolean).join(', ');

		if (value) {
			return `${name}: ${value}${coords ? ` at ${coords}` : ''}`;
		}
		return `${name}${coords ? `: ${coords}` : ''}`;
	}

	return `Data point ${index + 1}: ${formatValue(dataPoint)}`;
};

/**
 * Formats a value for screen reader output
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
const formatValue = (value) => {
	if (value === null || value === undefined) {
		return 'unknown';
	}

	if (typeof value === 'number') {
		// Format large numbers with commas
		if (Math.abs(value) >= 1000) {
			return value.toLocaleString();
		}
		// Round decimals to 2 places
		if (value % 1 !== 0) {
			return value.toFixed(2);
		}
	}

	if (value instanceof Date) {
		return value.toLocaleDateString();
	}

	return String(value);
};

/**
 * Generates ARIA attributes for a chart container
 * @param {Object} config - Chart configuration
 * @param {string} chartType - Type of chart
 * @param {string} uniqueId - Unique identifier for the chart
 * @returns {Object} ARIA attributes object
 */
export const generateChartAriaAttributes = (config, chartType = 'chart', uniqueId = '') => {
	const label = generateChartLabel(config, chartType);
	const dataDescription = formatDataForScreenReader(
		config.data || config.series?.[0]?.data,
		config,
		chartType
	);

	const descriptionId = uniqueId ? `${uniqueId}-description` : 'chart-description';

	return {
		role: 'img',
		'aria-label': label,
		'aria-describedby': descriptionId,
		tabIndex: 0,
		'data-description-id': descriptionId,
		'data-chart-type': chartType,
	};
};

/**
 * Generates a data table for screen readers from chart data
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 * @param {string} chartType - Type of chart
 * @returns {Object} Table data structure with headers and rows
 */
export const generateDataTable = (data, config = {}, chartType = 'chart') => {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return {
			caption: config.title || 'Chart Data',
			headers: [],
			rows: [],
		};
	}

	const sample = data[0];
	let headers = [];
	let rows = [];

	if (Array.isArray(sample)) {
		// Array format
		const dimensions = sample.length;
		headers = [
			config.labels?.x || 'X',
			config.labels?.y || 'Y',
			...(dimensions > 2 ? [config.zAxis3D?.name || config.zAxis?.name || 'Z'] : []),
		].slice(0, dimensions);

		rows = data.map((item, index) => ({
			id: `row-${index}`,
			cells: item.map(val => formatValue(val)),
		}));
	} else if (typeof sample === 'object') {
		// Object format
		const keys = Object.keys(sample);
		headers = keys.map(key => {
			switch(key) {
				case 'x': return config.labels?.x || 'X';
				case 'y': return config.labels?.y || 'Y';
				case 'z': return config.zAxis3D?.name || config.zAxis?.name || 'Z';
				case 'name': return 'Name';
				case 'value': return 'Value';
				default: return key.charAt(0).toUpperCase() + key.slice(1);
			}
		});

		rows = data.map((item, index) => ({
			id: `row-${index}`,
			cells: keys.map(key => formatValue(item[key])),
		}));
	} else {
		// Simple value array
		headers = ['Index', 'Value'];
		rows = data.map((item, index) => ({
			id: `row-${index}`,
			cells: [String(index + 1), formatValue(item)],
		}));
	}

	return {
		caption: typeof config.title === 'string' ? config.title : config.title?.text || 'Chart Data',
		headers,
		rows,
	};
};

/**
 * Announces a message to screen readers via a live region
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, priority = 'polite') => {
	// Look for existing live region or create one
	let liveRegion = document.getElementById('visualify-a11y-announcer');

	if (!liveRegion) {
		liveRegion = document.createElement('div');
		liveRegion.id = 'visualify-a11y-announcer';
		liveRegion.setAttribute('aria-live', priority);
		liveRegion.setAttribute('aria-atomic', 'true');
		liveRegion.className = 'sr-only';
		document.body.appendChild(liveRegion);
	}

	// Update live region to trigger announcement
	liveRegion.setAttribute('aria-live', priority);
	liveRegion.textContent = message;

	// Clear after announcement
	setTimeout(() => {
		liveRegion.textContent = '';
	}, 1000);
};

/**
 * Generates a CSV string from chart data for export
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 * @returns {string} CSV formatted string
 */
export const generateCSV = (data, config = {}) => {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return '';
	}

	const table = generateDataTable(data, config);
	const headers = table.headers.join(',');
	const rows = table.rows.map(row => row.cells.join(',')).join('\n');

	return `${headers}\n${rows}`;
};

/**
 * Creates a download link for CSV data
 * @param {string} csv - CSV content
 * @param {string} filename - Download filename
 */
export const downloadCSV = (csv, filename = 'chart-data.csv') => {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.setAttribute('aria-label', `Download data as ${filename}`);
	link.className = 'sr-only';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export default {
	generateChartLabel,
	formatDataForScreenReader,
	generateDataPointLabel,
	generateChartAriaAttributes,
	generateDataTable,
	announceToScreenReader,
	generateCSV,
	downloadCSV,
};
