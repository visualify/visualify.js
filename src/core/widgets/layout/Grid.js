/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-20 22:21:11
 * @FilePath     : /visualifyjs/src/core/widgets/layout/Grid.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';

function DynamicGrid({ config = {}, children }) {
	const {
		rows = 2,
		cols = 2,
		gap = '1px',
		style = {},
		debug = false,
	} = config;
	// Custom styles for the grid
	const gridStyles = {
		display: 'grid',
		gridTemplateRows: `repeat(${rows}, auto)`,
		gridTemplateColumns: `repeat(${cols}, 1fr)`,
		gap: gap,
		border: debug ? '1px solid red' : 'none',
		...style,
	};

	return <div style={gridStyles}>{children}</div>;
}

export default DynamicGrid;
