/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-12 17:35:02
 * @FilePath     : /visualify.js/src/core/components/parser.scatterBio.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import simplefetch from '../fetch/fetch';

var cached_color = {};
export function rcolor(seed = 0) {
	const maxHexValue = 16777215;
	const randomSeed = seed || Math.random();
	const randomColor = Math.floor(randomSeed * maxHexValue).toString(16);
	const color = '#' + randomColor.padStart(6, '0');

	return color;
}

export function isEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export const parseConfig = (props) => {
	const { echart } = props;
	var option = {
		series: [
			{
				data: null, // Use the fetched data here
				type: 'scatter',
				areaStyle: {},
			},
		],
		toolbox: {
			feature: {
				saveAsImage: {
					icon: `path://M30 20.75c-0.69 0.001-1.249 0.56-1.25 1.25v6.75h-25.5v-6.75c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 8c0 0.69 0.56 1.25 1.25 1.25h28c0.69-0.001 1.249-0.56 1.25-1.25v-8c-0.001-0.69-0.56-1.249-1.25-1.25h-0zM15.116 24.885c0.012 0.012 0.029 0.016 0.041 0.027 0.103 0.099 0.223 0.18 0.356 0.239l0.008 0.003 0.001 0c0.141 0.060 0.306 0.095 0.478 0.095 0.345 0 0.657-0.139 0.883-0.365l5.001-5c0.226-0.226 0.366-0.539 0.366-0.884 0-0.691-0.56-1.251-1.251-1.251-0.345 0-0.658 0.14-0.884 0.366l-2.865 2.867v-18.982c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 18.981l-2.866-2.866c-0.226-0.226-0.539-0.366-0.884-0.366-0.691 0-1.251 0.56-1.251 1.251 0 0.346 0.14 0.658 0.367 0.885v0z`,
				},
			},
		},
		dataZoom: [
			{
				type: 'inside',
				xAxisIndex: 0,
				filterMode: 'filter',
			},
			{
				type: 'inside',
				yAxisIndex: 0,
				filterMode: 'filter',
				orient: 'vertical',
			},
		],
		tooltip: {
			trigger: 'item',
			axisPointer: {
				type: 'cross',
			},
			formatter: (params) => {
				let express =
					Math.round(params.data.Expression * 10000) / 10000;
				return `
                    <div style="text-align: center;">
                        ${params.data.Cell_ID} 
                        <br/> Type: <strong>${params.data.Cell_Type} </strong>
                        <br/> Stage: <strong>${params.data.Stage}</strong>
                        <br/> #UMI: <strong>${params.data.UMI}</strong>
                        <br/> #Gene: <strong>${params.data.Gene}</strong>
                        <br/> MT%: <strong>${params.data.MT}</strong>
                        ${
							express != null
								? '<br/> Expression: <strong>' +
								  express +
								  '</strong>'
								: ''
						}
                    </div>
                `;
			},
		},
		title: {
			textStyle: {
				fontSize: 20,
			},
			left: 'center',
			top: 0,
		},
		animation: false,
		legend: {
			textStyle: {
				fontSize: 18,
			},
			orient: 'horizontal',
			right: 'center', // "top" | "bottom" | "center"
			itemWidth: 20,
			width: 600,
			top: 20,
		},

		xAxis: {
			name: 'UMAP 1',
			type: 'value',
			nameLocation: 'middle',
			nameGap: 10,
			nameTextStyle: {
				fontSize: 18, // Set font size
				fontWeight: 'bold', // Set font weight to bold
			},
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: { show: false },
			//min: -20,
			//max: 20,
		},
		yAxis: {
			name: 'UMAP 2',
			type: 'value',
			nameLocation: 'middle',
			nameGap: 10,
			nameTextStyle: {
				fontSize: 18, // Set font size
				fontWeight: 'bold', // Set font weight to bold
			},
			//min: -20,
			//max: 20,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: { show: false },
		},
		grid: {
			top: '20%',
			bottom: '12%',
			left: '10%',
			right: '10%',
		},
		...echart,
	};

	return option;
};

export const handleSimplyLoad = (simpleload) => {
	console.log(`handleSimplyLoad: `, simpleload);
	// fetch data direcly from config
	// fetch data from simply api
};

