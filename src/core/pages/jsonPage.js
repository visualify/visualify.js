/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 21:20:55
 * @FilePath     : /visualifyjs/src/core/pages/jsonPage.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from './404';
import fetchJson from '../fetch/json';
import LayoutParser from '../widgets/layout';
import Vcontroller from '../widgets/controller';

const JsonPage = () => {
	const [jsonData, setJsonData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const location = useLocation();

	useEffect(() => {
		const routerpath = location.pathname.replace(/^\/|\.json$/g, '');
		const jsonurl =
			routerpath === ''
				? 'home'
				: routerpath.endsWith('/')
				? routerpath + 'home'
				: routerpath;
		//console.log('JsonPage jsonurl:', jsonurl);
		if (jsonurl) {
			setLoading(true);
			setError(null);

			fetchJson(jsonurl)
				.then((data) => {
					setJsonData(data);
					setLoading(false);
				})
				.catch((err) => {
					setError(err);
					setLoading(false);
				});
		}
	}, [location.pathname]); // React to changes in pathname

	if (loading) {
		return <div>Loading...</div>;
	}
	if (error || !jsonData) {
		return <NotFoundPage page={location.pathname} />;
	}

	return (
		<>
			<LayoutParser config={jsonData.layout}>
				<Vcontroller components={jsonData.components} />
			</LayoutParser>
		</>
	);
};

export default JsonPage;
