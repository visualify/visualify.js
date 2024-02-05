/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 14:21:40
 * @FilePath     : /visualifyjs/src/core/modules/echartswitcher.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useState, useEffect, useRef } from 'react';
import ReCharts from './echarts';
import Loading from '../pages/loading';
import _ from 'lodash';
import _parser_gereral from '../parser/echart.general';
import _parser_data from '../parser/echart.data';
import _fetch_data, { _process_fetched_data } from '../parser/echart.parser';

import {
	fetchPresetFromURL,
	getEmbeddedPreset,
} from '../modules/echarts/presetHandler';
import minimumPreset from './echarts/common';

import ErrorBoundary from '../widgets/errorBoundary';
import { useAppContext } from '../appContext';

import downsampleSeries from '../parser/echart.hilbert';

const EChartSwitcher = ({ props, style }) => {
	const { config = {}, parser, advanced, style: _style } = props;

	const [loading, setLoading] = useState({
		active: true,
		message: null,
		style: advanced?.loadingStlye ?? {},
	});
	// Store the previous sharedData value using a ref
	const previousSharedDataRef = useRef(null);
	const chartRef = useRef(null);
	const [presetData, setPresetData] = useState(null);
	const [Options, setOptions] = useState({});
	const [onEvents] = useState({});
	const { width, height = '400px' } = config;
	const { sharedData } = useAppContext();

	useEffect(() => {
		let fetched_data, combinedOptions;
		const parsedGeneral = _parser_gereral(config, presetData);
		const parsedData = _parser_data(config, parsedGeneral);

		const loadPreset = async () => {
			try {
				if (typeof config.preset === 'string') {
					if (
						config.preset.startsWith('http://') ||
						config.preset.startsWith('https://')
					) {
						const presetData = await fetchPresetFromURL(
							config.preset,
						);
						setPresetData(presetData);
					} else {
						const embeddedPreset = getEmbeddedPreset(config.preset);
						setPresetData(embeddedPreset);
					}
				} else {
					setPresetData(minimumPreset);
				}
			} catch (error) {
				console.error('Error loading preset:', error);
				// Handle error or set to a default value
				setPresetData(minimumPreset);
			}
		};

		const updatePlot = async () => {
			try {
				let parsedAPI = parsedData;

				if (parser) {
					// fetch data from api
					fetched_data = await _fetch_data(
						parser,
						parsedData,
						sharedData,
					);
					parsedAPI = _process_fetched_data(
						fetched_data,
						parser,
						parsedData,
					);
				}

				combinedOptions = _.merge(parsedAPI, config.overrides);

				if (advanced?.hilbert)
					combinedOptions.series = downsampleSeries(
						combinedOptions.series,
						advanced.hilbert,
					);

				console.log('Final Options:', combinedOptions);
				setOptions(combinedOptions);

				setLoading((prev) => ({
					...prev,
					active: false,
					message: null,
				}));
			} catch (error) {
				setLoading((prev) => ({
					...prev,
					active: true,
					message: error.message,
				}));
			}
		};

		loadPreset();

		updatePlot();

		if (!_.isEqual(sharedData, previousSharedDataRef.current))
			previousSharedDataRef.current = sharedData;
	}, [config, parser, advanced, presetData, sharedData]);

	return (
		<div
			id={props.id}
			style={{ ...style, position: 'relative' }}>
			{loading.active && (
				<Loading
					message={loading.message}
					style={loading.style}
				/>
			)}
			<ErrorBoundary>
				<ReCharts
					options={Options}
					style={{
						opacity: loading.active ? 0 : 1,
						width,
						height,
						..._style,
					}}
					onEvents={onEvents}
					ref={chartRef}
				/>
			</ErrorBoundary>
		</div>
	);
};

export default EChartSwitcher;
