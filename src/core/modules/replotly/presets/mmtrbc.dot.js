/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-14 15:25:40
 * @FilePath     : /visualifyjs/src/core/modules/replotly/presets/mmtrbc.dot.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

import Plotly from 'react-plotly.js';

const DownloadIcon = {
	width: 32,
	height: 40,
	path: `M30 20.75c-0.69 0.001-1.249 0.56-1.25 1.25v6.75h-25.5v-6.75c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 8c0 0.69 0.56 1.25 1.25 1.25h28c0.69-0.001 1.249-0.56 1.25-1.25v-8c-0.001-0.69-0.56-1.249-1.25-1.25h-0zM15.116 24.885c0.012 0.012 0.029 0.016 0.041 0.027 0.103 0.099 0.223 0.18 0.356 0.239l0.008 0.003 0.001 0c0.141 0.060 0.306 0.095 0.478 0.095 0.345 0 0.657-0.139 0.883-0.365l5.001-5c0.226-0.226 0.366-0.539 0.366-0.884 0-0.691-0.56-1.251-1.251-1.251-0.345 0-0.658 0.14-0.884 0.366l-2.865 2.867v-18.982c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 18.981l-2.866-2.866c-0.226-0.226-0.539-0.366-0.884-0.366-0.691 0-1.251 0.56-1.251 1.251 0 0.346 0.14 0.658 0.367 0.885v0z`,
};

const mmtrbc_dot = {
	data: [],
	config: {
		displaylogo: false,
		modeBarButtonsToRemove: [
			'toImage',
			'zoom2d',
			'pan2d',
			'zoomIn2d',
			'zoomOut2d',
			'boxSelect',
			'select2d',
			'lasso2d',
			'resetScale2d',
			'hoverClosestCartesian',
			'hoverCompareCartesian',
			'toggleSpikelines',
		],
		modeBarButtonsToAdd: [
			{
				name: 'Save As Image',
				icon: DownloadIcon, // Your custom SVG or base64 encoded image
				click: function (gd) {
					Plotly.downloadImage(gd, { format: 'png' });
				},
			},
		],
	},
	layout: {
		title: {
			text: 'Add genes to update Dot Plot',
			font: {
				family: 'Arial, sans-serif',
				size: 24,
				color: 'black',
			},
		},
		margin: {
			l: 110,
			r: 40,
			b: 30,
			t: 80,
		},
		legend: {
			//hide the legend
			x: 0.5, // left align
			y: -0.5, // top align
			xanchor: 'center', // anchor the legend to the left
			yanchor: 'bottom', // anchor the legend to the top
			orientation: 'h', // horizontal legend
			font: {
				size: 16,
				family: 'Arial, sans-serif',
				color: '#6699CC',
			},
		},
		xaxis: {
			showgrid: false,
			showline: false,
			showticklabels: true,
			linecolor: 'rgb(102, 102, 102)',
			tickcolor: 'rgb(102, 102, 102)',
		},
		yaxis: {
			showgrid: true,
			showline: false,
			showticklabels: true,
			gridcolor: '#E5ECF6',
			tickfont: {
				size: 16,
				family: 'Arial',
				color: '#037e8c',
			},
		},
		width: 500,
		height: 300,
		hovermode: 'closest',
	},
	visualify: {
		mapping: {
			extra: {
				UMI: 'N_UMI',
				N_gene: 'N_gene',
				Frac_MT: 'Frac_MT',
				Cell_ID: 'Cell_ID',
			},
		},
		merger: {
			gene: {
				item: 'Cell_ID',
				label: 'Expression',
				visualMap: true,
			},
		},
	},
};

export default mmtrbc_dot;
