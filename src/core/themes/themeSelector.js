/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 22:52:11
 * @FilePath     : /visualifyjs/src/core/themes/themeSelector.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import Modern from './modern';

function ThemeSelector({ theme, config, children }) {
	switch (theme) {
		case 'modern':
			return (
				<Modern
					config={config}
					children={children}
				/>
			);
		// ... more cases as needed
		default:
			console.warn('Unsupported theme:', theme, 'using default theme');
			// Fallback to default theme
			return (
				<Modern
					config={config}
					children={children}
				/>
			);
	}
}

export default ThemeSelector;
