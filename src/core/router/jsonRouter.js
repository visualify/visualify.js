/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 21:58:14
 * @FilePath     : /visualifyjs/src/core/router/jsonRouter.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import AliasRoute from './alias';

function JsonRouter({ config, children }) {
	const { alias } = config;

	return (
		<HashRouter>
			<Routes>
				<Route
					path='/'
					element={children}
				/>
				<Route
					path='/*'
					element={<AliasRoute alias={alias}>{children}</AliasRoute>}
				/>
			</Routes>
		</HashRouter>
	);
}

export default JsonRouter;
