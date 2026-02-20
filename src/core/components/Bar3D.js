/**
 * Bar3D Component
 * 3D bar chart visualization using ECharts GL
 * @module components/Bar3D
 */

import React, { useState, useEffect, forwardRef, useCallback, useRef } from 'react';
import ReCharts from '../modules/echarts';
import {
	loadEChartsGL,
	isWebGLSupported,
	display3DError,
	cleanupWebGL,
} from '../modules/echarts/gl';
import Loading from '../pages/loading';
import {
	generateChartAriaAttributes,
	formatDataForScreenReader,
	generateDataTable,
	announceToScreenReader,
	generateCSV,
	downloadCSV,
} from '../../a11y/aria-labels';
import { useChartKeyboardNav } from '../../a11y/keyboard-nav';
import { validateChartColors, applyAccessibleColors } from '../../a11y/color-contrast';

/**
 * Default configuration for 3D bar charts
 */
const DEFAULT_CONFIG = {
	shading: 'lambert',
	opacity: 1,
};

/**
 * Generates ECharts option for 3D bar chart
 * @param {Object} config - Component configuration
 * @returns {Object} ECharts option object
 */
const getOptions = (config) => {
	const {
		title,
		data,
		xAxis3D,
		yAxis3D,
		zAxis3D,
		grid3D,
		visualMap,
		series,
		backgroundColor,
		color,
		tooltip,
		legend,
		toolbox,
	} = config;

	// Validate required data
	if (!data) {
		throw new Error('Bar3D requires data');
	}

	// Process data - support multiple formats
	// Format 1: [[x, y, z], ...] - 3D coordinates
	// Format 2: [{x, y, z}, ...] - Object format
	// Format 3: 2D grid with height values
	// Format 4: {x: [], y: [], z: []} - Object with coordinate arrays
	let processedData = data;

	// Handle object format: { x: [], y: [], z: [] }
	if (!Array.isArray(data) && data.x && data.y && data.z) {
		const len = Math.min(data.x.length, data.y.length, data.z.length);
		processedData = [];
		for (let i = 0; i < len; i++) {
			processedData.push([data.x[i], data.y[i], data.z[i]]);
		}
	}
	// Handle array of objects format: [{x, y, z}, ...]
	else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
		processedData = data.map((item) => [item.x, item.y, item.z]);
	}

	const options = {
		title:
			typeof title === 'string'
				? { text: title }
				: { left: 'center', top: 0, ...title },
		tooltip: {
			trigger: 'item',
			formatter:
				tooltip?.formatter ||
				((params) => {
					const [x, y, z] = params.value;
					return `X: ${x}<br/>Y: ${y}<br/>Height: ${z}`;
				}),
			...tooltip,
		},
		legend: legend ?? undefined,
		visualMap: visualMap ?? undefined,
		xAxis3D: {
			name: xAxis3D?.name || 'X',
			type: xAxis3D?.type || 'category',
			nameGap: 25,
			...xAxis3D,
		},
		yAxis3D: {
			name: yAxis3D?.name || 'Y',
			type: yAxis3D?.type || 'category',
			nameGap: 25,
			...yAxis3D,
		},
		zAxis3D: {
			name: zAxis3D?.name || 'Z',
			type: zAxis3D?.type || 'value',
			nameGap: 25,
			...zAxis3D,
		},
		grid3D: {
			boxWidth: 100,
			boxDepth: 80,
			boxHeight: 60,
			viewControl: {
				autoRotate: false,
				projection: 'perspective',
				...grid3D?.viewControl,
			},
			light: {
				main: {
					intensity: 1.2,
					shadow: true,
				},
				ambient: {
					intensity: 0.3,
				},
			},
			...grid3D,
		},
		series: [
			{
				type: 'bar3D',
				data: processedData,
				shading: series?.shading ?? DEFAULT_CONFIG.shading,
				itemStyle: {
					opacity: series?.opacity ?? DEFAULT_CONFIG.opacity,
					...series?.itemStyle,
				},
				label: {
					show: series?.label?.show ?? false,
					...series?.label,
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 16,
						color: '#fff',
					},
					itemStyle: {
						color: '#ff7f50',
					},
				},
				...series,
			},
		],
	};

	if (backgroundColor) {
		options.backgroundColor = backgroundColor;
	}

	if (color) {
		options.color = color;
	}

	if (toolbox) {
		options.toolbox = {
			feature: {
				...toolbox,
				saveAsImage: { show: toolbox.saveAsImage?.show ?? false },
			},
		};
	}

	return options;
};

