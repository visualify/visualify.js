/**
 * @fileoverview Preview Component - Live chart rendering
 * @module editor/components/Preview
 *
 * Provides real-time chart preview with error handling and fullscreen mode.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
	ArrowsFullscreen,
	FullscreenExit,
	ExclamationTriangle,
	RefreshCw,
} from 'react-bootstrap-icons';
import { Button, Alert, Spinner } from 'react-bootstrap';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

/**
 * Validate chart configuration
 */
function validateChartConfig(chart) {
	const errors = [];

	if (!chart.type) {
		errors.push('Chart type is required');
	}

	if (!chart.data || !Array.isArray(chart.data)) {
		errors.push('Chart data must be an array');
	}

	return errors;
}

/**
 * Transform chart config to ECharts options
 */
function transformToEChartsOptions(chart) {
	const baseOption = {
		title: {
			text: chart.title || '',
			left: 'center',
		},
		tooltip: {
			trigger: chart.type === 'pie' || chart.type === 'radar' ? 'item' : 'axis',
		},
		legend: {
			top: 30,
		},
		series: [],
	};

	const is3D = chart.type.includes('3d');

	// Handle different chart types
	switch (chart.type) {
		case 'scatter':
			return {
				...baseOption,
				xAxis: {
					type: chart.options?.xAxis?.type || 'value',
					name: chart.options?.xAxis?.name,
				},
				yAxis: {
					type: chart.options?.yAxis?.type || 'value',
					name: chart.options?.yAxis?.name,
				},
				series: [
					{
						type: 'scatter',
						data: chart.data.map((d) => [d.x, d.y]),
						symbolSize: chart.series?.symbolSize || 10,
						symbol: chart.series?.symbol || 'circle',
					},
				],
			};

		case 'scatter3d':
			return {
				...baseOption,
				xAxis3D: {
					type: 'value',
					name: chart.options?.xAxis3D?.name || 'X',
				},
				yAxis3D: {
					type: 'value',
					name: chart.options?.yAxis3D?.name || 'Y',
				},
				zAxis3D: {
					type: 'value',
					name: chart.options?.zAxis3D?.name || 'Z',
				},
				grid3D: {},
				series: [
					{
						type: 'scatter3D',
						data: chart.data.map((d) => [d.x, d.y, d.z]),
						symbolSize: chart.series?.symbolSize || 10,
					},
				],
			};

		case 'bar':
			return {
				...baseOption,
				xAxis: {
					type: chart.options?.xAxis?.type || 'category',
					data: chart.data.map((d) => d.category),
				},
				yAxis: {
					type: chart.options?.yAxis?.type || 'value',
				},
				series: [
					{
						type: 'bar',
						data: chart.data.map((d) => d.value),
						stack: chart.series?.stack,
					},
				],
			};

		case 'bar3d':
			return {
				...baseOption,
				xAxis3D: { type: 'category' },
				yAxis3D: { type: 'category' },
				zAxis3D: { type: 'value' },
				grid3D: {},
				series: [
					{
						type: 'bar3D',
						data: chart.data.map((d, i) => [i, 0, d.value]),
						shading: 'lambert',
					},
				],
			};

		case 'line':
			return {
				...baseOption,
				xAxis: {
					type: chart.options?.xAxis?.type || 'category',
					data: chart.data.map((d) => d.x),
				},
				yAxis: {
					type: chart.options?.yAxis?.type || 'value',
				},
				series: [
					{
						type: 'line',
						data: chart.data.map((d) => d.y),
						smooth: chart.series?.smooth || false,
						areaStyle: chart.series?.areaStyle,
					},
				],
			};

		case 'line3d':
			return {
				...baseOption,
				xAxis3D: { type: 'value' },
				yAxis3D: { type: 'value' },
				zAxis3D: { type: 'value' },
				grid3D: {},
				series: [
					{
						type: 'line3D',
						data: chart.data.map((d) => [d.x, d.y, d.z || 0]),
					},
				],
			};

		case 'pie':
			return {
				...baseOption,
				series: [
					{
						type: 'pie',
						radius: chart.series?.radius || ['0%', '70%'],
						data: chart.data.map((d) => ({
							name: d.name,
							value: d.value,
						})),
						emphasis: {
							itemStyle: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)',
							},
						},
					},
				],
			};

		case 'radar':
			return {
				...baseOption,
				radar: {
					indicator: chart.options?.radar?.indicator || [],
				},
				series: [
					{
						type: 'radar',
						data: chart.data.map((d) => ({
							name: d.name,
							value: d.value,
						})),
					},
				],
			};

		case 'funnel':
			return {
				...baseOption,
				series: [
					{
						type: 'funnel',
						data: chart.data.map((d) => ({
							name: d.name,
							value: d.value,
						})),
						sort: 'descending',
					},
				],
			};

		case 'heatmap':
			return {
				...baseOption,
				xAxis: { type: 'category' },
				yAxis: { type: 'category' },
				visualMap: {
					min: chart.options?.visualMap?.min || 0,
					max: chart.options?.visualMap?.max || 100,
				},
				series: [
					{
						type: 'heatmap',
						data: chart.data,
						label: { show: true },
					},
				],
			};

		case 'boxplot':
			return {
				...baseOption,
				xAxis: { type: 'category' },
				yAxis: { type: 'value' },
				series: [
					{
						type: 'boxplot',
						data: chart.data,
					},
				],
			};

		case 'surface3d':
			return {
				...baseOption,
				xAxis3D: { type: 'value' },
				yAxis3D: { type: 'value' },
				zAxis3D: { type: 'value' },
				grid3D: {
					viewControl: {
						autoRotate: true,
					},
				},
				series: [
					{
						type: 'surface',
						wireframe: { show: false },
						shading: 'color',
					},
				],
			};

		default:
			return baseOption;
	}
}

