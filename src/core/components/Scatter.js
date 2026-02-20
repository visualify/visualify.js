// Scatter.js
import React, { useState, useEffect, forwardRef, useCallback, useRef } from 'react';
import ReCharts from '../modules/echarts';
import { useTranslation } from 'react-i18next';
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
import { formatAxisLabel } from '../../i18n/formatters';

const Scatter = forwardRef(({ props, style }, ref) => {
	const { t } = useTranslation();

	const getOptions = (config) => {
		const _dataZoom = {
			inside: [
				{ type: 'inside', xAxisIndex: 0 },
				{ type: 'inside', yAxisIndex: 0 },
			],
			slider: [
				{ type: 'slider', xAxisIndex: 0 },
				{ type: 'slider', yAxisIndex: 0, orient: 'vertical' },
			],
			both: [
				{ type: 'inside', xAxisIndex: 0 },
				{ type: 'inside', yAxisIndex: 0 },
				{
					type: 'slider',
					xAxisIndex: 0,
				},
				{ type: 'slider', yAxisIndex: 0, orient: 'vertical' },
			],
		};
		let options = {};
		// Title
		if (typeof config.title === 'string') {
			options.title = { text: config.title };
		} else {
			options.title = {
				left: 'center',
				top: 0,
				...config.title,
			};
		}
		// Visual Map
		options.visualMap = config.visualMap ?? [];
		// Legend
		options.legend = config.legend ?? undefined;
		// Tooltip
		options.tooltip = {
			trigger: 'item',
			axisPointer: {
				type: 'cross',
			},
			formatter: config.formatter ?? undefined,
		};
		// Series
		options.series = config.series ?? undefined;
		// Data Zoom
		if (config.dataZoom) {
			options.dataZoom = _dataZoom[config.dataZoom];
		}
		// Toolbox
		if (config.toolbox) {
			options.toolbox = {
				feature: {
					...config.toolbox,
					saveAsImage: {
						show: config.toolbox.saveAsImage.show ?? false,
					},
				},
			};
		}
		//Tooltip
		if (config.tooltip) {
			options.tooltip = { ...options.tooltip, ...config.tooltip };
		}
		// xAxis
		if (config.xAxis) {
			options.xAxis = [
				{
					name: config.labels?.x ?? t('charts.scatter') + ' X',
					type: 'value',
					nameGap: 25,
					nameLocation: 'middle',
					axisLabel: {
						formatter: (value) => formatAxisLabel(value, 'value'),
					},
					...config.xAxis,
				},
			];
		}
		// yAxis
		if (config.yAxis) {
			options.yAxis = [
				{
					name: config.labels?.y ?? t('charts.scatter') + ' Y',
					type: 'value',
					nameGap: 25,
					nameLocation: 'middle',
					axisLabel: {
						formatter: (value) => formatAxisLabel(value, 'value'),
					},
					...config.yAxis,
				},
			];
		}
		// Grid
		if (config.grid) {
			try {
				options.grid = config.grid.map((item) => ({
					...item,
					...config.grid,
				}));
			} catch (e) {
				//console.log(config.grid);
				options.grid = config.grid;
			}
		} else {
			options.grid = [];
		}
		options.xAxis = config.xAxis
			? [
					{
						name: config.labels?.x ?? t('charts.scatter') + ' X',
						type: 'value',
						nameGap: 25,
						nameLocation: 'middle',
						axisLabel: {
							formatter: (value) => formatAxisLabel(value, 'value'),
						},
						...config.xAxis,
					},
			  ]
			: [
					{
						type: 'value',
						axisLabel: {
							formatter: (value) => formatAxisLabel(value, 'value'),
						},
					},
			  ];
		options.yAxis = config.yAxis
			? [
					{
						name: config.labels?.y ?? t('charts.scatter') + ' Y',
						type: 'value',
						nameGap: 25,
						nameLocation: 'middle',
						axisLabel: {
							formatter: (value) => formatAxisLabel(value, 'value'),
						},
						...config.yAxis,
					},
			  ]
			: [
					{
						type: 'value',
						axisLabel: {
							formatter: (value) => formatAxisLabel(value, 'value'),
						},
					},
			  ];
		if (config.is3D) {
			options.xAxis3D = {
				name: config.xAxis3D?.name || t('charts.scatter3d') + ' X',
				type: 'value',
				axisLabel: {
					formatter: (value) => formatAxisLabel(value, 'value'),
				},
				...config.xAxis3D,
			};
			options.yAxis3D = {
				name: config.yAxis3D?.name || t('charts.scatter3d') + ' Y',
				type: 'value',
				axisLabel: {
					formatter: (value) => formatAxisLabel(value, 'value'),
				},
				...config.yAxis3D,
			};
			options.zAxis3D = {
				name: config.zAxis3D?.name || t('charts.scatter3d') + ' Z',
				type: 'value',
				axisLabel: {
					formatter: (value) => formatAxisLabel(value, 'value'),
				},
				...config.zAxis3D,
			};
			options.grid3D = {
				...config.grid3D,
			};
		}
		if (config.backgroundColor) {
			options.backgroundColor = config.backgroundColor;
		}
		if (config.color) {
			options.color = config.color;
		}
		return options;
	};

	const { config } = props;
	const chartId = props.id || `scatter-chart-${Math.random().toString(36).substr(2, 9)}`;
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

	const [options, setOptions] = useState(getOptions(accessibleConfig));
	const [focusedDataPoint, setFocusedDataPoint] = useState(null);
	const chartRef = useRef(null);

	// Get chart data for accessibility
	const chartData = React.useMemo(() => {
		return accessibleConfig.data || accessibleConfig.series?.[0]?.data || [];
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
			// Highlight in chart if possible
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
			// Trigger click event on chart
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
		generateChartAriaAttributes(accessibleConfig, 'scatter', chartId),
		[accessibleConfig, chartId]
	);

	// Generate data description
	const dataDescription = React.useMemo(() =>
		formatDataForScreenReader(chartData, accessibleConfig, 'scatter'),
		[chartData, accessibleConfig]
	);

	// Generate data table for screen readers
	const dataTable = React.useMemo(() =>
		generateDataTable(chartData, accessibleConfig, 'scatter'),
		[chartData, accessibleConfig]
	);

	// Handle CSV download
	const handleDownloadData = useCallback(() => {
		const csv = generateCSV(chartData, accessibleConfig);
		if (csv) {
			downloadCSV(csv, `${accessibleConfig.title || 'scatter-chart'}-data.csv`);
			announceToScreenReader('Data downloaded as CSV file', 'polite');
		}
	}, [chartData, accessibleConfig]);

	// Announce chart load
	useEffect(() => {
		if (accessibleConfig.a11y?.announceLoad !== false) {
			announceToScreenReader(
				`${ariaAttributes['aria-label']}. Use arrow keys to navigate data points. Press Enter to select.`,
				'polite'
			);
		}
	}, []);

	// update options when config changes
	useEffect(() => {
		setOptions(getOptions(accessibleConfig));
	}, [accessibleConfig]);

	return (
		<div
			id={chartId}
			ref={containerRef}
			style={style}
			className="visualify-chart visualify-scatter-chart"
			{...ariaAttributes}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			data-testid="scatter-chart"
		>
			{/* Screen reader description */}
			<div id={descriptionId} className="sr-only">
				{dataDescription}
				{accessibleConfig.description && (
					<span>. {accessibleConfig.description}</span>
				)}
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
				{focusedDataPoint && `Focused: ${JSON.stringify(focusedDataPoint)}`}
			</div>

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
				style={{ width: accessibleConfig.chartWidth, height: accessibleConfig.chartHeight }}
				aria-hidden="true"
			/>
		</div>
	);
});

export default Scatter;
