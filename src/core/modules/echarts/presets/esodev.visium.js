const esodev_visium = {
	title: {
		textStyle: {
			fontSize: 20,
		},
		left: 'center',
		top: 0,
	},
	animation: false,
	legend: {
		show: false,
	},
	xAxis: {
		show: false,
	},
	yAxis: {
		show: false,
	},
	series: [],
	grid: {
		top: '15%',
		bottom: '12%',
		left: '5%',
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
	dataZoom: [],
	visualMap: {
		min: 0,
		max: 10,
		dimension: 2,
		orient: 'horizontal',
		top: 'bottom',
		right: 'center',
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
			let resultHtml = '';
			for (const [key, value] of Object.entries(params.data)) {
				if (key === 'Expression') {
					continue;
				}
				if (value > 0.5) {
					// Only show the cell type with likelihood >= 0.5
					resultHtml += `<br>${key}: ${value.toFixed(3)}`;
				}
			}
			return `
                    <div style="text-align: center;">
                        ${params.name}
                        <br> Cell2Location Cell Type Likelihood 
                        <br> (Likelihood >= 0.5)
                        ${resultHtml}
                    </div>
            `;
		},
	},
	visualify: {
		mapping: {
			x: 'X_Coord',
			y: 'Y_Coord',
			extra: {
				BC: 'BC',
				'SB-1': 'SB-1',
				'SB-2': 'SB-2',
				'SB-3': 'SB-3',
				'SB-4': 'SB-4',
				'SB-5': 'SB-5',
				'Cil-1': 'Cil-1',
				'Cil-2': 'Cil-2',
				'Cy.Epi': 'Cy.Epi',
				Fib_PG: 'Fib_PG',
				Fib_1: 'Fib_1',
				Fib_2: 'Fib_2',
				Fib_3: 'Fib_3',
				Fib_4: 'Fib_4',
				Fib_5: 'Fib_5',
				MF: 'MF',
				Fib_ICC: 'Fib_ICC',
				'Cy.Fib': 'Cy.Fib',
				ENS_PG: 'ENS_PG',
				Neu: 'Neu',
				Glia: 'Glia',
				'Cy.ENS': 'Cy.ENS',
				Ven: 'Ven',
				Art: 'Art',
				Lym: 'Lym',
				Peri: 'Peri',
				'Cy.Peri': 'Cy.Peri',
				SM: 'SM',
				'Cy.SM': 'Cy.SM',
				MS: 'MS',
				SkM: 'SkM',
			},
		},
		merger: {},
		symbolSize: 2,
		symbol: 'circle',
	},
};

export default esodev_visium;