/**
 * Bar3D Component - 3D bar chart visualization
 * @param {Object} props - Component props
 * @param {Object} props.props - Configuration object
 * @param {Object} props.style - CSS styles
 * @param {React.Ref} ref - Forwarded ref
 */
const Bar3D = forwardRef(({ props, style }, ref) => {
	const { config = {} } = props;
	const chartId = props.id || `bar3d-chart-${Math.random().toString(36).substr(2, 9)}`;
	const descriptionId = `${chartId}-description`;
	const tableId = `${chartId}-data-table`;

	// Accessibility: Validate and fix colors
	const accessibleConfig = React.useMemo(() => {
		const validation = validateChartColors(config);
		if (!validation.valid && config.a11y?.autoFix !== false) {
			return applyAccessibleColors(config);
		}
		return config;
	}, [config]);

	const [options, setOptions] = useState(null);
	const [loading, setLoading] = useState({
		active: true,
		message: 'Loading 3D library...',
	});
	const [error, setError] = useState(null);
	const [focusedDataPoint, setFocusedDataPoint] = useState(null);
	const chartRef = useRef(null);

	// Get chart data for accessibility
	const chartData = React.useMemo(() => {
		return accessibleConfig.data || [];
	}, [accessibleConfig]);

	// Keyboard navigation
	const {
		containerRef,
		handleKeyDown,
		handleFocus,
		focusedIndex,
	} = useChartKeyboardNav({
		data: chartData,
		config: accessibleConfig,
		onFocusChange: (index, dataPoint) => {
			setFocusedDataPoint(dataPoint);
			if (chartRef.current) {
				const chart = chartRef.current.getEchartsInstance?.();
				if (chart) {
					chart.dispatchAction({
						type: 'highlight',
						seriesIndex: 0,
						dataIndex: index,
					});
				}
			}
		},
		onActivate: (index, dataPoint) => {
			if (chartRef.current) {
				const chart = chartRef.current.getEchartsInstance?.();
				if (chart) {
					chart.dispatchAction({
						type: 'showTip',
						seriesIndex: 0,
						dataIndex: index,
					});
				}
			}
		},
	});

	// Generate ARIA attributes
	const ariaAttributes = React.useMemo(() =>
		generateChartAriaAttributes(accessibleConfig, 'bar3D', chartId),
		[accessibleConfig, chartId]
	);

	// Generate data description
	const dataDescription = React.useMemo(() =>
		formatDataForScreenReader(chartData, accessibleConfig, 'bar3D'),
		[chartData, accessibleConfig]
	);

	// Generate data table for screen readers
	const dataTable = React.useMemo(() =>
		generateDataTable(chartData, accessibleConfig, 'bar3D'),
		[chartData, accessibleConfig]
	);

	// Handle CSV download
	const handleDownloadData = useCallback(() => {
		const csv = generateCSV(chartData, accessibleConfig);
		if (csv) {
			downloadCSV(csv, `${accessibleConfig.title || 'bar3d-chart'}-data.csv`);
			announceToScreenReader('Data downloaded as CSV file', 'polite');
		}
	}, [chartData, accessibleConfig]);

	/**
	 * Initialize ECharts GL and set up chart options
	 */
	const initChart = useCallback(async () => {
		try {
			setLoading({ active: true, message: 'Loading 3D library...' });
			setError(null);

			// Check WebGL support
			if (!isWebGLSupported()) {
				throw new Error('WebGL not supported');
			}

			// Lazy load ECharts GL
			await loadEChartsGL();

			// Generate chart options
			const chartOptions = getOptions(accessibleConfig);
			setOptions(chartOptions);
			setLoading({ active: false, message: null });

			// Announce chart load
			if (accessibleConfig.a11y?.announceLoad !== false) {
				announceToScreenReader(
					`${ariaAttributes['aria-label']}. 3D bar chart. Use arrow keys to navigate data points. Press Enter to select.`,
					'polite'
				);
			}
		} catch (err) {
			const errorMessage = display3DError(err, { useToast: true });
			setError(errorMessage);
			setLoading({ active: true, message: errorMessage });

			// Announce error to screen readers
			announceToScreenReader(`Error loading 3D chart: ${errorMessage}`, 'assertive');
		}
	}, [accessibleConfig, ariaAttributes]);

	// Initialize chart on mount and config change
	useEffect(() => {
		initChart();
	}, [initChart]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (ref?.current) {
				cleanupWebGL(ref.current.getEchartsInstance?.());
			}
		};
	}, [ref]);

	// Handle resize
	useEffect(() => {
		const handleResize = () => {
			if (ref?.current) {
				const chart = ref.current.getEchartsInstance?.();
				if (chart && !chart.isDisposed()) {
					chart.resize();
				}
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [ref]);

	// Render error state
	if (error) {
		return (
			<div
				id={chartId}
				ref={containerRef}
				role="alert"
				aria-live="assertive"
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
				tabIndex={0}
			>
				<div>
					<h4>3D Chart Unavailable</h4>
					<p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div
			id={chartId}
			ref={containerRef}
			style={{ ...style, position: 'relative' }}
			className="visualify-chart visualify-bar3d-chart"
			{...ariaAttributes}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			data-testid="bar3d-chart"
		>
			{/* Screen reader description */}
			<div id={descriptionId} className="sr-only">
				{dataDescription}
				{accessibleConfig.description && (
					<span>. {accessibleConfig.description}</span>
				)}
				<p>3D bar chart visualization. Use Tab to enter chart, then arrow keys to navigate data points.</p>
			</div>

			{/* Screen reader data table */}
			{dataTable.rows.length > 0 && (
				<table id={tableId} className="sr-only">
					<caption>{dataTable.caption} - Data Table</caption>
					<thead>
						<tr>
							{dataTable.headers.map((header, i) => (
								<th key={i} scope="col">{header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{dataTable.rows.map((row) => (
							<tr key={row.id}>
								{row.cells.map((cell, i) => (
									<td key={i}>{cell}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* CSV download link for screen readers */}
			{accessibleConfig.a11y?.enableDownload !== false && chartData.length > 0 && (
				<button
					className="sr-only"
					onClick={handleDownloadData}
					aria-label="Download chart data as CSV"
					tabIndex={-1}
				>
					Download Data
				</button>
			)}

			{/* Live region for updates */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				id={`${chartId}-live-region`}
			>
				{focusedDataPoint && `Focused: X ${focusedDataPoint[0] || focusedDataPoint.x}, Y ${focusedDataPoint[1] || focusedDataPoint.y}, Height ${focusedDataPoint[2] || focusedDataPoint.z}`}
			</div>

			{loading.active && (
				<Loading message={loading.message} style={{ marginTop: '10px' }} />
			)}
			{options && (
				<ReCharts
					ref={(el) => {
						chartRef.current = el;
						if (typeof ref === 'function') {
							ref(el);
						} else if (ref) {
							ref.current = el;
						}
					}}
					options={options}
					style={{
						width: accessibleConfig.chartWidth || '100%',
						height: accessibleConfig.chartHeight || '400px',
						opacity: loading.active ? 0 : 1,
					}}
					aria-hidden="true"
				/>
			)}
		</div>
	);
});

Bar3D.displayName = 'Bar3D';

export default Bar3D;
