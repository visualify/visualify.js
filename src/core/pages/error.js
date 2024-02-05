/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-23 13:22:50
 * @FilePath     : /visualifyjs/src/core/pages/error.js
 * @Description  : 
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';

function Error({ message, style }) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				color: 'red',
				...style,
			}}>
			{/* Display the error message */}
			<p>{message}</p>
		</div>
	);
}

export default Error;
