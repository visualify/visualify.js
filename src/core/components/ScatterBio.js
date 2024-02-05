import React, { useEffect, useState } from 'react';
import Scatter from './Scatter';
import CircularProgress from '../widgets/circularProgress';
import { useAppContext } from '../appContext';
import simplefetch from '../fetch/fetch';

function rcolor(seed = 0) {
	const maxHexValue = 16777215;
	const randomSeed = seed || Math.random();
	const randomColor = Math.floor(randomSeed * maxHexValue).toString(16);
	const color = '#' + randomColor.padStart(6, '0');

	return color;
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function ScatterBio({ props, style, reset }) {
	// Declare states at the beginning
	const { sharedData } = useAppContext();
	const { debug } = props;

	const [updatedProps, setUpdatedProps] = useState(props);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// ------------------------------ Fetch Data ------------------------------
		const {
			meta,
			simpleload = true,
			gene,
			geneval,
			metaval,
			colour = 'Cell_Type', // 'Cell_Type' or 'Stage'
			colourval = undefined,
			axis_mapping,
			config = {},
			exclude_celltype = [],
			entry_mapping = undefined,
			exp_condition = 0,
			startup_msg = '',
		} = props;

		// error handling for missing config --------------------------------------

		// if meta is missing
		if (!meta) {
			setError({ message: 'meta is missing', data: { meta: meta } });
			setLoading(false);
			return;
		} else if (!gene) {
			setError({ message: 'gene is missing', data: { gene: gene } });
			setLoading(false);
			return;
		}
		// missing axis_mapping
		//  that are required for this widget to work
		//  represented as x, y while processing the data
		else if (!axis_mapping || !axis_mapping.x || !axis_mapping.y) {
			setError({
				message: 'axis_mapping is missing/incorrect',
				data: { axis_mapping: axis_mapping },
			});
			setLoading(false);
			return;
		}
		// if not simpleload, then metaval is required
		else if (!simpleload && !metaval) {
			setError({
				message: 'metaval is missing',
				data: { metaval: metaval },
			});
			setLoading(false);
			return;
		}

		/*
            // missing config
            else if (!config) {
                setError({message: "config is missing", data: {config: config}});
                setLoading(false);
                return;
            }

            // config.xAxis & config.yAxis are required for this widget to work
            else if (!config.xAxis || !config.yAxis) {
                setError({message: "config.xAxis or config.yAxis is missing", data: {config: config}});
                setLoading(false);
                return;
            }
            */

		// ------------------------------------------------------------------------

		const _query_gene = geneval ? sharedData[geneval] : sharedData.gene;
		const _query_meta = metaval ? sharedData[metaval] : sharedData.meta;

		const updatePlot = async () => {
			try {
				setLoading(true);

				let metadata = {};
				let genedata = {};

				// if not simpleload, then we wait user to provide the data
				if (!simpleload && (!_query_meta || _query_meta.length === 0)) {
					setLoading({
						message: `Please select ${startup_msg} to load data`,
					});
					return;
				} else if (simpleload) {
					metadata = await simplefetch(meta, {
						id: _query_meta,
						type: 'metadata',
						debug: debug,
					});

					genedata = await simplefetch(gene, {
						id: _query_gene,
						key: 'gene', //TODO: obtain key from config which can override the type
						type: 'gene',
						debug: debug,
					});
				} else {
					//console.log("ScatterBio: _query_meta", _query_meta);
					//console.log("ScatterBio: nodes_mapping", nodes_mapping);

					// Mapping logic to filter and transform IDs
					const mapped_nodes = entry_mapping
						? _query_meta.map((node) => entry_mapping[node])
						: _query_meta;

					//removed duplicated IDs
					const _filted_query_meta = [...new Set(mapped_nodes)];

					//console.log("ScatterBio: _filted_query_meta", _filted_query_meta);

					const metadataPromises = _filted_query_meta.map(
						async (metaId) => {
							return await simplefetch(meta, {
								id: metaId,
								type: 'metadata',
								debug: debug,
							});
						},
					);

					const metadataResponses = await Promise.all(
						metadataPromises,
					);

					// Combine the metadata from different IDs
					metadata = metadataResponses.reduce(
						(combined, metadata) => {
							return {
								...combined,
								...metadata,
							};
						},
						{},
					);

					if (
						_query_gene &&
						_query_gene.length > 0 &&
						!_query_gene.includes('None')
					) {
						if (debug)
							console.log('ScatterBio: _query_gene', _query_gene);

						const genedataPromises = _query_meta.map(
							async (metaId) => {
								const _mapped_metaId = entry_mapping
									? entry_mapping[metaId]
									: metaId;
								const _merged_query_gene =
									_mapped_metaId + '/' + _query_gene;
								//console.log(_merged_query_gene);
								return await simplefetch(gene, {
									id: _merged_query_gene,
									key: 'gene', //TODO: obtain key from config which can override the type
									type: 'gene',
									debug: debug,
								});
							},
						);

						genedata = await Promise.any(genedataPromises);
						//console.log("ScatterBio: genedata", genedata);
					}
				}

				const _nogene = isEmpty(genedata);
				if (debug) console.log('ScatterBio: _nogene', _nogene);
				if (debug)
					console.log(
						'ScatterBio: genedata',
						genedata,
						'metadata',
						metadata,
					);

				// ------------------------------ Proccess Data ------------------------------
				const { colors: __colors = [] } = config;

				const filted_colour = sharedData[colourval]
					? sharedData[colourval].replace(' ', '_')
					: colour;

				if (debug)
					console.log('ScatterBio - Colour by:', filted_colour);

				const __celltypes = [
					...new Set(metadata[filted_colour]),
				].filter((celltype) => !exclude_celltype.includes(celltype));

				let { zcolor: visualcolor = [] } = config;
				let seriescolor = {};

				if (Array.isArray(__colors) && __colors.length > 0) {
					__colors.forEach((item) => {
						if (item.color) visualcolor.push(item.color);
						else visualcolor.push(rcolor());
					});
					__celltypes.forEach((celltype, index) => {
						const cell = __colors.find(
							(item) => item.name === celltype,
						);
						const _color = cell?.color ?? visualcolor[index];
						const _symbol =
							__colors.find((item) => item.name === celltype)
								?.symbol ?? 'circle';
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
					__celltypes.forEach((celltype, index) => {
						if (no_zcolor) {
							visualcolor.push(rcolor());
						}
						seriescolor[celltype] = {
							color: rcolor(),
							symbol: 'circle',
						};
					});
				}

				// console.log("ScatterBio: axis_mapping", axis_mapping);
				// console.log("metadata: ", metadata);
				const { extra } = axis_mapping;

				let processedData;

				try {
					processedData = metadata['Cell_ID'].map((cellId, index) => {
						const _expression =
							genedata[cellId] >= exp_condition
								? genedata[cellId]
								: _nogene
								? 999
								: -1;
						const _Cell_Type = metadata[filted_colour] ?? 'Unknown';
						if (
							!__celltypes.includes('Unknown') &&
							__celltypes.length === 0
						) {
							__celltypes.push('Unknown');
							seriescolor['Unknown'] = {
								color: '#000000',
								symbol: 'circle',
							};
						}
						// const _UMI = metadata.N_UMI ? Math.round(metadata.N_UMI[index] * 100) / 100 : 0;
						// round to 2 decimal places
						const extraProperties = {};
						for (const property in extra) {
							if (metadata[extra[property]]) {
								extraProperties[property] =
									metadata[extra[property]][index];
							}
						}

						const z_index =
							_expression === -1 || _expression === 999
								? config.visium_cell_fraction
									? extraProperties[
											config.visium_cell_fraction
									  ] ?? _expression
									: _expression
								: _expression;

						return {
							name: cellId,
							value: [
								metadata[axis_mapping.x][index],
								metadata[axis_mapping.y][index],
								z_index,
							],
							Type:
								_Cell_Type === 'Unknown'
									? 'Unknown'
									: _Cell_Type[index],
							Expression: _expression,
							...extraProperties,
						};
					});

					//console.log("ScatterBio: processedData", processedData[0], processedData[1]);
				} catch (err) {
					// if TypeError, then set error message to remind user to check the api
					setError({
						message:
							'Please check the API, \n' +
							'Your API may not return the correct data format. \n' +
							meta +
							'\n' +
							err,
					});
					setLoading(false);
					return;
				}

				if (debug) console.log(processedData[2], processedData[3]);

				const {
					dotsize,
					dotFactor = 2000,
					minSymbolSize = 2,
					maxSymbolSize = 10,
				} = config;
				const pointCount = processedData.length;

				// Calculate the symbol size based on the number of points
				let symbolSize;
				if (dotsize === 'auto') {
					const sizeFactor = Math.max(
						1 - (pointCount - 1000) / dotFactor,
						0.2,
					);
					symbolSize =
						(maxSymbolSize - minSymbolSize) * sizeFactor +
						minSymbolSize;
					//console.log(pointCount, symbolSize);
				} else {
					symbolSize = typeof dotsize === 'number' ? dotsize : 5;
				}

				// Create a series for each unique cell type
				const series = __celltypes.map((cellType) => {
					return {
						name: cellType,
						type: 'scatter',
						data: processedData.filter(
							(data) =>
								data.Type === cellType && data.Expression > -1,
						),
						itemStyle: {
							color: seriescolor[cellType].color,
						},
						symbol: seriescolor[cellType].symbol,
						symbolSize: symbolSize,
					};
				});

				//console.log("series: ", series);

				const zshift =
					-config.zshift || -Math.max(config.chartWidth * 0.02, 10);

				const auto_zmax = Math.max(
					...processedData.map((item) => item.value[2]),
				);
				const auto_zmin = Math.min(
					...processedData.map((item) => item.value[2]),
				);

				//console.log("ScatterBio: auto_zmax", auto_zmax, "auto_zmin", auto_zmin, config.visium_cell_fraction);

				let visualMap =
					_nogene && !config.visium_cell_fraction
						? []
						: {
								min: config.zmin ?? auto_zmin,
								max: config.zmax ?? auto_zmax,
								dimension: 2,
								orient: 'vertical',
								top: 'center',
								right: zshift,
								text: config.labels
									? config.labels.z ?? ''
									: '',
								textGap: 10,
								calculable: true,
								inRange: {
									color: visualcolor,
								},
								textStyle: {
									writingMode: 'vertical-lr',
								},
								...config.visualMap,
						  };

				const { legend: _config_legend = {} } = config;
				const legendItemCount = __celltypes.length;
				const { type: _legendType, ...__config_legend } =
					_config_legend;
				let legendType = 'scroll';
				if (_legendType === 'auto') {
					legendType = legendItemCount > 10 ? 'scroll' : 'plain';
				}

				// console.log("__celltypes:", __celltypes);
				// Sort __celltypes by extracting and comparing the numerical part
				const sortedCellTypes = __celltypes.slice().sort((a, b) => {
					// Handle null, undefined, or other unexpected values
					if (a === null || b === null) {
						return 0; // Handle the case as per your requirement
					}
					const numA = parseInt(a.substring(1), 10);
					const numB = parseInt(b.substring(1), 10);
					return numA - numB;
				});

				// legend
				const _legend =
					_config_legend === false
						? false
						: {
								data: sortedCellTypes, //__celltypes,
								orient: 'horizontal',
								top: 5, // "top" | "bottom" | "center"
								right: 'center', // "top" | "bottom" | "center",
								...__config_legend,
								type: legendType,
						  };
				//console.log("ScatterBio: legend", _legend);

				const gridSettings = [
					{
						top: '5%',
						bottom: '5%',
						left: '5%',
						right: '5%',
						...(config.grid || {}), // Merge with config.grid if available, otherwise an empty object
					},
				];

				const title = config.title ?? '';
				// Update props for Scatter

				let scatterBioProps = {
					...props,
					config: {
						chartWidth: 800,
						chartHeight: 600,
						...config,
						series: series,
						legend: _legend,
						visualMap: visualMap,
						title: _nogene
							? title
							: {
									...title,
									text: _query_gene,
							  },
						// Use formatter from config if provided, otherwise use the default formatter
						formatter: config.formatter
							? (params) => config.formatter(params)
							: (params) => {
									return `
                                        ${params.name} 
                                        <br/> Type: ${params.data.Type} 
                                        <br/> UMI: ${params.data.UMI ?? 0}
                                        `;
							  },
						grid: gridSettings,
					},
				};

				/*
                        const imageDom = new Image();
                        imageDom.src = './resources/YY0-44_image.png';
                        scatterBioProps.config.backgroundColor = {
                            image: imageDom,
                            repeat: 'no-repeat' // or 'repeat', 'repeat-x', 'repeat-y' depending on your needs
                        };
                        */

				//console.log("ScatterBio: scatterBioProps.config", scatterBioProps.config);
				setUpdatedProps(scatterBioProps);

				setLoading(false);
			} catch (err) {
				console.log(err);
				if (err.name === 'TypeError' && simpleload)
					setError({
						message: `invalid URL for metadata/gene,\nplease check your URL or set simpleload to false`,
					});
				else setError(err);
				setLoading(false);
			}
		};
		updatePlot();
	}, [props, sharedData, debug]);

	if (reset) {
		reset(props.id, (vals) => {
			// logic to reset the data
			const { gene: rec_gene = ' ' } = vals;
			console.log('received data', sharedData[rec_gene]);
		});
	}

	if (loading.message) {
		return (
			<div style={{ marginTop: '10px', ...style }}>{loading.message}</div>
		);
	} else if (loading) {
		// Render a loading animation
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					...style,
				}}>
				<CircularProgress color='primary' />
			</div>
		);
	}

	if (error) {
		const errorLines = error.message.split('\n');
		const errorElements = errorLines.map((line, index) => (
			<p
				key={index}
				style={{ color: 'red' }}>
				{line}
			</p>
		));
		return (
			<div style={style}>
				An error has occurred: <br />
				<br /> {errorElements}
			</div>
		);
	}
	// Only render Scatter when not loading
	return (
		<>
			<Scatter
				key={updatedProps.id + '.inherent'}
				props={updatedProps}
				style={style}
			/>
		</>
	);
}

export default ScatterBio;
