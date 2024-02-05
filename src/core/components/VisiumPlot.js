import React, { useEffect, useState } from 'react';
import ScatterBio from './ScatterBio';
import simplefetch from '../fetch/fetch';
import { useAppContext } from '../appContext';

const VisiumPlot = ({ props, style }) => {
	// Declare states at the beginning
	const { sharedData } = useAppContext();
	const { debug } = props;

	const [updatedProps, setUpdatedProps] = useState(props);

	useEffect(() => {
		const { metaval } = props;

		let section = sharedData[metaval] ?? [];
		let VisiumProps = {
			...props,
			config: {
				...props.config,
				//visium_cell_fraction: "BC",
				visualMap: {
					calculable: true,
					top: 'bottom',
					orient: 'horizontal',
					right: 'center',
				},
				zcolor: ['#FFFF80', '#FFA500', '#FF0000'],
				toolbox: {
					saveAsImage: {
						show: true,
					},
				},
				//dataZoom: "inside", // "inside", "slider", 'both'
				dotsize: '2',
				labels: {
					z: ['log2\n(tpm+1)', ''],
				},

				xAxis: {
					show: false,
				},
				yAxis: {
					show: false,
				},
				legend: false,
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
				grid: {
					top: '15%',
					bottom: '12%',
					left: '5%',
					right: '10%',
				},
			},
		};

		const { cellval } = props;

		if (
			cellval &&
			sharedData[cellval] !== undefined &&
			sharedData[cellval].length > 0
		) {
			let selected_celltype = sharedData[cellval][0];
			if (
				selected_celltype === 'Default' ||
				selected_celltype === 'None' ||
				selected_celltype === 'NA' ||
				selected_celltype === 'N/A' ||
				selected_celltype === 'Unknown' ||
				selected_celltype === 'Unassigned' ||
				selected_celltype === 'All'
			)
				VisiumProps.config.visium_cell_fraction = null;
			else {
				VisiumProps.config.visium_cell_fraction =
					sharedData[cellval][0];
				VisiumProps.config.visualMap.text = [
					'Likelihood of being a ' + sharedData[cellval][0],
					'',
				];
			}
		}

		function BufferImage(imageBuffer) {
			// Create a Blob object from the binary data
			const blob = new Blob([new Uint8Array(imageBuffer)], {
				type: 'image/png',
			});
			// Create a URL from the Blob
			const dataURL = URL.createObjectURL(blob);
			// Create the Image object
			const imageDom = new Image();
			imageDom.onload = () => {
				// Wait until the image is loaded
				// Set the background properties
				VisiumProps.config.backgroundColor = {
					image: dataURL,
					repeat: 'no-repeat',
				};

				//console.log("VisiumProps", VisiumProps);
				// Update the state with the loaded image
				setUpdatedProps(VisiumProps);
			};
			imageDom.src = dataURL;
		}

		const fetchImage = async () => {
			const imageBuffer = await simplefetch(image + section, {
				type: 'image',
				debug: debug,
			});
			BufferImage(imageBuffer.data);
		};

		const { image } = props;
		if (section.length > 0) {
			section = section[0];
			VisiumProps.config.title = {
				text: 'Section ' + section,
				left: 'center',
				top: 'top',
				textStyle: {
					fontSize: 25,
					fontWeight: 'bold',
					color: 'black',
				},
			};
			fetchImage();
		}
	}, [props, sharedData, debug]);

	return (
		<>
			<ScatterBio
				key={updatedProps.id + '.inherent'}
				props={updatedProps}
				style={style}
				reset={null}
			/>
		</>
	);
};

export default VisiumPlot;
