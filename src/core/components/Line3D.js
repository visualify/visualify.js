/**
 * Line3D Component
 * 3D line chart visualization using ECharts GL
 * Supports trajectory visualization with multiple line series
 * @module components/Line3D
 */

import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import ReCharts from '../modules/echarts';
import {
	loadEChartsGL,
	isWebGLSupported,
	display3DError,
	cleanupWebGL,
} from '../modules/echarts/gl';
import Loading from '../pages/loading';

/**
 * Default configuration for 3D line charts
 */
const DEFAULT_CONFIG = {
	lineStyle: {
		width: 4,
	},
	symbolSize: 8,
};

/**
 * Processes data for 3D line chart
 * Supports multiple series and data formats
 * @param {Array|Object} data - Input data
 * @returns {Array} Processed series data
 */
const processLineData = (data) => {
	if (!data) return [];

	// Single series format: [[x, y, z], ...] or {x: [], y: [], z: []}
	if (Array.isArray(data)) {
		// Check if it's already in the correct format
		if (data.length > 0 && Array.isArray(data[0]) && data[0].length === 3) {
			return [{ data, name: 'Series 1' }];
		}
		// Array of series objects
		if (data.length > 0 && data[0].data) {
			return data;
		}
	}

	// Object format: {x: [], y: [], z: []}
	if (typeof data === 'object' && !Array.isArray(data)) {
		const { x, y, z } = data;
		if (Array.isArray(x) && Array.isArray(y) && Array.isArray(z)) {
			const combined = x.map((xi, i) => [xi, y[i], z[i]]);
			return [{ data: combined, name: 'Series 1' }];
		}
	}

	return [];
};

/**
 * Generates ECharts option for 3D line chart
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
		series: seriesConfig,
		backgroundColor,
		color,
		tooltip,
		legend,
		toolbox,
	} = config;

	// Process data into series
	const seriesData = processLineData(data);

	if (seriesData.length === 0) {
		throw new Error('Line3D requires valid data');
	}

	// Build series array
	const series = seriesData.map((s, index) => ({
		type: 'line3D',
		name: s.name || `Series ${index + 1}`,
		data: s.data,
		lineStyle: {
			width: seriesConfig?.lineStyle?.width ?? DEFAULT_CONFIG.lineStyle.width,
			color: seriesConfig?.lineStyle?.color || (color?.[index]),
			...seriesConfig?.lineStyle,
		},
		symbolSize: seriesConfig?.symbolSize ?? DEFAULT_CONFIG.symbolSize,
		symbol: seriesConfig?.symbol || 'circle',
		emphasis: {
			lineStyle: {
				width: (seriesConfig?.lineStyle?.width ?? DEFAULT_CONFIG.lineStyle.width) + 2,
			},
		},
		...seriesConfig,
	}));

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
					return `${params.seriesName}<br/>X: ${x}<br/>Y: ${y}<br/>Z: ${z}`;
				}),
			...tooltip,
		},
		legend: legend ?? {
			show: series.length > 1,
			data: series.map((s) => s.name),
		},
		visualMap: visualMap ?? undefined,
		xAxis3D: {
			name: xAxis3D?.name || 'X',
			type: xAxis3D?.type || 'value',
			nameGap: 25,
			...xAxis3D,
		},
		yAxis3D: {
			name: yAxis3D?.name || 'Y',
			type: yAxis3D?.type || 'value',
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
		series,
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
 * Line3D Component - 3D line chart visualization
 * @param {Object} props - Component props
 * @param {Object} props.props - Configuration object
 * @param {Object} props.style - CSS styles
 * @param {React.Ref} ref - Forwarded ref
 */
const Line3D = forwardRef(({ props, style }, ref) => {
	const { config = {} } = props;
	const [options, setOptions] = useState(null);
	const [loading, setLoading] = useState({
		active: true,
		message: 'Loading 3D library...',
	});
	const [error, setError] = useState(null);

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
			const chartOptions = getOptions(config);
			setOptions(chartOptions);
			setLoading({ active: false, message: null });
		} catch (err) {
			const errorMessage = display3DError(err, { useToast: true });
			setError(errorMessage);
			setLoading({ active: true, message: errorMessage });
		}
	}, [config]);

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
				id={props.id}
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
					<h4>3D Chart Unavailable</h4>
					<p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div id={props.id} style={{ ...style, position: 'relative' }}>
			{loading.active && (
				<Loading message={loading.message} style={{ marginTop: '10px' }} />
			)}
			{options && (
				<ReCharts
					ref={ref}
					options={options}
					style={{
						width: config.chartWidth || '100%',
						height: config.chartHeight || '400px',
						opacity: loading.active ? 0 : 1,
					}}
				/>
			)}
		</div>
	);
});

Line3D.displayName = 'Line3D';

export default Line3D;
