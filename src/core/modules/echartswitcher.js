/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 14:21:40
 * @FilePath     : /visualify.js/src/core/modules/echartswitcher.js
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
import {
	generateChartAriaAttributes,
	formatDataForScreenReader,
	announceToScreenReader,
} from '../../a11y/aria-labels';
import { createEChartsSwitcherKeyboardHandlers } from '../../a11y/keyboard-nav';
import { validateChartColors, applyAccessibleColors } from '../../a11y/color-contrast';

const EChartSwitcher = ({ props, style }) => {
	const { config = {}, parser, advanced, style: _style } = props;
	const chartId = props.id || `echart-switcher-${Math.random().toString(36).substr(2, 9)}`;

	// Accessibility: Validate and fix colors
	const accessibleConfig = React.useMemo(() => {
		const validation = validateChartColors(config);
		if (!validation.valid && config.a11y?.autoFix !== false) {
			return applyAccessibleColors(config);
		}
		return config;
	}, [config]);

	const [loading, setLoading] = useState({
		active: true,
		message: null,
		style: advanced?.loadingStlye ?? {},
	});
	// Store the previous sharedData value using a ref
	const previousSharedDataRef = useRef(null);
	const chartRef = useRef(null);
	const containerRef = useRef(null);
	const [presetData, setPresetData] = useState(null);
	const [Options, setOptions] = useState({});
	const [onEvents] = useState({});
	const { width, height = '400px' } = accessibleConfig;
	const { sharedData } = useAppContext();

	// Use ref for sharedData to access latest value without depending on it
	const sharedDataRef = useRef(sharedData);
	sharedDataRef.current = sharedData;

	// Build a serialized snapshot of the specific sharedData keys this component reads
	// via the parser config (parser.api attributes)
	const parserApiKeys = React.useMemo(() => {
		if (!parser?.api) return [];
		return Object.values(parser.api)
			.map((attr) => attr.val)
			.filter(Boolean)
			.sort();
	}, [parser]);
	const sharedDataSnapshot = JSON.stringify(
		parserApiKeys.reduce((acc, key) => {
			acc[key] = sharedData[key];
			return acc;
		}, {}),
	);

	// Generate ARIA attributes
	const ariaAttributes = React.useMemo(() =>
		generateChartAriaAttributes(accessibleConfig, 'chart', chartId),
		[accessibleConfig, chartId]
	);

	// Keyboard handlers
	const { handleKeyDown } = React.useMemo(() =>
		createEChartsSwitcherKeyboardHandlers(chartRef, accessibleConfig),
		[accessibleConfig]
	);

	useEffect(() => {
		let fetched_data, combinedOptions;
		const parsedGeneral = _parser_gereral(config, presetData);
		const parsedData = _parser_data(config, parsedGeneral);

		const loadPreset = async () => {
			try {
				if (typeof accessibleConfig.preset === 'string') {
					if (
						accessibleConfig.preset.startsWith('http://') ||
						accessibleConfig.preset.startsWith('https://')
					) {
						const presetData = await fetchPresetFromURL(
							accessibleConfig.preset,
						);
						setPresetData(presetData);
					} else {
						const embeddedPreset = getEmbeddedPreset(accessibleConfig.preset);
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
				const currentSharedData = sharedDataRef.current;

				if (parser) {
					// fetch data from api
					fetched_data = await _fetch_data(
						parser,
						parsedData,
						currentSharedData,
					);
					parsedAPI = _process_fetched_data(
						fetched_data,
						parser,
						parsedData,
					);
				}

				combinedOptions = _.merge(parsedAPI, accessibleConfig.overrides);

				if (advanced?.hilbert)
					combinedOptions.series = downsampleSeries(
						combinedOptions.series,
						advanced.hilbert,
					);

				setOptions(combinedOptions);

				setLoading((prev) => ({
					...prev,
					active: false,
					message: null,
				}));

				// Announce chart load to screen readers
				if (accessibleConfig.a11y?.announceLoad !== false) {
					announceToScreenReader(
						`${ariaAttributes['aria-label']}. Chart loaded with ${combinedOptions.series?.[0]?.data?.length || 0} data points.`,
						'polite'
					);
				}
			} catch (error) {
				setLoading((prev) => ({
					...prev,
					active: true,
					message: error.message,
				}));

				// Announce error to screen readers
				announceToScreenReader(`Error loading chart: ${error.message}`, 'assertive');
			}
		};

		loadPreset();

		updatePlot();

		const currentSharedDataFull = sharedDataRef.current;
		if (!_.isEqual(currentSharedDataFull, previousSharedDataRef.current))
			previousSharedDataRef.current = currentSharedDataFull;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config, parser, advanced, presetData, sharedDataSnapshot]);

	return (
		<div
			id={chartId}
			ref={containerRef}
			style={{ ...style, position: 'relative' }}
			className="visualify-chart visualify-echart-switcher"
			{...ariaAttributes}
			onKeyDown={handleKeyDown}
			data-testid="echart-switcher"
		>
			{/* Screen reader description */}
			<div id={`${chartId}-description`} className="sr-only">
				{ariaAttributes['aria-label']}
			</div>

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
					aria-hidden="true"
				/>
			</ErrorBoundary>
		</div>
	);
};

export default EChartSwitcher;
