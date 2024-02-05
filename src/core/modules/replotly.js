/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-14 14:39:52
 * @FilePath     : /visualifyjs/src/core/modules/replotly.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { getPreset } from './replotly/presetHandler';
import { useAppContext } from '../appContext';
import handle_Data, { __process_fetched_data } from '../parser/plotly.data';
import { handle_violin_plot } from '../parser/plotly.violin';

const RePlotly = ({ props, style }) => {
	const [data, setData] = useState(props.data ?? []);
	const [layout, setLayout] = useState(props.layout ?? {});
	const [config, setConfig] = useState(props.config ?? {});
	const { sharedData } = useAppContext();

	useEffect(() => {
		const updatePlot = async () => {
			const { settings, parser } = props;
			let preset = getPreset(settings?.preset);
			if (parser) {
				try {
					// fetch data from api
					const fetched_data = await handle_Data(
						parser,
						preset.layout,
						sharedData,
					);
					const processed_data = __process_fetched_data(
						fetched_data,
						parser,
						preset.visualify,
					);

					if (parser.type === 'violin') {
						preset.data = handle_violin_plot(processed_data);
						setData(() => preset.data);
					}
				} catch (err) {
					if (
						err.message === 'No data fetched from api' &&
						settings?.ignoreEmptyData
					) {
					} else console.log(err.message);
				}
			}

			setData((data) => [...preset.data]);
			setLayout((layout) => ({ ...preset.layout }));
			setConfig((config) => ({ ...preset.config }));
		};

		updatePlot();
	}, [props, sharedData]);

	return (
		<div style={style}>
			<Plot
				data={data}
				layout={layout}
				config={config}
			/>
		</div>
	);
};

export default RePlotly;