export const handleAPI = async (config, sharedData, bbox = false) => {
	let fetched_dat = {};
	let dependencies = {};

	// Get corresponding api and its attributes
	for (const [item, attr] of Object.entries(config.api)) {
		const { href, val, dep = null } = attr;
		let id = sharedData[val];

		if (typeof id === 'object' && config.mapping && config.mapping.api) {
			id = [...new Set(id.map((i) => config.mapping.api[i] ?? i))];
			id = id[0] ? id : null;
		} else if (config.mapping && config.mapping.api)
			id = config.mapping.api[id] ?? id;

		//console.log(`item: ${item}, href: ${href}, val: ${val}, id: ${id}`);
		dependencies[item] = id;

		if (id && typeof id === 'object') {
			//console.log(`id for ${item} : `, id);
			const promises = id.map(async (i) => {
				//console.log(`request for ${item} : `, i);
				return await simplefetch(href, {
					id: i,
					type: item,
					debug: false,
					bbox: bbox,
				});
			});
			//console.log(`promises for ${item} : `, promises);

			const resp = await Promise.all(promises);
			const result = resp.reduce((acc, cur) => {
				return {
					...acc,
					...cur,
				};
			}, {});
			//console.log(`result for ${item} : `, result);
			fetched_dat[item] = result;
		} else if (id) {
			//console.log(`dep2 id for ${item} : `, id, dependencies);

			const result = await simplefetch(href, {
				id: dependencies[dep] + '/' + id,
				type: item,
				debug: sharedData.debug,
				bbox: bbox,
			});
			fetched_dat[item] = result;
			dependencies[item] = id;
		}
	}

	if (isEmpty(fetched_dat)) {
		throw new Error(
			config.startup_msg ?? 'Please select metadata to load data',
		);
	} else {
		fetched_dat.fetched_ID = dependencies;
		return fetched_dat;
	}

	//wait for user to provide values for api
};

// Function to output the axis values
export const outputAxisValues = (myChart) => {
	if (!myChart) {
		return;
	}

	const yAxis = myChart.getModel().getComponent('yAxis').axis;
	const yAxisMin = yAxis.scale.getExtent()[0];
	const yAxisMax = yAxis.scale.getExtent()[1];

	const xAxis = myChart.getModel().getComponent('xAxis').axis;
	const XAxisMin = Math.round(xAxis.scale.getExtent()[0]);
	const XAxisMax = Math.round(xAxis.scale.getExtent()[1]);

	//console.log(
	//	`${msgPrefix} X Axis Display Range: [${XAxisMin}, ${XAxisMax}]`,
	//	`${msgPrefix} Y Axis Display Range: [${yAxisMin}, ${yAxisMax}]`,
	//);

	return {
		xMin: XAxisMin,
		yMin: yAxisMin,
		xMax: XAxisMax,
		yMax: yAxisMax,
	};
};

export const validateConfig = (config) => {
	if (!config) {
		throw new Error('config is required, minial config is {}');
	}
	// api or simpleload is required
	if (!config.api && !config.simpleload) {
		throw new Error('config.api or config.simpleload is required');
	}
};

export const parseData = (fetched, config, sharedData) => {
	if (!fetched) {
		throw new Error('fetched data is not valid: ' + fetched);
	}

	//console.log(`fetched: `, fetched);

	const metadata = fetched.metadata;
	const genes = fetched.gene;

	const {
		colors: givenColors = [],
		exclusion = [],
		dotsize = 'auto',
	} = config;
	//console.log(`givenColors: `, givenColors);
	let colourby = config.colourby;

	if (colourby && sharedData[config.colourby]) {
		colourby = sharedData[config.colourby].replace(' ', '_');
	}
	//console.log(`colourby: `, colourby);

	// Exclude items if given by config
	const category = [...new Set(metadata[colourby])].filter(
		(_category) => !exclusion.includes(_category),
	);
	//console.log(`category: `, category);

	const seriesAttr = processSeriesAttr(givenColors, category);
	//console.log(`seriescolor: `, seriesAttr);

	//console.log(fetched);
	try {
		return {
			series: processData(
				metadata,
				genes,
				colourby,
				seriesAttr,
				dotsize,
				config?.mapping?.axis,
			),
			legend: handleLegend(category),
			visualMap: handleVisualMap(genes, config.visualmap),
			title: fetched?.fetched_ID?.gene ?? '',
		};
	} catch (error) {
		console.log(error);
		throw new Error('Failed to parse data');
	}
};

