/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-06 17:23:59
 * @FilePath     : /visualify.js/src/core/components/scatterL.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../appContext';
import Loading from '../pages/loading';
import {
	initChart,
	handleChartForSharedDataChange,
} from '../modules/echartsUtils';
import {
	parseConfig,
	validateConfig,
	handleAPI,
	handleSimplyLoad,
	onDataZoom,
	parseData,
	outputAxisValues,
} from './parser.scatterBio';

function ScatterBio({ props, style }) {
	const chartRef = useRef(null);
	const { sharedData } = useAppContext();
	const [loading, setLoading] = useState({ active: true, message: null });

	// Store the previous sharedData value using a ref
	const previousSharedDataRef = useRef(null);

	// Use refs for sharedData and props to access latest values without depending on them
	const sharedDataRef = useRef(sharedData);
	sharedDataRef.current = sharedData;
	const propsRef = useRef(props);
	propsRef.current = props;

	// Extract stable dependency keys from props.config.api and colourby
	// These are the only sharedData keys this component actually reads
	const apiConfig = props.config?.api;
	const colourbyKey = props.config?.colourby;
	const apiVals = apiConfig
		? Object.values(apiConfig).map((attr) => attr.val).sort().join(',')
		: '';
	// Build a serialized snapshot of the specific sharedData values we depend on
	const relevantKeys = [];
	if (apiConfig) {
		Object.values(apiConfig).forEach((attr) => {
			if (attr.val) relevantKeys.push(attr.val);
		});
	}
	if (colourbyKey) relevantKeys.push(colourbyKey);
	const sharedDataSnapshot = JSON.stringify(
		relevantKeys.reduce((acc, key) => {
			acc[key] = sharedData[key];
			return acc;
		}, {}),
	);

	useEffect(() => {
		const currentProps = propsRef.current;
		const currentSharedData = sharedDataRef.current;

		let option = parseConfig(currentProps);
		//console.log('option: ', option);
		let fetched_dat = null;

		// Check if the sharedData has changed
		handleChartForSharedDataChange(
			chartRef,
			currentSharedData,
			previousSharedDataRef,
			() => {
				option.xAxis.min = currentProps?.echart?.xAxis?.min;
				option.xAxis.max = currentProps?.echart?.xAxis?.max;
				option.yAxis.min = currentProps?.echart?.yAxis?.min;
				option.yAxis.max = currentProps?.echart?.yAxis?.max;
			},
		);

		// Simulate fetching data asynchronously (replace with your data fetching logic)
		const updatePlot = async () => {
			try {
				setLoading({ active: true, message: null });
				validateConfig(currentProps.config);
				const myChart = initChart(chartRef, option);
				if (currentProps.config.simpleload)
					handleSimplyLoad(currentProps.config.simpleload);
				else {
					const ibox = currentProps.config?.ibox ?? {
						xMin: -9999,
						yMin: -9999,
						xMax: 9999,
						yMax: 9999,
					};
					fetched_dat = await handleAPI(
						currentProps.config,
						currentSharedData,
						ibox,
					);
					//console.log(fetched_dat, 'fetched_dat');
				}
				var { series, legend, visualMap, title } = parseData(
					fetched_dat,
					currentProps.config,
					currentSharedData,
				);
				// Chart options
				option.series = currentProps?.echart?.series ?? series;
				option.legend = {
					...option.legend,
					...legend,
				};

				option.visualMap = visualMap;
				option.title = {
					...option.title,
					text: title,
				};

				// Set the initial option
				myChart.setOption(option);

				let zoomTimeout;
				const zoom_action = () => {
					clearTimeout(zoomTimeout);
					zoomTimeout = setTimeout(async () => {
						await onDataZoom(
							currentProps,
							sharedDataRef.current,
							fetched_dat,
							myChart,
							option,
						);
					}, 500);
				};

				myChart.on('dataZoom', zoom_action);

				setLoading({ active: false, message: null });

				let bbox = outputAxisValues(myChart);
				option.xAxis.min = option.xAxis.min ?? bbox.xMin;
				option.xAxis.max = option.xAxis.max ?? bbox.xMax;
				option.yAxis.min = option.yAxis.min ?? bbox.yMin;
				option.yAxis.max = option.yAxis.max ?? bbox.yMax;

				// Cleanup event listeners on component unmount
				return () => {
					myChart.off('dataZoom', zoom_action);
					myChart.dispose();
				};
			} catch (error) {
				setLoading({ active: true, message: error.message });
			}
		};

		// Execute the updatePlot function
		updatePlot();

		// Observe changes to the size of the chart container
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				if (entry.contentRect.width && entry.contentRect.height) {
					updatePlot();
					resizeObserver.disconnect();
				}
			}
		});

		if (chartRef.current) {
			resizeObserver.observe(chartRef.current);
		}

		// Cleanup function
		return () => {
			resizeObserver.disconnect();
		};
		// Only re-run when relevant sharedData values actually change (serialized comparison)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sharedDataSnapshot, apiVals, colourbyKey]);

	return (
		<div
			id={props.id}
			style={{ ...style, position: 'relative' }}>
			{loading.active && (
				<Loading
					message={loading.message}
					style={{ marginTop: '10px' }}
				/>
			)}
			<div
				ref={chartRef}
				style={{
					opacity: loading.active ? 0 : 1,
					width: props.config?.size?.width || '100%',
					height: props.config?.size?.height || '100%',
				}}
			/>
		</div>
	);
}

export default ScatterBio;
