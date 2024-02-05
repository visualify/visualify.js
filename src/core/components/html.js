/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-25 21:00:26
 * @FilePath     : /visualifyjs/src/core/components/html.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import DOMPurify from 'dompurify';

function NaiveHTML({ props, style }) {
	const { className, style: _style } = props;
    
	let { html } = props;

	// Sanitize the HTML using DOMPurify
	html = DOMPurify.sanitize(html);

	return (
		<div
			style={{ ...style, ..._style }}
			className={className}
			dangerouslySetInnerHTML={{ __html: html }}>
			{/* The sanitized HTML will be inserted here */}
		</div>
	);
}

export default NaiveHTML;
