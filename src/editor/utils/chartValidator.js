/**
 * @fileoverview Chart Configuration Validator
 * @module editor/utils/chartValidator
 *
 * Validates chart configurations for different chart types.
 */

/**
 * Validation error
 */
class ValidationError extends Error {
	constructor(message, field = null) {
		super(message);
		this.name = 'ValidationError';
		this.field = field;
	}
}

/**
 * Chart type definitions and their required fields
 */
const CHART_SCHEMAS = {
	scatter: {
		required: ['data'],
		dataFormat: [
			{ x: 'number', y: 'number' },
			{ value: 'array' },
		],
	},
	scatter3d: {
		required: ['data'],
		dataFormat: [{ x: 'number', y: 'number', z: 'number' }],
	},
	bar: {
		required: ['data'],
		dataFormat: [{ category: 'string', value: 'number' }],
	},
	bar3d: {
		required: ['data'],
		dataFormat: [{ category: 'string', value: 'number' }],
	},
	line: {
		required: ['data'],
		dataFormat: [{ x: 'any', y: 'number' }],
	},
	line3d: {
		required: ['data'],
		dataFormat: [{ x: 'number', y: 'number', z: 'number' }],
	},
	pie: {
		required: ['data'],
		dataFormat: [{ name: 'string', value: 'number' }],
	},
	radar: {
		required: ['data', 'options.radar.indicator'],
		dataFormat: [{ name: 'string', value: 'array' }],
	},
	funnel: {
		required: ['data'],
		dataFormat: [{ name: 'string', value: 'number' }],
	},
	heatmap: {
		required: ['data'],
		dataFormat: ['array'],
	},
	boxplot: {
		required: ['data'],
		dataFormat: ['array'],
	},
	surface3d: {
		required: [],
		dataFormat: [],
	},
};

/**
 * Validate data point against format
 * @param {Object} dataPoint - Data point to validate
 * @param {Object} format - Expected format
 * @returns {boolean}
 */
function validateDataPoint(dataPoint, format) {
	if (typeof format === 'string') {
		if (format === 'array') {
			return Array.isArray(dataPoint);
		}
		return typeof dataPoint === format;
	}

	if (typeof format === 'object' && format !== null) {
		return Object.entries(format).every(([key, type]) => {
			if (!(key in dataPoint)) return false;

			const value = dataPoint[key];
			if (type === 'any') return true;
			if (type === 'array') return Array.isArray(value);
			if (type === 'number')
				return typeof value === 'number' || !isNaN(parseFloat(value));
			return typeof value === type;
		});
	}

	return true;
}

/**
 * Get nested value from object
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @returns {any}
 */
function getNestedValue(obj, path) {
	return path.split('.').reduce((current, key) => {
		return current?.[key];
	}, obj);
}

/**
 * Validate chart configuration
 * @param {Object} chart - Chart configuration
 * @returns {Object} Validation result
 */
export function validateChart(chart) {
	const errors = [];
	const warnings = [];

	// Check required fields
	if (!chart.type) {
		errors.push(new ValidationError('Chart type is required', 'type'));
	}

	if (!chart.title) {
		warnings.push(new ValidationError('Chart title is recommended', 'title'));
	}

	const schema = CHART_SCHEMAS[chart.type];
	if (!schema) {
		errors.push(new ValidationError(`Unknown chart type: ${chart.type}`, 'type'));
		return { valid: false, errors, warnings };
	}

	// Check schema requirements
	for (const field of schema.required) {
		const value = getNestedValue(chart, field);
		if (value === undefined || value === null) {
			errors.push(new ValidationError(`Missing required field: ${field}`, field));
		}
	}

	// Validate data format
	if (chart.data && Array.isArray(chart.data)) {
		if (chart.data.length === 0) {
			warnings.push(new ValidationError('Chart has no data points', 'data'));
		} else {
			// Check first data point against expected formats
			const firstPoint = chart.data[0];
			const validFormat = schema.dataFormat.some((format) =>
				validateDataPoint(firstPoint, format),
			);

			if (!validFormat && schema.dataFormat.length > 0) {
				const expectedFormat = schema.dataFormat
					.map((f) =>
						typeof f === 'string'
							? f
							: JSON.stringify(f),
					)
					.join(' or ');
				warnings.push(
					new ValidationError(
						`Data format may be incorrect. Expected: ${expectedFormat}`,
						'data',
					),
				);
			}
		}
	} else if (schema.required.includes('data')) {
		errors.push(new ValidationError('Chart data must be an array', 'data'));
	}

	// Validate 3D specific requirements
	if (chart.type.includes('3d')) {
		// Note: In a real implementation, we would check for WebGL support here
		warnings.push(
			new ValidationError(
				'3D charts require WebGL support in the browser',
				'type',
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate complete configuration
 * @param {Object} config - Full configuration
 * @returns {Object} Validation result
 */
export function validateConfig(config) {
	const errors = [];
	const warnings = [];

	if (!config) {
		errors.push(new ValidationError('Configuration is required'));
		return { valid: false, errors, warnings };
	}

	if (!config.charts || !Array.isArray(config.charts)) {
		errors.push(new ValidationError('Configuration must have a charts array'));
	} else {
		// Validate each chart
		config.charts.forEach((chart, index) => {
			const result = validateChart(chart);
			result.errors.forEach((error) => {
				error.field = `charts[${index}].${error.field}`;
				errors.push(error);
			});
			result.warnings.forEach((warning) => {
				warning.field = `charts[${index}].${warning.field}`;
				warnings.push(warning);
			});
		});
	}

	// Validate layout
	if (config.layout) {
		const { rows, cols } = config.layout;
		if (rows && (typeof rows !== 'number' || rows < 1)) {
			errors.push(new ValidationError('Layout rows must be a positive number'));
		}
		if (cols && (typeof cols !== 'number' || cols < 1)) {
			errors.push(new ValidationError('Layout cols must be a positive number'));
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Format validation errors for display
 * @param {Array} errors - Array of ValidationError
 * @returns {string}
 */
export function formatValidationErrors(errors) {
	return errors
		.map((error) => {
			const field = error.field ? `[${error.field}] ` : '';
			return `${field}${error.message}`;
		})
		.join('\n');
}

export { ValidationError, CHART_SCHEMAS };
export default validateChart;
