/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-08 16:34:20
 * @FilePath     : /visualifyjs/src/core/components/Visium.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useState, useRef } from 'react';
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

	// Use ref for sharedData to access latest without depending on it
	const sharedDataRef = useRef(sharedData);
	sharedDataRef.current = sharedData;

	// Extract stable trigger keys from props.settings
	const { cellfrac, metadata, gene, image } = props.settings || {};
	const imageTrigger = image?.trigger;
	// Build a snapshot of only the sharedData keys we depend on
	const relevantKeys = [imageTrigger, cellfrac].filter(Boolean);
	const sharedDataSnapshot = JSON.stringify(
		relevantKeys.reduce((acc, key) => {
			acc[key] = sharedData[key];
			return acc;
		}, {}),
	);

	useEffect(() => {
		if (!metadata || !gene || !image)
			throw new Error('missing metadata, gene, or image');
		const currentSharedData = sharedDataRef.current;
		let trigger = {
			metadata: metadata.trigger,
			gene: gene.trigger,
			image: image.trigger,
		};

		const updatePlot = async () => {
			try {
				const cellval = isEmpty(currentSharedData[cellfrac])
					? 'All'
					: currentSharedData[cellfrac][0];

				if (currentSharedData?.[trigger.image]) {
					console.log('image trigger', currentSharedData?.[trigger.image]);
					const imageBuffer = await conditionalFetch(
						image,
						currentSharedData,
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sharedDataSnapshot, cellfrac, imageTrigger]);

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
