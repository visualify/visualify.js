/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-30 21:58:47
 * @FilePath     : /visualifyjs/src/core/pages/404.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import '../../_css/404.css';

const NotFoundPage = ({ page, config = {} }) => {
	const {
		heading = (
			<span>
				Oops! This Page <span style={{ color: 'red' }}>{page}</span>{' '}
				Could Not Be Found
			</span>
		),
		content = 'SORRY BUT THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST, HAVE BEEN REMOVED, NAME CHANGED, OR IS TEMPORARILY UNAVAILABLE',
		button_text = 'BACK TO HOME',
	} = config;

	return (
		<div id='colorlib-notfound'>
			<div className='colorlib-notfound'>
				<div className='colorlib-notfound-404'>
					<h1>404</h1>
				</div>
				<h2 id='colorlib_404_customizer_page_heading'>{heading}</h2>
				<div id='colorlib_404_customizer_content'>{content}</div>
				<a
					href={window.location.origin}
					id='colorlib_404_customizer_button_text'>
					{button_text}
				</a>
			</div>
			<p className='colorlib-copyrigh'>
				<span>404 Page Template designed by </span>
				<a
					href='https://colorlib.com/'
					target='_blank'
					rel='noopener noreferrer'>
					Colorlib.
				</a>
			</p>
		</div>
	);
};

export default NotFoundPage;
