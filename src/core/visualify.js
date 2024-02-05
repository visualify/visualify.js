/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 15:35:28
 * @FilePath     : /visualifyjs/src/core/visualify.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import ThemeSelector from './themes/themeSelector';
import JsonRouter from './router/jsonRouter';
import { VisualifyProvider } from './appContext';

function Visualify({ config }) {
	// global variable
	const { theme = 'modern' } = config;

	return (
		<VisualifyProvider>
			<JsonRouter config={config}>
				<ThemeSelector
					theme={theme}
					config={config}
				/>
			</JsonRouter>
		</VisualifyProvider>
	);
}

function CreateApp(config) {
	if (!config) throw new Error('Missing configuration.');
	const el = document.querySelector(config.el || '#root');
	if (!el) throw new Error('el not found. Please check your `el` option.');
	const app = ReactDOM.createRoot(el);

	// deletion used configuration
	delete config.el;
	delete config.mode;

	app.render(
		<React.StrictMode>
			<Visualify config={{ ...config }} />
		</React.StrictMode>,
	);
}

export default CreateApp;
