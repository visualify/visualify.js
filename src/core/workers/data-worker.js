/**
 * @fileoverview Data Processing Web Worker
 * @module core/workers/data-worker
 *
 * Handles data transformations, aggregations, and computations
 * off the main thread for improved performance with large datasets.
 */

/**
 * Data transformation operations
 */
const DataOperations = {
	/**
	 * Aggregate data using specified method
	 * @param {Array} data - Input data array
	 * @param {Object} config - Aggregation config
	 * @returns {number} Aggregated value
	 */
	aggregate(data, config) {
		const { method = 'sum', field } = config;
		const values = field ? data.map((item) => item[field]) : data;

		switch (method) {
			case 'sum':
				return values.reduce((a, b) => a + (b || 0), 0);
			case 'avg':
			case 'mean':
				return values.reduce((a, b) => a + (b || 0), 0) / values.length;
			case 'min':
				return Math.min(...values);
			case 'max':
				return Math.max(...values);
			case 'count':
				return values.length;
			case 'median': {
				const sorted = [...values].sort((a, b) => a - b);
				const mid = Math.floor(sorted.length / 2);
				return sorted.length % 2 !== 0
					? sorted[mid]
					: (sorted[mid - 1] + sorted[mid]) / 2;
			}
			case 'std': {
				const mean = values.reduce((a, b) => a + b, 0) / values.length;
				const variance =
					values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
					values.length;
				return Math.sqrt(variance);
			}
			default:
				throw new Error(`Unknown aggregation method: ${method}`);
		}
	},

	/**
	 * Filter data based on criteria
	 * @param {Array} data - Input data array
	 * @param {Object} criteria - Filter criteria
	 * @returns {Array} Filtered data
	 */
	filter(data, criteria) {
		return data.filter((item) => {
			for (const [field, condition] of Object.entries(criteria)) {
				const value = item[field];

				if (typeof condition === 'object') {
					// Range filter: { min: 0, max: 100 }
					if ('min' in condition && value < condition.min) return false;
					if ('max' in condition && value > condition.max) return false;

					// Comparison operators
					if ('gt' in condition && !(value > condition.gt)) return false;
					if ('gte' in condition && !(value >= condition.gte)) return false;
					if ('lt' in condition && !(value < condition.lt)) return false;
					if ('lte' in condition && !(value <= condition.lte)) return false;
					if ('eq' in condition && value !== condition.eq) return false;
					if ('ne' in condition && value === condition.ne) return false;

					// Array includes
					if ('in' in condition && !condition.in.includes(value))
						return false;
					if ('nin' in condition && condition.nin.includes(value))
						return false;
				} else {
					// Direct equality
					if (value !== condition) return false;
				}
			}
			return true;
		});
	},

	/**
	 * Sort data by fields
	 * @param {Array} data - Input data array
	 * @param {Array} sortConfig - Sort configuration
	 * @returns {Array} Sorted data
	 */
	sort(data, sortConfig) {
		const sorts = Array.isArray(sortConfig) ? sortConfig : [sortConfig];

		return [...data].sort((a, b) => {
			for (const { field, order = 'asc' } of sorts) {
				const aVal = a[field];
				const bVal = b[field];

				if (aVal === bVal) continue;

				const comparison =
					aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

				return order === 'desc' ? -comparison : comparison;
			}
			return 0;
		});
	},

	/**
	 * Group data by field(s)
	 * @param {Array} data - Input data array
	 * @param {string|Array} fields - Field(s) to group by
	 * @returns {Object} Grouped data
	 */
	groupBy(data, fields) {
		const fieldArray = Array.isArray(fields) ? fields : [fields];
		const groups = {};

		for (const item of data) {
			const key = fieldArray.map((f) => item[f]).join('|');
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
		}

		return groups;
	},

	/**
	 * Sample data for preview (stratified sampling)
	 * @param {Array} data - Input data array
	 * @param {number} sampleSize - Desired sample size
	 * @returns {Array} Sampled data
	 */
	sample(data, sampleSize) {
		if (data.length <= sampleSize) return data;

		const step = data.length / sampleSize;
		const sampled = [];

		for (let i = 0; i < sampleSize; i++) {
			const index = Math.floor(i * step);
			sampled.push(data[index]);
		}

		return sampled;
	},

	/**
	 * Calculate statistics for numeric data
	 * @param {Array} data - Input data array
	 * @param {string} field - Field to analyze
	 * @returns {Object} Statistics
	 */
	statistics(data, field) {
		const values = data.map((item) => item[field]).filter((v) => typeof v === 'number');

		if (values.length === 0) {
			return null;
		}

		const sum = values.reduce((a, b) => a + b, 0);
		const mean = sum / values.length;
		const sorted = [...values].sort((a, b) => a - b);

		// Calculate variance and standard deviation
		const variance =
			values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
			values.length;
		const std = Math.sqrt(variance);

		return {
			count: values.length,
			sum,
			mean,
			min: sorted[0],
			max: sorted[sorted.length - 1],
			median:
				sorted.length % 2 === 0
					? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
					: sorted[Math.floor(sorted.length / 2)],
			variance,
			std,
			q1: sorted[Math.floor(sorted.length * 0.25)],
			q3: sorted[Math.floor(sorted.length * 0.75)],
		};
	},

	/**
	 * Parse CSV string to array
	 * @param {string} csv - CSV content
	 * @param {Object} options - Parse options
	 * @returns {Array} Parsed data
	 */
	parseCSV(csv, options = {}) {
		const { delimiter = ',', header = true } = options;
		const lines = csv.trim().split('\n');

		if (lines.length === 0) return [];

		const headers = header
			? lines[0].split(delimiter).map((h) => h.trim())
			: null;
		const startRow = header ? 1 : 0;

		return lines.slice(startRow).map((line) => {
			const values = line.split(delimiter).map((v) => v.trim());

			if (headers) {
				const obj = {};
				headers.forEach((h, i) => {
					obj[h] = this._parseValue(values[i]);
				});
				return obj;
			}
			return values.map((v) => this._parseValue(v));
		});
	},

	/**
	 * Try to parse a value to appropriate type
	 * @private
	 * @param {string} value - String value
	 * @returns {any} Parsed value
	 */
	_parseValue(value) {
		if (value === '' || value === undefined) return null;
		if (value === 'true') return true;
		if (value === 'false') return false;

		const num = Number(value);
		if (!isNaN(num) && value !== '') return num;

		// Try date
		const date = new Date(value);
		if (!isNaN(date.getTime())) return date;

		return value;
	},

	/**
	 * Transform data using pipeline of operations
	 * @param {Array} data - Input data
	 * @param {Array} operations - Array of operations to apply
	 * @returns {Array} Transformed data
	 */
	pipeline(data, operations) {
		let result = data;

		for (const op of operations) {
			const { type, config } = op;

			switch (type) {
				case 'filter':
					result = this.filter(result, config);
					break;
				case 'sort':
					result = this.sort(result, config);
					break;
				case 'groupBy':
					result = this.groupBy(result, config);
					break;
				case 'sample':
					result = this.sample(result, config.size);
					break;
				case 'map':
					result = result.map(config.fn);
					break;
				default:
					throw new Error(`Unknown operation: ${type}`);
			}
		}

		return result;
	},
};

/**
 * Handle incoming messages from main thread
 */
self.onmessage = function (event) {
	const { type, taskId, payload } = event.data;

	if (type !== 'task') {
		self.postMessage({
			type: 'error',
			taskId,
			error: { message: 'Unknown message type' },
		});
		return;
	}

	try {
		const { operation, data, config } = payload;
		let result;

		switch (operation) {
			case 'aggregate':
				result = DataOperations.aggregate(data, config);
				break;
			case 'filter':
				result = DataOperations.filter(data, config);
				break;
			case 'sort':
				result = DataOperations.sort(data, config);
				break;
			case 'groupBy':
				result = DataOperations.groupBy(data, config);
				break;
			case 'sample':
				result = DataOperations.sample(data, config.size);
				break;
			case 'statistics':
				result = DataOperations.statistics(data, config.field);
				break;
			case 'parseCSV':
				result = DataOperations.parseCSV(data, config);
				break;
			case 'pipeline':
				result = DataOperations.pipeline(data, config);
				break;
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}

		self.postMessage({
			type: 'result',
			taskId,
			payload: result,
		});
	} catch (error) {
		self.postMessage({
			type: 'error',
			taskId,
			error: { message: error.message, stack: error.stack },
		});
	}
};

export default DataOperations;
