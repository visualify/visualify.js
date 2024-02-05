/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-23 13:24:11
 * @FilePath     : /visualifyjs/src/core/widgets/CircularProgress.js
 * @Description  : 
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import '../../_css/circular-progress.css';

function CircularProgress({ color }) {
	return (
		<div className='circular-progress'>
			<div className={`spinner ${color}`} />
		</div>
	);
}

CircularProgress.propTypes = {
	color: PropTypes.oneOf(['primary', 'secondary']),
};

export default CircularProgress;