const processSymbolSize = (dotsize, totalcount) => {
	if (typeof dotsize === 'number') {
		return dotsize;
	} else if (dotsize === 'auto' || typeof dotsize === 'object') {
		const { dotFactor = 500, min = 2, max = 10 } = dotsize;
		const sizeFactor = Math.max(1 - totalcount / dotFactor, 0.2);
		return (max - min) * sizeFactor + min;
	} else {
		return 3;
	}
};

const processSeriesAttr = (givenColors, category) => {
	var __colors = givenColors;
	let visualcolor = [];
	let seriescolor = {};

	if (!isEmpty(cached_color)) {
		//console.log(`cached_color: `, cached_color);
		seriescolor = cached_color;
	}

	if (Array.isArray(__colors) && __colors.length > 0) {
		__colors.forEach((item) => {
			if (item.color) visualcolor.push(item.color);
			else visualcolor.push(rcolor());
		});
		category.forEach((celltype, index) => {
			const cell = __colors.find((item) => item.name === celltype);
			const _color = cell?.color ?? visualcolor[index];
			const _symbol =
				__colors.find((item) => item.name === celltype)?.symbol ??
				'circle';
			seriescolor[celltype] = {
				color: _color,
				symbol: _symbol,
			};
		});
	} else {
		let no_zcolor = false;
		if (visualcolor.length === 0) {
			no_zcolor = true;
		}
		category.forEach((celltype, index) => {
			if (no_zcolor) {
				visualcolor.push(rcolor());
			}
			if (!seriescolor[celltype]) {
				seriescolor[celltype] = {
					color: rcolor(),
					symbol: 'circle',
				};
			}
		});
	}

	cached_color = seriescolor;
	return seriescolor;
};

const processData = (
	metadata,
	genes,
	colourby,
	seriesAttr,
	dotsize,
	mapping,
) => {
	const { x = 'x', y = 'y', extra = [] } = mapping;
	// get the key from metadata
	const keys = Object.keys(metadata);
	//console.log(`keys: `, keys);
	// if colourby is not given, randomly pick one from keys
	colourby = colourby ?? keys[Math.floor(Math.random() * keys.length)];
	//console.log(`colourby: `, colourby);

	// Aggregate data based on the "colourby" attribute
	const aggregatedData = {};

	if (metadata[colourby] === undefined) return Object.values(aggregatedData);

	metadata[colourby].forEach((item, index) => {
		if (!aggregatedData[item]) {
			aggregatedData[item] = {
				name: item,
				type: 'scatter',
				data: [],
				itemStyle: {
					color: seriesAttr[item].color,
				},
				symbol: seriesAttr[item].symbol,
				symbolSize: processSymbolSize(
					dotsize,
					metadata[colourby].length,
				),
			};
		}

		// console.log(metadata['Cell_ID'][index]);
		// Todo: Leave for gene expression later
		const extraProperties = {};
		for (const property in mapping.extra) {
			if (metadata[extra[property]]) {
				extraProperties[property] = metadata[extra[property]][index];
			}
		}
		// Todo: Leave for z-index of visualmap later

		let Expression = genes ? genes[metadata['Cell_ID'][index]] : null;
		aggregatedData[item].data.push({
			value: [metadata[x][index], metadata[y][index], Expression ?? 0],
			...extraProperties,
			Expression: Expression,
		});
	});

	//console.log(`aggregatedData: `, aggregatedData);
	// Convert aggregated data to an array of series
	return Object.values(aggregatedData);
};

