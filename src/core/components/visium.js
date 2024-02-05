/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-08 16:34:20
 * @FilePath     : /visualifyjs/src/core/components/Visium.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../appContext';
import conditionalFetch from '../fetch/condfetch';
import EChartSwitcher from '../modules/echartswitcher';
import Loading from '../pages/loading';
import { isEmpty } from 'lodash';

const Visium = ({ props, style }) => {
	const [loading, setLoading] = useState({
		active: true,
		message: 'Please Select the Section',
	});
	const { sharedData } = useAppContext();
	const [Options, setOptions] = useState(props);

	useEffect(() => {
		const { cellfrac, metadata, gene, image } = props.settings;
		if (!metadata || !gene || !image)
			throw new Error('missing metadata, gene, or image');
		let trigger = {
			metadata: metadata.trigger,
			gene: gene.trigger,
			image: image.trigger,
		};

		const updatePlot = async () => {
			try {
				const cellval = isEmpty(sharedData[cellfrac])
					? 'All'
					: sharedData[cellfrac][0];

				if (sharedData?.[trigger.image]) {
					console.log('image trigger', sharedData?.[trigger.image]);
					const imageBuffer = await conditionalFetch(
						image,
						sharedData,
						{},
					);

					const blob = new Blob([new Uint8Array(imageBuffer.data)], {
						type: 'image/png',
					});
					const dataURL = URL.createObjectURL(blob);

					console.log('image', dataURL);
					setOptions((prev) => ({
						...prev,
						config: {
							...prev.config,
							overrides: {
								...prev.config.overrides,
								backgroundColor: {
									image: dataURL,
								},
							},
						},
					}));
				}

				console.log('update plot', cellval, trigger);
			} catch (e) {
				setLoading({ active: true, message: e.message });
			}
		};

		updatePlot();
	}, [props, sharedData]);

	return (
		<div
			id={props.id}
			style={{ ...style, position: 'relative' }}>
			{loading.active && (
				<Loading
					message={loading.message}
					style={loading.style}
				/>
			)}
			<EChartSwitcher
				props={Options}
				style={{
					opacity: loading.active ? 0 : 1,
					...style,
				}}
			/>
		</div>
	);
};

export default Visium;
