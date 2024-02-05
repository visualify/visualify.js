/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-14 14:43:45
 * @FilePath     : /visualifyjs/src/core/parser/plotly.data.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import conditionalFetch from '../fetch/condfetch';
import { isEmpty } from 'lodash';

const handle_Data = async (parser = {}, Options = {}, sharedData) => {
	const { sources } = parser;

	let fetched_data = {}; // response from api

	const processSource = async (source) => {
		let resp = await conditionalFetch(
			source,
			sharedData,
			Options.title,
			Options.visualify,
		);
		if (resp) fetched_data[source.name] = resp;
	};

	if (Array.isArray(sources)) {
		await Promise.all(sources.map(processSource));
	} else if (typeof sources === 'object') {
		await processSource(sources);
	}

	if (isEmpty(fetched_data))
		throw new Error(parser?.startup_msg ?? 'No data fetched from api');

	return fetched_data;
};

export default handle_Data;

export const __process_fetched_data = (
	fetched_data,
	parser_config,
	visualify = {},
) => {
	//console.log('visualify', visualify);
	const {
		seriesBy = visualify?.seriesBy ?? null,
		mapping = visualify?.mapping ?? {},
		exclude = visualify?.exclude ?? [],
		symbol = visualify?.symbol ?? null,
		symbolSize = visualify?.symbolSize ?? null,
		merger = visualify?.merger ?? null,
	} = parser_config;
	const { x = 'x', y = 'y', z = 'z', extra = [] } = mapping;
	const aggregatedData = {};

	for (const [key, data] of Object.entries(fetched_data)) {
		//console.log('processing data from api', key, data);
		if (!data) {
			return Object.values(aggregatedData);
		} else if (data && merger && merger[key]) {
            /*
			console.log(
				`Plotly processing data from merger:`,
				key,
				`merger`,
				merger[key],
				`data`,
				data,
				`with`,
				aggregatedData,
			);*/
			// add extra properties to aggregatedData.data
			Object.values(aggregatedData).forEach((item) => {
				item.data.forEach((value) => {
					if (merger[key].item in value) {
						let tag = value[merger[key].item];
						let val = data[tag];
						if (merger[key].label) value[merger[key].label] = val;
						if (merger[key].visualMap) value.value.push(val);
					}
				});
			});
		} else {
			// if seriesBy is not defined, get the first key of data as the series
			const seriesKey = seriesBy ?? Object.keys(data)[0];
			if (
				data[seriesKey] === undefined ||
				data === undefined ||
				!Array.isArray(data[seriesKey])
			)
				continue;
			data[seriesKey].forEach((item, index) => {
				if (exclude && exclude.includes(item)) return;

				const extraProperties = {};
				for (const property in mapping.extra) {
					if (data[extra[property]]) {
						extraProperties[property] =
							data[extra[property]][index];
					}
				}

				if (!data[x] || !data[y] || !parser_config.type) return;

				const point = data[z]
					? [data[x][index], data[y][index], data[z][index]]
					: [data[x][index], data[y][index]];

				if (!aggregatedData[item]) {
					aggregatedData[item] = {
						name: item,
						type: parser_config.type,
						data: [],
					};
					if (symbol) aggregatedData[item].symbol = symbol;
					if (symbolSize)
						aggregatedData[item].symbolSize = symbolSize;
				}

				aggregatedData[item].data.push({
					value: point,
					...extraProperties,
				});
			});
		}
	}

	let processed_data = Object.values(aggregatedData);

	return processed_data;
};
