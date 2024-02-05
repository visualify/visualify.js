/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-20 21:48:29
 * @FilePath     : /visualifyjs/src/core/widgets/layout.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import DynamicGrid from './layout/Grid';

function LayoutParser({ config = {}, children }) {
	const { type = 'grid', ...rest } = config;

	if (type === 'grid') {
		return (
			<>
				<DynamicGrid config={{ ...rest }}>
					{React.cloneElement(children, { layout: type })}
				</DynamicGrid>
			</>
		);
	}

	return (
		<div>
			<h1>LayoutParser</h1>
			<span>
				We are not support <b>{type}</b> layout type yet
			</span>
			<br></br>
			{children}
		</div>
	);
}

export default LayoutParser;
