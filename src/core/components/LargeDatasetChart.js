/**
 * @fileoverview Large Dataset Chart Component
 * @module core/components/LargeDatasetChart
 *
 * Optimized chart component for handling large datasets using Web Workers
 * for data processing and sampling for preview rendering.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReCharts from '../modules/echarts';
import Loading from '../pages/loading';
import {
	getDataProcessor,
	sampleData,
	calculateStatistics,
	filterData,
} from '../data-processor';

/**
 * Default configuration for large dataset charts
 */
const DEFAULT_CONFIG = {
	sampleSize: 10000,
	progressiveThreshold: 50000,
	progressiveChunkSize: 5000,
	enableWorkerProcessing: true,
	showDataSummary: true,
};

/**
 * LargeDatasetChart Component
 * Handles datasets with 100k+ rows efficiently using Web Workers
 *
 * @param {Object} props - Component props
 * @param {Object} props.config - Chart configuration
 * @param {Object} props.style - CSS styles
 * @param {React.Ref} ref - Forwarded ref
 */
const LargeDatasetChart = React.forwardRef(({ config, style }, ref) => {
	const {
		data,
		type = 'line',
		sampleSize = DEFAULT_CONFIG.sampleSize,
		progressiveThreshold = DEFAULT_CONFIG.progressiveThreshold,
		enableWorkerProcessing = DEFAULT_CONFIG.enableWorkerProcessing,
		showDataSummary = DEFAULT_CONFIG.showDataSummary,
		...chartConfig
	} = config;

	const [processedData, setProcessedData] = useState(null);
	const [loading, setLoading] = useState({
		active: true,
		message: 'Processing data...',
		progress: 0,
	});
	const [dataSummary, setDataSummary] = useState(null);
	const [error, setError] = useState(null);

	const processorRef = useRef(null);
	const abortControllerRef = useRef(null);

	// Initialize data processor
	useEffect(() => {
		if (enableWorkerProcessing) {
			processorRef.current = getDataProcessor();
		}
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [enableWorkerProcessing]);

	// Process data when it changes
	useEffect(() => {
		const processData = async () => {
			if (!data || !Array.isArray(data)) {
				setError('Invalid data provided');
				return;
			}

			// Reset state
			setError(null);
			setLoading({
				active: true,
				message: `Processing ${data.length.toLocaleString()} data points...`,
				progress: 0,
			});

			abortControllerRef.current = new AbortController();

			try {
				let displayData = data;
				let summary = null;

				// For very large datasets, use sampling
				if (data.length > sampleSize) {
					setLoading((prev) => ({
						...prev,
						message: `Sampling ${sampleSize.toLocaleString()} points from ${data.length.toLocaleString()}...`,
					}));

					if (enableWorkerProcessing && processorRef.current) {
						displayData = await sampleData(data, sampleSize);
					} else {
						// Fallback to main thread sampling
						const step = data.length / sampleSize;
						displayData = [];
						for (let i = 0; i < sampleSize; i++) {
							displayData.push(data[Math.floor(i * step)]);
						}
					}

					// Calculate summary statistics
					if (showDataSummary && enableWorkerProcessing) {
						const numericFields = Object.keys(data[0]).filter(
							(key) => typeof data[0][key] === 'number'
						);

						if (numericFields.length > 0) {
							summary = await calculateStatistics(data, numericFields[0]);
						}
					}
				}

				// Process data in chunks for progressive rendering
				if (data.length > progressiveThreshold) {
					setLoading((prev) => ({
						...prev,
						message: 'Preparing progressive rendering...',
						progress: 50,
					}));
				}

				setProcessedData(displayData);
				setDataSummary(summary);
				setLoading({ active: false, message: null, progress: 100 });
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('[LargeDatasetChart] Processing error:', err);
					setError(err.message);
					setLoading({ active: false, message: null, progress: 0 });
				}
			}
		};

		processData();
	}, [data, sampleSize, progressiveThreshold, enableWorkerProcessing, showDataSummary]);

	// Generate chart options
	const chartOptions = useMemo(() => {
		if (!processedData) return null;

		return {
			title: {
				text: chartConfig.title || 'Large Dataset Chart',
				subtext: data.length > sampleSize
					? `Showing ${sampleSize.toLocaleString()} of ${data.length.toLocaleString()} points`
					: `${data.length.toLocaleString()} points`,
				left: 'center',
			},
			tooltip: {
				trigger: 'axis',
				...chartConfig.tooltip,
			},
			xAxis: {
				type: 'category',
				data: processedData.map((_, i) => i),
				...chartConfig.xAxis,
			},
			yAxis: {
				type: 'value',
				...chartConfig.yAxis,
			},
			series: [
				{
					type,
					data: processedData,
					large: data.length > progressiveThreshold,
					largeThreshold: progressiveThreshold,
					progressive: 5000,
					progressiveThreshold: progressiveThreshold,
					...chartConfig.series,
				},
			],
			dataZoom: data.length > sampleSize ? [
				{ type: 'inside', start: 0, end: 100 },
				{ type: 'slider', start: 0, end: 100 },
			] : undefined,
			toolbox: {
				feature: {
					dataZoom: { show: true },
					restore: { show: true },
					saveAsImage: { show: true },
				},
			},
		};
	}, [processedData, data.length, sampleSize, progressiveThreshold, type, chartConfig]);

	// Handle data filtering
	const handleFilter = useCallback(async (criteria) => {
		if (!enableWorkerProcessing || !processorRef.current) {
			console.warn('[LargeDatasetChart] Worker processing not enabled');
			return;
		}

		setLoading({
			active: true,
			message: 'Filtering data...',
			progress: 0,
		});

		try {
			const filtered = await filterData(data, criteria);
			setProcessedData(filtered);
			setLoading({ active: false, message: null, progress: 100 });
		} catch (err) {
			setError(err.message);
			setLoading({ active: false, message: null, progress: 0 });
		}
	}, [data, enableWorkerProcessing]);

	// Render error state
	if (error) {
		return (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#f5f5f5',
					border: '1px solid #ddd',
					borderRadius: '4px',
					padding: '20px',
					textAlign: 'center',
				}}
			>
				<div>
					<h4>Error Processing Data</h4>
					<p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{ ...style, position: 'relative' }}>
			{loading.active && (
				<Loading
					message={loading.message}
					progress={loading.progress}
					style={{ marginTop: '10px' }}
				/>
			)}

			{showDataSummary && dataSummary && (
				<div
					style={{
						position: 'absolute',
						top: '10px',
						right: '10px',
						background: 'rgba(255,255,255,0.9)',
						padding: '10px',
						borderRadius: '4px',
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						fontSize: '12px',
						zIndex: 10,
					}}
				>
					<div><strong>Data Summary</strong></div>
					<div>Count: {dataSummary.count?.toLocaleString()}</div>
					<div>Mean: {dataSummary.mean?.toFixed(2)}</div>
					<div>Min: {dataSummary.min?.toFixed(2)}</div>
					<div>Max: {dataSummary.max?.toFixed(2)}</div>
				</div>
			)}

			{chartOptions && (
				<ReCharts
					ref={ref}
					options={chartOptions}
					style={{
						width: config.chartWidth || '100%',
						height: config.chartHeight || '400px',
						opacity: loading.active ? 0.5 : 1,
					}}
				/>
			)}
		</div>
	);
});

LargeDatasetChart.displayName = 'LargeDatasetChart';

export default LargeDatasetChart;
