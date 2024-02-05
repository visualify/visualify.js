/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-21 19:18:05
 * @FilePath     : /visualifyjs/src/core/parser/echart.types.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
export function handle_alltypes_chart(type, Options) {
	if (type === 'pie') return handle_pie_chart(Options);
	if (type === 'radar') return handle_radar_chart(Options);
	if (type === 'funnel') return handle_funnel_chart(Options);
	return Options;
}

function handle_pie_chart(Options) {
	const newOptions = {
		...Options,
		legend: {
			...Options?.legend,
			orient: 'vertical',
			left: 'left',
		},
		emphasis: {
			...Options?.emphasis,
			itemStyle: {
				shadowBlur: 10,
				shadowOffsetX: 0,
				shadowColor: 'rgba(0, 0, 0, 0.5)',
			},
		},
		xAxis: {
			show: false,
		},
		yAxis: {
			show: false,
		},
	};
	return newOptions;
}

function handle_radar_chart(Options) {
	const newOptions = {
		...Options,
		radar: {
			...Options?.radar,
		},
		xAxis: {
			show: false,
		},
		yAxis: {
			show: false,
		},
		legend: {
			top: 0,
		},
	};
	return newOptions;
}


function handle_funnel_chart(Options) {
	const newOptions = {
		...Options,
		xAxis: {
			show: false,
		},
		yAxis: {
			show: false,
		},
		legend: {
			top: 0,
		},
	};
	return newOptions;
}

