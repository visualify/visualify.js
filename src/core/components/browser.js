/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-25 21:57:39
 * @FilePath     : /visualify.js/src/core/components/browser.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useState } from 'react';

function Browser({ props, style }) {
	const { src, style: _style, title, width, height } = props;
	const [error, setError] = useState(null);

	useEffect(() => {
		// Clear any previous error when the src changes
		setError(null);
	}, [src]);

	return (
		<>
			<iframe
				src={src}
				title={title}
				width={width}
				height={height}
				style={{ ...style }}
				onError={() => {
					setError('Error loading content. Please check the URL.');
				}}
			/>
			{error && (
				<div
					className='iframe-error'
					style={{ ...style, ..._style }}>
					{error}
				</div>
			)}
		</>
	);
}

export default Browser;
