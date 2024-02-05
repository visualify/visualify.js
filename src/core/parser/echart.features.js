/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-03 13:01:48
 * @FilePath     : /visualifyjs/src/core/parser/echart.features.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

export function _parsePeakvalley(options, seriesObject) {
	if (options.valley || options.peak) {
		seriesObject.markPoint = {};
		seriesObject.markPoint.data = [];
		if (options.peak) {
			seriesObject.markPoint.data.push({
				type: 'max',
				name: 'Max',
				label: {
					formatter:
						typeof options.peak === 'string' ? options.peak : 'Max',
				},
			});
		}
		if (options.valley) {
			seriesObject.markPoint.data.push({
				type: 'min',
				name: 'Min',
				label: {
					formatter:
						typeof options.valley === 'string'
							? options.valley
							: 'Min',
				},
			});
		}
	}
}

export function _parseMarkArea(markAreaOption, seriesIndex) {
	const markAreaOptions = {};

	const formatAreaData = (option) => {
		let areas = [];

		const processAxis = (axisData, axisName) => {
			if (Array.isArray(axisData)) {
				axisData.forEach((data) =>
					areas.push([
						{ [axisName]: data.start, name: data.name },
						{ [axisName]: data.end },
					]),
				);
			} else {
				areas.push([
					{ [axisName]: axisData.start, name: axisData.name },
					{ [axisName]: axisData.end },
				]);
			}
		};

		if (option.xAxis) {
			processAxis(option.xAxis, 'xAxis');
		}
		if (option.yAxis) {
			processAxis(option.yAxis, 'yAxis');
		}

		return areas;
	};

	let areaData = [];
	let selectedOption =
		Array.isArray(markAreaOption) && seriesIndex < markAreaOption.length
			? markAreaOption[seriesIndex]
			: markAreaOption;

	areaData = formatAreaData(selectedOption);
	markAreaOptions.data = areaData;

	// Add emphasis and other additional properties
	Object.keys(selectedOption).forEach((key) => {
		if (key === 'data') {
			markAreaOptions[key] = markAreaOptions[key].concat(
				selectedOption[key],
			);
		} else if (key !== 'xAxis' && key !== 'yAxis') {
			markAreaOptions[key] = selectedOption[key];
		}
	});

	return markAreaOptions;
}

export function _parseMarkLine(markLineOption, seriesIndex) {
	const markLineOptions = {};

	let selectedOption =
		Array.isArray(markLineOption) && seriesIndex < markLineOption.length
			? markLineOption[seriesIndex]
			: markLineOption;

	markLineOptions.emphasis = {
		lineStyle: {
			width: 5,
			type: 'solid',
		},
	};

	markLineOptions.blur = {
		lineStyle: {
			opacity: 0.5, // Example blur style
		},
	};

	markLineOptions.lineStyle = {
		type: 'dashed', // 'solid','dashed'
		width: 3,
	};

	// Add additional properties from markLineOption
	Object.keys(selectedOption).forEach((key) => {
		markLineOptions[key] = selectedOption[key];
	});

	return markLineOptions;
}
