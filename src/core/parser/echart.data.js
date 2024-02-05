/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-02 16:52:58
 * @FilePath     : /visualifyjs/src/core/parser/echart.data.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import { getArrayEl, _handleSeries } from './echart.series';
import {
	_parsePeakvalley,
	_parseMarkArea,
	_parseMarkLine,
} from './echart.features';

const _parser_data = (options = {}, preset = {}) => {
	// Parse the custom options
	const parsedOptions = {
		...preset,
		yAxis: { ...preset.yAxis },
		xAxis: { ...preset.xAxis },
		legend: { ...preset.legend },
		title: { ...preset.title },
		tooltip: { ...preset.tooltip },
		// ... other default settings for charts
		series: [],
	};

	// Initialize totalValues array if percentage mode is active
	let totalValues = options.percentage
		? new Array(options.xAxis.length).fill(0)
		: [];

	// calculate total values if in percentage mode
	if (options.percentage && options.data) {
		Object.entries(options.data).forEach(([_, data]) => {
			data.forEach((value, idx) => {
				totalValues[idx] += value;
			});
		});
	}

	if (options.data && typeof options.data === 'object') {
		parsedOptions.series = Object.entries(options.data).map(
			([name, data], index) => {
				let seriesObject = {
					name,
					type: getArrayEl(options.type, index),
					data,
					...(options.markArea && {
						markArea: _parseMarkArea(options.markArea, index),
					}),
					...(options.markLine && {
						markLine: _parseMarkLine(options.markLine, index),
					}),
					...(options.symbol && {
						symbol: getArrayEl(options.symbol, index),
					}),
					...(options.symbolSize && {
						symbolSize: getArrayEl(options.symbolSize, index),
					}),
					...(options.stack && {
						stack: options.stack.includes(name)
							? 'total'
							: getArrayEl(options.stack, index),
					}),
					...(options.emphasis && {
						emphasis: getArrayEl(options.emphasis, index),
					}),
				};

				if (
					options.percentage &&
					(options.type === 'bar' || options.type === 'line')
				) {
					seriesObject.data = seriesObject.data.map(
						(value, idx) => (value / totalValues[idx]) * 100,
					);
					seriesObject.stack = 'total';
				}

				if (options.waterfall) {
					if (name === 'Placeholder' || name === options.waterfall) {
						seriesObject.itemStyle = {
							borderColor: 'transparent',
							color: 'transparent',
						};
						seriesObject = {
							...seriesObject,
							emphasis: {
								...seriesObject?.emphasis,
								itemStyle: {
									borderColor: 'transparent',
									color: 'transparent',
								},
							},
						};
					}
				}

				_parsePeakvalley(options, seriesObject);

				_handleSeries(options, seriesObject, index);

				return seriesObject;
			},
		);
	}

	if (
		(Array.isArray(options.type) && options.type.includes('radar')) ||
		options.type === 'radar'
	)
		parsedOptions.radar = options.radar;

	// Modify yAxis for percentage display
	if (options.percentage) {
		parsedOptions.yAxis = {
			...parsedOptions.yAxis,
			axisLabel: { formatter: '{value}%' },
			max: 100,
		};

		parsedOptions.tooltip = {
			trigger: 'axis',
			formatter: percentageTooltipFormatter,
		};
	}

	if (options.markArea || options.markLine) {
		parsedOptions.tooltip = {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
			},
		};
	}

	if (options.waterfall) {
		parsedOptions.legend = {
			...parsedOptions.legend,
			data: parsedOptions.series
				.map((series) => series.name)
				.filter((name) => name !== 'Placeholder'),
		};
		parsedOptions.xAxis = {
			...parsedOptions.xAxis,
			splitLine: { show: false },
		};

		parsedOptions.tooltip = {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			formatter: function (params) {
				var tar = params[1];
				return (
					tar.name +
					'<br/>' +
					tar.marker +
					tar.seriesName +
					' : ' +
					tar.value
				);
			},
		};
	}

	return parsedOptions;
};

export default _parser_data;

export function percentageTooltipFormatter(params) {
	let total = params.reduce((sum, item) => sum + item.value, 0);
	let tooltipContent = params
		.map((item) => {
			let percentage = ((item.value / total) * 100).toFixed(2);
			return `${item.marker}${item.seriesName}: ${percentage}%`;
		})
		.join('<br/>');
	return `${params[0].axisValueLabel}<br/>${tooltipContent}`;
}
