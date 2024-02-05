/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 22:03:28
 * @FilePath     : /visualifyjs/src/core/themes/modern.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

import React from 'react';
import Vheader from '../widgets/header';
import Vfooter from '../widgets/footer';
import { Container } from 'react-bootstrap';
import JsonPage from '../pages/jsonPage';

import '../../_css/modern.css';

function Modern({ config, children }) {
	//console.log('Modern config', config);
	const { homepage = 'home.json' } = config;
	return (
		<>
			<Vheader config={config} />
			<Container className='text-center'>
				<JsonPage homepage={homepage} />
				{children}
			</Container>
			<Vfooter config={config} />
		</>
	);
}

export default Modern;
