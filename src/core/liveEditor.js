/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 22:51:45
 * @FilePath     : /visualifyjs/src/core/liveEditor.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import Recharts from './recharts';
import { createRoot } from 'react-dom/client';
import CodeEditorWithPreview from './modules/codeEditorWithPreview';
import { VisualifyProvider } from './appContext';
class LiveEditor extends Recharts {
	constructor(config) {
		super();
		this.config = config;
	}

	mount(selector) {
		const el =
			typeof selector === 'string'
				? document.querySelector(selector)
				: selector;

		if (!el) {
			throw new Error(`Element not found with selector: ${selector}`);
		}

		try {
			// Assuming createRoot is imported from 'react-dom/client'
			const charts = createRoot(el);
			charts.render(
				<VisualifyProvider>
					<CodeEditorWithPreview config={this.config} />
				</VisualifyProvider>,
			);
			console.log('mounted ' + selector, el);
		} catch (e) {
			console.error('Error mounting chart:', e);
		}
	}
}

export default LiveEditor;
