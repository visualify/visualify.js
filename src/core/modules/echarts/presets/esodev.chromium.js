/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-22 22:37:23
 * @FilePath     : /visualifyjs/src/core/modules/echarts/presets/esodev.chromium.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const esodev_chromium = {
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
		top: 25,
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
	series: [],
	grid: {
		top: '20%',
		bottom: '12%',
		left: '10%',
		right: '10%',
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
		// Inside type for X-axis
		{
			type: 'inside',
			xAxisIndex: 0,
			filterMode: 'filter',
		},
		// Inside type for Y-axis
		{
			type: 'inside',
			yAxisIndex: 0,
			filterMode: 'filter',
			orient: 'vertical',
		},
	],
	visualMap: {
		min: 0,
		max: 3,
		dimension: 2,
		orient: 'vertical',
		top: 'center',
		left: 0,
		text: ['log2\n(tpm+1)', ''],
		textGap: 10,
		calculable: true,
		inRange: {
			color: ['#808080', '#FFA500', '#FF0000'],
		},
		textStyle: {
			writingMode: 'vertical-lr',
		},
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
			return `
                    <div style="text-align: center;">
                        ${params.data.Cell_ID} 
                        <br/> Type: <strong>${params.data.Cell_Type} </strong>
                        <br/> Stage: <strong>${params.data.Stage}</strong>
                        <br/> #UMI: <strong>${params.data.UMI}</strong>
                        <br/> #Gene: <strong>${params.data.Gene}</strong>
                        <br/> MT%: <strong>${params.data.MT}</strong>
                        ${
							express !== undefined
								? '<br/> Expression: <strong>' +
								  round_epxress +
								  '</strong>'
								: ''
						}
                    </div>
                `;
		},
	},
	visualify: {
		mapping: {
			x: '2D_UMAP_1',
			y: '2D_UMAP_2',
			extra: {
				Stage: 'Stage',
				UMI: 'n_UMIs',
				MT: 'percent_MT',
				Gene: 'n_Genes',
				Cell_Type: 'Cell_Type',
				Cell_ID: 'Cell_ID',
			},
		},
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
		api_mapping: {
			'ENS (S)': 'ens_iter_2',
			'IM (S)': 'im_iter_2',
			'MES (S)': 'mes_iter_2',
			'SKM (S)': 'skm_iter_2',
			'ENDO (S)': 'endo_iter_2',
			'EPI (E)': 'epi_iter_2',
			Stroma: 'stroma_iter_1',
			Epithelium: 'epi_iter_1',
		},
	},
};

export default esodev_chromium;
