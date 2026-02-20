/**
 * Surface3D Component
 * 3D surface plot visualization using ECharts GL
 * Supports height maps and contour lines
 * @module components/Surface3D
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
 * Default configuration for 3D surface plots
 */
const DEFAULT_CONFIG = {
	shading: 'lambert',
	wireframe: {
		show: false,
	},
};

/**
 * Generates surface data from a mathematical function or grid
 * @param {Function|Array|Object} dataSource - Function (x, y) => z, array of [x, y, z] values, or object with {x, y, z} arrays
 * @param {Object} range - X and Y ranges
 * @returns {Array} Processed surface data
 */
const generateSurfaceData = (dataSource, range = {}) => {
	// Handle object format: { x: [], y: [], z: [[...], ...] }
	if (!Array.isArray(dataSource) && typeof dataSource === 'object' && dataSource.x && dataSource.y && dataSource.z) {
		const { x, y, z } = dataSource;
		const data = [];
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < y.length; j++) {
				data.push([x[i], y[j], z[i][j]]);
			}
		}
		return data;
	}

	if (Array.isArray(dataSource)) {
		return dataSource;
	}

	if (typeof dataSource === 'function') {
		const { xMin = -10, xMax = 10, yMin = -10, yMax = 10, step = 1 } = range;
		const data = [];
		for (let x = xMin; x <= xMax; x += step) {
			for (let y = yMin; y <= yMax; y += step) {
				const z = dataSource(x, y);
				data.push([x, y, z]);
			}
		}
		return data;
	}

	return [];
};

/**
 * Generates ECharts option for 3D surface plot
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
		contour,
	} = config;

	// Validate required data
	if (!data) {
		throw new Error('Surface3D requires data');
	}

	// Process data
	const processedData = generateSurfaceData(data, config.range);

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
					return `X: ${x.toFixed(2)}<br/>Y: ${y.toFixed(2)}<br/>Z: ${z.toFixed(2)}`;
				}),
			...tooltip,
		},
		legend: legend ?? undefined,
		visualMap: visualMap ?? {
			show: true,
			dimension: 2,
			min: Math.min(...processedData.map((d) => d[2])),
			max: Math.max(...processedData.map((d) => d[2])),
			inRange: {
				color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
			},
		},
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
				autoRotate: series?.autoRotate ?? false,
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
				type: 'surface',
				data: processedData,
				shading: series?.shading ?? DEFAULT_CONFIG.shading,
				wireframe: {
					show: series?.wireframe?.show ?? DEFAULT_CONFIG.wireframe.show,
					...series?.wireframe,
				},
				itemStyle: {
					opacity: series?.opacity ?? 1,
					...series?.itemStyle,
				},
				...series,
			},
		],
	};

	// Add contour lines if enabled
	if (contour?.show) {
		options.series[0].contour = {
			show: true,
			color: contour.color || '#000',
			...contour,
		};
	}

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
 * Surface3D Component - 3D surface plot visualization
 * @param {Object} props - Component props
 * @param {Object} props.props - Configuration object
 * @param {Object} props.style - CSS styles
 * @param {React.Ref} ref - Forwarded ref
 */
const Surface3D = forwardRef(({ props, style }, ref) => {
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

Surface3D.displayName = 'Surface3D';

export default Surface3D;
