/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-30 15:11:35
 * @FilePath     : /visualifyjs/src/core/components/ratio.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../appContext';

function RatioBox({ props, style }) {
	const { debug } = props;

	const { style: blockStyle } = props;
	// if debug is true, then border is red, else no border
	style = {
		...style,
		...blockStyle,
		border: debug ? '1px solid red' : 'none',
	};

	const { title } = props;
	const renderTitle = () => {
		return title && <h3>{title}</h3>;
	};

	const { setSharedData } = useAppContext();
	const { choice = [] } = props;

	// State to keep track of selected choice
	const [selectedChoice, setSelectedChoice] = useState(
		choice.length > 0 ? choice[0] : null,
	);

	// Handler for radio button change
	const handleRadioChange = (event) => {
		setSelectedChoice(event.target.value);
	};

	const {
		id,
		val,
		ratio_style = {
			margin: 'auto 15px',
		},
	} = props;

	// Store the selected choice in shared data whenever it changes
	useEffect(() => {
		if (val) {
			setSharedData((prevSharedData) => {
				return { ...prevSharedData, [val]: selectedChoice };
			});
		}
	}, [selectedChoice, val, setSharedData]);

	return (
		<div
			key={id}
			style={style}
			className='ratio-box-container'>
			{renderTitle()}
			{choice.map((item, index) => (
				<label
					key={index}
					style={ratio_style}>
					<input
						type='radio'
						value={item}
						checked={selectedChoice === item}
						onChange={handleRadioChange}
					/>
					{item}
				</label>
			))}
		</div>
	);
}

export default RatioBox;
