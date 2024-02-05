import React, { useEffect, useState } from 'react';
import RePlotly from '../modules/replotly';
import simplefetch from '../fetch/fetch';
import { useAppContext } from '../appContext';
import mmtrbc_dot from '../modules/replotly/presets/mmtrbc.dot';
import conditionalFetch from '../fetch/condfetch';

const DotBio = ({ props, style }) => {
	// Declare states at the beginning
	const { sharedData } = useAppContext();
	const { debug } = props;

	// Loading and error states
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [updatedProps, setUpdatedProps] = useState(props);

	useEffect(() => {
		const fetchData = async () => {
			const { meta, gene: url, genelist } = props;

			if (meta === undefined) {
				alert('DotBio: meta is undefined');
			}
			if (url === undefined) {
				alert(
					'DotBio: gene is undefined, need to be a url or data of gene',
				);
			}
			if (genelist === undefined) {
				console.log(
					'DotBio: genelist is undefined, defaulting to genelist',
				);
			}

			const metadata = await conditionalFetch(meta, sharedData, {});

			const sharedgenelist = genelist
				? sharedData[genelist]
				: sharedData.genelist;

			let genedata = {};

			if (sharedgenelist !== undefined) {
				// genelist is a list of genes names (strings)
				for (const gene of sharedgenelist) {
					//console.log("fetching", gene, url);
					genedata[gene] = await simplefetch(url, {
						id: gene,
						key: 'gene',
						type: 'gene',
						debug: debug,
					});
				}
			}

			//if (debug)
			//  console.log("DotBio: genedata", genedata, "metadata", metadata);

			return { metadata, genedata };
		};

		const processData = ({ metadata, genedata }) => {
			// Set the title & size of the plot
			const { showscale = false } = props.settings;

			let config = mmtrbc_dot;

			//console.log('DotBio: config', config);
			// Dealing with the data
			const { exclude_celltype } = props;
			const _celltypes = [...new Set(metadata['Cell_Type'])].filter(
				(celltype) => !exclude_celltype.includes(celltype),
			);

			// the length of the gene data
			// const _genedata_length = Object.keys(_genedata).length;
			// console.log("DotBio: _genedata_length", gene, _genedata_length);

			let processedData = {};
			let cellTypeCounts = {};
			let expressionSums = {};

			for (const gene in genedata) {
				const _genedata = genedata[gene];

				processedData[gene] = metadata['Cell_ID']
					.map((cellId, index) => {
						const _expression = _genedata[cellId] ?? -1;
						return {
							name: cellId,
							value: [
								metadata['x'][index],
								metadata['y'][index],
								_expression,
							],
							UMI: Math.round(metadata.N_UMI[index] * 100) / 100, // round to 2 decimal places
							Type: metadata['Cell_Type'][index],
							Expression: _expression,
						};
					})
					.filter((item) => item.Expression > 0);

				cellTypeCounts[gene] = processedData[gene].reduce(
					(counts, item) => {
						if (!counts[item.Type]) {
							counts[item.Type] = 1;
						} else {
							counts[item.Type]++;
						}
						return counts;
					},
					{},
				);

				expressionSums[gene] = processedData[gene].reduce(
					(sums, item) => {
						if (!sums[item.Type]) {
							sums[item.Type] = item.Expression;
						} else {
							sums[item.Type] += item.Expression;
						}
						return sums;
					},
					{},
				);
			}

			let totalCellTypeCounts = metadata['Cell_Type'].reduce(
				(counts, cellType) => {
					if (!counts[cellType]) {
						counts[cellType] = 1;
					} else {
						counts[cellType]++;
					}
					return counts;
				},
				{},
			);

			// If It provides the configuration of the plot
			const {
				colorMat: __colorMat,
				sizeMat: __sizeMat,
				xLabels: __xLabels,
				yLabels: __yLabels,
			} = props.settings;

			// calculate the color matrix
			const colorMat = __colorMat ?? {};

			let averageExpression = {};

			for (let gene in genedata) {
				if (!averageExpression[gene]) {
					averageExpression[gene] = {};
				}
				for (let cellType in cellTypeCounts[gene]) {
					let count = totalCellTypeCounts[cellType];
					let totalExpression = expressionSums[gene][cellType];
					averageExpression[gene][cellType] = totalExpression / count;
					// round to the nearest integer
					averageExpression[gene][cellType] = Math.round(
						averageExpression[gene][cellType],
					);
				}
			}

			//console.log("Average Expression: ", averageExpression);

			// Calculate the maximum and minimum expression across all genes and cell types
			let maxExpression = 0;
			let minExpression = Infinity;
			for (let gene in averageExpression) {
				for (let cellType in averageExpression[gene]) {
					maxExpression = Math.max(
						maxExpression,
						averageExpression[gene][cellType],
					);
					minExpression = Math.min(
						minExpression,
						averageExpression[gene][cellType],
					);
				}
			}

			// Create a color scale function that uses the maximum and minimum expression
			function colorScale(expression) {
				// Normalize the expression to a value between 0 and 1
				let normalized =
					(expression - minExpression) /
					(maxExpression - minExpression);

				// Map the normalized value to a color
				let r = 70 + Math.round(185 * normalized);
				let g = 125; // + Math.round(255 * normalized); //(1 - normalized)
				let b = 255;

				return 'rgb(' + r + ', ' + g + ', ' + b + ')';
			}

			// Assign colors based on average expression
			for (let gene in averageExpression) {
				if (!colorMat[gene]) {
					colorMat[gene] = {};
				}
				for (let cellType in averageExpression[gene]) {
					let expression = averageExpression[gene][cellType];
					colorMat[gene][cellType] = colorScale(expression);
				}
			}

			//console.log("Color Matrix: ", colorMat);

			// calculate the size matrix
			let sizeMat = __sizeMat ?? {};

			for (let gene in cellTypeCounts) {
				if (!sizeMat[gene]) {
					sizeMat[gene] = {};
				}

				for (let cellType of _celltypes) {
					if (!cellTypeCounts[gene][cellType]) {
						sizeMat[gene][cellType] = 0;
					} else {
						sizeMat[gene][cellType] =
							Math.round(
								(cellTypeCounts[gene][cellType] /
									totalCellTypeCounts[cellType]) *
									1000,
							) / 1000;
					}
				}
			}

			//console.log("Size Matrix: ", sizeMat);

			// process the xLabels
			const xLabels = __xLabels ?? _celltypes;

			// process the yLabels
			const yLabels = __yLabels ?? Object.keys(genedata);

			// process the data
			const {
				annotation = false,
				showlegend = false,
				maxdotsize = 20,
			} = props.settings;

			// check list
			const _genedata_length = Object.keys(genedata).length;
			//console.log("DotBio: _genedata_length", _genedata_length, isEmpty(genedata));
			const _hasData = _genedata_length > 0;

			const data = xLabels.map((xLabel, i) => {
				let sizes = yLabels.map(
					(yLabel) => sizeMat[yLabel][xLabel] * maxdotsize,
				);
				let colors = yLabels.map((yLabel) => colorMat[yLabel][xLabel]);
				// round to the nearest integer
				let hoverTexts = yLabels.map((yLabel) => {
					let avgExpress = _hasData
						? averageExpression[yLabel][xLabel]
						: 0;
					return `${xLabel} <br> ${yLabel} <br> Avg Expression: ${avgExpress}`;
				});

				return {
					mode: 'markers',
					x: Array(sizes.length).fill(xLabel), // Repeat the xLabel for each y value
					y: yLabels,
					marker: {
						size: sizes,
						color: colors,
					},
					type: 'scatter',
					name: xLabel,
					hoverinfo: 'text',
					hovertext: hoverTexts,
					showlegend: showlegend,
				};
			});

			//console.log('DotBio: data', data);
			config.data = data;

			// show the largest percentage of celltype and least percentage of celltype
			let minVal = Number.MAX_VALUE;
			let maxVal = Number.MIN_VALUE;
			let minKey = '',
				maxKey = '';

			for (let key in sizeMat) {
				for (let innerKey in sizeMat[key]) {
					if (sizeMat[key][innerKey] < minVal) {
						minVal = sizeMat[key][innerKey];
						minKey = key + ' ' + innerKey;
					}
					if (sizeMat[key][innerKey] > maxVal) {
						maxVal = sizeMat[key][innerKey];
						maxKey = key + ' ' + innerKey;
					}
				}
			}

			//console.log("Min Value:", minVal, "Key:", minKey);
			//console.log("Max Value:", maxVal, "Key:", maxKey);

			if (annotation) {
				// round the values
				minVal = Math.round(minVal * 100000) / 1000;
				maxVal = Math.round(maxVal * 100000) / 1000;

				config.layout.annotations = _hasData
					? [
							{
								text: `<b>${
									minKey.split(' ')[1]
								}</b>: ${minVal}%`,
								x: -0.35,
								y: -0.2 - minVal / 2000, // Adjust this formula to move the annotation as per your requirement
								xref: 'paper',
								yref: 'paper',
								showarrow: false,
								font: {
									size: 12,
								},
							},
							{
								text: `<b>${
									maxKey.split(' ')[1]
								}: </b>${maxVal}%`,
								x: -0.35,
								y: -0.35 + maxVal / 2000, // Adjust this formula to move the annotation as per your requirement
								xref: 'paper',
								yref: 'paper',
								showarrow: false,
								font: {
									size: 12,
								},
							},
					  ]
					: [];
			}
			//console.log(config.data);
			// remove the title if data present
			config.layout.title = _hasData ? '' : config.title;
			config.layout.margin.t = _hasData ? 20 : 80;
			//console.log(config);

			if (showscale && _hasData) {
				data.push({
					type: 'scatter',
					mode: 'markers',
					x: [null], // No x or y data for this trace
					y: [null],
					marker: {
						size: 0, // Marker size is 0, essentially making it invisible
						color: [minExpression, maxExpression], // Use min and max expression as color range
						colorscale: [
							[0, 'rgb(70, 125, 255)'], // Color corresponding to min expression
							[1, 'rgb(255, 125, 255)'], // Color corresponding to max expression
						],
						colorbar: {
							title: 'Avg Expression', // Title of the color bar
							titleside: 'right',
							tickmode: 'array',
							tickvals: [minExpression, maxExpression], // Tick values should match actual data range
							ticktext: [minExpression, maxExpression], // Tick text indicating Low and High
							ticks: 'outside',
						},
						showscale: true,
					},
					hoverinfo: 'none', // No hover info for this trace
					showlegend: false, // No legend for this trace
				});
			}

			//console.log('DotBio: config', config);
			// processing logic here...
			setUpdatedProps((updatedProps) => ({
				...updatedProps,
				data: config.data,
			}));
		};

		fetchData()
			.then(processData)
			.then(() => setLoading(false))
			.catch((err) => {
				console.error(err);
				setError(err);
				setLoading(false);
			});
	}, [props, sharedData, debug]);

	if (loading) return 'Loading...';
	if (error) return 'An error has occurred: ' + error.message;

	return (
		<>
			<RePlotly
				key={updatedProps.id + '.inherent'}
				props={updatedProps}
				style={style}
			/>
		</>
	);
};

export default DotBio;
