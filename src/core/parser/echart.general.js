/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-02 11:56:41
 * @FilePath     : /visualifyjs/src/core/parser/echart.general.js
 * @Description  :
 *
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import { handle_alltypes_chart } from './echart.types';
import { getArrayEl } from './echart.series';

const _parser_gereral = (options = {}, preset = {}) => {
	// Parse the custom options
	const parsedOptions = handle_alltypes_chart(getArrayEl(options.type), {
		...preset,
	});

	// Parse the common options
	if ('title' in options) {
		if (typeof options.title === 'string')
			parsedOptions.title = {
				...parsedOptions?.title,
				text: options.title,
			};
		else parsedOptions.title = options.title;
	}

	if ('subtitle' in options) parsedOptions.title.subtext = options.subtitle;

	if (options.legend === false) parsedOptions.legend = { show: false };
	else if ('legend' in options)
		parsedOptions.legend = { ...options.legend, ...options.legend };

	if ('xAxis' in options) {
		if (options.xAxis === false) parsedOptions.xAxis = { show: false };
		else if (options.xAxis)
			parsedOptions.xAxis = {
				...parsedOptions?.xAxis,
				data: options.xAxis,
			};
	}

	if ('yAxis' in options) {
		if (options.yAxis === false) parsedOptions.yAxis = { show: false };
		else if (Array.isArray(options.yAxis))
			parsedOptions.yAxis = {
				...parsedOptions?.yAxis,
				data: options.yAxis,
			};
	}

	if ('xAxisLabel' in options) {
		parsedOptions.xAxis = {
			...parsedOptions?.xAxis,
			name: options.xAxisLabel,
		};
	}

	if ('yAxisLabel' in options) {
		parsedOptions.yAxis = {
			...parsedOptions?.yAxis,
			name: options.yAxisLabel,
		};
	}

	if ('xAxisLineshow' in options) {
		parsedOptions.xAxis = {
			...parsedOptions?.xAxis,
			axisLine: {
				...parsedOptions.xAxis?.axisLine,
				show: options.xAxisLineshow,
			},
		};
	}

	if ('yAxisLineshow' in options) {
		parsedOptions.yAxis = {
			...parsedOptions?.yAxis,
			axisLine: {
				...parsedOptions.yAxis?.axisLine,
				show: options.yAxisLineshow,
			},
		};
	}

	if ('xAxisLabelShow' in options) {
		parsedOptions.xAxis = {
			...parsedOptions?.xAxis,
			axisLabel: {
				...parsedOptions.xAxis?.axisLabel,
				show: options.xAxisLabelShow,
			},
		};
	}

	if ('yAxisLabelShow' in options) {
		parsedOptions.yAxis = {
			...parsedOptions.yAxis,
			axisLabel: {
				...parsedOptions.yAxis?.axisLabel,
				show: options.yAxisLabelShow,
			},
		};
	}

	if ('xAxisLabelColor' in options) {
		parsedOptions.xAxis = {
			...parsedOptions?.xAxis, // Copy existing xAxis properties
			axisLabel: {
				...parsedOptions.xAxis?.axisLabel, // Copy existing axisLabel properties
				color: options.xAxisLabelColor,
			},
		};
	}

	if ('yAxisLabelColor' in options) {
		parsedOptions.yAxis = {
			...parsedOptions?.yAxis, // Copy existing yAxis properties
			axisLabel: {
				...parsedOptions.yAxis?.axisLabel, // Copy existing axisLabel properties
				color: options.yAxisLabelColor,
			},
		};
	}

	if ('tooltip' in options) {
		parsedOptions.tooltip = {
			...parsedOptions?.tooltip,
			...options.tooltip,
		};
	}

	if ('toolbox' in options) {
		parsedOptions.toolbox = {
			...parsedOptions?.toolbox,
			...options.toolbox,
		};
	}

	return parsedOptions;
};

export default _parser_gereral;
