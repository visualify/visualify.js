/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-22 22:37:23
 * @FilePath     : /visualifyjs/src/core/modules/echarts/presets/mmtrbc.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const mmtrbc = {
	title: {
		text: 'MmTrBC Preset',
		textStyle: {
			fontFamily: 'Arial, sans-serif',
			fontSize: 24,
			color: 'black',
			margin: '0 0 20px 0',
		},
		left: 'center',
		top: 0,
	},
	tooltip: {
		trigger: 'item',
		axisPointer: {
			type: 'cross',
		},
		formatter: (params) => {
			let express = params.data.value[2];
			let round_epxress = express
				? Math.round(express * 10000) / 10000
				: 0;

			let round = (num, n = 2) =>
				Math.round(num * Math.pow(10, n)) / Math.pow(10, n);

			return ` ${params.data.Cell_ID} <br/> 
					Type: ${params.seriesName} <br/> 
					UMI: ${params.data.UMI ?? 'not found'} <br/>
					FMT: ${round(params.data.Frac_MT, 5) ?? 'not found'} <br/>
					${express !== undefined ? 'Expression: ' + round_epxress : ''} `;
		},
	},
	legend: {
		top: 30,
		textStyle: {
			fontFamily: 'Arial, sans-serif',
			fontSize: 18,
		},
		type: 'scroll',
		orient: 'horizontal',
		right: 'center',
		width: '80%',
	},
	xAxis: {
		name: 'TSNE-2',
		type: 'value',
		axisLabel: false,
		nameGap: 10,
		nameLocation: 'middle',
		axisTick: false,
		splitLine: false,
		nameTextStyle: {
			fontSize: '18',
			fontWeight: 'bold',
		},
	},
	yAxis: {
		name: 'TSNE-1',
		type: 'value',
		axisLabel: false,
		nameGap: 10,
		nameLocation: 'middle',
		axisTick: false,
		splitLine: false,
		nameTextStyle: {
			fontSize: '18',
			fontWeight: 'bold',
		},
	},
	series: [],
	grid: {
		containLabel: true,
		left: '5%',
		right: '13%',
		top: '13%',
		bottom: '13%',
	},
	// ... other default settings for charts
	toolbox: {
		feature: {
			saveAsImage: {
				show: true,
				icon: `path://M30 20.75c-0.69 0.001-1.249 0.56-1.25 1.25v6.75h-25.5v-6.75c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 8c0 0.69 0.56 1.25 1.25 1.25h28c0.69-0.001 1.249-0.56 1.25-1.25v-8c-0.001-0.69-0.56-1.249-1.25-1.25h-0zM15.116 24.885c0.012 0.012 0.029 0.016 0.041 0.027 0.103 0.099 0.223 0.18 0.356 0.239l0.008 0.003 0.001 0c0.141 0.060 0.306 0.095 0.478 0.095 0.345 0 0.657-0.139 0.883-0.365l5.001-5c0.226-0.226 0.366-0.539 0.366-0.884 0-0.691-0.56-1.251-1.251-1.251-0.345 0-0.658 0.14-0.884 0.366l-2.865 2.867v-18.982c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 18.981l-2.866-2.866c-0.226-0.226-0.539-0.366-0.884-0.366-0.691 0-1.251 0.56-1.251 1.251 0 0.346 0.14 0.658 0.367 0.885v0z`,
			},
		},
	},
	dataZoom: [
		{ type: 'inside', xAxisIndex: 0 },
		{ type: 'inside', yAxisIndex: 0 },
		{
			type: 'slider',
			xAxisIndex: 0,
		},
		{ type: 'slider', yAxisIndex: 0, orient: 'vertical' },
	],
	visualMap: {
		min: 0,
		max: 8,
		dimension: 2,
		orient: 'vertical',
		top: 'center',
		right: 35,
		text: ['log2\n(tpm+1)', ''],
		textGap: 10,
		calculable: true,
		inRange: {
			color: [
				'rgb(43, 120, 182)',
				'rgb(247, 126, 11)',
				'rgb(59, 160, 30)',
				'rgb(206, 37, 41)',
				'rgb(143, 103, 191)',
				'rgb(134, 86, 74)',
			],
		},
		textStyle: {
			writingMode: 'vertical-lr',
		},
	},
	visualify: {
		colors_for_celltype: [
			{
				name: 'BC-1',
				color: 'rgb(43, 120, 182)',
				symbol: 'circle',
			},
			{
				name: 'BC-2',
				color: 'rgb(247, 126, 11)',
				symbol: 'circle',
			},
			{
				name: 'BC-Sec',
				color: 'rgb(59, 160, 30)',
				symbol: 'circle',
			},
			{
				name: 'BC-Sq',
				color: 'rgb(206, 37, 41)',
				symbol: 'circle',
			},
			{
				name: 'BC-Mes',
				color: 'rgb(143, 103, 191)',
				symbol: 'circle',
			},
			{
				name: 'BC-Pro',
				color: 'rgb(134, 86, 74)',
				symbol: 'circle',
			},
		],
		mapping: {
			extra: {
				UMI: 'N_UMI',
				N_gene: 'N_gene',
				Frac_MT: 'Frac_MT',
				Cell_ID: 'Cell_ID',
			},
		},
		exclude: ['BC-Mes', 'BC-NE', 'BC-Im'],
		seriesBy: 'Cell_Type',
		symbolSize: 5,
		symbol: 'circle',
		merger: {
			gene: {
				item: 'Cell_ID',
				label: 'Expression',
				visualMap: true,
			},
		},
		filter: {
			Expression: '>-1',
		},
	},
};

export default mmtrbc;
