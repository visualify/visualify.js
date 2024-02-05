/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-02 22:53:11
 * @FilePath     : /visualifyjs/src/core/parser/echart.series.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
export function _handleSeries(options, seriesObject, index) {
	setArrayEl(seriesObject, options, 'label', index);
	setArrayEl(seriesObject, options, 'labelLine', index);
	setArrayEl(seriesObject, options, 'itemStyle', index);
	setArrayEl(seriesObject, options, 'emphasis', index);
	// Handle Line Chart options
	if (seriesObject.type === 'line') {
		setArrayEl(seriesObject, options, 'smooth', index);
		setArrayEl(seriesObject, options, 'step', index);
		setArrayEl(seriesObject, options, 'areaStyle', index);
	} else if (seriesObject.type === 'pie') {
		setArrayEl(seriesObject, options, 'selectedMode', index);
		setArrayEl(seriesObject, options, 'roseType', index);
		if ('center' in options)
			seriesObject.center = getArray(options.center, index);
		if ('radius' in options)
			seriesObject.radius = getArray(options.radius, index);
	} else if (seriesObject.type === 'radar') {
		if ('radar' in options && Array.isArray(options.radar))
			seriesObject.radarIndex = index;
	} else if (seriesObject.type === 'funnel') {
		seriesObject.top = getArrayEl(options.top, index) ?? 60;
		seriesObject.bottom = getArrayEl(options.bottom, index) ?? 60;
		seriesObject.left = getArrayEl(options.left, index) ?? '10%';
		setArrayEl(seriesObject, options, 'right', index);
		seriesObject.width = getArrayEl(options.width, index) ?? '80%';
		setArrayEl(seriesObject, options, 'height', index);
		seriesObject.min = getArrayEl(options.min, index) ?? 0;
		seriesObject.max = getArrayEl(options.max, index) ?? 100;
		seriesObject.minSize = getArrayEl(options.minSize, index) ?? '0%';
		seriesObject.maxSize = getArrayEl(options.maxSize, index) ?? '100%';
		seriesObject.sort = getArrayEl(options.sort, index) ?? 'descending';
		seriesObject.gap = getArrayEl(options.gap, index) ?? 0;
		seriesObject.funnelAlign =
			getArrayEl(options.funnelAlign, index) ?? 'center';
		setArrayEl(seriesObject, options, 'z', index);
	}
}

function setArrayEl(sereis, options, param, index) {
	let val = getArrayEl(options[param], index);
	if (param in options && val) sereis[param] = val;
}

// Helper function to get the type for each series
export function getArrayEl(value, index) {
	return Array.isArray(value)
		? value[Math.min(index, value.length - 1)]
		: value;
}

function getArray(value, index) {
	let _inedx = Math.min(index, value.length - 1);
	if (Array.isArray(value) && Array.isArray(value[_inedx]))
		return value[_inedx];
	else if (Array.isArray(value)) return value;
	else return getArrayEl(value, index);
}

export default _handleSeries;
