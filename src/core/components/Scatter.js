// Scatter.js
import React, { useState, useEffect, forwardRef } from 'react';
import ReCharts from '../modules/echarts';

const Scatter = forwardRef(({ props, style }, ref) => {
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
			console.log(config.tooltip);
		}
		// xAxis
		if (config.xAxis) {
			options.xAxis = [
				{
					name: config.labels?.x ?? '',
					type: 'value',
					nameGap: 25,
					nameLocation: 'middle',
					...config.xAxis,
				},
			];
		}
		// yAxis
		if (config.yAxis) {
			options.yAxis = [
				{
					name: config.labels?.y ?? '',
					type: 'value',
					nameGap: 25,
					nameLocation: 'middle',
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
						name: config.labels?.x ?? '', // Add optional chaining here
						type: 'value',
						nameGap: 25,
						nameLocation: 'middle',
						...config.xAxis,
					},
			  ]
			: [
					{
						type: 'value',
					},
			  ];
		options.yAxis = config.yAxis
			? [
					{
						name: config.labels?.y ?? '', // And here
						type: 'value',
						nameGap: 25,
						nameLocation: 'middle',
						...config.yAxis,
					},
			  ]
			: [
					{
						type: 'value',
					},
			  ];
		if (config.is3D) {
			options.xAxis3D = {
				name: config.xAxis3D?.name || 'X',
				type: 'value',
				...config.xAxis3D,
			};
			options.yAxis3D = {
				name: config.yAxis3D?.name || 'Y',
				type: 'value',
				...config.yAxis3D,
			};
			options.zAxis3D = {
				name: config.zAxis3D?.name || 'Z',
				type: 'value',
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
			console.log(options.color);
		}
		return options;
	};

	const { config } = props;
	const [options, setOptions] = useState(getOptions(config));
	// update options when config changes
	useEffect(() => {
		setOptions(getOptions(config));
	}, [config]);

	return (
		<div
			id={props.id}
			style={style}>
			<ReCharts
				ref={ref}
				options={options}
				style={{ width: config.chartWidth, height: config.chartHeight }}
			/>
		</div>
	);
});

export default Scatter;