export async function onDataZoom(
	props,
	sharedData,
	fetched_dat,
	myChart,
	option,
) {
	const bbox = outputAxisValues(myChart);

	fetched_dat = await handleAPI(props.config, sharedData, bbox);

	if (isEmpty(fetched_dat)) return;

	var {
		series: newseries,
		legend,
		visualMap,
		title,
	} = parseData(fetched_dat, props.config, sharedData);

	const MAX_POINTS = 8000;

	if (props.config.merge) {
		// Ensure that both option.series and newseries are arrays
		option.series = Array.isArray(option.series) ? option.series : [];
		newseries = Array.isArray(newseries) ? newseries : [];

		// Merge the existing series and new series while ensuring uniqueness based on the series name
		const mergedSeries = [...option.series, ...newseries].reduce(
			(uniqueSeries, currentSeries) => {
				const existingIndex = uniqueSeries.findIndex(
					(series) => series.name === currentSeries.name,
				);

				if (existingIndex === -1) {
					// Series with this name doesn't exist yet, add it to the uniqueSeries array
					uniqueSeries.push(currentSeries);
				} else {
					// Series with this name already exists, update its data
					uniqueSeries[existingIndex].data = currentSeries.data;
				}

				return uniqueSeries;
			},
			[],
		);

		// Calculate the total number of points in the merged series
		const totalPoints = mergedSeries.reduce(
			(count, series) =>
				(count += Array.isArray(series.data) ? series.data.length : 0),
			0,
		);

		// Check if the total number of points exceeds the MAX_POINTS limit
		if (totalPoints > MAX_POINTS) {
			// Calculate the number of excess points
			let excess = totalPoints - MAX_POINTS;

			// Iterate over the last option.series and reduce their data points
			for (const series of option.series.slice().reverse()) {
				if (excess > 0 && Array.isArray(series.data)) {
					const removedPoints = series.data.splice(-excess);
					excess -= removedPoints.length;
				}
			}
		}

		// Set the option's series to the merged series
		option.series = mergedSeries;
	} else {
		option.series = newseries;
	}

	option.legend = {
		...option.legend,
		...legend,
	};

	option.visualMap = visualMap;
	option.title = {
		...option.title,
		text: title,
	};
	myChart.setOption(option);
	return bbox;
}

const handleLegend = (category) => {
	let legend = {};
	let legendType = category.length > 10 ? 'scroll' : 'plain';

	const sortedItems = category.slice().sort((a, b) => {
		// Extract the character part from the strings
		const charPartA = a.match(/[^0-9]+/)[0];
		const charPartB = b.match(/[^0-9]+/)[0];

		// Compare the character parts alphabetically
		const charComparison = charPartA.localeCompare(charPartB);

		if (charComparison !== 0) {
			return charComparison;
		}

		// If the character parts are the same, extract and compare the numeric part
		const numPartA = parseInt(a.match(/\d+/)[0], 10);
		const numPartB = parseInt(b.match(/\d+/)[0], 10);

		return numPartA - numPartB;
	});

	legend.orient = 'horizontal';
	legend.top = 25;
	legend.right = 'center';
	legend.type = legendType;
	legend.data = sortedItems;
	return legend;
};

const handleVisualMap = (genes, visualmap = {}) => {
	if (!genes) return [];
	// Initialize max and min variables with the first value in the object

	console.log(`visualmap in handleVisualMap: `, visualmap);


	let maxValue = Number.NEGATIVE_INFINITY;
	let minValue = Number.POSITIVE_INFINITY;
	let visualMap = {};
	// Iterate through the values of the object
	for (const value of Object.values(genes)) {
		// Compare the current value to the max and min values
		if (value > maxValue) {
			maxValue = value;
		}
		if (value < minValue) {
			minValue = value;
		}
	}
	//console.log(`handlesVisualMap: `, maxValue, minValue);
	visualMap.min = minValue;
	visualMap.max = maxValue;
	visualMap.dimension = 2;
	visualMap.orient = 'vertical';
	visualMap.top = 'center';
	visualMap.left = 0;
	visualMap.text = ['log2\n(tpm+1)', ''];
	visualMap.textGap = 10;
	visualMap.calculable = true;
	visualMap.inRange = {
		color: ['#808080', '#FFA500', '#FF0000'],
	};
	visualMap.textStyle = {
		writingMode: 'vertical-lr',
	};

	visualMap = { ...visualMap, ...visualmap };

	//console.log(`handlesVisualMap: `, visualMap);
	return visualMap;
};
