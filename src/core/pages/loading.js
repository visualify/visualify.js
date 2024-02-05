/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-23 13:22:33
 * @FilePath     : /visualifyjs/src/core/pages/Loading.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import Error from './error';
import CircularProgress from '../widgets/circularProgress';

function Loading({
	message,
	style,
	msgStyle,
	ProgressColor = 'primary',
	error = false,
}) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column', // Added to stack elements vertically
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				...style,
			}}>
			<CircularProgress color={ProgressColor} />
			<div style={{ marginTop: '10px', ...msgStyle }}>
				{error ? (
					<Error
						message={message}
						style={msgStyle}
					/>
				) : (
					<p>{message}</p>
				)}
			</div>
		</div>
	);
}

export default Loading;
