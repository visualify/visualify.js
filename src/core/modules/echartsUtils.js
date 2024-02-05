/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-11 23:09:44
 * @FilePath     : /visualifyjs/src/core/lib/echartsUtils
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
// echartsUtils.js
import * as echarts from 'echarts';

export const initChart = (chartRef, chartOption) => {
	if (!chartRef.current) {
		throw new Error('Chart container DOM element not available.');
	}

	let chartInstance = echarts.getInstanceByDom(chartRef.current);
	if (!chartInstance) {
		chartInstance = echarts.init(chartRef.current);
	}
	chartInstance.setOption(chartOption);
	return chartInstance;
};

export const disposeChart = (chartInstance) => {
	chartInstance && chartInstance.dispose();
};

export const handleChartForSharedDataChange = (
	chartRef,
	sharedData,
	previousSharedDataRef,
	extra_Excute_Func = null,
) => {
	if (sharedData !== previousSharedDataRef.current) {
		const chartInstance = echarts.getInstanceByDom(chartRef.current);
		disposeChart(chartInstance);
		previousSharedDataRef.current = sharedData;
		if (extra_Excute_Func) {
			//console.log('excute func: ', extra_Excute_Func);
			extra_Excute_Func();
		}
	}
};
