/**
 * @fileoverview Data Processor - Main Thread Interface
 * @module core/data-processor
 *
 * Provides a high-level API for offloading data processing to Web Workers.
 * Handles worker pool management, task distribution, and result aggregation.
 */

import { getWorkerPool, terminateWorkerPool } from './workers/worker-pool';

/**
 * Default configuration for data processor
 * @readonly
 */
const DEFAULT_CONFIG = {
	workerScript: new URL('./workers/data-worker.js', import.meta.url).href,
	minWorkers: 2,
	maxWorkers: 4,
	chunkSize: 10000,
	enableChunking: true,
};

/**
 * Data Processor class
 * Manages data processing operations using Web Workers
 */
class DataProcessor {
	/**
	 * Create a new data processor
	 * @param {Object} config - Processor configuration
	 */
	constructor(config = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.pool = getWorkerPool({
			workerScript: this.config.workerScript,
			minWorkers: this.config.minWorkers,
			maxWorkers: this.config.maxWorkers,
		});
	}

	/**
	 * Check if data should be chunked for processing
	 * @private
	 * @param {Array} data - Data array
	 * @returns {boolean} True if data should be chunked
	 */
	_shouldChunk(data) {
		return this.config.enableChunking && data.length > this.config.chunkSize;
	}

	/**
	 * Split data into chunks for parallel processing
	 * @private
	 * @param {Array} data - Data array
	 * @param {number} chunkSize - Size of each chunk
	 * @returns {Array<Array>} Array of chunks
	 */
	_chunkData(data, chunkSize) {
		const chunks = [];
		for (let i = 0; i < data.length; i += chunkSize) {
			chunks.push(data.slice(i, i + chunkSize));
		}
		return chunks;
	}

	/**
	 * Aggregate data using specified method
	 * @param {Array} data - Input data
	 * @param {Object} config - Aggregation config
	 * @returns {Promise<number>} Aggregated value
	 */
	async aggregate(data, config) {
		if (this._shouldChunk(data)) {
			// Process in chunks and combine results
			const chunks = this._chunkData(data, this.config.chunkSize);
			const chunkResults = await this.pool.executeAll(
				chunks.map((chunk) => ({
					operation: 'aggregate',
					data: chunk,
					config: { ...config, method: 'sum' },
				}))
			);

			// Combine chunk results
			const total = chunkResults.reduce((a, b) => a + b, 0);

			if (config.method === 'avg' || config.method === 'mean') {
				return total / data.length;
			}
			if (config.method === 'count') {
				return data.length;
			}
			return total;
		}

		return this.pool.execute({
			operation: 'aggregate',
			data,
			config,
		});
	}

	/**
	 * Filter data based on criteria
	 * @param {Array} data - Input data
	 * @param {Object} criteria - Filter criteria
	 * @returns {Promise<Array>} Filtered data
	 */
	async filter(data, criteria) {
		if (this._shouldChunk(data)) {
			const chunks = this._chunkData(data, this.config.chunkSize);
			const results = await this.pool.executeAll(
				chunks.map((chunk) => ({
					operation: 'filter',
					data: chunk,
					config: criteria,
				}))
			);
			return results.flat();
		}

		return this.pool.execute({
			operation: 'filter',
			data,
			config: criteria,
		});
	}

	/**
	 * Sort data by fields
	 * @param {Array} data - Input data
	 * @param {Array|Object} sortConfig - Sort configuration
	 * @returns {Promise<Array>} Sorted data
	 */
	async sort(data, sortConfig) {
		// Sorting is typically done on full dataset
		return this.pool.execute({
			operation: 'sort',
			data,
			config: sortConfig,
		});
	}

	/**
	 * Group data by field(s)
	 * @param {Array} data - Input data
	 * @param {string|Array} fields - Field(s) to group by
	 * @returns {Promise<Object>} Grouped data
	 */
	async groupBy(data, fields) {
		return this.pool.execute({
			operation: 'groupBy',
			data,
			config: fields,
		});
	}

	/**
	 * Sample data for preview
	 * @param {Array} data - Input data
	 * @param {number} sampleSize - Sample size
	 * @returns {Promise<Array>} Sampled data
	 */
	async sample(data, sampleSize) {
		return this.pool.execute({
			operation: 'sample',
			data,
			config: { size: sampleSize },
		});
	}

	/**
	 * Calculate statistics for a field
	 * @param {Array} data - Input data
	 * @param {string} field - Field name
	 * @returns {Promise<Object>} Statistics
	 */
	async statistics(data, field) {
		if (this._shouldChunk(data)) {
			// Process statistics in chunks and combine
			const chunks = this._chunkData(data, this.config.chunkSize);
			const chunkStats = await this.pool.executeAll(
				chunks.map((chunk) => ({
					operation: 'statistics',
					data: chunk,
					config: { field },
				}))
			);

			// Combine statistics from chunks
			return this._combineStatistics(chunkStats);
		}

		return this.pool.execute({
			operation: 'statistics',
			data,
			config: { field },
		});
	}

