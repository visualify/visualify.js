/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 14:18:43
 * @FilePath     : /visualifyjs/src/core/libs/echarts.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useRef, forwardRef } from 'react';
import ReactEcharts from 'echarts-for-react';

const ReCharts = forwardRef(({ options, style, onEvents = {} }, ref) => {
	const internalRef = useRef(null);

	// Use the provided ref or the internalRef
	const chartRef = ref || internalRef;

	useEffect(() => {
		// Ensure the chart instance is available
		if (chartRef.current) {
			const chart = chartRef.current.getEchartsInstance();

			// Set the 'silent' option to suppress warnings
			chart.setOption({
				...options,
				silent: true,
			});

			// Efficiently update options
			if (JSON.stringify(options) !== JSON.stringify(chart.getOption())) {
				chart.clear();
				chart.setOption(options);
			}

			// Handle events
			Object.keys(onEvents).forEach((eventName) => {
				chart.off(eventName); // Remove old listener
				chart.on(eventName, onEvents[eventName]); // Attach new listener
			});

			// Resize observer for responsive charts
			const resizeObserver = new ResizeObserver(() => {
				chart.resize();
			});
			const parent = chart.getDom().parentElement;
			if (parent) {
				resizeObserver.observe(parent);
			}

			// Cleanup
			return () => {
				resizeObserver.disconnect();

				if (!chart.isDisposed()) {
					chart.off();
					chart.dispose();
				}
			};
		}
	}, [options, chartRef, onEvents]); // Include onEvents in the dependency array

	return (
		<ReactEcharts
			ref={chartRef}
			option={options}
			style={style}
			onEvents={onEvents}
		/>
	);
});

export default ReCharts;