/**
 * Single Chart Preview Component
 */
function ChartPreview({ chart, height = '300px' }) {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const chartOption = useMemo(() => {
		try {
			const errors = validateChartConfig(chart);
			if (errors.length > 0) {
				throw new Error(errors.join(', '));
			}
			return transformToEChartsOptions(chart);
		} catch (err) {
			setError(err.message);
			return null;
		}
	}, [chart]);

	useEffect(() => {
		if (chartOption) {
			setError(null);
			setLoading(false);
		}
	}, [chartOption]);

	if (error) {
		return (
			<Alert variant="danger" className="m-3">
				<ExclamationTriangle className="me-2" />
				<strong>Chart Error</strong>
				<hr />
				<pre className="mb-0 small">{error}</pre>
			</Alert>
		);
	}

	if (loading || !chartOption) {
		return (
			<div
				className="d-flex align-items-center justify-content-center"
				style={{ height }}
			>
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	return (
		<ReactECharts
			option={chartOption}
			style={{ height, width: '100%' }}
			opts={{ renderer: chart.type.includes('3d') ? 'webgl' : 'canvas' }}
			onChartReady={() => setLoading(false)}
		/>
	);
}

/**
 * Preview Component
 */
function Preview({ config, fullscreen = false }) {
	const [isFullscreen, setIsFullscreen] = useState(fullscreen);
	const [refreshKey, setRefreshKey] = useState(0);

	const toggleFullscreen = useCallback(() => {
		setIsFullscreen((prev) => !prev);
	}, []);

	const handleRefresh = useCallback(() => {
		setRefreshKey((prev) => prev + 1);
	}, []);

	const validCharts = config.charts.filter((chart) => {
		const errors = validateChartConfig(chart);
		return errors.length === 0;
	});

	const hasErrors = validCharts.length !== config.charts.length;

	return (
		<div
			className={`preview-container ${isFullscreen ? 'vh-100' : ''}`}
			key={refreshKey}
		>
			<div className="preview-header">
				<div className="d-flex align-items-center">
					<span className="preview-title">Live Preview</span>
					{hasErrors && (
						<span className="badge bg-warning text-dark ms-2">
							<ExclamationTriangle className="me-1" size={12} />
							Some charts have errors
						</span>
					)}
				</div>
				<div className="preview-actions">
					<Button
						variant="outline-secondary"
						size="sm"
						onClick={handleRefresh}
						title="Refresh"
					>
						<RefreshCw size={16} />
					</Button>
					<Button
						variant="outline-secondary"
						size="sm"
						onClick={toggleFullscreen}
						title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
					>
						{isFullscreen ? (
							<FullscreenExit size={16} />
						) : (
							<ArrowsFullscreen size={16} />
						)}
					</Button>
				</div>
			</div>

			<div
				className="preview-content"
				style={{
					maxHeight: isFullscreen ? 'calc(100vh - 60px)' : '600px',
					overflow: 'auto',
				}}
			>
				{config.charts.length === 0 ? (
					<Alert variant="info">
						No charts to preview. Add charts from the sidebar.
					</Alert>
				) : (
					<div className="row g-3">
						{config.charts.map((chart) => (
							<div
								key={chart.id}
								className={`col-${isFullscreen ? '6' : '12'}`}
							>
								<div className="card">
									<div className="card-header d-flex justify-content-between align-items-center">
										<span>{chart.title}</span>
										<span className="badge bg-secondary">
											{chart.type}
										</span>
									</div>
									<div className="card-body p-0">
										<ChartPreview
											chart={chart}
											height={isFullscreen ? '400px' : '300px'}
										/>
									</div>
								</div>
							</div>
						))}
						</div>
					)
				)}
			</div>
		</div>
	);
}

export default Preview;