	/**
	 * Combine statistics from multiple chunks
	 * @private
	 * @param {Array<Object>} statsArray - Array of statistics
	 * @returns {Object} Combined statistics
	 */
	_combineStatistics(statsArray) {
		const validStats = statsArray.filter((s) => s !== null);
		if (validStats.length === 0) return null;

		const totalCount = validStats.reduce((sum, s) => sum + s.count, 0);
		const totalSum = validStats.reduce((sum, s) => sum + s.sum, 0);
		const mean = totalSum / totalCount;

		// Combine variance (using parallel algorithm)
		let totalVariance = 0;
		for (const s of validStats) {
			totalVariance += s.variance * s.count + Math.pow(s.mean - mean, 2) * s.count;
		}
		totalVariance /= totalCount;

		return {
			count: totalCount,
			sum: totalSum,
			mean,
			min: Math.min(...validStats.map((s) => s.min)),
			max: Math.max(...validStats.map((s) => s.max)),
			variance: totalVariance,
			std: Math.sqrt(totalVariance),
		};
	}

	/**
	 * Parse CSV data
	 * @param {string} csv - CSV content
	 * @param {Object} options - Parse options
	 * @returns {Promise<Array>} Parsed data
	 */
	async parseCSV(csv, options = {}) {
		return this.pool.execute({
			operation: 'parseCSV',
			data: csv,
			config: options,
		});
	}

	/**
	 * Execute a pipeline of operations
	 * @param {Array} data - Input data
	 * @param {Array} operations - Array of operations
	 * @returns {Promise<Array>} Result data
	 */
	async pipeline(data, operations) {
		return this.pool.execute({
			operation: 'pipeline',
			data,
			config: operations,
		});
	}

	/**
	 * Process large dataset with progress callbacks
	 * @param {Array} data - Input data
	 * @param {Object} config - Processing config
	 * @param {Function} onProgress - Progress callback
	 * @returns {Promise<Object>} Processing result
	 */
	async processLargeDataset(data, config, onProgress) {
		const { operation, operationConfig } = config;
		const chunks = this._chunkData(data, this.config.chunkSize);
		const totalChunks = chunks.length;
		const results = [];

		// Process chunks in batches to avoid overwhelming the worker pool
		const batchSize = this.config.maxWorkers;
		for (let i = 0; i < chunks.length; i += batchSize) {
			const batch = chunks.slice(i, i + batchSize);
			const batchResults = await this.pool.executeAll(
				batch.map((chunk) => ({
					operation,
					data: chunk,
					config: operationConfig,
				}))
			);
			results.push(...batchResults);

			if (onProgress) {
				onProgress({
					processed: Math.min(i + batchSize, totalChunks),
					total: totalChunks,
					percent: Math.round((Math.min(i + batchSize, totalChunks) / totalChunks) * 100),
				});
			}
		}

		return this._combineResults(results, operation);
	}

	/**
	 * Combine results from chunked processing
	 * @private
	 * @param {Array} results - Chunk results
	 * @param {string} operation - Operation type
	 * @returns {any} Combined result
	 */
	_combineResults(results, operation) {
		switch (operation) {
			case 'filter':
				return results.flat();
			case 'aggregate':
				return results.reduce((a, b) => a + b, 0);
			case 'statistics':
				return this._combineStatistics(results);
			default:
				return results;
		}
	}

	/**
	 * Get processor statistics
	 * @returns {Object} Statistics
	 */
	getStats() {
		return this.pool.getStats();
	}

	/**
	 * Terminate the processor and clean up resources
	 */
	terminate() {
		terminateWorkerPool();
	}
}

// Singleton instance
let globalProcessor = null;

/**
 * Get or create global data processor
 * @param {Object} config - Processor configuration
 * @returns {DataProcessor} Global processor instance
 */
export function getDataProcessor(config = {}) {
	if (!globalProcessor) {
		globalProcessor = new DataProcessor(config);
	}
	return globalProcessor;
}

/**
 * Terminate global data processor
 */
export function terminateDataProcessor() {
	if (globalProcessor) {
		globalProcessor.terminate();
		globalProcessor = null;
	}
}

// Convenience functions for common operations

/**
 * Aggregate data using workers
 * @param {Array} data - Input data
 * @param {Object} config - Aggregation config
 * @returns {Promise<number>} Aggregated value
 */
export function aggregateData(data, config) {
	return getDataProcessor().aggregate(data, config);
}

/**
 * Filter data using workers
 * @param {Array} data - Input data
 * @param {Object} criteria - Filter criteria
 * @returns {Promise<Array>} Filtered data
 */
export function filterData(data, criteria) {
	return getDataProcessor().filter(data, criteria);
}

/**
 * Sort data using workers
 * @param {Array} data - Input data
 * @param {Object} sortConfig - Sort config
 * @returns {Promise<Array>} Sorted data
 */
export function sortData(data, sortConfig) {
	return getDataProcessor().sort(data, sortConfig);
}

/**
 * Sample data for preview
 * @param {Array} data - Input data
 * @param {number} sampleSize - Sample size
 * @returns {Promise<Array>} Sampled data
 */
export function sampleData(data, sampleSize) {
	return getDataProcessor().sample(data, sampleSize);
}

/**
 * Calculate statistics
 * @param {Array} data - Input data
 * @param {string} field - Field name
 * @returns {Promise<Object>} Statistics
 */
export function calculateStatistics(data, field) {
	return getDataProcessor().statistics(data, field);
}

export { DataProcessor };
export default DataProcessor;
