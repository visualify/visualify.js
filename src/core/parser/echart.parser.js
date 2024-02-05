/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-23 23:27:45
 * @FilePath     : /visualifyjs/src/core/parser/echart.parser.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import conditionalFetch from '../fetch/condfetch';
import { isEmpty } from 'lodash';

const enableVisualMap = (series) => {
	if (!series || series.length === 0) return false;
	const seriesData = series[0].data;
	if (!seriesData) return false;
	// Check if the series data has z values (indicating 3D data)
	return seriesData.some((dataPoint) => dataPoint.value.length === 3);
};

const _fetch_data = async (parser = {}, Options = {}, sharedData) => {
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

export const _process_fetched_data = (
	fetched_data,
	parser = {},
	Options = {},
) => {
	Options.series = __process_fetched_data(
		fetched_data,
		parser,
		Options.visualify,
	);
	Options.legend.data = Options.series.map((item) => item.name);

	if (!enableVisualMap(Options.series)) {
		//console.log('disable visual map');
		Options.visualMap = [];
	}
	return Options;
};

const __process_fetched_data = (
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
		filter = visualify?.filter ?? null,
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
				`processing data from merger:`,
				key,
				`merger`,
				merger[key],
				`data`,
				data,
				`with`,
				aggregatedData,
			);
			*/
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

			if (data[seriesKey] === undefined || data === undefined) continue;
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

	if (filter) {
		for (let filter_key of Object.keys(filter)) {
			const filter_expression = filter[filter_key];
			//console.log('filter', filter_key, filter_expression);
			processed_data = processed_data.map((item) => {
				const filteredData = item.data.filter((dataPoint) => {
					try {
						const value = dataPoint[filter_key];
						if (value === undefined || value === null) return true;

						const match =
							filter_expression.match(/([><]=?)\s*(-?\d+)/);
						if (!match)
							throw new Error(
								'Invalid filter expression for filter',
							);

						// Extract the operator and threshold value
						const operator = match[1];
						const threshold = parseInt(match[2]);
						// Evaluate the filter expression using the function
						return eval_filter(value, operator, threshold);
					} catch (err) {
						console.warn('error in filter', err);
						return false;
					}
				});
				return {
					...item,
					data: filteredData,
				};
			});
		}
	}

	return processed_data;
};

// Define a function to evaluate filter expressions
function eval_filter(value, operator, threshold) {
	switch (operator) {
		case '<':
			return value < threshold;
		case '<=':
			return value <= threshold;
		case '>':
			return value > threshold;
		case '>=':
			return value >= threshold;
		case '=':
			return value === threshold;
		default:
			throw new Error('Invalid operator in filter expression');
	}
}

export default _fetch_data;
