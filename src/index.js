/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 15:35:28
 * @FilePath     : /visualifyjs/src/index.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import './_css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './_utils/reportWebVitals';
import Recharts from './core/recharts';
import CreateApp from './core/visualify';
import LiveEditor from './core/liveEditor';

try {
	if (window.$visualify) {
		if (process.env.NODE_ENV === 'development') {
			console.log('window.$visualify', window.$visualify);
			window.$visualify.Recharts = Recharts;
			window.$visualify.LiveEditor = LiveEditor;
		}
		if (window.$visualify.mode === 'charts') {
			window.$visualify.Recharts = Recharts;
			window.$visualify.LiveEditor = LiveEditor;
		} else if (
			window.$visualify.mode === 'pages' ||
			window.$visualify.mode === undefined
		) {
			// loads the visualify in pages mode
			CreateApp(window.$visualify);
		} else {
			console.error('mode should be recharts or pages');
		}

		// If you want to start measuring performance in your app, pass a function
		// to log results (for example: reportWebVitals(console.log))
		// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
		reportWebVitals();
	} else {
		// If load js before $visualify is set
		let _visualify;
		Object.defineProperty(window, '$visualify', {
			set(config) {
				// Store the value internally
				_visualify = config;
				// Additional code for after $visualify is set
				if (config.mode === 'charts')
					throw new Error(
						'You need to initialize $visualify before using recharts',
					);
				// loads the visualify in page mode
				else if (config.mode === 'pages') CreateApp(window.$visualify);
				else console.warn(`Unsupported mode: ${config.mode}`);
			},
			get() {
				return _visualify;
			},
		});
	}
} catch (e) {
	console.error(e);
}
