/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 16:02:42
 * @FilePath     : /visualifyjs/src/core/recharts.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import EChartSwitcher from './modules/echartswitcher';
import { VisualifyProvider } from './appContext';

class Recharts {
	constructor(config = {}) {
		//console.log('config', config);
		const { el = null } = config;
		// Default to empty object if nothing is passed
		if (typeof el === 'string') {
			this.selector = document.querySelector(el);
			if (!this.selector) {
				throw new Error(`Element not found with selector: ${el}`);
			}
		} else {
			this.selector = el;
		}
		const { parser = null, advanced = null, ...rest } = config;
		this.config = rest;
		this.parser = parser;
		this.advanced = advanced;
	}

	mount(selector = this.selector) {
		const el =
			typeof selector === 'string'
				? document.querySelector(selector)
				: selector;

		if (!el)
			throw new Error(`Element not found with selector: ${selector}`);

		try {
			// Assuming createRoot is imported from 'react-dom/client'
			const charts = createRoot(el);
			charts.render(
				<VisualifyProvider>
					<EChartSwitcher
						props={{
							config: this.config,
							parser: this.parser,
							advanced: this.advanced,
						}}
					/>
				</VisualifyProvider>,
			);
			//console.log('mounted ' + selector, el);
		} catch (e) {
			console.error('Error mounting chart:', e);
		}
	}
}

export default Recharts;
